/**
 * SkillEngine — runtime de execução de skills com herança POO.
 *
 * Suporta:
 *  - Herança declarativa via `extends` (lista de slugs)
 *  - Composição via dependências `/skill/...` no body
 *  - Triggers: manual | schedule | event | webhook | automation | agent | openclaw
 *  - Persistência de execuções em skill_executions
 *  - Audit hash (SHA-256) para imutabilidade
 */

import crypto from "crypto";
import { db } from "../../db/index";
import {
  arcadiaSkills,
  skillExecutions,
  type ArcadiaSkill,
  type InsertSkillExecution,
} from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import {
  parseReferences,
  ReferenceResolver,
  interpolate,
  type ExecutionContext,
} from "./reference-parser";

export type TriggerSource =
  | "manual"
  | "schedule"
  | "automation"
  | "agent"
  | "webhook"
  | "openclaw"
  | "event";

export interface ExecuteOptions {
  skillId: string;
  inputParams?: Record<string, unknown>;
  context: ExecutionContext;
  triggeredBy?: TriggerSource;
  automationId?: number;
  parentExecutionId?: string;
}

export interface ExecuteResult {
  executionId: string;
  skillId: string;
  status: "success" | "error";
  output?: unknown;
  error?: string;
  durationMs: number;
  resolvedBody?: string;
}

// ─── SkillEngine ──────────────────────────────────────────────────────────────

class SkillEngine {

  // ── Carregar skill com cadeia de herança resolvida ──────────────────────────

  async loadWithInheritance(skillId: string, tenantId?: number): Promise<ArcadiaSkill> {
    const skill = await this.findById(skillId);
    if (!skill) throw new Error(`Skill não encontrada: ${skillId}`);
    if (!skill.extends || skill.extends.length === 0) return skill;

    // Resolve cadeia de herança: mescla corpo e parâmetros dos pais
    const parents = await this.resolveParents(skill.extends, tenantId);
    return this.mergeInheritance(skill, parents);
  }

  private async findById(id: string): Promise<ArcadiaSkill | undefined> {
    const [skill] = await db
      .select()
      .from(arcadiaSkills)
      .where(eq(arcadiaSkills.id, id))
      .limit(1);
    return skill;
  }

  private async resolveParents(
    extendsSlugs: string[],
    tenantId?: number
  ): Promise<ArcadiaSkill[]> {
    if (extendsSlugs.length === 0) return [];

    const slugList = extendsSlugs.map((ref) => {
      // aceita "/skill/namespace/slug" ou "namespace/slug" ou "slug"
      const parts = ref.replace(/^\/skill\//, "").split("/");
      return parts[parts.length - 1]; // pega o slug
    });

    const parents = await db
      .select()
      .from(arcadiaSkills)
      .where(inArray(arcadiaSkills.slug, slugList));

    return parents;
  }

  /**
   * Merge simples de herança:
   *  - body do filho tem prioridade
   *  - parâmetros dos pais são fundidos (pai → filho sobrescreve)
   */
  private mergeInheritance(child: ArcadiaSkill, parents: ArcadiaSkill[]): ArcadiaSkill {
    let mergedParams: Record<string, unknown> = {};

    for (const parent of parents) {
      if (parent.parametersSchema && typeof parent.parametersSchema === "object") {
        mergedParams = { ...mergedParams, ...(parent.parametersSchema as object) };
      }
    }

    if (child.parametersSchema && typeof child.parametersSchema === "object") {
      mergedParams = { ...mergedParams, ...(child.parametersSchema as object) };
    }

    return {
      ...child,
      parametersSchema: Object.keys(mergedParams).length > 0 ? mergedParams : child.parametersSchema,
    };
  }

  // ── Executar ────────────────────────────────────────────────────────────────

  async execute(opts: ExecuteOptions): Promise<ExecuteResult> {
    const startedAt = Date.now();

    // Criar registro de execução com status pending
    const [execution] = await db
      .insert(skillExecutions)
      .values({
        skillId: opts.skillId,
        tenantId: opts.context.tenantId,
        companyId: opts.context.companyId,
        userId: opts.context.userId,
        triggeredBy: opts.triggeredBy ?? "manual",
        automationId: opts.automationId,
        parentExecutionId: opts.parentExecutionId,
        inputParams: opts.inputParams ?? {},
        status: "running",
      } as any)
      .returning();

    try {
      const skill = await this.loadWithInheritance(opts.skillId, opts.context.tenantId);

      // Verificar visibilidade
      this.assertExecutable(skill, opts.context);

      // Resolver referências no body
      const body = skill.body ?? "";
      const refs = parseReferences(body);
      const resolver = new ReferenceResolver({
        ...opts.context,
        vars: { ...(opts.inputParams ?? {}), ...(opts.context.vars ?? {}) },
      });
      const resolved = await resolver.resolveAll(refs);
      const resolvedBody = interpolate(body, resolved);

      const output: Record<string, unknown> = {
        skill: skill.slug,
        resolvedBody,
        resolvedDependencies: resolved,
        params: opts.inputParams,
      };

      const durationMs = Date.now() - startedAt;
      const auditHash = this.buildAuditHash(execution.id, opts.skillId, output);

      await db
        .update(skillExecutions)
        .set({
          status: "success",
          outputResult: output,
          resolvedDependencies: resolved,
          durationMs,
          auditHash,
          completedAt: new Date(),
        })
        .where(eq(skillExecutions.id, execution.id));

      return {
        executionId: execution.id,
        skillId: opts.skillId,
        status: "success",
        output,
        durationMs,
        resolvedBody,
      };
    } catch (err: any) {
      const durationMs = Date.now() - startedAt;

      await db
        .update(skillExecutions)
        .set({
          status: "error",
          errorMessage: err.message,
          durationMs,
          completedAt: new Date(),
        })
        .where(eq(skillExecutions.id, execution.id));

      return {
        executionId: execution.id,
        skillId: opts.skillId,
        status: "error",
        error: err.message,
        durationMs,
      };
    }
  }

  // ── Verificações ────────────────────────────────────────────────────────────

  private assertExecutable(skill: ArcadiaSkill, ctx: ExecutionContext): void {
    if (skill.status !== "active") {
      throw new Error(`Skill "${skill.slug}" não está ativa (status: ${skill.status})`);
    }

    if (skill.visibilityExecute === "private") {
      // Apenas o criador pode executar
      if (skill.createdBy && skill.createdBy !== ctx.userId) {
        throw new Error(`Skill "${skill.slug}" é privada`);
      }
    }
  }

  // ── Audit ───────────────────────────────────────────────────────────────────

  private buildAuditHash(executionId: string, skillId: string, output: unknown): string {
    const payload = JSON.stringify({ executionId, skillId, output, ts: Date.now() });
    return crypto.createHash("sha256").update(payload).digest("hex");
  }

  // ── Listar execuções ────────────────────────────────────────────────────────

  async getExecutions(skillId: string, limit = 50) {
    return db
      .select()
      .from(skillExecutions)
      .where(eq(skillExecutions.skillId, skillId))
      .orderBy(skillExecutions.startedAt)
      .limit(limit);
  }

  // ── Health ──────────────────────────────────────────────────────────────────

  async health(): Promise<{ ok: boolean; totalSkills: number }> {
    const [{ count }] = await db
      .select({ count: db.$count(arcadiaSkills) })
      .from(arcadiaSkills);
    return { ok: true, totalSkills: Number(count) };
  }
}

export const skillEngine = new SkillEngine();

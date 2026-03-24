/**
 * ReferenceParser — resolve referências /tipo/caminho usadas no body das skills.
 *
 * Formatos suportados:
 *   /skill/namespace/slug          → executa outra skill
 *   /kg/node-id                    → lê nó do Knowledge Graph
 *   /data/table/filter             → query ao banco Arcádia
 *   /var/nome                      → variável de contexto da execução
 *   /tool/nome                     → chama uma ferramenta registrada
 *   /agent/nome                    → delega para um agente
 *   /file/caminho                  → lê arquivo do storage
 */

import { db } from "../../db/index";
import { arcadiaSkills, graphNodes } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export type ReferenceType = "skill" | "kg" | "data" | "var" | "tool" | "agent" | "file";

export interface ParsedReference {
  raw: string;          // texto original, ex: "/skill/system/base_report"
  type: ReferenceType;
  path: string[];       // segmentos após o tipo
}

export interface ResolvedReference {
  ref: ParsedReference;
  value: unknown;
  error?: string;
}

export interface ExecutionContext {
  tenantId?: number;
  companyId?: number;
  userId?: string;
  vars?: Record<string, unknown>;
  tools?: Record<string, (...args: unknown[]) => Promise<unknown>>;
}

// ─── Parser ──────────────────────────────────────────────────────────────────

const REF_REGEX = /\/([a-z]+)((?:\/[^\s/,})"']+)+)/g;

export function parseReferences(text: string): ParsedReference[] {
  const refs: ParsedReference[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = REF_REGEX.exec(text)) !== null) {
    const raw = match[0];
    if (seen.has(raw)) continue;
    seen.add(raw);

    const type = match[1] as ReferenceType;
    const path = match[2].split("/").filter(Boolean);

    if (isValidType(type)) {
      refs.push({ raw, type, path });
    }
  }

  return refs;
}

function isValidType(t: string): t is ReferenceType {
  return ["skill", "kg", "data", "var", "tool", "agent", "file"].includes(t);
}

// ─── Resolver ─────────────────────────────────────────────────────────────────

export class ReferenceResolver {
  constructor(private ctx: ExecutionContext) {}

  async resolveAll(refs: ParsedReference[]): Promise<Record<string, ResolvedReference>> {
    const results: Record<string, ResolvedReference> = {};
    await Promise.all(
      refs.map(async (ref) => {
        try {
          const value = await this.resolve(ref);
          results[ref.raw] = { ref, value };
        } catch (err: any) {
          results[ref.raw] = { ref, value: null, error: err.message };
        }
      })
    );
    return results;
  }

  async resolve(ref: ParsedReference): Promise<unknown> {
    switch (ref.type) {
      case "skill":
        return this.resolveSkill(ref.path);
      case "kg":
        return this.resolveKg(ref.path);
      case "var":
        return this.resolveVar(ref.path);
      case "tool":
        return this.resolveTool(ref.path);
      case "data":
        return this.resolveData(ref.path);
      case "agent":
        return { type: "agent_reference", name: ref.path.join("/") };
      case "file":
        return { type: "file_reference", path: ref.path.join("/") };
      default:
        throw new Error(`Tipo de referência desconhecido: ${(ref as any).type}`);
    }
  }

  private async resolveSkill(path: string[]): Promise<unknown> {
    // /skill/namespace/slug  ou  /skill/slug
    const [ns, slug] = path.length >= 2 ? [path[0], path[1]] : ["tenant", path[0]];

    const conditions = [eq(arcadiaSkills.slug, slug), eq(arcadiaSkills.namespace, ns)];
    if (this.ctx.tenantId) {
      conditions.push(eq(arcadiaSkills.tenantId, this.ctx.tenantId));
    }

    const [skill] = await db
      .select()
      .from(arcadiaSkills)
      .where(and(...conditions))
      .limit(1);

    if (!skill) throw new Error(`Skill não encontrada: /${ns}/${slug}`);
    return { type: "skill_ref", id: skill.id, slug: skill.slug, body: skill.body };
  }

  private async resolveKg(path: string[]): Promise<unknown> {
    const nodeId = parseInt(path[0], 10);
    if (isNaN(nodeId)) throw new Error(`ID de nó KG inválido: ${path[0]}`);

    const [node] = await db
      .select()
      .from(graphNodes)
      .where(eq(graphNodes.id, nodeId))
      .limit(1);

    if (!node) throw new Error(`Nó KG não encontrado: ${nodeId}`);
    return node;
  }

  private resolveVar(path: string[]): unknown {
    const name = path.join(".");
    const vars = this.ctx.vars ?? {};
    if (!(name in vars)) throw new Error(`Variável não definida: /var/${name}`);
    return vars[name];
  }

  private async resolveTool(path: string[]): Promise<unknown> {
    const name = path.join("/");
    const tool = this.ctx.tools?.[name];
    if (!tool) throw new Error(`Ferramenta não registrada: /tool/${name}`);
    return { type: "tool_ref", name, callable: true };
  }

  private async resolveData(path: string[]): Promise<unknown> {
    // /data/table/filter — placeholder; implementação por módulo
    const [table, ...filterParts] = path;
    return { type: "data_ref", table, filter: filterParts.join("/") };
  }
}

// ─── Interpolação de template ─────────────────────────────────────────────────

/**
 * Substitui referências resolvidas no body da skill.
 * Ex: "Resultado de /var/input" → "Resultado de <valor>"
 */
export function interpolate(
  body: string,
  resolved: Record<string, ResolvedReference>
): string {
  let result = body;
  for (const [raw, res] of Object.entries(resolved)) {
    if (res.error) continue;
    const replacement =
      typeof res.value === "string" ? res.value : JSON.stringify(res.value);
    result = result.replaceAll(raw, replacement);
  }
  return result;
}

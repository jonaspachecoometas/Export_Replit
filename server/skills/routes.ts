import type { Express, Request, Response } from "express";
import { db } from "../../db/index";
import {
  arcadiaSkills,
  skillExecutions,
  insertArcadiaSkillSchema,
} from "@shared/schema";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { skillEngine } from "./engine";

const executeBodySchema = z.object({
  inputParams: z.record(z.unknown()).optional(),
  triggeredBy: z
    .enum(["manual", "schedule", "automation", "agent", "webhook", "openclaw", "event"])
    .optional()
    .default("manual"),
  automationId: z.number().int().optional(),
  parentExecutionId: z.string().uuid().optional(),
});

const listQuerySchema = z.object({
  namespace: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

function tenantId(req: Request): number | undefined {
  return (req as any).user?.tenantId ?? (req as any).tenantId;
}

function userId(req: Request): string | undefined {
  return (req as any).user?.id ?? (req as any).userId;
}

export function registerSkillRoutes(app: Express): void {

  // ── Health ────────────────────────────────────────────────────────────────

  app.get("/api/skills/health", async (_req: Request, res: Response) => {
    try {
      const status = await skillEngine.health();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // ── Listar skills ─────────────────────────────────────────────────────────

  app.get("/api/skills", async (req: Request, res: Response) => {
    try {
      const q = listQuerySchema.parse(req.query);
      const tid = tenantId(req);

      const conditions: any[] = [];
      if (tid) conditions.push(eq(arcadiaSkills.tenantId, tid));
      if (q.namespace) conditions.push(eq(arcadiaSkills.namespace, q.namespace));
      if (q.status) conditions.push(eq(arcadiaSkills.status, q.status as any));
      if (q.search) {
        conditions.push(
          or(
            ilike(arcadiaSkills.name, `%${q.search}%`),
            ilike(arcadiaSkills.slug, `%${q.search}%`),
            ilike(arcadiaSkills.description, `%${q.search}%`)
          )
        );
      }

      const skills = await db
        .select()
        .from(arcadiaSkills)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(arcadiaSkills.createdAt))
        .limit(q.limit)
        .offset(q.offset);

      res.json({ skills, total: skills.length });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ── Criar skill ───────────────────────────────────────────────────────────

  app.post("/api/skills", async (req: Request, res: Response) => {
    try {
      const tid = tenantId(req);
      const uid = userId(req);
      const data = insertArcadiaSkillSchema.parse({
        ...req.body,
        tenantId: tid,
        createdBy: uid,
      });

      const [skill] = await db.insert(arcadiaSkills).values(data).returning();
      res.status(201).json(skill);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ── Buscar skill por ID ───────────────────────────────────────────────────

  app.get("/api/skills/:id", async (req: Request, res: Response) => {
    try {
      const [skill] = await db
        .select()
        .from(arcadiaSkills)
        .where(eq(arcadiaSkills.id, req.params.id))
        .limit(1);

      if (!skill) return res.status(404).json({ error: "Skill não encontrada" });
      res.json(skill);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ── Atualizar skill ───────────────────────────────────────────────────────

  app.put("/api/skills/:id", async (req: Request, res: Response) => {
    try {
      const [existing] = await db
        .select()
        .from(arcadiaSkills)
        .where(eq(arcadiaSkills.id, req.params.id))
        .limit(1);

      if (!existing) return res.status(404).json({ error: "Skill não encontrada" });

      const [updated] = await db
        .update(arcadiaSkills)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(arcadiaSkills.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ── Deletar skill ─────────────────────────────────────────────────────────

  app.delete("/api/skills/:id", async (req: Request, res: Response) => {
    try {
      const result = await db
        .delete(arcadiaSkills)
        .where(eq(arcadiaSkills.id, req.params.id));

      if ((result.rowCount ?? 0) === 0) {
        return res.status(404).json({ error: "Skill não encontrada" });
      }
      res.json({ deleted: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ── Executar skill ────────────────────────────────────────────────────────

  app.post("/api/skills/:id/execute", async (req: Request, res: Response) => {
    try {
      const body = executeBodySchema.parse(req.body);

      const result = await skillEngine.execute({
        skillId: req.params.id,
        inputParams: body.inputParams,
        context: {
          tenantId: tenantId(req),
          userId: userId(req),
        },
        triggeredBy: body.triggeredBy,
        automationId: body.automationId,
        parentExecutionId: body.parentExecutionId,
      });

      const statusCode = result.status === "success" ? 200 : 500;
      res.status(statusCode).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ── Histórico de execuções ────────────────────────────────────────────────

  app.get("/api/skills/:id/executions", async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
      const executions = await skillEngine.getExecutions(req.params.id, limit);
      res.json({ executions });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ── Execução por ID ───────────────────────────────────────────────────────

  app.get("/api/skills/executions/:executionId", async (req: Request, res: Response) => {
    try {
      const [execution] = await db
        .select()
        .from(skillExecutions)
        .where(eq(skillExecutions.id, req.params.executionId))
        .limit(1);

      if (!execution) return res.status(404).json({ error: "Execução não encontrada" });
      res.json(execution);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });
}

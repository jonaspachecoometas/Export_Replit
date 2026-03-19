import { Router, Request, Response } from "express";
import { insertGraphNodeSchema, insertGraphEdgeSchema, insertKnowledgeBaseSchema } from "@shared/schema";
import * as graphService from "./service";

const router = Router();

// Middleware de autenticação
router.use((req: Request, res: Response, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  next();
});

const tenantId = (req: Request): number | undefined =>
  (req.user as any)?.tenantId ?? undefined;

// ─── Nodes ────────────────────────────────────────────────────────────────────

router.get("/nodes", async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const nodes = await graphService.getNodes(tenantId(req), type, limit);
    res.json(nodes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/nodes/:id", async (req: Request, res: Response) => {
  try {
    const node = await graphService.getNodeById(parseInt(req.params.id));
    if (!node) return res.status(404).json({ error: "Nó não encontrado" });
    res.json(node);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/nodes", async (req: Request, res: Response) => {
  try {
    const parsed = insertGraphNodeSchema.safeParse({
      ...req.body,
      tenantId: tenantId(req),
    });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const node = await graphService.createNode(parsed.data);
    res.status(201).json(node);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/nodes/:id", async (req: Request, res: Response) => {
  try {
    const node = await graphService.updateNode(parseInt(req.params.id), req.body);
    if (!node) return res.status(404).json({ error: "Nó não encontrado" });
    res.json(node);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/nodes/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await graphService.deleteNode(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Nó não encontrado" });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Batch de Nodes ───────────────────────────────────────────────────────────

router.post("/nodes/batch", async (req: Request, res: Response) => {
  try {
    const { nodes } = req.body as { nodes: any[] };
    if (!Array.isArray(nodes)) {
      return res.status(400).json({ error: "Campo 'nodes' deve ser um array" });
    }
    const created = await Promise.all(
      nodes.map((n) =>
        graphService.createNode({ ...n, tenantId: tenantId(req) })
      )
    );
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Edges ────────────────────────────────────────────────────────────────────

router.get("/edges", async (req: Request, res: Response) => {
  try {
    const sourceId = req.query.sourceId ? parseInt(req.query.sourceId as string) : undefined;
    const targetId = req.query.targetId ? parseInt(req.query.targetId as string) : undefined;
    const edges = await graphService.getEdges(sourceId, targetId);
    res.json(edges);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/edges", async (req: Request, res: Response) => {
  try {
    const parsed = insertGraphEdgeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const edge = await graphService.createEdge(parsed.data);
    res.status(201).json(edge);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/edges/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await graphService.deleteEdge(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Aresta não encontrada" });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Knowledge Base ───────────────────────────────────────────────────────────

router.get("/knowledge", async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const entries = await graphService.getKnowledgeEntries(category, search);
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/knowledge/:id", async (req: Request, res: Response) => {
  try {
    const entry = await graphService.getKnowledgeEntry(parseInt(req.params.id));
    if (!entry) return res.status(404).json({ error: "Entrada não encontrada" });
    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/knowledge", async (req: Request, res: Response) => {
  try {
    const parsed = insertKnowledgeBaseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const entry = await graphService.createKnowledgeEntry(parsed.data);
    res.status(201).json(entry);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/knowledge/:id", async (req: Request, res: Response) => {
  try {
    const entry = await graphService.updateKnowledgeEntry(parseInt(req.params.id), req.body);
    if (!entry) return res.status(404).json({ error: "Entrada não encontrada" });
    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/knowledge/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await graphService.deleteKnowledgeEntry(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Entrada não encontrada" });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Busca Semântica ──────────────────────────────────────────────────────────

router.post("/search", async (req: Request, res: Response) => {
  try {
    const { query, n_results = 5 } = req.body as { query: string; n_results?: number };
    if (!query) return res.status(400).json({ error: "Campo 'query' é obrigatório" });

    const result = await graphService.semanticSearch(query, n_results);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Grafo completo para visualização ────────────────────────────────────────

router.get("/visualization", async (req: Request, res: Response) => {
  try {
    const data = await graphService.getGraphData(tenantId(req));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

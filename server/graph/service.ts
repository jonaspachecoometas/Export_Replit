import { db } from "../../db/index";
import { eq, desc, and, sql, ilike, or } from "drizzle-orm";
import {
  graphNodes,
  graphEdges,
  knowledgeBase,
  learnedInteractions,
  insertGraphNodeSchema,
  insertGraphEdgeSchema,
  insertKnowledgeBaseSchema,
  type GraphNode,
  type GraphEdge,
  type KnowledgeBaseEntry,
  type InsertGraphNode,
  type InsertGraphEdge,
  type InsertKnowledgeBaseEntry,
} from "@shared/schema";

const EMBEDDINGS_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";

// ─── Nodes ────────────────────────────────────────────────────────────────────

export async function getNodes(tenantId?: number, type?: string, limit = 100): Promise<GraphNode[]> {
  const conditions = [];
  if (tenantId) conditions.push(eq(graphNodes.tenantId, tenantId));
  if (type) conditions.push(eq(graphNodes.type, type));

  return db
    .select()
    .from(graphNodes)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(graphNodes.createdAt))
    .limit(limit);
}

export async function getNodeById(id: number): Promise<GraphNode | undefined> {
  const [node] = await db.select().from(graphNodes).where(eq(graphNodes.id, id));
  return node;
}

export async function createNode(data: InsertGraphNode): Promise<GraphNode> {
  const [node] = await db.insert(graphNodes).values(data).returning();

  // Indexar embedding em background (não bloqueia a resposta)
  const content = typeof data.data === "object" ? JSON.stringify(data.data) : String(data.data);
  indexNodeEmbedding(node.id, content, data.type).catch(() => {});

  return node;
}

export async function updateNode(id: number, data: Partial<InsertGraphNode>): Promise<GraphNode | undefined> {
  const [node] = await db
    .update(graphNodes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(graphNodes.id, id))
    .returning();
  return node;
}

export async function deleteNode(id: number): Promise<boolean> {
  const result = await db.delete(graphNodes).where(eq(graphNodes.id, id));
  return (result.rowCount ?? 0) > 0;
}

// ─── Edges ────────────────────────────────────────────────────────────────────

export async function getEdges(sourceId?: number, targetId?: number): Promise<GraphEdge[]> {
  const conditions = [];
  if (sourceId) conditions.push(eq(graphEdges.sourceId, sourceId));
  if (targetId) conditions.push(eq(graphEdges.targetId, targetId));

  return db
    .select()
    .from(graphEdges)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(graphEdges.createdAt));
}

export async function createEdge(data: InsertGraphEdge): Promise<GraphEdge> {
  const [edge] = await db.insert(graphEdges).values(data).returning();
  return edge;
}

export async function deleteEdge(id: number): Promise<boolean> {
  const result = await db.delete(graphEdges).where(eq(graphEdges.id, id));
  return (result.rowCount ?? 0) > 0;
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────

export async function getKnowledgeEntries(category?: string, search?: string): Promise<KnowledgeBaseEntry[]> {
  const conditions = [];
  if (category) conditions.push(eq(knowledgeBase.category, category));
  if (search) {
    conditions.push(
      or(
        ilike(knowledgeBase.title, `%${search}%`),
        ilike(knowledgeBase.content, `%${search}%`)
      )!
    );
  }

  return db
    .select()
    .from(knowledgeBase)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(knowledgeBase.createdAt))
    .limit(50);
}

export async function getKnowledgeEntry(id: number): Promise<KnowledgeBaseEntry | undefined> {
  const [entry] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id));
  return entry;
}

export async function createKnowledgeEntry(data: InsertKnowledgeBaseEntry): Promise<KnowledgeBaseEntry> {
  const [entry] = await db.insert(knowledgeBase).values(data).returning();

  // Indexar no serviço de embeddings
  indexKnowledgeEmbedding(entry.id, entry.title + "\n" + entry.content, entry.category).catch(() => {});

  return entry;
}

export async function updateKnowledgeEntry(
  id: number,
  data: Partial<InsertKnowledgeBaseEntry>
): Promise<KnowledgeBaseEntry | undefined> {
  const [entry] = await db.update(knowledgeBase).set(data).where(eq(knowledgeBase.id, id)).returning();
  return entry;
}

export async function deleteKnowledgeEntry(id: number): Promise<boolean> {
  const result = await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
  return (result.rowCount ?? 0) > 0;
}

// ─── Busca Semântica ──────────────────────────────────────────────────────────

export async function semanticSearch(
  query: string,
  nResults = 5
): Promise<{ results: any[]; source: "embeddings" | "text_fallback" }> {
  // Tenta busca vetorial no serviço de embeddings Python
  try {
    const response = await fetch(`${EMBEDDINGS_URL}/embeddings/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, n_results: nResults }),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return { results: data.results || [], source: "embeddings" };
    }
  } catch {
    // Serviço de embeddings indisponível — fallback para busca textual
  }

  // Fallback: busca textual simples no banco
  const textResults = await db
    .select()
    .from(knowledgeBase)
    .where(
      or(
        ilike(knowledgeBase.title, `%${query}%`),
        ilike(knowledgeBase.content, `%${query}%`)
      )!
    )
    .limit(nResults);

  // Complementa com interações aprendidas
  const interactionResults = await db
    .select()
    .from(learnedInteractions)
    .where(
      or(
        ilike(learnedInteractions.question, `%${query}%`),
        ilike(learnedInteractions.answer, `%${query}%`)
      )!
    )
    .orderBy(desc(learnedInteractions.createdAt))
    .limit(nResults);

  return {
    results: [
      ...textResults.map((r) => ({ type: "knowledge", score: 0.7, data: r })),
      ...interactionResults.map((r) => ({ type: "interaction", score: 0.6, data: r })),
    ],
    source: "text_fallback",
  };
}

// ─── Grafo Completo para Visualização ────────────────────────────────────────

export async function getGraphData(tenantId?: number): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const nodes = await getNodes(tenantId, undefined, 200);
  const nodeIds = nodes.map((n) => n.id);

  if (nodeIds.length === 0) return { nodes: [], edges: [] };

  const edges = await db
    .select()
    .from(graphEdges)
    .where(
      or(
        sql`${graphEdges.sourceId} = ANY(${sql.raw(`ARRAY[${nodeIds.join(",")}]`)})`,
        sql`${graphEdges.targetId} = ANY(${sql.raw(`ARRAY[${nodeIds.join(",")}]`)})`
      )!
    );

  return { nodes, edges };
}

// ─── Helpers Privados ────────────────────────────────────────────────────────

async function indexNodeEmbedding(nodeId: number, content: string, type: string) {
  await fetch(`${EMBEDDINGS_URL}/embeddings/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doc_id: `node_${nodeId}`,
      document: content,
      metadata: { type: "graph_node", node_type: type, node_id: nodeId },
    }),
    signal: AbortSignal.timeout(10000),
  });
}

async function indexKnowledgeEmbedding(entryId: number, content: string, category: string) {
  await fetch(`${EMBEDDINGS_URL}/embeddings/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doc_id: `kb_${entryId}`,
      document: content,
      metadata: { type: "knowledge_base", category, entry_id: entryId },
    }),
    signal: AbortSignal.timeout(10000),
  });
}

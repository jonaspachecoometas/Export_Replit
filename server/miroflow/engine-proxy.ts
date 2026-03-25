import type { Express, Request, Response } from "express";
import crypto from "crypto";
import { createNode } from "../graph/service";

const MIROFLOW_HOST = process.env.MIROFLOW_HOST || "localhost";
const MIROFLOW_PORT = parseInt(process.env.MIROFLOW_PORT || "8006", 10);
const MIROFLOW_URL = `http://${MIROFLOW_HOST}:${MIROFLOW_PORT}`;
const MIROFLOW_TIMEOUT = 300_000; // 5 minutos — deepseek-r1:14b pode levar 60-120s
const MIROFLOW_HEALTH_TIMEOUT = 5_000; // 5 segundos para health check

async function proxyToMiroFlow(path: string, method: string = "GET", body?: object): Promise<any> {
  const timeoutMs = path === "/health" ? MIROFLOW_HEALTH_TIMEOUT : MIROFLOW_TIMEOUT;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${MIROFLOW_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(err.detail || `MiroFlow error: ${response.status}`);
    }
    return await response.json();
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") throw new Error("MiroFlow timeout (300s)");
    throw err;
  }
}

async function registerExecutionInKG(req: Request, execData: any, inputBody: any): Promise<void> {
  try {
    const auditHash = crypto
      .createHash("sha256")
      .update(JSON.stringify({
        execution_id: execData.execution_id,
        agent: execData.agent,
        model: execData.model,
        input: inputBody,
        output: execData.result,
      }))
      .digest("hex");

    await createNode({
      type: "miroflow_execution",
      tenantId: (req.user as any)?.tenantId ?? null,
      data: {
        ...execData,
        input: inputBody,
        auditHash,
        immutable: true,
        registeredAt: new Date().toISOString(),
      },
    });
  } catch (kgErr: any) {
    // KG failure não deve bloquear a resposta ao cliente
    console.error("[MiroFlow] Falha ao registrar no KG:", kgErr.message);
  }
}

export function registerMiroFlowRoutes(app: Express): void {
  app.get("/api/miroflow/health", async (_req: Request, res: Response) => {
    try {
      const data = await proxyToMiroFlow("/health", "GET");
      res.json({ online: true, url: MIROFLOW_URL, ...data });
    } catch {
      res.json({ online: false, url: MIROFLOW_URL });
    }
  });

  app.post("/api/miroflow/analyze", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    try {
      const inputBody = {
        ...req.body,
        tenant_id: (req.user as any)?.tenantId ?? null,
      };
      const data = await proxyToMiroFlow("/analyze", "POST", inputBody);
      // Registrar no KG de forma assíncrona (não bloqueia a resposta)
      registerExecutionInKG(req, data, req.body).catch(() => {});
      res.json(data);
    } catch (err: any) {
      res.status(502).json({ error: err.message });
    }
  });

  console.log(`[MiroFlow Proxy] Rotas registradas -> ${MIROFLOW_URL}`);
}

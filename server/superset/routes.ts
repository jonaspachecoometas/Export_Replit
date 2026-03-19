import type { Express, Request, Response } from "express";

const SUPERSET_HOST = process.env.SUPERSET_HOST || "localhost";
const SUPERSET_PORT = parseInt(process.env.SUPERSET_PORT || "8088", 10);
const SUPERSET_URL = `http://${SUPERSET_HOST}:${SUPERSET_PORT}`;
const ADMIN_USER = process.env.SUPERSET_ADMIN_USER || "admin";
const ADMIN_PASS = process.env.SUPERSET_ADMIN_PASSWORD || "arcadia2026";

// Cache do service token (válido por 50 min)
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getServiceToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const resp = await fetch(`${SUPERSET_URL}/api/v1/security/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS, provider: "db", refresh: true }),
  });

  if (!resp.ok) throw new Error(`Falha ao autenticar no Superset (${resp.status})`);
  const data = await resp.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + 50 * 60 * 1000;
  return cachedToken!;
}

export function registerSupersetRoutes(app: Express): void {

  // Gera Guest Token para embedding em qualquer tela
  app.post("/api/superset/guest-token", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });

      const { dashboardId } = req.body;
      if (!dashboardId) return res.status(400).json({ error: "dashboardId é obrigatório" });

      const token = await getServiceToken();
      const user = req.user as any;

      const guestResp = await fetch(`${SUPERSET_URL}/api/v1/security/guest_token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: {
            username: `arcadia_${user?.id || "guest"}`,
            first_name: user?.name?.split(" ")[0] || "Arcádia",
            last_name: user?.name?.split(" ").slice(1).join(" ") || "User",
          },
          resources: [{ type: "dashboard", id: dashboardId }],
          rls: user?.tenantId ? [{ clause: `tenant_id = ${user.tenantId}`, type: "BASE_ROLE" }] : [],
        }),
      });

      if (!guestResp.ok) {
        const errText = await guestResp.text();
        return res.status(502).json({ error: "Falha ao gerar guest token", detail: errText });
      }

      const { token: guestToken } = await guestResp.json();
      res.json({ token: guestToken, supersetUrl: "/superset" });
    } catch (err: any) {
      console.error("[Superset] guest-token error:", err.message);
      res.status(502).json({ error: err.message });
    }
  });

  // Lista dashboards disponíveis (para seletor na UI)
  app.get("/api/superset/dashboards", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });

      const token = await getServiceToken();
      const resp = await fetch(
        `${SUPERSET_URL}/api/v1/dashboard/?q=(order_column:changed_on_delta_humanized,order_direction:desc,page_size:50)`,
        { headers: { "Authorization": `Bearer ${token}` } }
      );

      if (!resp.ok) return res.status(502).json({ error: "Superset indisponível", dashboards: [] });
      const data = await resp.json();
      res.json(data.result || []);
    } catch (err: any) {
      console.error("[Superset] dashboards error:", err.message);
      res.status(502).json({ error: err.message, dashboards: [] });
    }
  });

  // Health check
  app.get("/api/superset/health", async (_req: Request, res: Response) => {
    try {
      const resp = await fetch(`${SUPERSET_URL}/health`, { signal: AbortSignal.timeout(5000) });
      const text = await resp.text();
      res.json({ online: resp.ok && text === "OK", url: SUPERSET_URL, status: text });
    } catch {
      res.json({ online: false, url: SUPERSET_URL });
    }
  });

  // Autologin (compatibilidade — redireciona para /superset com sessão)
  app.get("/api/bi/superset/autologin", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    res.redirect("/superset/login");
  });
}

import type { Express, Request, Response } from "express";

const SUPERSET_HOST = process.env.SUPERSET_HOST || "localhost";
const SUPERSET_PORT = parseInt(process.env.SUPERSET_PORT || "8088", 10);
const SUPERSET_URL = `http://${SUPERSET_HOST}:${SUPERSET_PORT}`;
const ADMIN_USER = process.env.SUPERSET_ADMIN_USER || "admin";
const ADMIN_PASS = process.env.SUPERSET_ADMIN_PASSWORD || "arcadia2026";

// Cache do service token (válido por 45 min)
let cachedToken: string | null = null;
let cachedCsrf: string | null = null;
let cachedSession: string | null = null;
let tokenExpiry = 0;

const FETCH_TIMEOUT = 8000; // 8s — falha rápido em vez de ficar pendurado

function clearTokenCache() {
  cachedToken = null;
  cachedCsrf = null;
  cachedSession = null;
  tokenExpiry = 0;
}

async function getServiceToken(): Promise<{ token: string; csrf: string; session: string }> {
  if (cachedToken && cachedCsrf && cachedSession && Date.now() < tokenExpiry) {
    return { token: cachedToken, csrf: cachedCsrf, session: cachedSession };
  }

  const resp = await fetch(`${SUPERSET_URL}/api/v1/security/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS, provider: "db", refresh: true }),
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });

  if (!resp.ok) throw new Error(`Falha ao autenticar no Superset (${resp.status})`);
  const data = await resp.json();
  cachedToken = data.access_token;

  const csrfResp = await fetch(`${SUPERSET_URL}/api/v1/security/csrf_token/`, {
    headers: { "Authorization": `Bearer ${cachedToken}` },
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });
  if (!csrfResp.ok) throw new Error(`Falha ao obter CSRF token (${csrfResp.status})`);
  const csrfData = await csrfResp.json();
  cachedCsrf = csrfData.result;

  // Guardar o cookie de sessão retornado pelo Superset (necessário junto com X-CSRFToken)
  const setCookie = csrfResp.headers.get("set-cookie") || "";
  cachedSession = setCookie.split(";")[0]; // ex: "session=xxx"

  tokenExpiry = Date.now() + 45 * 60 * 1000;
  return { token: cachedToken!, csrf: cachedCsrf!, session: cachedSession };
}

export function registerSupersetRoutes(app: Express): void {

  // Gera Guest Token para embedding em qualquer tela
  app.post("/api/superset/guest-token", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });

      const { dashboardId } = req.body;
      if (!dashboardId) return res.status(400).json({ error: "dashboardId é obrigatório" });

      const { token, csrf, session } = await getServiceToken();
      const user = req.user as any;

      // Resolve slug → dashboard ID → embedded UUID
      // Enviar session cookie junto com o Bearer JWT para que Flask-Login identifique
      // o admin via user_loader (necessário quando o papel Public tem can_read on Dashboard)
      let dashResp = await fetch(`${SUPERSET_URL}/api/v1/dashboard/${dashboardId}`, {
        headers: { "Authorization": `Bearer ${token}`, "Cookie": session },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });
      // Token pode ter expirado — limpa cache e tenta uma vez com credenciais frescas
      if (!dashResp.ok) {
        clearTokenCache();
        const fresh = await getServiceToken();
        dashResp = await fetch(`${SUPERSET_URL}/api/v1/dashboard/${dashboardId}`, {
          headers: { "Authorization": `Bearer ${fresh.token}`, "Cookie": fresh.session },
          signal: AbortSignal.timeout(FETCH_TIMEOUT),
        });
      }
      if (!dashResp.ok) {
        return res.status(404).json({ error: `Dashboard '${dashboardId}' não encontrado no Superset` });
      }
      const dashData = await dashResp.json();
      const dbNumericId = dashData.result?.id;

      const embeddedResp = await fetch(`${SUPERSET_URL}/api/v1/dashboard/${dbNumericId}/embedded`, {
        headers: { "Authorization": `Bearer ${token}`, "Cookie": session },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });
      if (!embeddedResp.ok) {
        return res.status(404).json({ error: `Dashboard '${dashboardId}' não tem embedding habilitado` });
      }
      const embeddedData = await embeddedResp.json();
      const embeddedUuid = embeddedData.result?.uuid;

      if (!embeddedUuid) {
        return res.status(404).json({ error: `UUID de embedding não encontrado para '${dashboardId}'` });
      }

      const guestResp = await fetch(`${SUPERSET_URL}/api/v1/security/guest_token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-CSRFToken": csrf,
          "Cookie": session,
        },
        body: JSON.stringify({
          user: {
            username: `arcadia_${user?.id || "guest"}`,
            first_name: user?.name?.split(" ")[0] || "Arcádia",
            last_name: user?.name?.split(" ").slice(1).join(" ") || "User",
          },
          resources: [{ type: "dashboard", id: embeddedUuid }],
          rls: user?.tenantId ? [{ clause: `tenant_id = ${user.tenantId}` }] : [],
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });

      if (!guestResp.ok) {
        const errText = await guestResp.text();
        return res.status(502).json({ error: "Falha ao gerar guest token", detail: errText });
      }

      const { token: guestToken } = await guestResp.json();
      res.json({ token: guestToken, embeddedId: embeddedUuid, supersetUrl: "/superset" });
    } catch (err: any) {
      console.error("[Superset] guest-token error:", err.message);
      clearTokenCache(); // limpa cache para forçar novo login na próxima requisição
      res.status(502).json({ error: err.message });
    }
  });

  // Lista dashboards disponíveis (para seletor na UI)
  app.get("/api/superset/dashboards", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });

      const { token } = await getServiceToken();
      const resp = await fetch(
        `${SUPERSET_URL}/api/v1/dashboard/?q=(order_column:changed_on_delta_humanized,order_direction:desc,page_size:50)`,
        { headers: { "Authorization": `Bearer ${token}` } }
      );

      if (!resp.ok) return res.status(502).json({ error: "Superset indisponível", dashboards: [] });
      const data = await resp.json();
      res.json(data.result || []);
    } catch (err: any) {
      console.error("[Superset] dashboards error:", err.message);
      clearTokenCache();
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

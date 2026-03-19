// ERPNext Proxy — Transparente, igual ao Plus proxy
// /erpnext-app/* → http://erpnext:8080/*

import { Express, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const ERPNEXT_HOST = process.env.ERPNEXT_CONTAINER_HOST || "erpnext";
const ERPNEXT_CONTAINER_PORT = parseInt(process.env.ERPNEXT_CONTAINER_PORT || "8080", 10);
const ERPNEXT_TIMEOUT = parseInt(process.env.ERPNEXT_TIMEOUT || "60000", 10);

export function setupErpNextProxy(app: Express): void {
  // Só ativa se o container estiver configurado (DOCKER_MODE ou flag explícita)
  const dockerMode = process.env.DOCKER_MODE === "true";
  const forceProxy = process.env.ERPNEXT_PROXY_ENABLED === "true";

  if (!dockerMode && !forceProxy) {
    console.log("[ERPNext Proxy] Modo container desativado — proxy não configurado.");
    console.log("[ERPNext Proxy] Use ERPNEXT_URL para apontar para instância externa.");
    return;
  }

  const erpnextTarget = `http://${ERPNEXT_HOST}:${ERPNEXT_CONTAINER_PORT}`;

  const erpnextProxy = createProxyMiddleware({
    target: erpnextTarget,
    changeOrigin: true,
    timeout: ERPNEXT_TIMEOUT,
    proxyTimeout: ERPNEXT_TIMEOUT,
    pathRewrite: {
      "^/erpnext-app": "",
    },
    on: {
      error: (err, req, res) => {
        console.error("[ERPNext Proxy] Error:", err.message);
        if (res && typeof (res as Response).status === "function") {
          (res as Response).status(502).json({
            error: "ERPNext não disponível",
            message: `Frappe não está rodando em ${erpnextTarget}`,
          });
        }
      },
      proxyReq: (proxyReq, req) => {
        console.log(`[ERPNext Proxy] ${req.method} ${req.url} -> ${erpnextTarget}`);
        const forwardedHost = req.headers["x-forwarded-host"];
        const host = (typeof forwardedHost === "string" ? forwardedHost : req.headers.host) || "localhost";
        const forwardedProto = req.headers["x-forwarded-proto"];
        const proto = typeof forwardedProto === "string" ? forwardedProto : "https";
        proxyReq.setHeader("X-Forwarded-Host", host);
        proxyReq.setHeader("X-Forwarded-Proto", proto);
        proxyReq.setHeader("X-Forwarded-Prefix", "/erpnext-app");
        // Frappe usa este header para resolver URLs absolutas
        proxyReq.setHeader("X-Site-Name", "erpnext.local");
      },
      proxyRes: (proxyRes) => {
        const location = proxyRes.headers["location"];
        if (location && typeof location === "string") {
          let newLocation = location;
          // Rewrite URLs absolutas do container → /erpnext-app
          newLocation = newLocation.replace(
            new RegExp(`http://${ERPNEXT_HOST}:${ERPNEXT_CONTAINER_PORT}`, "g"),
            "/erpnext-app"
          );
          newLocation = newLocation.replace(/http:\/\/erpnext:8080/g, "/erpnext-app");
          // Se é path relativo sem prefixo, adiciona /erpnext-app
          if (newLocation.startsWith("/") && !newLocation.startsWith("/erpnext-app")) {
            newLocation = "/erpnext-app" + newLocation;
          }
          proxyRes.headers["location"] = newLocation;
        }
      },
    },
  });

  app.use("/erpnext-app", erpnextProxy);

  // Status check do container ERPNext
  app.get("/api/erpnext/container-status", async (_req, res) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${erpnextTarget}/api/method/frappe.ping`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json() as any;
        res.json({
          status: "online",
          host: ERPNEXT_HOST,
          port: ERPNEXT_CONTAINER_PORT,
          message: data.message,
          mode: "container",
        });
      } else {
        res.json({
          status: "error",
          host: ERPNEXT_HOST,
          port: ERPNEXT_CONTAINER_PORT,
          httpStatus: response.status,
        });
      }
    } catch (err: any) {
      res.json({
        status: "offline",
        host: ERPNEXT_HOST,
        port: ERPNEXT_CONTAINER_PORT,
        error: err.name === "AbortError" ? "timeout" : err.message,
      });
    }
  });

  console.log(`[ERPNext Proxy] Configurado: /erpnext-app -> ${erpnextTarget}`);
}

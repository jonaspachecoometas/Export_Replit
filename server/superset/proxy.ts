import { Express, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const SUPERSET_HOST = process.env.SUPERSET_HOST || "localhost";
const SUPERSET_PORT = parseInt(process.env.SUPERSET_PORT || "8088", 10);
const SUPERSET_TIMEOUT = 60000;

export function setupSupersetProxy(app: Express): void {
  const target = `http://${SUPERSET_HOST}:${SUPERSET_PORT}`;

  const supersetProxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    timeout: SUPERSET_TIMEOUT,
    proxyTimeout: SUPERSET_TIMEOUT,
    pathRewrite: { "^/superset": "" },
    on: {
      error: (err, _req, res) => {
        console.error("[Superset Proxy] Error:", err.message);
        if (res && typeof (res as Response).status === "function") {
          (res as Response).status(502).json({
            error: "Superset indisponível",
            message: "O Arcádia Insights está iniciando. Tente novamente em alguns segundos.",
            target,
          });
        }
      },
      proxyRes: (proxyRes) => {
        const location = proxyRes.headers["location"];
        if (location && typeof location === "string" && location.startsWith("/")) {
          proxyRes.headers["location"] = `/superset${location}`;
        }
      },
    },
  });

  app.use("/superset", supersetProxy);
  console.log(`[Superset Proxy] Configurado -> /superset/* => ${target}`);
}

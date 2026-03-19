import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: isProduction
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
          return `${timestamp} [${level}] ${message}${extras}`;
        })
      ),
  transports: [new winston.transports.Console()],
});

export function httpLogger() {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    const { method, path: reqPath } = req;

    res.on("finish", () => {
      if (!reqPath.startsWith("/api")) return;
      const duration = Date.now() - start;
      const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      logger.log(level, `${method} ${reqPath} ${res.statusCode}`, {
        duration_ms: duration,
        user_id: req.user?.id || null,
        tenant_id: req.user?.tenantId || null,
      });
    });

    next();
  };
}

import express, { type Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { registerAllTools } from "./autonomous/tools";
import { storage } from "./storage";
import { createServer } from "http";
import { spawn } from "child_process";
import path from "path";
import { logger, httpLogger } from "./logger";

interface ManagedService {
  name: string;
  scriptPath: string;
  port: number;
  process: ReturnType<typeof spawn> | null;
  status: "running" | "stopped" | "restarting";
  startedAt: Date | null;
  restartCount: number;
  logs: string[];
}

const managedServices: Map<string, ManagedService> = new Map();
const MAX_LOG_LINES = 200;

function startPythonService(name: string, scriptPath: string, port: number) {
  const existing = managedServices.get(name);

  const pythonProcess = spawn("python", [scriptPath], {
    env: { ...process.env, [`${name.toUpperCase()}_PORT`]: String(port) },
    stdio: ["pipe", "pipe", "pipe"],
    cwd: process.cwd(),
  });

  const service: ManagedService = {
    name,
    scriptPath,
    port,
    process: pythonProcess,
    status: "running",
    startedAt: new Date(),
    restartCount: existing ? existing.restartCount : 0,
    logs: existing ? existing.logs : [],
  };

  const pushLog = (line: string) => {
    service.logs.push(`[${new Date().toISOString()}] ${line}`);
    if (service.logs.length > MAX_LOG_LINES) {
      service.logs = service.logs.slice(-MAX_LOG_LINES);
    }
  };

  pythonProcess.stdout?.on("data", (data) => {
    const msg = data.toString().trim();
    console.log(`[${name}] ${msg}`);
    pushLog(`[stdout] ${msg}`);
  });

  pythonProcess.stderr?.on("data", (data) => {
    const msg = data.toString().trim();
    console.error(`[${name}] ${msg}`);
    pushLog(`[stderr] ${msg}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
    pushLog(`Process exited with code ${code}`);
    if (service.status === "stopped" || service.status === "restarting") {
      service.process = null;
      return;
    }
    service.process = null;
    if (code !== 0) {
      service.status = "restarting";
      service.restartCount++;
      console.log(`[${name}] Restarting in 5 seconds...`);
      setTimeout(() => startPythonService(name, scriptPath, port), 5000);
    } else {
      service.status = "stopped";
    }
  });

  managedServices.set(name, service);
  return pythonProcess;
}

function restartManagedService(name: string): boolean {
  const service = managedServices.get(name);
  if (!service) return false;

  if (service.process) {
    service.status = "restarting";
    const proc = service.process;
    service.process = null;
    proc.kill("SIGTERM");
    setTimeout(() => {
      try { proc.kill("SIGKILL"); } catch {}
      startPythonService(service.name, service.scriptPath, service.port);
    }, 2000);
  } else {
    startPythonService(service.name, service.scriptPath, service.port);
  }
  return true;
}

function stopManagedService(name: string): boolean {
  const service = managedServices.get(name);
  if (!service || !service.process) return false;
  service.status = "stopped";
  const proc = service.process;
  service.process = null;
  proc.kill("SIGTERM");
  setTimeout(() => {
    try { proc.kill("SIGKILL"); } catch {}
  }, 3000);
  return true;
}

function getManagedServiceInfo(name: string) {
  const service = managedServices.get(name);
  if (!service) return null;
  return {
    name: service.name,
    port: service.port,
    status: service.status,
    startedAt: service.startedAt?.toISOString() || null,
    restartCount: service.restartCount,
    uptime: service.startedAt ? Math.round((Date.now() - service.startedAt.getTime()) / 1000) : 0,
    logLines: service.logs.length,
  };
}

function getManagedServiceLogs(name: string, lines = 50): string[] {
  const service = managedServices.get(name);
  if (!service) return [];
  return service.logs.slice(-lines);
}

function startNodeService(name: string, scriptPath: string, port: number) {
  const existing = managedServices.get(name);

  const service: ManagedService = {
    name,
    scriptPath,
    port,
    process: null,
    status: "running",
    startedAt: new Date(),
    restartCount: existing?.restartCount || 0,
    logs: existing?.logs || [],
  };

  const pushLog = (msg: string) => {
    service.logs.push(`[${new Date().toISOString()}] ${msg}`);
    if (service.logs.length > MAX_LOG_LINES) service.logs.splice(0, service.logs.length - MAX_LOG_LINES);
  };

  const nodeProcess = spawn("npx", ["tsx", scriptPath], {
    env: { ...process.env, PORT: port.toString() },
    stdio: ["pipe", "pipe", "pipe"],
  });

  service.process = nodeProcess;
  pushLog(`Node service started (PID: ${nodeProcess.pid})`);

  nodeProcess.stdout?.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg) {
      console.log(`[${name}] ${msg}`);
      pushLog(msg);
    }
  });

  nodeProcess.stderr?.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg) {
      console.error(`[${name}] ${msg}`);
      pushLog(`[stderr] ${msg}`);
    }
  });

  nodeProcess.on("close", (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
    pushLog(`Process exited with code ${code}`);
    if (service.status === "stopped" || service.status === "restarting") {
      service.process = null;
      return;
    }
    service.process = null;
    if (code !== 0) {
      service.status = "restarting";
      service.restartCount++;
      console.log(`[${name}] Restarting in 5 seconds...`);
      setTimeout(() => startNodeService(name, scriptPath, port), 5000);
    } else {
      service.status = "stopped";
    }
  });

  managedServices.set(name, service);
  return nodeProcess;
}

export { managedServices, restartManagedService, stopManagedService, getManagedServiceInfo, getManagedServiceLogs, startNodeService };

// Em modo Docker cada serviço roda como container independente — não spawnar processos filhos
if (!process.env.DOCKER_MODE || process.env.DOCKER_MODE === "false") {
  startPythonService("contabil", path.join(process.cwd(), "server/python/contabil_service.py"), 8003);
  startPythonService("bi", path.join(process.cwd(), "server/python/bi_engine.py"), 8004);
  startPythonService("automation", path.join(process.cwd(), "server/python/automation_engine.py"), 8005);
  startNodeService("communication", path.join(process.cwd(), "server/communication/engine.ts"), 8006);
} else {
  console.log("[services] DOCKER_MODE=true — microserviços rodando como containers independentes");
}

function startShellService(name: string, scriptPath: string, port: number) {
  const existing = managedServices.get(name);

  const service: ManagedService = {
    name,
    scriptPath,
    port,
    process: null,
    status: "running",
    startedAt: new Date(),
    restartCount: existing?.restartCount || 0,
    logs: existing?.logs || [],
  };

  const pushLog = (msg: string) => {
    service.logs.push(`[${new Date().toISOString()}] ${msg}`);
    if (service.logs.length > MAX_LOG_LINES) service.logs.splice(0, service.logs.length - MAX_LOG_LINES);
  };

  const shellProcess = spawn("bash", [scriptPath], {
    env: { ...process.env },
    stdio: ["pipe", "pipe", "pipe"],
  });

  service.process = shellProcess;
  pushLog(`Shell service started (PID: ${shellProcess.pid})`);

  shellProcess.stdout?.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg) {
      console.log(`[${name}] ${msg}`);
      pushLog(msg);
    }
  });

  shellProcess.stderr?.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg) {
      console.error(`[${name}] ${msg}`);
      pushLog(`[stderr] ${msg}`);
    }
  });

  shellProcess.on("close", (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
    pushLog(`Process exited with code ${code}`);
    if (service.status === "stopped" || service.status === "restarting") {
      service.process = null;
      return;
    }
    service.process = null;
    if (code !== 0) {
      service.status = "restarting";
      service.restartCount++;
      console.log(`[${name}] Restarting in 10 seconds...`);
      setTimeout(() => startShellService(name, scriptPath, port), 10000);
    } else {
      service.status = "stopped";
    }
  });

  managedServices.set(name, service);
  return shellProcess;
}

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: (req) => !req.path.startsWith("/api"),
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later." },
});

app.use("/api", apiLimiter);
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);

// Structured HTTP logging
app.use(httpLogger());

export function log(message: string, source = "express") {
  logger.info(message, { source });
}

// Plus proxy is configured in server/plus/proxy.ts via setupPlusProxy
// It's registered after session middleware to enable SSO authentication

(async () => {
  // Seed master user if not exists
  try {
    const { scrypt, randomBytes } = await import("crypto");
    const { promisify } = await import("util");
    const scryptAsync = promisify(scrypt);
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync("admin", salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
        name: "Administrador Master",
        email: "admin@arcadia.suite",
        role: "admin",
        status: "active",
      });
      console.log("[Seed] Usuário master 'admin' criado com sucesso");
    }
  } catch (e: any) {
    console.log("[Seed] Verificação de usuário master:", e.message);
  }

  await registerRoutes(httpServer, app);

  await registerAllTools();

  const { jobQueueService } = await import("./governance/jobQueue");
  const { pipelineOrchestrator } = await import("./blackboard/PipelineOrchestrator");
  pipelineOrchestrator.registerJobHandlers();
  jobQueueService.startProcessing();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();

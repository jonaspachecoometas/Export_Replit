import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertApplicationSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerSoeRoutes, registerErpRoutes } from "./erp/routes";
import { registerInternalChatRoutes } from "./chat/routes";
import { setupChatSocket } from "./chat/socket";
import { setupCommunitySocket } from "./communities/socket";
import { registerWhatsappRoutes } from "./whatsapp/routes";
import { registerManusRoutes } from "./manus/routes";
import { registerCustomMcpRoutes } from "./mcp/routes";
import { registerAutomationRoutes } from "./automations/routes";
import { registerAutomationEngineRoutes } from "./automations/engine-proxy";
import { registerBiRoutes } from "./bi/routes";
import { registerBiEngineRoutes } from "./bi/engine-proxy";
import { registerCommEngineRoutes } from "./communication/proxy";
import { registerLearningRoutes } from "./learning/routes";
import compassRoutes from "./compass/routes";
import productivityRoutes from "./productivity/routes";
import crmRoutes from "./crm/routes";
import adminRoutes from "./admin/routes";
import productionRoutes from "./production/routes";
import supportRoutes from "./support/routes";
import valuationRoutes from "./valuation/routes";
import ideRoutes from "./ide/routes";
import proxyRoutes from "./proxy/routes";
import loginBridgeRoutes from "./login-bridge/routes";
import emailRoutes from "./email/routes";
import apiCentralRoutes from "./api-central/routes";
import fiscoRoutes from "./fisco/routes";
import contabilRoutes from "./contabil/routes";
import peopleRoutes from "./people/routes";
import { registerFinanceiroRoutes } from "./financeiro/routes";
import { registerCommunityRoutes } from "./communities/routes";
import paraRoutes from "./para/routes";
import protocolsRoutes, { registerAgentCard } from "./protocols";
import erpnextRoutes from "./erpnext/routes";
import qualityRoutes from "./quality/routes";
import lowcodeRoutes from "./lowcode/routes";
import devAgentRoutes from "./devAgent";
import retailRoutes from "./retail/routes";
import marketplaceRoutes from "./marketplace/routes";
import lmsRoutes from "./lms/routes";
import xosRoutes from "./xos/routes";
import governanceRoutes from "./governance/routes";
import { setupPlusProxy } from "./plus/proxy";
import { setupSupersetProxy } from "./superset/proxy";
import { registerSupersetRoutes } from "./superset/routes";
import { setupErpNextProxy } from "./erpnext/proxy";
import { importErpNextRulesForTenant } from "./soe/erpnext-rule-importer";
import { registerEngineRoomRoutes } from "./engine-room/routes";
import plusSsoRoutes from "./plus/sso";
import migrationRoutes from "./migration/routes";
import { githubRoutes } from "./integrations/github";
import autonomousRoutes from "./autonomous/routes";
import blackboardRoutes from "./blackboard/routes";
import pipelineRoutes from "./blackboard/pipelineRoutes";
import { startAllAgents } from "./blackboard/agents";
import { loadModuleRoutes } from "./modules/loader";
import graphRoutes from "./graph/routes";
import { initSocketIO } from "./socket-io";
import { startXosScheduler } from "./xos/scheduler";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth and session setup first
  setupAuth(app);
  
  // Arcádia Plus - Proxy registered AFTER session but BEFORE auth-protected routes
  await setupPlusProxy(app);

  // Apache Superset - Arcádia Insights (substitui Metabase)
  setupSupersetProxy(app);
  registerSupersetRoutes(app);

  // ERPNext container proxy (ativo apenas em DOCKER_MODE ou ERPNEXT_PROXY_ENABLED=true)
  setupErpNextProxy(app);
  
  registerChatRoutes(app);
  registerSoeRoutes(app);
  registerInternalChatRoutes(app);
  // Initialize shared Socket.IO singleton (must be before other socket setups)
  initSocketIO(httpServer);
  setupChatSocket(httpServer);
  setupCommunitySocket(httpServer);
  registerWhatsappRoutes(app);
  registerManusRoutes(app);
  registerCustomMcpRoutes(app);
  registerAutomationRoutes(app);
  registerAutomationEngineRoutes(app);
  registerBiRoutes(app);
  app.use("/api/graph", graphRoutes);
  registerBiEngineRoutes(app);
  registerCommEngineRoutes(app);
  registerLearningRoutes(app);
  app.use("/api/compass", compassRoutes);
  app.use("/api/productivity", productivityRoutes);
  app.use("/api/crm", crmRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/production", productionRoutes);
  app.use("/api/support", supportRoutes);
  app.use("/api/valuation", valuationRoutes);
  app.use("/api/ide", ideRoutes);
  app.use("/api/proxy", proxyRoutes);
  app.use("/api/login-bridge", loginBridgeRoutes);
  app.use("/api/email", emailRoutes);
  app.use("/api/api-central", apiCentralRoutes);
  app.use("/api/fisco", fiscoRoutes);
  app.use("/api/contabil", contabilRoutes);
  app.use("/api/people", peopleRoutes);
  registerFinanceiroRoutes(app);
  registerCommunityRoutes(app);
  app.use("/api/para", paraRoutes);
  app.use("/api/erpnext", erpnextRoutes);

  // SOE — Importar regras do ERPNext para soe_regras
  app.post("/api/soe/erpnext/import-rules", async (req: any, res) => {
    try {
      const tenantId = req.user?.tenantId || req.body?.tenantId;
      const result = await importErpNextRulesForTenant(tenantId);
      res.json({ ok: true, ...result });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });
  app.use("/api/quality", qualityRoutes);
  app.use("/api/lowcode", lowcodeRoutes);
  app.use("/api/dev-agent", devAgentRoutes);
  app.use("/api/retail", retailRoutes);
  app.use("/api/marketplace", marketplaceRoutes);
  app.use("/api/lms", lmsRoutes);
  app.use("/api/xos", xosRoutes);
  app.use("/api/governance", governanceRoutes);
  registerEngineRoomRoutes(app);
  app.use("/api/migration", migrationRoutes);
  app.use("/api/github", githubRoutes);
  app.use("/api/autonomous", autonomousRoutes);
  app.use("/api/blackboard", blackboardRoutes);
  app.use("/api/xos/pipeline", pipelineRoutes);
  
  // Auto-loader de módulos criados pelo Dev Center
  await loadModuleRoutes(app);
  
  // Iniciar os 6 agentes do Blackboard
  startAllAgents();

  // XOS Scheduler: SLA breach checker + supervisor stats broadcaster
  startXosScheduler();
  
  // Central de Protocolos (MCP, A2A, AP2, UCP)
  app.use("/api", protocolsRoutes);
  registerAgentCard(app); // Agent Card na raiz (/.well-known/agent.json)
  
  // Arcádia Plus - SSO routes (proxy already registered at top)
  app.use("/api/plus/sso", plusSsoRoutes);

  app.get("/api/tenants", async (req: any, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const tenants = await storage.getTenants();
      res.json(tenants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tenants" });
    }
  });

  app.get("/api/applications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = req.user!;
      
      if (user.role === "admin") {
        const apps = await storage.getApplications();
        res.json(apps);
      } else {
        const apps = await storage.getUserApplications(user.id);
        res.json(apps);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.get("/api/applications/all", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const apps = await storage.getApplications();
      res.json(apps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.get("/api/applications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const app = await storage.getApplication(req.params.id);
      if (!app) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(app);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const validated = insertApplicationSchema.parse(req.body);
      const newApp = await storage.createApplication(validated);
      
      if (newApp && req.user?.id) {
        await storage.assignApplicationToUser(req.user.id, newApp.id);
      }
      
      res.status(201).json(newApp);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create application" });
    }
  });

  app.patch("/api/applications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const validated = insertApplicationSchema.partial().parse(req.body);
      const updated = await storage.updateApplication(req.params.id, validated);
      if (!updated) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update application" });
    }
  });

  app.delete("/api/applications/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const deleted = await storage.deleteApplication(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete application" });
    }
  });

  app.post("/api/users/:userId/applications/:appId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      await storage.assignApplicationToUser(req.params.userId, req.params.appId);
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to assign application" });
    }
  });

  app.delete("/api/users/:userId/applications/:appId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      await storage.removeApplicationFromUser(req.params.userId, req.params.appId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove application access" });
    }
  });

  return httpServer;
}

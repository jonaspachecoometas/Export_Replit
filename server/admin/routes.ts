import { Router, Request, Response } from "express";
import { db } from "../../db/index";
import { eq, desc, and, or, isNull, inArray, sql } from "drizzle-orm";
import { users, profiles, crmPartners, crmClients, tenants, tenantPlans, partnerClients, partnerCommissions, tenantEmpresas, insertTenantSchema, insertTenantPlanSchema, insertPartnerClientSchema, insertTenantEmpresaSchema } from "@shared/schema";
import fs from "fs";
import path from "path";

const router = Router();

// Helper: Retorna IDs de tenants que o usuário pode acessar
async function getAllowedTenantIds(user: any): Promise<number[] | null> {
  // null = acesso total (master)
  if (!user.tenantId || user.tenantType === "master") return null;
  
  if (user.tenantType === "partner") {
    // Partner vê seu próprio tenant + clientes vinculados
    const clientRelations = await db.select({ clientId: partnerClients.clientId })
      .from(partnerClients)
      .where(eq(partnerClients.partnerId, user.tenantId));
    return [user.tenantId, ...clientRelations.map(r => r.clientId)];
  }
  
  // Client vê apenas seu próprio tenant
  return [user.tenantId];
}

// Helper: Verifica se usuário pode acessar um tenant específico
async function canAccessTenant(user: any, tenantId: number): Promise<boolean> {
  const allowed = await getAllowedTenantIds(user);
  if (allowed === null) return true; // Master pode tudo
  return allowed.includes(tenantId);
}

router.use((req: Request, res: Response, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  const user = req.user as any;
  if (user.role !== "admin" && user.role !== "master") {
    return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
  }
  next();
});

router.get("/profiles", async (req: Request, res: Response) => {
  try {
    const allProfiles = await db.select().from(profiles).orderBy(profiles.name);
    res.json(allProfiles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/profiles", async (req: Request, res: Response) => {
  try {
    const { name, description, type, allowedModules, status } = req.body;
    const [profile] = await db.insert(profiles).values({
      name,
      description,
      type: type || "custom",
      allowedModules: allowedModules || [],
      status: status || "active",
    }).returning();
    res.status(201).json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/profiles/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, allowedModules, status } = req.body;
    const [profile] = await db.update(profiles)
      .set({ name, description, allowedModules, status, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    if (!profile) return res.status(404).json({ error: "Perfil não encontrado" });
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/profiles/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    if (!profile) return res.status(404).json({ error: "Perfil não encontrado" });
    if (profile.isSystem === 1) {
      return res.status(400).json({ error: "Não é possível excluir perfis do sistema" });
    }
    await db.delete(profiles).where(eq(profiles.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users", async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
      profileId: users.profileId,
      partnerId: users.partnerId,
      status: users.status,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    }).from(users).orderBy(users.name);
    
    const usersWithProfile = await Promise.all(allUsers.map(async (user) => {
      let profile = null;
      let partner = null;
      if (user.profileId) {
        const [p] = await db.select().from(profiles).where(eq(profiles.id, user.profileId));
        profile = p;
      }
      if (user.partnerId) {
        const [pt] = await db.select().from(crmPartners).where(eq(crmPartners.id, user.partnerId));
        partner = pt;
      }
      return { ...user, profile, partner };
    }));
    
    res.json(usersWithProfile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { name, email, role, profileId, partnerId, status } = req.body;
    const [user] = await db.update(users)
      .set({ name, email, role, profileId, partnerId, status })
      .where(eq(users.id, id))
      .returning();
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/users/:id/status", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const [user] = await db.update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning();
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/partners/:id/status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const [partner] = await db.update(crmPartners)
      .set({ status, updatedAt: new Date() })
      .where(eq(crmPartners.id, id))
      .returning();
    if (!partner) return res.status(404).json({ error: "Parceiro não encontrado" });
    res.json(partner);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/clients/:id/status", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const [client] = await db.update(crmClients)
      .set({ status, updatedAt: new Date() })
      .where(eq(crmClients.id, id))
      .returning();
    if (!client) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json(client);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const [allUsers] = await db.select({ count: db.$count(users) }).from(users);
    const [activeUsers] = await db.select({ count: db.$count(users) }).from(users).where(eq(users.status, "active"));
    const [allProfiles] = await db.select({ count: db.$count(profiles) }).from(profiles);
    const [allPartners] = await db.select({ count: db.$count(crmPartners) }).from(crmPartners);
    const [activePartners] = await db.select({ count: db.$count(crmPartners) }).from(crmPartners).where(eq(crmPartners.status, "active"));
    const [allClients] = await db.select({ count: db.$count(crmClients) }).from(crmClients);
    const [activeClients] = await db.select({ count: db.$count(crmClients) }).from(crmClients).where(eq(crmClients.status, "active"));
    
    res.json({
      users: { total: allUsers.count, active: activeUsers.count },
      profiles: { total: allProfiles.count },
      partners: { total: allPartners.count, active: activePartners.count },
      clients: { total: allClients.count, active: activeClients.count },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/libraries", async (req: Request, res: Response) => {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    
    const dependencies = Object.entries(packageJson.dependencies || {}).map(([name, version]) => ({
      name,
      version: String(version).replace(/^\^|~/, ""),
      type: "production",
      category: categorizePackage(name),
    }));
    
    const devDependencies = Object.entries(packageJson.devDependencies || {}).map(([name, version]) => ({
      name,
      version: String(version).replace(/^\^|~/, ""),
      type: "development",
      category: categorizePackage(name),
    }));
    
    res.json({
      nodejs: {
        dependencies,
        devDependencies,
        total: dependencies.length + devDependencies.length,
      },
      python: {
        dependencies: [],
        total: 0,
        note: "Python microservices planejados para próximas versões",
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function categorizePackage(name: string): string {
  if (name.includes("react") || name.includes("radix") || name.includes("tailwind")) return "UI/Frontend";
  if (name.includes("express") || name.includes("passport") || name.includes("session")) return "Backend/Auth";
  if (name.includes("drizzle") || name.includes("pg") || name.includes("connect-pg")) return "Database";
  if (name.includes("socket") || name.includes("ws") || name.includes("whatsapp")) return "Real-time/Comunicação";
  if (name.includes("openai") || name.includes("ai")) return "AI/ML";
  if (name.includes("zod") || name.includes("hook-form")) return "Validação/Forms";
  if (name.includes("vite") || name.includes("typescript") || name.includes("tsx") || name.includes("esbuild")) return "Build/Dev Tools";
  if (name.includes("lucide") || name.includes("framer")) return "Icons/Animações";
  if (name.includes("pdf") || name.includes("docx") || name.includes("csv") || name.includes("zip")) return "Documentos/Arquivos";
  if (name.includes("recharts") || name.includes("chart")) return "Visualização";
  if (name.includes("date") || name.includes("day-picker")) return "Data/Tempo";
  return "Utilitários";
}

// ==========================================
// MULTI-TENANT MANAGEMENT ROUTES
// ==========================================

// GET /api/admin/tenants - List all tenants with hierarchy
router.get("/tenants", async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const user = req.user as any;
    
    const allTenants = await db.select().from(tenants).orderBy(desc(tenants.createdAt));
    
    // Filtrar por tenant do usuário
    let filteredByAccess = allTenants;
    if (user.tenantType === "partner") {
      // Partner vê apenas seu próprio tenant e seus clientes
      const clientRelations = await db.select().from(partnerClients)
        .where(eq(partnerClients.partnerId, user.tenantId));
      const clientIds = clientRelations.map(r => r.clientId);
      filteredByAccess = allTenants.filter(t => 
        t.id === user.tenantId || clientIds.includes(t.id)
      );
    } else if (user.tenantType === "client") {
      // Client vê apenas seu próprio tenant
      filteredByAccess = allTenants.filter(t => t.id === user.tenantId);
    }
    // Master (tenantType === "master") vê todos
    
    // Filter by type if specified
    const filteredTenants = type 
      ? filteredByAccess.filter(t => t.tenantType === type)
      : filteredByAccess;
    
    // Add parent tenant info
    const tenantsWithParent = await Promise.all(filteredTenants.map(async (tenant) => {
      let parentTenant = null;
      if (tenant.parentTenantId) {
        const [parent] = await db.select().from(tenants).where(eq(tenants.id, tenant.parentTenantId));
        parentTenant = parent ? { id: parent.id, name: parent.name, tenantType: parent.tenantType } : null;
      }
      
      // Count child tenants
      const childTenants = allTenants.filter(t => t.parentTenantId === tenant.id);
      
      return { ...tenant, parentTenant, childCount: childTenants.length };
    }));
    
    res.json(tenantsWithParent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: resolve plan features for a tenant based on plan code
async function resolvePlanFeatures(planCode: string): Promise<Record<string, any> | null> {
  const [plan] = await db.select().from(tenantPlans).where(eq(tenantPlans.code, planCode));
  if (!plan || !plan.features) return null;
  return plan.features as Record<string, any>;
}

// POST /api/admin/tenants - Create new tenant
router.post("/tenants", async (req: Request, res: Response) => {
  try {
    const validated = insertTenantSchema.parse(req.body);
    
    if (validated.plan && !validated.features) {
      const planFeatures = await resolvePlanFeatures(validated.plan);
      if (planFeatures) {
        validated.features = planFeatures as any;
      }
    }
    
    const [tenant] = await db.insert(tenants).values(validated).returning();
    res.status(201).json(tenant);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/admin/tenants/:id - Update tenant
router.patch("/tenants/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const user = req.user as any;
    
    if (!await canAccessTenant(user, id)) {
      return res.status(403).json({ error: "Sem permissão para modificar este tenant" });
    }
    
    const { name, email, phone, plan, status, tenantType, parentTenantId, partnerCode, commissionRate, maxUsers, maxStorageMb, features, billingEmail, trialEndsAt } = req.body;
    
    let resolvedFeatures = features;
    if (plan && !features) {
      const [currentTenant] = await db.select().from(tenants).where(eq(tenants.id, id));
      if (currentTenant && currentTenant.plan !== plan) {
        const planFeatures = await resolvePlanFeatures(plan);
        if (planFeatures) {
          resolvedFeatures = planFeatures;
        }
      }
    }
    
    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (plan !== undefined) updateData.plan = plan;
    if (status !== undefined) updateData.status = status;
    if (tenantType !== undefined) updateData.tenantType = tenantType;
    if (parentTenantId !== undefined) updateData.parentTenantId = parentTenantId;
    if (partnerCode !== undefined) updateData.partnerCode = partnerCode;
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
    if (maxUsers !== undefined) updateData.maxUsers = maxUsers;
    if (maxStorageMb !== undefined) updateData.maxStorageMb = maxStorageMb;
    if (resolvedFeatures !== undefined) updateData.features = resolvedFeatures;
    if (billingEmail !== undefined) updateData.billingEmail = billingEmail;
    if (trialEndsAt !== undefined) updateData.trialEndsAt = trialEndsAt;
    
    const [tenant] = await db.update(tenants)
      .set(updateData)
      .where(eq(tenants.id, id))
      .returning();
    
    if (!tenant) return res.status(404).json({ error: "Tenant não encontrado" });
    res.json(tenant);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/tenants/:id - Delete tenant
router.delete("/tenants/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const user = req.user as any;
    
    // Apenas master pode excluir tenants
    if (user.tenantType !== "master") {
      return res.status(403).json({ error: "Apenas master pode excluir tenants" });
    }
    
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    if (!tenant) return res.status(404).json({ error: "Tenant não encontrado" });
    if (tenant.tenantType === "master") {
      return res.status(400).json({ error: "Não é possível excluir o tenant master" });
    }
    await db.delete(tenants).where(eq(tenants.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/tenants/hierarchy - Get hierarchy tree
router.get("/tenants/hierarchy", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const allowedIds = await getAllowedTenantIds(user);
    
    let allTenants = await db.select().from(tenants).orderBy(tenants.name);
    
    // Filtrar por acesso do usuário
    if (allowedIds !== null) {
      allTenants = allTenants.filter(t => allowedIds.includes(t.id));
    }
    
    // Build hierarchy tree
    const buildTree = (parentId: number | null): any[] => {
      return allTenants
        .filter(t => t.parentTenantId === parentId)
        .map(t => ({
          ...t,
          children: buildTree(t.id)
        }));
    };
    
    // Start from master tenants (no parent) or user's tenant
    const hierarchy = allowedIds === null 
      ? buildTree(null) 
      : allTenants.map(t => ({ ...t, children: [] }));
    res.json(hierarchy);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// TENANT PLANS ROUTES
// ==========================================

// GET /api/admin/plans - List all plans
router.get("/plans", async (req: Request, res: Response) => {
  try {
    const allPlans = await db.select().from(tenantPlans).orderBy(tenantPlans.sortOrder);
    res.json(allPlans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/plans - Create new plan
router.post("/plans", async (req: Request, res: Response) => {
  try {
    const validated = insertTenantPlanSchema.parse(req.body);
    const [plan] = await db.insert(tenantPlans).values(validated).returning();
    res.status(201).json(plan);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/admin/plans/:id - Update plan
router.patch("/plans/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, maxUsers, maxStorageMb, features, monthlyPrice, yearlyPrice, trialDays, isActive, sortOrder } = req.body;
    
    const [plan] = await db.update(tenantPlans)
      .set({ name, description, maxUsers, maxStorageMb, features, monthlyPrice, yearlyPrice, trialDays, isActive, sortOrder })
      .where(eq(tenantPlans.id, id))
      .returning();
    
    if (!plan) return res.status(404).json({ error: "Plano não encontrado" });
    res.json(plan);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/plans/:id - Delete plan
router.delete("/plans/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(tenantPlans).where(eq(tenantPlans.id, id));
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/plans/:id/propagate - Apply plan features to all tenants with this plan
router.post("/plans/:id/propagate", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [plan] = await db.select().from(tenantPlans).where(eq(tenantPlans.id, id));
    if (!plan) return res.status(404).json({ error: "Plano não encontrado" });
    if (!plan.features) return res.status(400).json({ error: "Plano sem módulos definidos" });
    
    const affected = await db.update(tenants)
      .set({ features: plan.features, maxUsers: plan.maxUsers, maxStorageMb: plan.maxStorageMb, updatedAt: new Date() })
      .where(eq(tenants.plan, plan.code))
      .returning();
    
    res.json({ propagated: affected.length, planCode: plan.code });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/plans/seed - Seed default plans
router.post("/plans/seed", async (req: Request, res: Response) => {
  try {
    const existing = await db.select().from(tenantPlans);
    if (existing.length > 0) {
      return res.json({ message: "Planos já existem", count: existing.length });
    }
    
    const defaultPlans: any[] = [
      {
        code: "free",
        name: "Gratuito",
        description: "Plano básico gratuito para experimentar",
        tenantType: "client",
        maxUsers: 2,
        maxStorageMb: 500,
        monthlyPrice: 0,
        yearlyPrice: 0,
        trialDays: 14,
        sortOrder: 1,
        features: { erp: true, crm: true },
      },
      {
        code: "starter",
        name: "Starter",
        description: "Para pequenas empresas começando",
        tenantType: "client",
        maxUsers: 5,
        maxStorageMb: 2000,
        monthlyPrice: 9900,
        yearlyPrice: 99000,
        trialDays: 14,
        sortOrder: 2,
        features: { erp: true, crm: true, bi: true, fisco: true, whatsapp: true, compass: true },
      },
      {
        code: "pro",
        name: "Profissional",
        description: "Para empresas em crescimento",
        tenantType: "client",
        maxUsers: 15,
        maxStorageMb: 10000,
        monthlyPrice: 29900,
        yearlyPrice: 299000,
        trialDays: 14,
        sortOrder: 3,
        features: { erp: true, crm: true, bi: true, fisco: true, retail: true, plus: true, whatsapp: true, manus: true, cockpit: true, compass: true, support: true, biblioteca: true },
      },
      {
        code: "enterprise",
        name: "Enterprise",
        description: "Para grandes empresas",
        tenantType: "client",
        maxUsers: 100,
        maxStorageMb: 50000,
        monthlyPrice: 99900,
        yearlyPrice: 999000,
        trialDays: 30,
        sortOrder: 4,
        features: { erp: true, crm: true, bi: true, fisco: true, retail: true, plus: true, whatsapp: true, manus: true, ide: true, cockpit: true, compass: true, production: true, support: true, xosCrm: true, centralApis: true, comunidades: true, biblioteca: true },
      },
      {
        code: "partner_starter",
        name: "Parceiro Starter",
        description: "Para consultores e pequenos integradores",
        tenantType: "partner",
        maxUsers: 10,
        maxStorageMb: 5000,
        monthlyPrice: 19900,
        yearlyPrice: 199000,
        trialDays: 14,
        sortOrder: 5,
        features: { erp: true, crm: true, bi: true, fisco: true, retail: true, whatsapp: true, compass: true, support: true },
      },
      {
        code: "partner_pro",
        name: "Parceiro Pro",
        description: "Para integradores e consultorias",
        tenantType: "partner",
        maxUsers: 50,
        maxStorageMb: 25000,
        monthlyPrice: 49900,
        yearlyPrice: 499000,
        trialDays: 30,
        sortOrder: 6,
        features: { erp: true, crm: true, bi: true, fisco: true, retail: true, plus: true, whatsapp: true, manus: true, ide: true, cockpit: true, compass: true, production: true, support: true, xosCrm: true, centralApis: true, comunidades: true, biblioteca: true },
      },
    ];
    
    const created = await db.insert(tenantPlans).values(defaultPlans).returning();
    res.status(201).json({ message: "Planos criados com sucesso", count: created.length, plans: created });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PARTNER-CLIENT RELATIONSHIPS
// ==========================================

// GET /api/admin/partner-clients - List partner-client relationships
router.get("/partner-clients", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const allowedIds = await getAllowedTenantIds(user);
    
    let relationships = await db.select().from(partnerClients).orderBy(desc(partnerClients.startedAt));
    
    // Filtrar por acesso do usuário
    if (allowedIds !== null) {
      relationships = relationships.filter(r => 
        allowedIds.includes(r.partnerId) || allowedIds.includes(r.clientId)
      );
    }
    
    // Add partner and client info
    const withDetails = await Promise.all(relationships.map(async (rel) => {
      const [partner] = await db.select().from(tenants).where(eq(tenants.id, rel.partnerId));
      const [client] = await db.select().from(tenants).where(eq(tenants.id, rel.clientId));
      return {
        ...rel,
        partner: partner ? { id: partner.id, name: partner.name } : null,
        client: client ? { id: client.id, name: client.name } : null,
      };
    }));
    
    res.json(withDetails);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/partner-clients - Create partner-client relationship
router.post("/partner-clients", async (req: Request, res: Response) => {
  try {
    const validated = insertPartnerClientSchema.parse(req.body);
    const [relationship] = await db.insert(partnerClients).values(validated).returning();
    res.status(201).json(relationship);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// PARTNER COMMISSIONS
// ==========================================

// GET /api/admin/commissions - List all commissions
router.get("/commissions", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const allowedIds = await getAllowedTenantIds(user);
    const { partnerId, status } = req.query;
    
    let allCommissions = await db.select().from(partnerCommissions).orderBy(desc(partnerCommissions.createdAt));
    
    // Filtrar por acesso do usuário
    if (allowedIds !== null) {
      allCommissions = allCommissions.filter(c => 
        allowedIds.includes(c.partnerId) || allowedIds.includes(c.clientId)
      );
    }
    
    if (partnerId) {
      allCommissions = allCommissions.filter(c => c.partnerId === parseInt(partnerId as string));
    }
    if (status) {
      allCommissions = allCommissions.filter(c => c.status === status);
    }
    
    // Add partner and client info
    const withDetails = await Promise.all(allCommissions.map(async (comm) => {
      const [partner] = await db.select().from(tenants).where(eq(tenants.id, comm.partnerId));
      const [client] = await db.select().from(tenants).where(eq(tenants.id, comm.clientId));
      return {
        ...comm,
        partner: partner ? { id: partner.id, name: partner.name } : null,
        client: client ? { id: client.id, name: client.name } : null,
      };
    }));
    
    res.json(withDetails);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/commissions/:id/approve - Approve commission
router.patch("/commissions/:id/approve", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [commission] = await db.update(partnerCommissions)
      .set({ status: "approved", approvedAt: new Date() })
      .where(eq(partnerCommissions.id, id))
      .returning();
    
    if (!commission) return res.status(404).json({ error: "Comissão não encontrada" });
    res.json(commission);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/admin/commissions/:id/pay - Mark commission as paid
router.patch("/commissions/:id/pay", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { paymentReference } = req.body;
    
    const [commission] = await db.update(partnerCommissions)
      .set({ status: "paid", paidAt: new Date(), paymentReference })
      .where(eq(partnerCommissions.id, id))
      .returning();
    
    if (!commission) return res.status(404).json({ error: "Comissão não encontrada" });
    res.json(commission);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/admin/tenants/stats - Tenant statistics
router.get("/tenants/stats", async (req: Request, res: Response) => {
  try {
    const allTenants = await db.select().from(tenants);
    
    const stats = {
      total: allTenants.length,
      byType: {
        master: allTenants.filter(t => t.tenantType === "master").length,
        partner: allTenants.filter(t => t.tenantType === "partner").length,
        client: allTenants.filter(t => t.tenantType === "client").length,
      },
      byStatus: {
        active: allTenants.filter(t => t.status === "active").length,
        trial: allTenants.filter(t => t.status === "trial").length,
        suspended: allTenants.filter(t => t.status === "suspended").length,
        cancelled: allTenants.filter(t => t.status === "cancelled").length,
      }
    };
    
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== TENANT EMPRESAS (Matriz/Filiais) ==========

router.get("/empresas", async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.query;
    const user = req.user as any;
    
    let query;
    if (tenantId) {
      const tid = parseInt(tenantId as string);
      if (!(await canAccessTenant(user, tid))) {
        return res.status(403).json({ error: "Sem permissão para este tenant" });
      }
      query = await db.select().from(tenantEmpresas)
        .where(eq(tenantEmpresas.tenantId, tid))
        .orderBy(desc(tenantEmpresas.tipo), tenantEmpresas.razaoSocial);
    } else {
      const allowed = await getAllowedTenantIds(user);
      if (allowed) {
        query = await db.select().from(tenantEmpresas)
          .where(inArray(tenantEmpresas.tenantId, allowed))
          .orderBy(desc(tenantEmpresas.tipo), tenantEmpresas.razaoSocial);
      } else {
        query = await db.select().from(tenantEmpresas)
          .orderBy(desc(tenantEmpresas.tipo), tenantEmpresas.razaoSocial);
      }
    }
    res.json(query);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/empresas/:id", async (req: Request, res: Response) => {
  try {
    const [empresa] = await db.select().from(tenantEmpresas)
      .where(eq(tenantEmpresas.id, parseInt(req.params.id)));
    if (!empresa) return res.status(404).json({ error: "Empresa não encontrada" });
    
    const user = req.user as any;
    if (!(await canAccessTenant(user, empresa.tenantId))) {
      return res.status(403).json({ error: "Sem permissão" });
    }
    res.json(empresa);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/empresas", async (req: Request, res: Response) => {
  try {
    const data = insertTenantEmpresaSchema.parse(req.body);
    const user = req.user as any;
    if (!(await canAccessTenant(user, data.tenantId))) {
      return res.status(403).json({ error: "Sem permissão para este tenant" });
    }
    const [empresa] = await db.insert(tenantEmpresas).values(data).returning();
    res.json(empresa);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/empresas/:id", async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(tenantEmpresas)
      .where(eq(tenantEmpresas.id, parseInt(req.params.id)));
    if (!existing) return res.status(404).json({ error: "Empresa não encontrada" });
    
    const user = req.user as any;
    if (!(await canAccessTenant(user, existing.tenantId))) {
      return res.status(403).json({ error: "Sem permissão" });
    }
    
    const [empresa] = await db.update(tenantEmpresas)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(tenantEmpresas.id, parseInt(req.params.id)))
      .returning();
    res.json(empresa);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/empresas/:id", async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(tenantEmpresas)
      .where(eq(tenantEmpresas.id, parseInt(req.params.id)));
    if (!existing) return res.status(404).json({ error: "Empresa não encontrada" });
    
    const user = req.user as any;
    if (!(await canAccessTenant(user, existing.tenantId))) {
      return res.status(403).json({ error: "Sem permissão" });
    }
    
    await db.delete(tenantEmpresas).where(eq(tenantEmpresas.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

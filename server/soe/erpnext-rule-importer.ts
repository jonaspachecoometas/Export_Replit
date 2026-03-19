// SOE — ERPNext Rule Importer
// Lê DocTypes e Workflows do ERPNext via API REST e converte
// em soe_regras para o SOE Rule Engine.
//
// Uso:
//   import { importErpNextRules } from "./erpnext-rule-importer";
//   await importErpNextRules(tenantId);
//
// As regras geradas ficam na tabela soe_regras com origemPadrao=false
// (origem: "erpnext") e podem ser sobrescritas por regras custom do tenant.

import { db } from "../../db";
import { soeRegras } from "@shared/schema";
import { and, eq } from "drizzle-orm";

// DocTypes de negócio que queremos importar regras
const DOCTYPES_ALVO = [
  "Sales Order",
  "Purchase Order",
  "Sales Invoice",
  "Purchase Invoice",
  "Delivery Note",
  "Purchase Receipt",
  "Payment Entry",
  "Journal Entry",
  "Item",
  "Customer",
  "Supplier",
  "Stock Entry",
  "Quotation",
];

// Mapa DocType → trigger SOE correspondente
const DOCTYPE_TRIGGER_MAP: Record<string, string> = {
  "Sales Order": "pre_sales_order",
  "Purchase Order": "pre_purchase_order",
  "Sales Invoice": "pre_nfe_emissao",
  "Purchase Invoice": "pre_compra_recebida",
  "Delivery Note": "pre_entrega",
  "Purchase Receipt": "pre_recebimento_mercadoria",
  "Payment Entry": "pre_pagamento",
  "Journal Entry": "pre_lancamento_contabil",
  "Item": "pre_cadastro_produto",
  "Customer": "pre_cadastro_cliente",
  "Supplier": "pre_cadastro_fornecedor",
  "Stock Entry": "pre_movimentacao_estoque",
  "Quotation": "pre_orcamento",
};

interface FrappeDocTypeField {
  fieldname: string;
  label?: string;
  fieldtype: string;
  reqd?: number;
  options?: string;
  depends_on?: string;
}

interface FrappeWorkflowState {
  state: string;
  doc_status?: string;
  allow_edit?: string;
}

interface FrappeWorkflowTransition {
  state: string;
  action: string;
  next_state: string;
  allowed?: string;
}

interface FrappeWorkflow {
  name: string;
  document_type: string;
  is_active: number;
  states?: FrappeWorkflowState[];
  transitions?: FrappeWorkflowTransition[];
}

function getErpNextUrl(): string {
  // Em modo container, usa o serviço Docker interno
  const dockerMode = process.env.DOCKER_MODE === "true";
  if (dockerMode) {
    const host = process.env.ERPNEXT_CONTAINER_HOST || "erpnext";
    const port = process.env.ERPNEXT_CONTAINER_PORT || "8080";
    return `http://${host}:${port}`;
  }
  return process.env.ERPNEXT_URL || "";
}

function getAuthHeader(): Record<string, string> {
  const key = process.env.ERPNEXT_API_KEY || "";
  const secret = process.env.ERPNEXT_API_SECRET || "";
  return {
    Authorization: `token ${key}:${secret}`,
    "Content-Type": "application/json",
  };
}

async function fetchDocTypeFields(baseUrl: string, doctype: string): Promise<FrappeDocTypeField[]> {
  try {
    const resp = await fetch(
      `${baseUrl}/api/resource/DocType/${encodeURIComponent(doctype)}`,
      { headers: getAuthHeader(), signal: AbortSignal.timeout(10000) }
    );
    if (!resp.ok) return [];
    const data = await resp.json() as any;
    return (data?.data?.fields as FrappeDocTypeField[]) || [];
  } catch {
    return [];
  }
}

async function fetchWorkflows(baseUrl: string, doctype: string): Promise<FrappeWorkflow[]> {
  try {
    const resp = await fetch(
      `${baseUrl}/api/resource/Workflow?filters=[["document_type","=","${doctype}"],["is_active","=",1]]&fields=["name","document_type","is_active"]`,
      { headers: getAuthHeader(), signal: AbortSignal.timeout(10000) }
    );
    if (!resp.ok) return [];
    const data = await resp.json() as any;
    const workflows: FrappeWorkflow[] = data?.data || [];

    // Busca detalhes de cada workflow (states/transitions)
    const detailed: FrappeWorkflow[] = [];
    for (const wf of workflows) {
      try {
        const detResp = await fetch(
          `${baseUrl}/api/resource/Workflow/${encodeURIComponent(wf.name)}`,
          { headers: getAuthHeader(), signal: AbortSignal.timeout(10000) }
        );
        if (detResp.ok) {
          const det = await detResp.json() as any;
          detailed.push(det.data);
        }
      } catch {
        detailed.push(wf);
      }
    }
    return detailed;
  } catch {
    return [];
  }
}

function campoParaSoe(field: FrappeDocTypeField, doctype: string, trigger: string) {
  // Mapeamento de nomes de campo Frappe → nomes SOE
  const fieldMap: Record<string, string> = {
    customer: "clienteId",
    supplier: "fornecedorId",
    item_code: "itemCodigo",
    qty: "quantidade",
    rate: "valorUnitario",
    amount: "valorTotal",
    posting_date: "dataEmissao",
    due_date: "vencimento",
    payment_terms_template: "condicaoPagamento",
    cost_center: "centroCusto",
    company: "empresaNome",
  };
  return fieldMap[field.fieldname] || field.fieldname;
}

function gerarRegraObrigatorio(
  field: FrappeDocTypeField,
  doctype: string,
  trigger: string,
  tenantId: number | undefined
) {
  const campoSoe = campoParaSoe(field, doctype, trigger);
  return {
    tenantId,
    dominio: "business" as const,
    trigger,
    nome: `ERPNext: ${doctype} — ${field.label || field.fieldname} obrigatório`,
    condicao: {},
    acao: {
      validar: {
        campo: campoSoe,
        obrigatorio: true,
      },
    },
    prioridade: 50,
    ativo: true,
    origemPadrao: false,
  };
}

export async function importErpNextRules(tenantId?: number): Promise<{
  imported: number;
  skipped: number;
  errors: string[];
}> {
  const baseUrl = getErpNextUrl();

  if (!baseUrl) {
    return { imported: 0, skipped: 0, errors: ["ERPNEXT_URL não configurado"] };
  }

  console.log(`[SOE RuleImporter] Iniciando importação de regras ERPNext de ${baseUrl}...`);

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const doctype of DOCTYPES_ALVO) {
    const trigger = DOCTYPE_TRIGGER_MAP[doctype];
    if (!trigger) continue;

    try {
      // 1. Campos obrigatórios do DocType
      const fields = await fetchDocTypeFields(baseUrl, doctype);
      const requiredFields = fields.filter((f) => f.reqd === 1 && f.fieldname !== "name");

      for (const field of requiredFields) {
        const ruleId = `erpnext:${doctype.toLowerCase().replace(/ /g, "_")}:${field.fieldname}:reqd`;

        // Verifica se já existe
        try {
          const existing = await db.query.soeRegras?.findFirst?.({
            where: (t: any, { eq }: any) => eq(t.id, ruleId),
          });
          if (existing) { skipped++; continue; }
        } catch { /* tabela pode não existir ainda */ }

        try {
          const ruleData = gerarRegraObrigatorio(field, doctype, trigger, tenantId);
          await db.insert(soeRegras).values({
            id: ruleId,
            ...ruleData,
            condicao: ruleData.condicao,
            acao: ruleData.acao,
          } as any);
          imported++;
        } catch (e: any) {
          errors.push(`${doctype}/${field.fieldname}: ${e.message}`);
        }
      }

      // 2. Workflows ativos → regras de estado permitido
      const workflows = await fetchWorkflows(baseUrl, doctype);
      for (const wf of workflows) {
        if (!wf.transitions?.length) continue;

        // Extrai ações permitidas por estado → regra de validação de status
        const allowedActions = wf.transitions.map((t) => t.action).filter(Boolean);
        if (allowedActions.length === 0) continue;

        const ruleId = `erpnext:wf:${wf.name.toLowerCase().replace(/ /g, "_")}`;

        try {
          const existing = await db.query.soeRegras?.findFirst?.({
            where: (t: any, { eq }: any) => eq(t.id, ruleId),
          });
          if (existing) { skipped++; continue; }
        } catch { /* ok */ }

        try {
          await db.insert(soeRegras).values({
            id: ruleId,
            tenantId,
            dominio: "business",
            trigger,
            nome: `ERPNext Workflow: ${wf.name}`,
            condicao: {},
            acao: {
              set: {
                _erpnextWorkflow: wf.name,
                _erpnextAllowedActions: allowedActions,
              },
            },
            prioridade: 80,
            ativo: true,
            origemPadrao: false,
          } as any);
          imported++;
        } catch (e: any) {
          errors.push(`Workflow ${wf.name}: ${e.message}`);
        }
      }

      console.log(`[SOE RuleImporter] ${doctype}: ${requiredFields.length} campos obrigatórios, ${workflows.length} workflow(s)`);
    } catch (e: any) {
      errors.push(`DocType ${doctype}: ${e.message}`);
    }
  }

  console.log(`[SOE RuleImporter] Concluído: ${imported} importadas, ${skipped} já existiam, ${errors.length} erros`);
  return { imported, skipped, errors };
}

// Endpoint para disparar importação via API
export async function importErpNextRulesForTenant(tenantId: number): Promise<{
  imported: number;
  skipped: number;
  errors: string[];
}> {
  return importErpNextRules(tenantId);
}

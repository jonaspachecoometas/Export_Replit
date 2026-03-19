// SOE Rule Engine — Motor Central de Regras
// Intercepta chamadas às rotas SOE antes de despachar ao motor (Plus/ERPNext/local)
// e aplica regras configuráveis de negócio, fiscal, contábil e financeiro.

import { db } from "../../db/index";
import { soeRegras, soeEventos } from "@shared/schema";
import { eq, and, isNull, or } from "drizzle-orm";
import type { SoeRule, RuleContext, EnrichedPayload, SoeRuleCondition } from "./types";
import { FISCAL_RULES_PADRAO } from "./fiscal-rules";
import { BUSINESS_RULES_PADRAO } from "./business-rules";

const DEFAULT_RULES: SoeRule[] = [...FISCAL_RULES_PADRAO, ...BUSINESS_RULES_PADRAO];

export class SoeRuleEngine {
  private static instance: SoeRuleEngine;

  static getInstance(): SoeRuleEngine {
    if (!SoeRuleEngine.instance) SoeRuleEngine.instance = new SoeRuleEngine();
    return SoeRuleEngine.instance;
  }

  // Aplica todas as regras ativas para um trigger + contexto
  async apply(
    trigger: string,
    payload: Record<string, any>,
    context: RuleContext
  ): Promise<EnrichedPayload> {
    const start = Date.now();
    const appliedRules: string[] = [];
    const validationErrors: string[] = [];

    try {
      // Carrega regras do banco (custom do tenant) + defaults hardcoded
      const rules = await this.getActiveRules(trigger, context);

      // Enriquece payload com contexto (empresa, regime tributário)
      let enriched = this.enrichWithContext(payload, context);

      // Aplica cada regra em ordem de prioridade
      for (const rule of rules.sort((a, b) => a.prioridade - b.prioridade)) {
        if (!this.avaliarCondicao(rule.condicao, enriched, context)) continue;

        const result = this.aplicarAcao(rule.acao, enriched);
        if (result.validationError) {
          validationErrors.push(`[${rule.id}] ${result.validationError}`);
        } else {
          enriched = result.payload;
          appliedRules.push(rule.id);
        }
      }

      // Registra evento no banco (async, não bloqueia a response)
      this.logEvent(trigger, payload, enriched, appliedRules, context, Date.now() - start).catch(
        (e) => console.error("[SoeRuleEngine] log error:", e.message)
      );

      return { payload: enriched, appliedRules, validationErrors };
    } catch (err: any) {
      console.error("[SoeRuleEngine] apply error:", err.message);
      return { payload, appliedRules, validationErrors };
    }
  }

  private async getActiveRules(trigger: string, context: RuleContext): Promise<SoeRule[]> {
    // Regras do banco (custom do tenant)
    let dbRules: SoeRule[] = [];
    try {
      const rows = await db
        .select()
        .from(soeRegras)
        .where(
          and(
            eq(soeRegras.trigger, trigger),
            eq(soeRegras.ativo, true),
            or(
              isNull(soeRegras.tenantId),
              eq(soeRegras.tenantId, context.tenantId ?? 0)
            )
          )
        );
      dbRules = rows.map((r) => ({
        id: r.id,
        dominio: r.dominio as any,
        trigger: r.trigger,
        nome: r.nome,
        condicao: r.condicao as any,
        acao: r.acao as any,
        prioridade: r.prioridade ?? 10,
        ativo: r.ativo ?? true,
      }));
    } catch {
      // Banco pode não ter a tabela ainda (antes de migration)
    }

    // Regras padrão hardcoded (filtradas pelo trigger)
    const defaults = DEFAULT_RULES.filter((r) => r.trigger === trigger && r.ativo);

    // Merge: regras do banco sobrescrevem defaults com mesmo ID
    const merged = new Map<string, SoeRule>();
    for (const r of defaults) merged.set(r.id, r);
    for (const r of dbRules) merged.set(r.id, r);

    return Array.from(merged.values());
  }

  private enrichWithContext(
    payload: Record<string, any>,
    context: RuleContext
  ): Record<string, any> {
    return {
      ...payload,
      _contexto: {
        tenantId: context.tenantId,
        empresaId: context.empresaId,
        motor: context.motor,
        regimeTributario: context.empresa?.regimeTributario,
        uf: context.empresa?.uf,
      },
      // Atalhos para condições
      regimeTributario: context.empresa?.regimeTributario ?? payload.regimeTributario,
    };
  }

  private avaliarCondicao(
    condicao: SoeRuleCondition,
    payload: Record<string, any>,
    _context: RuleContext
  ): boolean {
    if (!condicao || Object.keys(condicao).length === 0) return true;

    for (const [key, expected] of Object.entries(condicao)) {
      // Condições internas (_xxx)
      if (key === "_cfopNaoDefinido") {
        if (expected && payload.cfop) return false;
        continue;
      }
      if (key === "_operacao") {
        // Infere operação pelo tipo (simplificado)
        if (expected === "venda" && payload._tipo !== "venda") return false;
        continue;
      }
      if (key === "_interestadual") {
        const interestadual = payload.ufDestinatario && payload.ufEmitente &&
          payload.ufDestinatario !== payload.ufEmitente;
        if (expected !== interestadual) return false;
        continue;
      }

      const actual = this.getNestedValue(payload, key);

      if (Array.isArray(expected)) {
        if (!expected.includes(actual)) return false;
      } else if (typeof expected === "object" && expected !== null) {
        if ("_lt" in expected && !(actual < expected._lt)) return false;
        if ("_gt" in expected && !(actual > expected._gt)) return false;
        if ("_eq" in expected && actual !== expected._eq) return false;
      } else {
        if (actual !== expected) return false;
      }
    }
    return true;
  }

  private aplicarAcao(
    acao: any,
    payload: Record<string, any>
  ): { payload: Record<string, any>; validationError?: string } {
    let result = { ...payload };

    if (acao.set) {
      for (const [path, value] of Object.entries(acao.set)) {
        result = this.setNestedValue(result, path, value);
      }
    }

    if (acao.validar) {
      const { campo, obrigatorio, formato } = acao.validar;
      const valor = this.getNestedValue(payload, campo);
      if (obrigatorio && !valor) {
        return { payload, validationError: `Campo obrigatório ausente: ${campo}` };
      }
      if (formato && valor) {
        const re = typeof formato === "string" ? new RegExp(formato) : formato;
        if (!re.test(String(valor))) {
          return { payload, validationError: `Campo ${campo} com formato inválido: ${valor}` };
        }
      }
    }

    return { payload: result };
  }

  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split(".").reduce((curr, key) => curr?.[key], obj);
  }

  private setNestedValue(
    obj: Record<string, any>,
    path: string,
    value: any
  ): Record<string, any> {
    const result = { ...obj };
    const keys = path.split(".");
    let curr: any = result;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!curr[keys[i]]) curr[keys[i]] = {};
      curr = curr[keys[i]];
    }
    curr[keys[keys.length - 1]] = value;
    return result;
  }

  private async logEvent(
    trigger: string,
    payloadEntrada: any,
    payloadSaida: any,
    regraIds: string[],
    context: RuleContext,
    duracaoMs: number
  ) {
    try {
      await db.insert(soeEventos).values({
        tenantId: context.tenantId,
        empresaId: context.empresaId,
        evento: trigger,
        motorOrigem: context.motor,
        regraIds,
        payloadEntrada,
        payloadSaida,
        status: "ok",
        duracaoMs,
      });
    } catch {
      // Silencia erro de log — não deve quebrar o fluxo principal
    }
  }
}

// Singleton exportado
export const soeRuleEngine = SoeRuleEngine.getInstance();

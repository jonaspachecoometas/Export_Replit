// SOE Rule Engine — Types

export interface SoeRuleCondition {
  // Comparações simples: { campo: valor } ou { campo: { op: valor } }
  [key: string]: any;
}

export interface SoeRuleAction {
  // set: sobrescreve campos no payload
  set?: Record<string, any>;
  // validar: valida campos obrigatórios/formato
  validar?: { campo: string; obrigatorio?: boolean; formato?: RegExp | string };
  // addItem: adiciona item à lista
  addItem?: { campo: string; valor: any };
  // calcular: define um campo como resultado de expressão
  calcular?: { campo: string; expressao: string };
}

export interface SoeRule {
  id: string;
  dominio: "fiscal" | "business" | "accounting" | "financial";
  trigger: string;
  nome: string;
  condicao: SoeRuleCondition;
  acao: SoeRuleAction;
  prioridade: number;
  ativo: boolean;
  origemPadrao?: boolean;
}

export interface RuleContext {
  tenantId?: number;
  empresaId?: number;
  userId?: string;
  motor?: "plus" | "erpnext" | "local";
  empresa?: {
    regimeTributario?: "simples_nacional" | "lucro_presumido" | "lucro_real";
    uf?: string;
    cnpj?: string;
  };
}

export interface EnrichedPayload {
  payload: Record<string, any>;
  appliedRules: string[];
  validationErrors: string[];
}

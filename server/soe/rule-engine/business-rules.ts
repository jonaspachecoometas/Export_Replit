// SOE — Regras de Negócio Padrão

import type { SoeRule } from "./types";

export const BUSINESS_RULES_PADRAO: SoeRule[] = [
  // ── Aprovação de pedidos ───────────────────────────────────────────────────

  {
    id: "PEDIDO_APROVACAO_AUTO_BAIXO_VALOR",
    dominio: "business",
    trigger: "pre_sales_order_confirm",
    nome: "Aprovação automática para pedidos de baixo valor",
    condicao: { "totalAmount": { "_lt": 5000 } },
    acao: { set: { "_aprovacaoAutomatica": true, "status": "confirmed" } },
    prioridade: 10,
    ativo: false, // tenant habilita com seu limite
    origemPadrao: true,
  },

  // ── Estoque ────────────────────────────────────────────────────────────────

  {
    id: "RESERVA_ESTOQUE_AO_CONFIRMAR",
    dominio: "business",
    trigger: "post_sales_order_confirm",
    nome: "Reserva estoque ao confirmar pedido",
    condicao: { "status": "confirmed" },
    acao: { set: { "_reservarEstoque": true } },
    prioridade: 10,
    ativo: true,
    origemPadrao: true,
  },

  // ── Financeiro ─────────────────────────────────────────────────────────────

  {
    id: "CRIAR_CONTA_RECEBER_AO_FATURAR",
    dominio: "business",
    trigger: "post_nfe_emitida",
    nome: "Cria conta a receber automaticamente ao faturar",
    condicao: { "_tipoOperacao": "venda" },
    acao: { set: { "_criarContaReceber": true } },
    prioridade: 5,
    ativo: true,
    origemPadrao: true,
  },
  {
    id: "CRIAR_CONTA_PAGAR_AO_RECEBER_COMPRA",
    dominio: "business",
    trigger: "post_purchase_received",
    nome: "Cria conta a pagar ao receber mercadoria",
    condicao: {},
    acao: { set: { "_criarContaPagar": true } },
    prioridade: 5,
    ativo: true,
    origemPadrao: true,
  },

  // ── Alertas ────────────────────────────────────────────────────────────────

  {
    id: "ALERTA_ESTOQUE_MINIMO",
    dominio: "business",
    trigger: "post_sales_order_confirm",
    nome: "Alerta quando estoque cai abaixo do mínimo",
    condicao: { "_estoqueAbaixoMinimo": true },
    acao: { set: { "_enviarAlertaEstoque": true } },
    prioridade: 15,
    ativo: true,
    origemPadrao: true,
  },
];

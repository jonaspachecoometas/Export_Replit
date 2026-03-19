// SOE — Regras Fiscais Padrão
// Estas regras enriquecem o payload ANTES de despachar ao motor (Plus/ERPNext)
// O motor recebe o payload já correto e só executa.

import type { SoeRule } from "./types";

export const FISCAL_RULES_PADRAO: SoeRule[] = [
  // ── CFOP — Resolução automática por direção da operação ──────────────────

  {
    id: "CFOP_VENDA_DENTRO_ESTADO",
    dominio: "fiscal",
    trigger: "pre_sales_order",
    nome: "CFOP padrão — venda dentro do estado",
    condicao: { _cfopNaoDefinido: true, _operacao: "venda" },
    acao: { set: { "cfopPadrao": "5.102" } },
    prioridade: 20,
    ativo: true,
    origemPadrao: true,
  },
  {
    id: "CFOP_VENDA_OUTRO_ESTADO",
    dominio: "fiscal",
    trigger: "pre_sales_order",
    nome: "CFOP padrão — venda para outro estado",
    condicao: { _cfopNaoDefinido: true, _operacao: "venda", _interestadual: true },
    acao: { set: { "cfopPadrao": "6.102" } },
    prioridade: 19,
    ativo: true,
    origemPadrao: true,
  },
  {
    id: "CFOP_COMPRA_DENTRO_ESTADO",
    dominio: "fiscal",
    trigger: "pre_purchase_order",
    nome: "CFOP padrão — compra dentro do estado",
    condicao: { _cfopNaoDefinido: true },
    acao: { set: { "cfopPadrao": "1.102" } },
    prioridade: 20,
    ativo: true,
    origemPadrao: true,
  },

  // ── Tributação por Regime ──────────────────────────────────────────────────

  {
    id: "TRIBUTACAO_SIMPLES_NACIONAL",
    dominio: "fiscal",
    trigger: "pre_nfe_emissao",
    nome: "Simples Nacional — aplica CSOSN e remove destaque PIS/COFINS",
    condicao: { regimeTributario: "simples_nacional" },
    acao: {
      set: {
        "tributacao.csosnPadrao": "400",
        "tributacao.destacarPisCofins": false,
        "tributacao.aliquotaIcms": 0,
      },
    },
    prioridade: 5,
    ativo: true,
    origemPadrao: true,
  },
  {
    id: "TRIBUTACAO_LUCRO_PRESUMIDO",
    dominio: "fiscal",
    trigger: "pre_nfe_emissao",
    nome: "Lucro Presumido — CST 00 com alíquotas padrão",
    condicao: { regimeTributario: "lucro_presumido" },
    acao: {
      set: {
        "tributacao.cstIcmsPadrao": "00",
        "tributacao.cstPisPadrao": "01",
        "tributacao.cstCofinsPadrao": "01",
        "tributacao.destacarPisCofins": true,
      },
    },
    prioridade: 5,
    ativo: true,
    origemPadrao: true,
  },
  {
    id: "TRIBUTACAO_LUCRO_REAL",
    dominio: "fiscal",
    trigger: "pre_nfe_emissao",
    nome: "Lucro Real — CST 00, PIS/COFINS não cumulativo",
    condicao: { regimeTributario: "lucro_real" },
    acao: {
      set: {
        "tributacao.cstIcmsPadrao": "00",
        "tributacao.cstPisPadrao": "50",
        "tributacao.cstCofinsPadrao": "50",
        "tributacao.destacarPisCofins": true,
        "tributacao.regimePisCofins": "nao_cumulativo",
      },
    },
    prioridade: 5,
    ativo: true,
    origemPadrao: true,
  },

  // ── Validações obrigatórias ────────────────────────────────────────────────

  {
    id: "VALIDAR_NCM_NFE",
    dominio: "fiscal",
    trigger: "pre_nfe_emissao",
    nome: "Valida NCM obrigatório em NF-e",
    condicao: { tipoDocumento: ["nfe", "nfce"] },
    acao: { validar: { campo: "ncm", obrigatorio: true, formato: "^\\d{8}$" } },
    prioridade: 1,
    ativo: true,
    origemPadrao: true,
  },
  {
    id: "VALIDAR_CFOP_OBRIGATORIO",
    dominio: "fiscal",
    trigger: "pre_nfe_emissao",
    nome: "Valida CFOP obrigatório",
    condicao: {},
    acao: { validar: { campo: "cfop", obrigatorio: true, formato: "^\\d\\.\\d{3}$" } },
    prioridade: 1,
    ativo: true,
    origemPadrao: true,
  },
  {
    id: "VALIDAR_CNPJ_CPF_DESTINATARIO",
    dominio: "fiscal",
    trigger: "pre_nfe_emissao",
    nome: "Valida CNPJ/CPF do destinatário",
    condicao: { tipoDocumento: "nfe" },
    acao: { validar: { campo: "destinatario.cpfCnpj", obrigatorio: true } },
    prioridade: 1,
    ativo: true,
    origemPadrao: true,
  },

  // ── Geração automática de NF-e ao faturar ─────────────────────────────────

  {
    id: "NFE_AUTO_AO_FATURAR",
    dominio: "fiscal",
    trigger: "pre_sales_order_confirm",
    nome: "Gera NF-e automaticamente ao confirmar pedido (se configurado)",
    condicao: { "config.nfeAutomatica": true },
    acao: { set: { "_gerarNfe": true } },
    prioridade: 10,
    ativo: false, // desativado por padrão — tenant habilita
    origemPadrao: true,
  },
];

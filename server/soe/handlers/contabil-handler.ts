// SOE — Handler Contábil
// Gera lançamentos contábeis automáticos a partir de eventos SOE.
// Os lançamentos são salvos em soe_lancamentos e depois sincronizados
// com o Motor Contábil Python (:8003).

import { db } from "../../../db/index";
import { soeLancamentos } from "@shared/schema";
import type { SoeEventPayload } from "../event-bus";

const CONTABIL_ENGINE_URL =
  `http://${process.env.CONTABIL_ENGINE_HOST || "localhost"}:${process.env.CONTABIL_PORT || "8003"}`;

async function inserirLancamento(
  tenantId: number | undefined,
  empresaId: number,
  data: string,
  contaDebito: string,
  contaCredito: string,
  valor: number,
  historico: string,
  origemEvento: string,
  origemEventoId?: string
) {
  if (!valor || valor <= 0) return;
  try {
    await db.insert(soeLancamentos).values({
      tenantId,
      empresaId,
      data,
      contaDebito,
      contaCredito,
      valor: String(valor),
      historico,
      origemEvento,
      origemEventoId,
      periodo: data.substring(0, 7), // 'YYYY-MM'
      enviado8003: false,
    });
  } catch (e: any) {
    console.error("[ContabilHandler] Erro ao inserir lançamento:", e.message);
  }
}

export const contabilHandler = {

  // NF-e de venda emitida → lançamentos de receita + impostos
  lancamentoVenda: async (payload: SoeEventPayload) => {
    const { dados, tenantId, empresaId } = payload;
    if (!empresaId || !dados.valorTotal) return;

    const data = dados.dataEmissao?.substring(0, 10) || new Date().toISOString().substring(0, 10);
    const numeroNfe = dados.numero || dados.nfeId || "?";
    const eventoId = dados._eventoId;

    // D: Clientes / C: Receita Bruta de Vendas
    await inserirLancamento(
      tenantId, empresaId, data,
      "1.1.3.01", "3.1.1.01",
      parseFloat(dados.valorTotal),
      `Venda NF-e ${numeroNfe}`,
      "nfe_emitida", eventoId
    );

    // D: Deduções ICMS / C: ICMS a Recolher
    if (dados.valorIcms && parseFloat(dados.valorIcms) > 0) {
      await inserirLancamento(
        tenantId, empresaId, data,
        "3.1.2.01", "2.1.2.01",
        parseFloat(dados.valorIcms),
        `ICMS s/ Venda NF-e ${numeroNfe}`,
        "nfe_emitida", eventoId
      );
    }

    // D: Deduções PIS / C: PIS a Recolher
    if (dados.valorPis && parseFloat(dados.valorPis) > 0) {
      await inserirLancamento(
        tenantId, empresaId, data,
        "3.1.2.02", "2.1.2.02",
        parseFloat(dados.valorPis),
        `PIS s/ Venda NF-e ${numeroNfe}`,
        "nfe_emitida", eventoId
      );
    }

    // D: Deduções COFINS / C: COFINS a Recolher
    if (dados.valorCofins && parseFloat(dados.valorCofins) > 0) {
      await inserirLancamento(
        tenantId, empresaId, data,
        "3.1.2.03", "2.1.2.03",
        parseFloat(dados.valorCofins),
        `COFINS s/ Venda NF-e ${numeroNfe}`,
        "nfe_emitida", eventoId
      );
    }
  },

  // Cancelamento de NF-e → estorno dos lançamentos
  estornoLancamentoVenda: async (payload: SoeEventPayload) => {
    const { dados, tenantId, empresaId } = payload;
    if (!empresaId || !dados.valorTotal) return;

    const data = new Date().toISOString().substring(0, 10);
    const numeroNfe = dados.numero || dados.nfeId || "?";

    // Estorno: inverte débito/crédito
    await inserirLancamento(
      tenantId, empresaId, data,
      "3.1.1.01", "1.1.3.01",
      parseFloat(dados.valorTotal),
      `Estorno NF-e ${numeroNfe} (cancelamento)`,
      "nfe_cancelada"
    );
  },

  // Compra recebida (NF-e entrada) → entrada em estoque + fornecedor
  lancamentoCompra: async (payload: SoeEventPayload) => {
    const { dados, tenantId, empresaId } = payload;
    if (!empresaId || !dados.valorMercadorias) return;

    const data = dados.dataEntrada?.substring(0, 10) || new Date().toISOString().substring(0, 10);
    const numeroNfe = dados.numero || "?";
    const fornecedor = dados.fornecedor || "Fornecedor";

    await inserirLancamento(
      tenantId, empresaId, data,
      "1.1.4.01", "2.1.1.01",
      parseFloat(dados.valorMercadorias),
      `Compra NF-e ${numeroNfe} / ${fornecedor}`,
      "compra_recebida"
    );
  },

  // Pagamento de conta a pagar
  lancamentoPagamento: async (payload: SoeEventPayload) => {
    const { dados, tenantId, empresaId } = payload;
    if (!empresaId || !dados.valorPago) return;

    const data = dados.dataPagamento?.substring(0, 10) || new Date().toISOString().substring(0, 10);

    await inserirLancamento(
      tenantId, empresaId, data,
      "2.1.1.01", "1.1.1.01",
      parseFloat(dados.valorPago),
      `Pagamento: ${dados.descricao || "Conta a pagar"}`,
      "pagamento_realizado"
    );
  },

  // Recebimento de cliente
  lancamentoRecebimento: async (payload: SoeEventPayload) => {
    const { dados, tenantId, empresaId } = payload;
    if (!empresaId || !dados.valorRecebido) return;

    const data = dados.dataRecebimento?.substring(0, 10) || new Date().toISOString().substring(0, 10);

    await inserirLancamento(
      tenantId, empresaId, data,
      "1.1.1.01", "1.1.3.01",
      parseFloat(dados.valorRecebido),
      `Recebimento: ${dados.descricao || "Conta a receber"}`,
      "recebimento_realizado"
    );
  },
};

// Sincroniza lançamentos pendentes com Motor Contábil Python (:8003)
export async function sincronizarComMotorContabil(empresaId: number, periodo: string) {
  try {
    const resp = await fetch(`${CONTABIL_ENGINE_URL}/lancamentos/sincronizar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ empresaId, periodo }),
      signal: AbortSignal.timeout(30000),
    });
    if (!resp.ok) {
      console.warn("[ContabilHandler] Motor :8003 retornou:", resp.status);
    }
  } catch (e: any) {
    console.warn("[ContabilHandler] Motor :8003 indisponível:", e.message);
  }
}

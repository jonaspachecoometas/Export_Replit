// SOE — Handler Financeiro
// Automações financeiras disparadas pelo Event Bus SOE.

import { db } from "../../../db/index";
import { finAccountsReceivable, finAccountsPayable } from "@shared/schema";
import type { SoeEventPayload } from "../event-bus";

export const financialHandler = {

  // Cria conta a receber automaticamente ao emitir NF-e de venda
  criarContaReceber: async (payload: SoeEventPayload) => {
    const { dados, tenantId } = payload;
    if (!dados.valorTotal || !dados.clienteId) return;

    try {
      // Verifica se já existe conta a receber para esta NF-e
      if (dados.nfeId) {
        const existente = await db.query.finAccountsReceivable?.findFirst?.({
          where: (t: any, { eq }: any) => eq(t.reference, `nfe:${dados.nfeId}`),
        });
        if (existente) return;
      }

      const vencimento = dados.vencimento
        || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

      await db.insert(finAccountsReceivable).values({
        tenantId: tenantId ?? 1,
        customerId: dados.clienteId,
        description: `NF-e ${dados.numero || dados.nfeId || "?"} — ${dados.clienteNome || "Cliente"}`,
        amount: String(dados.valorTotal),
        dueDate: vencimento,
        status: "pending",
        category: "vendas",
        paymentMethod: dados.formaPagamento || "outros",
        notes: `Gerado automaticamente pelo SOE ao emitir NF-e`,
      } as any);

      console.log("[FinancialHandler] Conta a receber criada para NF-e", dados.nfeId || dados.numero);
    } catch (e: any) {
      console.error("[FinancialHandler] criarContaReceber error:", e.message);
    }
  },

  // Baixa conta a receber após recebimento confirmado
  baixarContaReceber: async (payload: SoeEventPayload) => {
    const { dados } = payload;
    if (!dados.contaReceiverId) return;

    try {
      await db
        .update(finAccountsReceivable)
        .set({
          status: "received",
          receivedDate: dados.dataRecebimento || new Date().toISOString().substring(0, 10),
          paymentMethod: dados.formaPagamento || "outros",
        } as any)
        .where((finAccountsReceivable as any).id.eq(dados.contaReceiverId));
    } catch (e: any) {
      console.error("[FinancialHandler] baixarContaReceber error:", e.message);
    }
  },

  // Cria conta a pagar ao receber mercadoria
  criarContaPagar: async (payload: SoeEventPayload) => {
    const { dados, tenantId } = payload;
    if (!dados.valorTotal || !dados.fornecedorId) return;

    try {
      const vencimento = dados.vencimento
        || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

      await db.insert(finAccountsPayable).values({
        tenantId: tenantId ?? 1,
        supplierId: dados.fornecedorId,
        description: `NF-e Entrada ${dados.numero || "?"} — ${dados.fornecedor || "Fornecedor"}`,
        amount: String(dados.valorTotal),
        dueDate: vencimento,
        status: "pending",
        category: "compras",
        notes: `Gerado automaticamente pelo SOE ao receber compra`,
      } as any);
    } catch (e: any) {
      console.error("[FinancialHandler] criarContaPagar error:", e.message);
    }
  },

  // Baixa conta a pagar após pagamento
  baixarContaPagar: async (payload: SoeEventPayload) => {
    const { dados } = payload;
    if (!dados.contaPayableId) return;

    try {
      await db
        .update(finAccountsPayable)
        .set({
          status: "paid",
          paidDate: dados.dataPagamento || new Date().toISOString().substring(0, 10),
          paymentMethod: dados.formaPagamento || "outros",
        } as any)
        .where((finAccountsPayable as any).id.eq(dados.contaPayableId));
    } catch (e: any) {
      console.error("[FinancialHandler] baixarContaPagar error:", e.message);
    }
  },

  // Reserva estoque ao confirmar venda (notificação — execução no motor)
  reservarEstoque: async (payload: SoeEventPayload) => {
    const { dados } = payload;
    if (!dados.items || dados.motor === "local") return;
    // Log apenas — a reserva real é feita pelo motor Plus/ERPNext
    console.log(
      `[FinancialHandler] Venda ${dados.id} confirmada — ` +
      `${dados.items?.length || 0} item(s) para reserva de estoque`
    );
  },

  // Alerta de estoque baixo (via console/log — webhook futuro)
  alertaEstoqueBaixo: async (payload: SoeEventPayload) => {
    const { dados } = payload;
    console.warn(
      `[FinancialHandler] ALERTA: Estoque baixo — ` +
      `Produto ${dados.produtoId} / ${dados.produtoNome} ` +
      `(atual: ${dados.estoqueAtual}, mínimo: ${dados.estoqueMinimo})`
    );
    // TODO Fase 5: enviar via WhatsApp/Email usando Motor Comunicação (:8006)
  },
};

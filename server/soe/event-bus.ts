// SOE Event Bus — Dispara eventos após execução do motor
// Permite que lançamentos contábeis, alertas e automações
// sejam disparados de forma desacoplada após cada operação SOE.

import { db } from "../db/index";
import { soeEventos } from "@shared/schema";
import { contabilHandler } from "./handlers/contabil-handler";
import { financialHandler } from "./handlers/financial-handler";

export type SoeEventType =
  | "nfe_emitida"
  | "nfe_cancelada"
  | "venda_confirmada"
  | "venda_faturada"
  | "compra_recebida"
  | "pagamento_realizado"
  | "recebimento_realizado"
  | "estoque_baixo";

export interface SoeEventPayload {
  tenantId?: number;
  empresaId?: number;
  motorOrigem?: "plus" | "erpnext" | "local";
  dados: Record<string, any>;
}

type EventHandler = (payload: SoeEventPayload) => Promise<void>;

// Mapa de handlers por evento
const HANDLERS: Record<SoeEventType, EventHandler[]> = {
  nfe_emitida: [
    contabilHandler.lancamentoVenda,
    financialHandler.criarContaReceber,
  ],
  nfe_cancelada: [
    contabilHandler.estornoLancamentoVenda,
  ],
  venda_confirmada: [
    financialHandler.reservarEstoque,
  ],
  venda_faturada: [
    contabilHandler.lancamentoVenda,
  ],
  compra_recebida: [
    contabilHandler.lancamentoCompra,
    financialHandler.criarContaPagar,
  ],
  pagamento_realizado: [
    contabilHandler.lancamentoPagamento,
    financialHandler.baixarContaPagar,
  ],
  recebimento_realizado: [
    contabilHandler.lancamentoRecebimento,
    financialHandler.baixarContaReceber,
  ],
  estoque_baixo: [
    financialHandler.alertaEstoqueBaixo,
  ],
};

export class SoeEventBus {
  private static instance: SoeEventBus;

  static getInstance(): SoeEventBus {
    if (!SoeEventBus.instance) SoeEventBus.instance = new SoeEventBus();
    return SoeEventBus.instance;
  }

  async emit(evento: SoeEventType, payload: SoeEventPayload): Promise<void> {
    const start = Date.now();

    // Registra evento no banco
    let eventoId: string | undefined;
    try {
      const [row] = await db
        .insert(soeEventos)
        .values({
          tenantId: payload.tenantId,
          empresaId: payload.empresaId,
          evento,
          motorOrigem: payload.motorOrigem,
          payloadEntrada: payload.dados,
          status: "ok",
        })
        .returning({ id: soeEventos.id });
      eventoId = row?.id;
    } catch (e: any) {
      console.error("[SoeEventBus] Erro ao registrar evento:", e.message);
    }

    // Dispara handlers em paralelo (falha isolada — não bloqueia o fluxo)
    const handlers = HANDLERS[evento] ?? [];
    const results = await Promise.allSettled(
      handlers.map((h) => h({ ...payload, dados: { ...payload.dados, _eventoId: eventoId } }))
    );

    const erros = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason?.message);

    if (erros.length > 0) {
      console.warn(`[SoeEventBus] ${evento}: ${erros.length} handler(s) falharam:`, erros);
    }

    console.log(
      `[SoeEventBus] ${evento} processado em ${Date.now() - start}ms | ` +
      `${handlers.length} handlers | ${erros.length} erros`
    );
  }
}

export const soeEventBus = SoeEventBus.getInstance();

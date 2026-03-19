/**
 * Singleton Socket.IO — instância compartilhada entre todos os módulos.
 * Inicializado em routes.ts via initSocketIO(httpServer).
 * Qualquer módulo pode importar getIO() para emitir eventos.
 */
import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";

let _io: SocketServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketServer {
  if (_io) return _io;
  _io = new SocketServer(httpServer, {
    path: "/socket.io",
    cors: { origin: "*", methods: ["GET", "POST"] },
  });
  return _io;
}

export function getIO(): SocketServer {
  if (!_io) throw new Error("[socket-io] Not initialized. Call initSocketIO first.");
  return _io;
}

/** Emite um evento XOS para todos os clientes conectados (não bloqueia). */
export function broadcastXos(event: string, data: unknown) {
  try {
    getIO().emit(`xos:${event}`, data);
  } catch {
    // Socket ainda não iniciado ou sem clientes — ignorar silenciosamente
  }
}

/**
 * useXosSocket — subscribes to XOS real-time events from Socket.IO.
 * Usage:
 *   const { supervisorStats, lastSlaBreachEvent } = useXosSocket();
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface SupervisorStats {
  openConversations: number;
  resolvedToday: number;
  urgentTickets: number;
  agentsOnline: number;
  timestamp: string;
}

export interface SlaBreachEvent {
  protocolId: number;
  protocolNumber: string;
  tenantId: number;
  queueId: number | null;
  assignedTo: number | null;
  breachedAt: string;
}

interface XosSocketState {
  connected: boolean;
  supervisorStats: SupervisorStats | null;
  lastSlaBreachEvent: SlaBreachEvent | null;
}

let _socket: Socket | null = null;
let _refCount = 0;

function getSocket(): Socket {
  if (!_socket) {
    _socket = io(window.location.origin, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
  }
  return _socket;
}

export function useXosSocket() {
  const [state, setState] = useState<XosSocketState>({
    connected: false,
    supervisorStats: null,
    lastSlaBreachEvent: null,
  });
  const socketRef = useRef<Socket | null>(null);

  const handleStats = useCallback((data: SupervisorStats) => {
    setState((s) => ({ ...s, supervisorStats: data }));
  }, []);

  const handleSlaBreach = useCallback((data: SlaBreachEvent) => {
    setState((s) => ({ ...s, lastSlaBreachEvent: data }));
  }, []);

  const handleConnect = useCallback(() => {
    setState((s) => ({ ...s, connected: true }));
  }, []);

  const handleDisconnect = useCallback(() => {
    setState((s) => ({ ...s, connected: false }));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    _refCount++;

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("xos:supervisor.stats", handleStats);
    socket.on("xos:sla.breach", handleSlaBreach);

    // Sync initial connection state
    if (socket.connected) {
      setState((s) => ({ ...s, connected: true }));
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("xos:supervisor.stats", handleStats);
      socket.off("xos:sla.breach", handleSlaBreach);

      _refCount--;
      // Keep socket alive as long as any component uses it
      if (_refCount <= 0 && _socket) {
        _socket.disconnect();
        _socket = null;
        _refCount = 0;
      }
    };
  }, [handleConnect, handleDisconnect, handleStats, handleSlaBreach]);

  return state;
}

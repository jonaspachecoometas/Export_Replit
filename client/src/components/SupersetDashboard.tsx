import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";

interface SupersetDashboardProps {
  dashboardId: string;
  height?: string | number;
  className?: string;
  showOpenLink?: boolean;
}

/**
 * Componente reutilizável para embedar dashboards do Apache Superset (Arcádia Insights)
 * em QUALQUER tela do Arcádia Suite via Guest Token JWT.
 *
 * Uso:
 *   <SupersetDashboard dashboardId="financial-overview" />
 *   <SupersetDashboard dashboardId="dre-mensal" height={400} />
 */
export function SupersetDashboard({
  dashboardId,
  height = "calc(100vh - 320px)",
  className = "",
  showOpenLink = true,
}: SupersetDashboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sdkRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "unavailable">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const fetchGuestToken = useCallback(async (): Promise<string> => {
    const resp = await fetch("/api/superset/guest-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dashboardId }),
      credentials: "include",
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
      throw new Error(err.error || `HTTP ${resp.status}`);
    }
    const { token } = await resp.json();
    return token;
  }, [dashboardId]);

  const loadDashboard = useCallback(async () => {
    if (!containerRef.current) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      // Verifica se Superset está disponível
      const health = await fetch("/api/superset/health", { credentials: "include" });
      const healthData = await health.json();
      if (!healthData.online) {
        setStatus("unavailable");
        return;
      }

      // Importa SDK dinamicamente (só quando necessário)
      const { embedDashboard } = await import("@superset-ui/embedded-sdk");

      // Limpa embedding anterior se houver
      if (sdkRef.current) {
        containerRef.current.innerHTML = "";
      }

      sdkRef.current = await embedDashboard({
        id: dashboardId,
        supersetDomain: window.location.origin + "/superset",
        mountPoint: containerRef.current,
        fetchGuestToken,
        dashboardUiConfig: {
          hideTitle: true,
          hideChartControls: false,
          filters: { visible: true, expanded: false },
        },
      });

      setStatus("ready");
    } catch (err: any) {
      console.error("[SupersetDashboard] Erro:", err.message);
      // Se SDK não estiver instalado, usa iframe como fallback
      if (err.message?.includes("Cannot find module") || err.message?.includes("embedDashboard")) {
        setStatus("unavailable");
      } else {
        setErrorMsg(err.message);
        setStatus("error");
      }
    }
  }, [dashboardId, fetchGuestToken]);

  useEffect(() => {
    loadDashboard();
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [loadDashboard]);

  const heightStyle = typeof height === "number" ? `${height}px` : height;

  if (status === "unavailable") {
    return (
      <div className={`rounded-xl overflow-hidden border border-[#c89b3c]/20 bg-white shadow-sm ${className}`} style={{ height: heightStyle }}>
        <iframe
          src="/superset/login"
          className="w-full h-full border-0"
          title="Arcádia Insights — Apache Superset"
          allow="fullscreen"
        />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 rounded-xl border border-red-100 bg-red-50 ${className}`} style={{ height: heightStyle }}>
        <AlertTriangle className="w-8 h-8 text-red-400" />
        <div className="text-center">
          <p className="font-medium text-red-700 text-sm">Erro ao carregar dashboard</p>
          <p className="text-red-500 text-xs mt-1">{errorMsg}</p>
        </div>
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height: heightStyle }}>
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10 rounded-xl">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#c89b3c] animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#1f334d] font-medium">Carregando Arcádia Insights...</p>
          </div>
        </div>
      )}

      {showOpenLink && status === "ready" && (
        <a
          href="/superset"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-white/80 backdrop-blur text-[#1f334d] text-xs rounded-lg border border-gray-200 hover:bg-white transition-colors shadow-sm"
        >
          <ExternalLink className="w-3 h-3" /> Abrir completo
        </a>
      )}

      <div
        ref={containerRef}
        className="w-full h-full rounded-xl overflow-hidden border border-[#c89b3c]/20"
      />
    </div>
  );
}

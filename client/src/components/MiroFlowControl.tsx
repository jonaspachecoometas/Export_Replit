import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Loader2 } from "lucide-react";

interface AnalyzeRequest {
  agent: "statistician" | "fiscal_auditor" | "researcher";
  task: string;
  context?: Record<string, unknown>;
}

interface AnalyzeResponse {
  agent: string;
  model: string;
  result: string;
  execution_id: string;
  duration_ms: number;
}

const AGENTS = [
  {
    value: "statistician",
    label: "Statistician",
    model: "deepseek-r1:14b",
    placeholder:
      "Ex: Analise a distribuição de vendas por região no último trimestre",
  },
  {
    value: "fiscal_auditor",
    label: "Fiscal Auditor",
    model: "deepseek-r1:14b",
    placeholder:
      "Ex: Verifique inconsistências nos registros NFe do CNPJ 12.345.678/0001-90",
  },
  {
    value: "researcher",
    label: "Researcher",
    model: "llama3.1:8b",
    placeholder:
      "Ex: Quais fornecedores têm maior correlação com atrasos de entrega?",
  },
] as const;

interface MiroFlowControlProps {
  currentDashboardData?: Record<string, unknown>;
}

export function MiroFlowControl({
  currentDashboardData,
}: MiroFlowControlProps) {
  const [enabled, setEnabled] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<
    "statistician" | "fiscal_auditor" | "researcher"
  >("statistician");
  const [task, setTask] = useState("");

  const mutation = useMutation({
    mutationFn: async (request: AnalyzeRequest) => {
      const response = await apiRequest("POST", "/api/miroflow/analyze", request);
      return response.json() as Promise<AnalyzeResponse>;
    },
  });

  const handleAnalyze = () => {
    if (!task.trim()) {
      return;
    }

    mutation.mutate({
      agent: selectedAgent,
      task,
      context: currentDashboardData,
    });
  };

  const currentAgentConfig = AGENTS.find((a) => a.value === selectedAgent);

  return (
    <div className="space-y-6">
      <Card className="bg-[#1f334d] border border-[#c89b3c]/20">
        <CardHeader className="border-b border-[#c89b3c]/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-[#c89b3c]" />
              <CardTitle className="text-white">Modo Científico</CardTitle>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                enabled ? "bg-[#c89b3c]" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardHeader>

        {enabled && (
          <CardContent className="space-y-4 pt-6">
            {/* Agent Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Selecione o Agente
              </label>
              <Select value={selectedAgent} onValueChange={(value: any) => setSelectedAgent(value)}>
                <SelectTrigger className="bg-[#2a4466] border border-[#c89b3c]/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a4466] border border-[#c89b3c]/20">
                  {AGENTS.map((agent) => (
                    <SelectItem key={agent.value} value={agent.value} className="text-white">
                      <div>
                        <div>{agent.label}</div>
                        <div className="text-xs text-gray-400">{agent.model}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Task Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Digite a Tarefa
              </label>
              <Textarea
                placeholder={currentAgentConfig?.placeholder || "Digite sua tarefa..."}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                disabled={mutation.isPending}
                className="bg-[#2a4466] border border-[#c89b3c]/20 text-white placeholder:text-gray-500 min-h-24"
              />
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!task.trim() || mutation.isPending}
              className="w-full bg-[#c89b3c] hover:bg-[#d4a94a] text-[#1f334d] font-semibold"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                "Analisar"
              )}
            </Button>

            {/* Error Display */}
            {mutation.isError && (
              <div className="rounded-lg p-4 bg-red-900/20 border border-red-500/50">
                <Badge className="mb-2 bg-red-600 text-white">Erro</Badge>
                <p className="text-sm text-red-100">
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : "Erro ao processar a análise"}
                </p>
              </div>
            )}

            {/* Result Display */}
            {mutation.isSuccess && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-600 text-white">Sucesso</Badge>
                </div>

                <div className="rounded-lg p-4 bg-[#2a4466] border border-[#c89b3c]/20">
                  <ScrollArea className="h-64 w-full pr-4">
                    <p className="text-white text-sm whitespace-pre-wrap">
                      {mutation.data?.result}
                    </p>
                  </ScrollArea>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                  <div>
                    <span className="font-semibold text-[#c89b3c]">Modelo:</span>{" "}
                    {mutation.data?.model}
                  </div>
                  <div>
                    <span className="font-semibold text-[#c89b3c]">Tempo:</span>{" "}
                    {mutation.data?.duration_ms}ms
                  </div>
                  <div>
                    <span className="font-semibold text-[#c89b3c]">ID:</span>{" "}
                    {mutation.data?.execution_id?.slice(0, 8)}...
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

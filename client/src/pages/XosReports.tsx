import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BrowserFrame } from "@/components/Browser/BrowserFrame";
import {
  BarChart3, Star, Shield, Users, MessageSquare, Ticket, TrendingUp,
  ArrowLeft, DollarSign, CheckCircle2, AlertTriangle, Clock, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface OverviewReport {
  period: string;
  conversations: { total: number; resolved: number; open: number; avg_csat: number; avg_handle_minutes: number; channels_used: number };
  tickets: { total: number; resolved: number; open: number; sla_breaches: number; avg_csat: number };
  contacts: { total: number; leads: number; customers: number; new_in_period: number };
  deals: { total: number; won: number; lost: number; won_value: number; win_rate_pct: number };
  generated_at: string;
}

interface AgentReport {
  agent_id: string;
  agent_name: string;
  conversations_handled: number;
  resolved: number;
  avg_csat: number;
  avg_handle_minutes: number;
  tickets_handled: number;
  tickets_resolved: number;
}

interface SlaReport {
  period: string;
  protocols: { total: number; breached: number; compliant: number; compliance_rate_pct: number };
  tickets_by_priority: Array<{ priority: string; total: number; breached: number; avg_resolution_minutes: number }>;
}

interface CsatSummary {
  period: string;
  total_responses: number;
  avg_score: number;
  satisfaction_rate_pct: number;
  distribution: { 5: number; 4: number; 3: number; "1-2": number };
}

export default function XosReports() {
  const [period, setPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: overview, isLoading } = useQuery<OverviewReport>({
    queryKey: ["/api/xos/reports/overview", period],
    queryFn: async () => {
      const res = await fetch(`/api/xos/reports/overview?period=${period}`);
      return res.json();
    },
  });

  const { data: agentReport = [] } = useQuery<AgentReport[]>({
    queryKey: ["/api/xos/reports/agents", period],
    queryFn: async () => {
      const res = await fetch(`/api/xos/reports/agents?period=${period}`);
      return res.json();
    },
  });

  const { data: slaReport } = useQuery<SlaReport>({
    queryKey: ["/api/xos/reports/sla", period],
    queryFn: async () => {
      const res = await fetch(`/api/xos/reports/sla?period=${period}`);
      return res.json();
    },
  });

  const { data: csatSummary } = useQuery<CsatSummary>({
    queryKey: ["/api/xos/csat/summary", period],
    queryFn: async () => {
      const res = await fetch(`/api/xos/csat/summary?period=${period}`);
      return res.json();
    },
  });

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

  const periodLabel: Record<string, string> = { "7d": "7 dias", "30d": "30 dias", "90d": "90 dias", "1y": "1 ano" };

  const getPriorityColor = (p: string) => ({
    low: "text-slate-500", normal: "text-blue-600", high: "text-orange-600", urgent: "text-red-600"
  }[p] || "text-slate-600");

  const getPriorityBadge = (p: string) => ({
    low: "bg-slate-100 text-slate-700", normal: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700", urgent: "bg-red-100 text-red-700"
  }[p] || "bg-gray-100 text-gray-700");

  const csatBar = (label: string, count: number, total: number, color: string) => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-8">{label}</span>
      <Progress value={total > 0 ? (count / total) * 100 : 0} className={`flex-1 h-3 ${color}`} />
      <span className="text-sm font-medium text-slate-700 w-8 text-right">{count}</span>
    </div>
  );

  if (isLoading) {
    return (
      <BrowserFrame>
        <div className="flex items-center justify-center h-screen">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </BrowserFrame>
    );
  }

  const conv = overview?.conversations;
  const tick = overview?.tickets;
  const contacts = overview?.contacts;
  const deals = overview?.deals;

  return (
    <BrowserFrame>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/xos">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-2 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Relatórios XOS</h1>
                  <p className="text-xs text-slate-500">Análise de atendimento e CRM</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="90d">Últimos 90 dias</SelectItem>
                    <SelectItem value="1y">Último ano</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="csat">CSAT</TabsTrigger>
              <TabsTrigger value="sla">SLA</TabsTrigger>
              <TabsTrigger value="agents">Agentes</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <p className="text-sm text-slate-500">Período: {periodLabel[period]}</p>

              {/* Top KPI row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Conversas</p>
                        <p className="text-3xl font-bold">{conv?.total || 0}</p>
                      </div>
                      <MessageSquare className="h-10 w-10 text-blue-200" />
                    </div>
                    <div className="mt-2 text-sm text-blue-100">
                      {conv?.resolved || 0} resolvidas ({conv?.total ? Math.round((conv.resolved / conv.total) * 100) : 0}%)
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Tickets</p>
                        <p className="text-3xl font-bold">{tick?.total || 0}</p>
                      </div>
                      <Ticket className="h-10 w-10 text-orange-200" />
                    </div>
                    <div className="mt-2 text-sm text-orange-100">
                      {tick?.sla_breaches || 0} SLA violados
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-100 text-sm">Receita Ganha</p>
                        <p className="text-2xl font-bold">{formatCurrency(deals?.won_value || 0)}</p>
                      </div>
                      <DollarSign className="h-10 w-10 text-emerald-200" />
                    </div>
                    <div className="mt-2 text-sm text-emerald-100">
                      {deals?.won || 0} deals • {deals?.win_rate_pct || 0}% taxa
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-violet-100 text-sm">Novos Contatos</p>
                        <p className="text-3xl font-bold">{contacts?.new_in_period || 0}</p>
                      </div>
                      <Users className="h-10 w-10 text-violet-200" />
                    </div>
                    <div className="mt-2 text-sm text-violet-100">
                      {contacts?.leads || 0} leads • {contacts?.customers || 0} clientes
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detail cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      Atendimento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-slate-800">{conv?.avg_handle_minutes || 0}<span className="text-sm font-normal text-slate-500">min</span></p>
                        <p className="text-xs text-slate-500 mt-1">Tempo Médio de Atendimento</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-slate-800">{conv?.channels_used || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Canais Utilizados</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-700">{conv?.resolved || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Resolvidas</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-700">{conv?.open || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Em Aberto</p>
                      </div>
                    </div>
                    {conv?.avg_csat ? (
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <div>
                          <p className="font-semibold text-slate-800">{Number(conv.avg_csat).toFixed(1)} / 5</p>
                          <p className="text-xs text-slate-500">CSAT Médio das Conversas</p>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      Pipeline de Vendas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-700">{deals?.won || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Ganhos</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-red-700">{deals?.lost || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Perdidos</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Taxa de conversão</span>
                        <span className="font-semibold">{deals?.win_rate_pct || 0}%</span>
                      </div>
                      <Progress value={deals?.win_rate_pct || 0} className="h-3" />
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Valor Total Ganho</p>
                      <p className="text-xl font-bold text-emerald-600">{formatCurrency(deals?.won_value || 0)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CSAT */}
            <TabsContent value="csat" className="space-y-6">
              {csatSummary ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                      <CardContent className="p-5 text-center">
                        <Star className="h-10 w-10 mx-auto mb-2 fill-white" />
                        <p className="text-4xl font-bold">{Number(csatSummary.avg_score).toFixed(1)}</p>
                        <p className="text-yellow-100 text-sm mt-1">Nota Média / 5</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-5 text-center">
                        <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
                        <p className="text-4xl font-bold text-emerald-600">{csatSummary.satisfaction_rate_pct}%</p>
                        <p className="text-slate-500 text-sm mt-1">Taxa de Satisfação (4-5 ★)</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-5 text-center">
                        <Users className="h-10 w-10 mx-auto mb-2 text-blue-500" />
                        <p className="text-4xl font-bold text-blue-600">{csatSummary.total_responses}</p>
                        <p className="text-slate-500 text-sm mt-1">Total de Avaliações</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição de Notas</CardTitle>
                      <CardDescription>Período: {periodLabel[period]}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {csatBar("⭐⭐⭐⭐⭐", csatSummary.distribution[5], csatSummary.total_responses, "[&>div]:bg-emerald-500")}
                      {csatBar("⭐⭐⭐⭐", csatSummary.distribution[4], csatSummary.total_responses, "[&>div]:bg-green-400")}
                      {csatBar("⭐⭐⭐", csatSummary.distribution[3], csatSummary.total_responses, "[&>div]:bg-yellow-400")}
                      {csatBar("⭐⭐", csatSummary.distribution["1-2"], csatSummary.total_responses, "[&>div]:bg-red-400")}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Star className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500">Nenhuma avaliação no período</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* SLA */}
            <TabsContent value="sla" className="space-y-6">
              {slaReport && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={`${slaReport.protocols.compliance_rate_pct >= 90 ? "bg-gradient-to-br from-emerald-500 to-emerald-600" : slaReport.protocols.compliance_rate_pct >= 70 ? "bg-gradient-to-br from-yellow-500 to-yellow-600" : "bg-gradient-to-br from-red-500 to-red-600"} text-white`}>
                      <CardContent className="p-5 text-center">
                        <Shield className="h-10 w-10 mx-auto mb-2 opacity-80" />
                        <p className="text-4xl font-bold">{slaReport.protocols.compliance_rate_pct}%</p>
                        <p className="text-sm opacity-80 mt-1">Compliance de SLA</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-5 text-center">
                        <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-500" />
                        <p className="text-4xl font-bold text-emerald-600">{slaReport.protocols.compliant}</p>
                        <p className="text-slate-500 text-sm mt-1">Protocolos dentro do SLA</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-5 text-center">
                        <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-red-500" />
                        <p className="text-4xl font-bold text-red-600">{slaReport.protocols.breached}</p>
                        <p className="text-slate-500 text-sm mt-1">Violações de SLA</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tickets por Prioridade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {slaReport.tickets_by_priority.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Nenhum ticket no período</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-slate-50 border-b">
                              <tr>
                                <th className="text-left p-3 text-sm font-medium text-slate-600">Prioridade</th>
                                <th className="text-center p-3 text-sm font-medium text-slate-600">Total</th>
                                <th className="text-center p-3 text-sm font-medium text-slate-600">Violações</th>
                                <th className="text-center p-3 text-sm font-medium text-slate-600">Tempo Médio Res.</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {slaReport.tickets_by_priority.map(row => (
                                <tr key={row.priority} className="hover:bg-slate-50">
                                  <td className="p-3">
                                    <Badge className={getPriorityBadge(row.priority)}>{row.priority}</Badge>
                                  </td>
                                  <td className="p-3 text-center font-medium">{row.total}</td>
                                  <td className="p-3 text-center">
                                    <span className={row.breached > 0 ? "text-red-600 font-semibold" : "text-emerald-600"}>
                                      {row.breached}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center text-slate-600">
                                    {row.avg_resolution_minutes ? (
                                      <div className="flex items-center justify-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {Number(row.avg_resolution_minutes).toFixed(0)}min
                                      </div>
                                    ) : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Agents */}
            <TabsContent value="agents">
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Agente</CardTitle>
                  <CardDescription>Período: {periodLabel[period]}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-slate-600">Agente</th>
                          <th className="text-center p-4 text-sm font-medium text-slate-600">Conversas</th>
                          <th className="text-center p-4 text-sm font-medium text-slate-600">Resolvidas</th>
                          <th className="text-center p-4 text-sm font-medium text-slate-600">CSAT</th>
                          <th className="text-center p-4 text-sm font-medium text-slate-600">TMA</th>
                          <th className="text-center p-4 text-sm font-medium text-slate-600">Tickets</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {agentReport.map(agent => {
                          const resolutionRate = agent.conversations_handled > 0
                            ? Math.round((agent.resolved / agent.conversations_handled) * 100)
                            : 0;
                          return (
                            <tr key={agent.agent_id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 font-medium text-slate-800">{agent.agent_name}</td>
                              <td className="p-4 text-center">{agent.conversations_handled}</td>
                              <td className="p-4 text-center">
                                <div className="flex flex-col items-center">
                                  <span className="font-medium">{agent.resolved}</span>
                                  <span className="text-xs text-slate-500">{resolutionRate}%</span>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                {agent.avg_csat ? (
                                  <div className="flex items-center justify-center gap-1 text-yellow-600 font-semibold">
                                    <Star className="h-3 w-3 fill-current" />
                                    {Number(agent.avg_csat).toFixed(1)}
                                  </div>
                                ) : <span className="text-slate-400">—</span>}
                              </td>
                              <td className="p-4 text-center text-slate-600">
                                {agent.avg_handle_minutes ? `${Number(agent.avg_handle_minutes).toFixed(0)}min` : "—"}
                              </td>
                              <td className="p-4 text-center">
                                <span className="text-sm">{agent.tickets_handled} / {agent.tickets_resolved}</span>
                              </td>
                            </tr>
                          );
                        })}
                        {agentReport.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-slate-500">
                              Nenhum dado de agente no período
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </BrowserFrame>
  );
}

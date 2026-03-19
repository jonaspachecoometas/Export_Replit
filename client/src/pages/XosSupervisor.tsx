import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useXosSocket } from "@/hooks/use-xos-socket";
import { Link } from "wouter";
import { BrowserFrame } from "@/components/Browser/BrowserFrame";
import {
  Users, MessageSquare, Ticket, Clock, AlertTriangle, CheckCircle2,
  TrendingUp, ChevronRight, RefreshCw, Activity, UserCheck, PhoneOff,
  BarChart3, Inbox, Star, ArrowLeft, Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface SupervisorOverview {
  conversations: {
    open: number;
    pending: number;
    resolved_today: number;
    unassigned: number;
    avg_handle_time_minutes: number;
  };
  tickets: {
    open: number;
    resolved_today: number;
    urgent_open: number;
    sla_breached: number;
  };
  agents_active: Array<{ agent_id: string; active_conversations: number }>;
  generated_at: string;
}

interface QueueStat {
  id: number;
  name: string;
  color: string;
  active_conversations: number;
  waiting: number;
  total_agents: number;
  avg_first_response_minutes: number;
}

interface AgentStat {
  agent_id: string;
  agent_name: string;
  avatar: string | null;
  active_conversations: number;
  resolved_today: number;
  avg_csat: number;
  avg_handle_time_minutes: number;
  queues: string[];
}

interface LiveConversation {
  id: number;
  contact_name: string;
  contact_phone: string;
  queue_name: string;
  queue_color: string;
  channel: string;
  status: string;
  assigned_to: string | null;
  age_minutes: number;
  last_message: string;
}

export default function XosSupervisor() {
  const [activeTab, setActiveTab] = useState("overview");
  const [queueFilter, setQueueFilter] = useState("all");
  const [autoRefresh] = useState(true);
  const { connected: socketConnected, supervisorStats: liveStats } = useXosSocket();

  const refetchInterval = autoRefresh ? 30000 : false;

  const { data: overview, isLoading: loadingOverview, refetch: refetchOverview } = useQuery<SupervisorOverview>({
    queryKey: ["/api/xos/supervisor/overview"],
    refetchInterval,
  });

  const { data: queues = [] } = useQuery<QueueStat[]>({
    queryKey: ["/api/xos/supervisor/queues"],
    refetchInterval,
  });

  const { data: agents = [] } = useQuery<AgentStat[]>({
    queryKey: ["/api/xos/supervisor/agents", queueFilter],
    queryFn: async () => {
      const url = queueFilter === "all"
        ? "/api/xos/supervisor/agents"
        : `/api/xos/supervisor/agents?queueId=${queueFilter}`;
      const res = await fetch(url);
      return res.json();
    },
    refetchInterval,
  });

  const { data: liveConvs = [] } = useQuery<LiveConversation[]>({
    queryKey: ["/api/xos/supervisor/conversations/live", queueFilter],
    queryFn: async () => {
      const url = queueFilter === "all"
        ? "/api/xos/supervisor/conversations/live"
        : `/api/xos/supervisor/conversations/live?queueId=${queueFilter}`;
      const res = await fetch(url);
      return res.json();
    },
    refetchInterval,
  });

  const getQueueColor = (color: string) => {
    const map: Record<string, string> = {
      blue: "bg-blue-500", green: "bg-green-500", red: "bg-red-500",
      yellow: "bg-yellow-500", purple: "bg-purple-500", orange: "bg-orange-500",
      cyan: "bg-cyan-500", pink: "bg-pink-500",
    };
    return map[color] || "bg-slate-500";
  };

  const getAgentCsatColor = (score: number) => {
    if (!score) return "text-slate-400";
    if (score >= 4.5) return "text-emerald-600";
    if (score >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getAgeColor = (minutes: number) => {
    if (minutes < 10) return "text-emerald-600";
    if (minutes < 30) return "text-yellow-600";
    return "text-red-600";
  };

  if (loadingOverview) {
    return (
      <BrowserFrame>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-slate-500">Carregando dados do supervisor...</p>
          </div>
        </div>
      </BrowserFrame>
    );
  }

  // Prefer real-time socket stats over polling data when available
  const conv = overview?.conversations;
  const tick = overview?.tickets;
  const totalActive = liveStats?.openConversations ?? ((conv?.open || 0) + (conv?.pending || 0));
  const resolvedToday = liveStats?.resolvedToday ?? conv?.resolved_today ?? 0;
  const urgentTickets = liveStats?.urgentTickets ?? tick?.urgent_open ?? 0;
  const agentsOnline = liveStats?.agentsOnline ?? overview?.agents_active?.length ?? 0;

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
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-2 rounded-xl">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Monitor de Supervisor</h1>
                  <p className="text-xs text-slate-500">
                    Atualizado às {overview ? new Date(overview.generated_at).toLocaleTimeString("pt-BR") : "—"}
                    {socketConnected
                      ? <span className="ml-2 text-emerald-600">● tempo real</span>
                      : autoRefresh && <span className="ml-2 text-yellow-600">○ polling 30s</span>
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={queueFilter} onValueChange={setQueueFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Todas as filas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as filas</SelectItem>
                    {queues.map(q => (
                      <SelectItem key={q.id} value={String(q.id)}>{q.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => refetchOverview()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Em Atendimento</p>
                    <p className="text-3xl font-bold">{totalActive}</p>
                  </div>
                  <MessageSquare className="h-10 w-10 text-blue-200" />
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-100">
                  <span>{conv?.unassigned || 0} sem agente</span>

                  <span>•</span>
                  <span>{conv?.pending || 0} pendentes</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Resolvidos Hoje</p>
                    <p className="text-3xl font-bold">{resolvedToday}</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-emerald-200" />
                </div>
                <div className="mt-2 text-sm text-emerald-100">
                  TMA: {conv?.avg_handle_time_minutes || 0}min
                </div>
              </CardContent>
            </Card>

            <Card className={`text-white ${(tick?.sla_breached || 0) > 0 ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-orange-500 to-orange-600"}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Tickets Urgentes</p>
                    <p className="text-3xl font-bold">{urgentTickets}</p>
                  </div>
                  <Ticket className="h-10 w-10 text-orange-200" />
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-orange-100">
                  {(tick?.sla_breached || 0) > 0 && (
                    <span className="flex items-center gap-1 text-red-200">
                      <AlertTriangle className="h-3 w-3" />
                      {tick?.sla_breached} SLA violado
                    </span>
                  )}
                  {(tick?.sla_breached || 0) === 0 && <span>SLA OK</span>}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100 text-sm">Agentes Ativos</p>
                    <p className="text-3xl font-bold">{agentsOnline}</p>
                  </div>
                  <Users className="h-10 w-10 text-violet-200" />
                </div>
                <div className="mt-2 text-sm text-violet-100">
                  {agents.length} no total
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Filas</TabsTrigger>
              <TabsTrigger value="agents">Agentes</TabsTrigger>
              <TabsTrigger value="live">Ao Vivo ({liveConvs.length})</TabsTrigger>
            </TabsList>

            {/* Queues Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {queues.map(queue => {
                  const occupancy = queue.total_agents > 0
                    ? Math.min(100, Math.round((queue.active_conversations / queue.total_agents) * 100))
                    : 0;
                  return (
                    <Card key={queue.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${getQueueColor(queue.color)}`} />
                          <h3 className="font-semibold text-slate-800">{queue.name}</h3>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {queue.total_agents} agentes
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center mb-3">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">{queue.active_conversations}</p>
                            <p className="text-xs text-slate-500">ativos</p>
                          </div>
                          <div>
                            <p className={`text-2xl font-bold ${queue.waiting > 0 ? "text-orange-600" : "text-slate-400"}`}>
                              {queue.waiting}
                            </p>
                            <p className="text-xs text-slate-500">aguardando</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-600">
                              {queue.avg_first_response_minutes ? `${queue.avg_first_response_minutes}m` : "—"}
                            </p>
                            <p className="text-xs text-slate-500">TMP</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Ocupação</span>
                            <span>{occupancy}%</span>
                          </div>
                          <Progress value={occupancy} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {queues.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-slate-500">
                    <Inbox className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>Nenhuma fila configurada</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="text-left p-4 text-sm font-medium text-slate-600">Agente</th>
                          <th className="text-center p-4 text-sm font-medium text-slate-600">Em Atend.</th>
                          <th className="text-center p-4 text-sm font-medium text-slate-600">Resolvidos Hoje</th>
                          <th className="text-center p-4 text-sm font-medium text-slate-600">CSAT Médio</th>
                          <th className="text-center p-4 text-sm font-medium text-slate-600">TMA (min)</th>
                          <th className="text-left p-4 text-sm font-medium text-slate-600">Filas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {agents.map(agent => (
                          <tr key={agent.agent_id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm">
                                    {(agent.agent_name || "?").slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-slate-800">{agent.agent_name}</p>
                                  <div className="flex items-center gap-1">
                                    <Circle className={`h-2 w-2 fill-current ${agent.active_conversations > 0 ? "text-emerald-500" : "text-slate-300"}`} />
                                    <span className="text-xs text-slate-500">
                                      {agent.active_conversations > 0 ? "online" : "disponível"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`text-xl font-bold ${agent.active_conversations > 5 ? "text-red-600" : agent.active_conversations > 2 ? "text-yellow-600" : "text-slate-700"}`}>
                                {agent.active_conversations}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="text-lg font-semibold text-emerald-600">{agent.resolved_today || 0}</span>
                            </td>
                            <td className="p-4 text-center">
                              <div className={`flex items-center justify-center gap-1 font-semibold ${getAgentCsatColor(agent.avg_csat)}`}>
                                {agent.avg_csat ? (
                                  <>
                                    <Star className="h-3 w-3 fill-current" />
                                    {Number(agent.avg_csat).toFixed(1)}
                                  </>
                                ) : "—"}
                              </div>
                            </td>
                            <td className="p-4 text-center text-slate-600">
                              {agent.avg_handle_time_minutes ? `${agent.avg_handle_time_minutes}m` : "—"}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {(agent.queues || []).filter(Boolean).map((q, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{q}</Badge>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {agents.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-slate-500">
                              <UserCheck className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                              Nenhum agente encontrado
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Live Conversations Tab */}
            <TabsContent value="live">
              <div className="space-y-2">
                {liveConvs.length === 0 && (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-slate-500">Nenhuma conversa em aberto</p>
                    </CardContent>
                  </Card>
                )}
                {liveConvs.map(conv => (
                  <Card key={conv.id} className={`hover:shadow-md transition-shadow ${Number(conv.age_minutes) > 30 ? "border-red-200 bg-red-50" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white">
                            {(conv.contact_name || "?").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-800">{conv.contact_name || "Desconhecido"}</p>
                            <Badge variant="outline" className="text-xs">{conv.channel}</Badge>
                          </div>
                          <p className="text-sm text-slate-500 truncate">{conv.last_message || "—"}</p>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          {conv.queue_name && (
                            <Badge variant="secondary" className="text-xs">{conv.queue_name}</Badge>
                          )}
                          {conv.assigned_to ? (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <UserCheck className="h-3 w-3" />
                              <span className="hidden sm:block">{conv.assigned_to}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-orange-500">
                              <PhoneOff className="h-3 w-3" />
                              <span>Sem agente</span>
                            </div>
                          )}
                          <div className={`flex items-center gap-1 text-sm font-medium ${getAgeColor(Number(conv.age_minutes))}`}>
                            <Clock className="h-4 w-4" />
                            {Number(conv.age_minutes).toFixed(0)}m
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </BrowserFrame>
  );
}

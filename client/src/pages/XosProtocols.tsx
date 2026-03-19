import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { BrowserFrame } from "@/components/Browser/BrowserFrame";
import {
  Hash, Search, Filter, ArrowLeft, CheckCircle2, Clock, AlertTriangle,
  Plus, Star, Shield, Copy, ChevronRight, User, Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Protocol {
  id: number;
  protocol_number: string;
  status: "open" | "resolved" | "cancelled";
  subject: string | null;
  contact_name: string | null;
  queue_name: string | null;
  assigned_to: string | null;
  sla_deadline: string | null;
  sla_breach: boolean;
  satisfaction_score: number | null;
  opened_at: string;
  resolved_at: string | null;
  conversation_id: number | null;
  ticket_id: number | null;
}

export default function XosProtocols() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newForm, setNewForm] = useState({ subject: "", contactId: "", queueId: "", slaMinutes: "" });
  const [csatDialog, setCsatDialog] = useState<{ open: boolean; protocol: Protocol | null }>({ open: false, protocol: null });
  const [csatScore, setCsatScore] = useState(5);
  const [csatComment, setCsatComment] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: protocols = [], isLoading } = useQuery<Protocol[]>({
    queryKey: ["/api/xos/protocols", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/xos/protocols?${params}`);
      return res.json();
    },
  });

  const createProtocol = useMutation({
    mutationFn: async (data: typeof newForm) => {
      const res = await fetch("/api/xos/protocols", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: data.subject || null,
          contactId: data.contactId ? parseInt(data.contactId) : null,
          queueId: data.queueId ? parseInt(data.queueId) : null,
          slaMinutes: data.slaMinutes ? parseInt(data.slaMinutes) : null,
        }),
      });
      if (!res.ok) throw new Error("Falha ao criar protocolo");
      return res.json();
    },
    onSuccess: (prot) => {
      toast({ title: "Protocolo criado", description: `Número: ${prot.protocol_number}` });
      setShowNewDialog(false);
      setNewForm({ subject: "", contactId: "", queueId: "", slaMinutes: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/xos/protocols"] });
    },
    onError: () => toast({ title: "Erro ao criar protocolo", variant: "destructive" }),
  });

  const updateProtocol = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/xos/protocols/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Protocolo atualizado" });
      queryClient.invalidateQueries({ queryKey: ["/api/xos/protocols"] });
      setSelectedProtocol(null);
    },
  });

  const submitCsat = useMutation({
    mutationFn: async ({ protocol, score, comment }: { protocol: Protocol; score: number; comment: string }) => {
      const endpoint = protocol.conversation_id
        ? `/api/xos/conversations/${protocol.conversation_id}/csat`
        : protocol.ticket_id
          ? `/api/xos/tickets/${protocol.ticket_id}/csat`
          : null;
      if (!endpoint) throw new Error("Sem conversa ou ticket vinculado");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, comment }),
      });
      if (!res.ok) throw new Error("Falha ao registrar CSAT");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Avaliação registrada!", description: "CSAT salvo com sucesso." });
      setCsatDialog({ open: false, protocol: null });
      setCsatScore(5);
      setCsatComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/xos/protocols"] });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const getStatusConfig = (status: string) => ({
    open: { label: "Aberto", color: "bg-blue-100 text-blue-700", icon: Clock },
    resolved: { label: "Resolvido", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    cancelled: { label: "Cancelado", color: "bg-slate-100 text-slate-600", icon: AlertTriangle },
  }[status] || { label: status, color: "bg-slate-100 text-slate-600", icon: Clock });

  const isSlaBreached = (p: Protocol) => {
    if (p.sla_breach) return true;
    if (p.status !== "open" || !p.sla_deadline) return false;
    return new Date(p.sla_deadline) < new Date();
  };

  const getSlaTimeLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff < 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const copyProtocol = (number: string) => {
    navigator.clipboard.writeText(number);
    toast({ title: "Copiado!", description: number });
  };

  const open = protocols.filter(p => p.status === "open").length;
  const resolved = protocols.filter(p => p.status === "resolved").length;
  const breached = protocols.filter(p => isSlaBreached(p)).length;

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
                <div className="bg-gradient-to-br from-teal-600 to-cyan-700 p-2 rounded-xl">
                  <Hash className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Protocolos</h1>
                  <p className="text-xs text-slate-500">Rastreamento de atendimentos</p>
                </div>
              </div>
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Protocolo
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-200" />
                <div>
                  <p className="text-blue-100 text-sm">Abertos</p>
                  <p className="text-2xl font-bold">{open}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-200" />
                <div>
                  <p className="text-emerald-100 text-sm">Resolvidos</p>
                  <p className="text-2xl font-bold">{resolved}</p>
                </div>
              </CardContent>
            </Card>
            <Card className={`text-white ${breached > 0 ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-slate-500 to-slate-600"}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 opacity-70" />
                <div>
                  <p className="opacity-80 text-sm">SLA Violado</p>
                  <p className="text-2xl font-bold">{breached}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por número ou assunto..."
                className="pl-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Abertos</SelectItem>
                <SelectItem value="resolved">Resolvidos</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : protocols.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Inbox className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">Nenhum protocolo encontrado</p>
                <Button className="mt-4" onClick={() => setShowNewDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Criar Protocolo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {protocols.map(protocol => {
                const statusCfg = getStatusConfig(protocol.status);
                const StatusIcon = statusCfg.icon;
                const breached = isSlaBreached(protocol);
                const slaLeft = protocol.sla_deadline && protocol.status === "open" ? getSlaTimeLeft(protocol.sla_deadline) : null;

                return (
                  <Card
                    key={protocol.id}
                    className={`hover:shadow-md transition-all cursor-pointer ${breached ? "border-red-300 bg-red-50" : ""}`}
                    onClick={() => setSelectedProtocol(protocol)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <StatusIcon className={`h-5 w-5 ${protocol.status === "resolved" ? "text-emerald-500" : protocol.status === "cancelled" ? "text-slate-400" : "text-blue-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              className="font-mono font-semibold text-slate-800 hover:text-blue-600 flex items-center gap-1"
                              onClick={e => { e.stopPropagation(); copyProtocol(protocol.protocol_number); }}
                            >
                              #{protocol.protocol_number}
                              <Copy className="h-3 w-3 opacity-50" />
                            </button>
                            <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                            {breached && <Badge className="bg-red-100 text-red-700">SLA Violado</Badge>}
                            {protocol.satisfaction_score && (
                              <Badge className="bg-yellow-100 text-yellow-700">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                {protocol.satisfaction_score}/5
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1 truncate">{protocol.subject || "Sem assunto"}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            {protocol.contact_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {protocol.contact_name}
                              </span>
                            )}
                            {protocol.queue_name && (
                              <span>{protocol.queue_name}</span>
                            )}
                            <span>{new Date(protocol.opened_at).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {slaLeft && (
                            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 justify-end">
                              <Shield className="h-3 w-3" />
                              {slaLeft} restante
                            </p>
                          )}
                          {breached && protocol.status === "open" && (
                            <p className="text-xs text-red-600 font-medium">SLA vencido</p>
                          )}
                          <ChevronRight className="h-4 w-4 text-slate-400 mt-1 ml-auto" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>

        {/* Protocol detail dialog */}
        {selectedProtocol && (
          <Dialog open onOpenChange={() => setSelectedProtocol(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-teal-600" />
                  Protocolo #{selectedProtocol.protocol_number}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <Badge className={getStatusConfig(selectedProtocol.status).color}>
                      {getStatusConfig(selectedProtocol.status).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Abertura</p>
                    <p className="text-sm font-medium">{new Date(selectedProtocol.opened_at).toLocaleString("pt-BR")}</p>
                  </div>
                  {selectedProtocol.contact_name && (
                    <div>
                      <p className="text-xs text-slate-500">Contato</p>
                      <p className="text-sm font-medium">{selectedProtocol.contact_name}</p>
                    </div>
                  )}
                  {selectedProtocol.queue_name && (
                    <div>
                      <p className="text-xs text-slate-500">Fila</p>
                      <p className="text-sm font-medium">{selectedProtocol.queue_name}</p>
                    </div>
                  )}
                  {selectedProtocol.sla_deadline && (
                    <div>
                      <p className="text-xs text-slate-500">SLA Deadline</p>
                      <p className={`text-sm font-medium ${isSlaBreached(selectedProtocol) ? "text-red-600" : "text-emerald-600"}`}>
                        {new Date(selectedProtocol.sla_deadline).toLocaleString("pt-BR")}
                        {isSlaBreached(selectedProtocol) && " (violado)"}
                      </p>
                    </div>
                  )}
                  {selectedProtocol.satisfaction_score && (
                    <div>
                      <p className="text-xs text-slate-500">CSAT</p>
                      <div className="flex items-center gap-1 text-yellow-600">
                        {"★".repeat(selectedProtocol.satisfaction_score)}
                        <span className="text-sm ml-1">{selectedProtocol.satisfaction_score}/5</span>
                      </div>
                    </div>
                  )}
                </div>
                {selectedProtocol.subject && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Assunto</p>
                    <p className="text-sm bg-slate-50 p-2 rounded">{selectedProtocol.subject}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="flex flex-wrap gap-2">
                {selectedProtocol.status === "open" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCsatDialog({ open: true, protocol: selectedProtocol })}
                    >
                      <Star className="h-4 w-4 mr-2" /> Registrar CSAT
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateProtocol.mutate({ id: selectedProtocol.id, status: "resolved" })}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Resolver
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedProtocol(null)}>Fechar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* New Protocol Dialog */}
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Protocolo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  placeholder="Descreva o motivo do atendimento"
                  value={newForm.subject}
                  onChange={e => setNewForm(f => ({ ...f, subject: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="contactId">ID do Contato</Label>
                  <Input
                    id="contactId"
                    type="number"
                    placeholder="Ex: 42"
                    value={newForm.contactId}
                    onChange={e => setNewForm(f => ({ ...f, contactId: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="slaMinutes">SLA (minutos)</Label>
                  <Input
                    id="slaMinutes"
                    type="number"
                    placeholder="Ex: 480"
                    value={newForm.slaMinutes}
                    onChange={e => setNewForm(f => ({ ...f, slaMinutes: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowNewDialog(false)}>Cancelar</Button>
              <Button onClick={() => createProtocol.mutate(newForm)} disabled={createProtocol.isPending}>
                {createProtocol.isPending ? "Criando..." : "Criar Protocolo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CSAT Dialog */}
        <Dialog open={csatDialog.open} onOpenChange={o => !o && setCsatDialog({ open: false, protocol: null })}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Registrar Avaliação (CSAT)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nota (1 a 5)</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setCsatScore(n)}
                      className={`text-2xl transition-transform hover:scale-110 ${n <= csatScore ? "text-yellow-400" : "text-slate-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">{["", "Muito insatisfeito", "Insatisfeito", "Neutro", "Satisfeito", "Muito satisfeito"][csatScore]}</p>
              </div>
              <div>
                <Label htmlFor="csatComment">Comentário (opcional)</Label>
                <Textarea
                  id="csatComment"
                  placeholder="O que poderia melhorar?"
                  value={csatComment}
                  onChange={e => setCsatComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setCsatDialog({ open: false, protocol: null })}>Cancelar</Button>
              <Button
                onClick={() => csatDialog.protocol && submitCsat.mutate({ protocol: csatDialog.protocol, score: csatScore, comment: csatComment })}
                disabled={submitCsat.isPending}
              >
                {submitCsat.isPending ? "Salvando..." : "Salvar Avaliação"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BrowserFrame>
  );
}

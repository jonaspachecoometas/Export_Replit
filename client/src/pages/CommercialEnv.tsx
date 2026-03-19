import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BrowserFrame } from "@/components/Browser/BrowserFrame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Users, TrendingUp, DollarSign, Plus, Search, Edit, Eye,
  RefreshCw, CheckCircle, XCircle, Clock, Send, ArrowRight, Building2,
  Loader2, MapPin, Calendar, Target, FileCheck, Rocket, BarChart3
} from "lucide-react";

type TabType = "dashboard" | "customers" | "proposals" | "projects" | "services" | "pipeline";

interface ArcadiaCustomer {
  name: string;
  customer_name?: string;
  territory?: string;
  customer_group?: string;
}

interface ArcadiaSalesOrder {
  name: string;
  customer: string;
  customer_name: string;
  transaction_date: string;
  delivery_date: string;
  grand_total: number;
  status: string;
  per_delivered: number;
  per_billed: number;
}

interface Proposal {
  id: number;
  proposalNumber: string;
  title: string;
  customerId: string;
  customerName: string;
  serviceType: string;
  status: string;
  totalValue: number;
  validUntil: string;
  createdAt: string;
}

interface EnvironmentalService {
  id: number;
  code?: string;
  name: string;
  description?: string;
  category?: string;
  basePrice?: string;
  unit?: string;
  estimatedDuration?: number;
  items?: string[];
  isActive?: number;
}

const defaultServices: EnvironmentalService[] = [
  { id: -1, code: "MON-001", name: "Monitoramento de Águas Subterrâneas", description: "Campanha de monitoramento de poços com análises laboratoriais", category: "Monitoramento", basePrice: "15000", items: ["Mobilização de equipe", "Coleta de amostras", "Análises laboratoriais", "Relatório técnico"] },
  { id: -2, code: "INV-001", name: "Investigação Confirmatória", description: "Investigação de áreas potencialmente contaminadas conforme CONAMA 420", category: "Investigação", basePrice: "45000", items: ["Sondagens", "Instalação de poços", "Coleta de amostras", "Análises laboratoriais", "Modelo conceitual", "Relatório técnico"] },
  { id: -3, code: "INV-002", name: "Investigação Detalhada", description: "Delimitação de plumas de contaminação e avaliação de risco", category: "Investigação", basePrice: "85000", items: ["Sondagens adicionais", "Poços multinível", "Slug tests", "Análises químicas", "Modelagem", "Avaliação de risco", "Relatório técnico"] },
  { id: -4, code: "REM-001", name: "Projeto de Remediação", description: "Elaboração de plano de intervenção para áreas contaminadas", category: "Remediação", basePrice: "35000", items: ["Análise de alternativas", "Dimensionamento", "Projeto executivo", "Cronograma", "Orçamento"] },
  { id: -5, code: "LIC-001", name: "Licenciamento Ambiental", description: "Elaboração de estudos para licenciamento ambiental", category: "Licenciamento", basePrice: "25000", items: ["Diagnóstico ambiental", "Estudos específicos", "Elaboração de EIA/RIMA ou RAS", "Acompanhamento CETESB"] },
  { id: -6, code: "AUD-001", name: "Auditoria Ambiental (Due Diligence)", description: "Avaliação ambiental de imóveis para transações imobiliárias", category: "Consultoria", basePrice: "18000", items: ["Pesquisa documental", "Vistoria técnica", "Avaliação de passivos", "Relatório de due diligence"] },
];

const serviceCategories = ["Monitoramento", "Investigação", "Remediação", "Licenciamento", "Consultoria", "Outro"];

const statusColors: Record<string, string> = {
  rascunho: "bg-gray-500",
  enviada: "bg-blue-500",
  visualizada: "bg-purple-500",
  em_negociacao: "bg-yellow-500",
  aceita: "bg-green-500",
  rejeitada: "bg-red-500",
  expirada: "bg-gray-400",
  Completed: "bg-green-500",
  "To Deliver and Bill": "bg-yellow-500",
  "To Bill": "bg-blue-500",
  "To Deliver": "bg-orange-500",
  Draft: "bg-gray-500",
};

const api = {
  get: async (url: string) => {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },
  post: async (url: string, data: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },
  put: async (url: string, data: any) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },
  delete: async (url: string) => {
    const res = await fetch(url, { method: "DELETE", credentials: "include" });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  },
};

export default function CommercialEnv() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<EnvironmentalService | null>(null);
  const [editingService, setEditingService] = useState<EnvironmentalService | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [newItems, setNewItems] = useState<string>("");
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ArcadiaSalesOrder | null>(null);
  const [projectWorkflow, setProjectWorkflow] = useState<"pre_projeto" | "backlog" | "planejamento" | "execucao">("pre_projeto");

  interface ProjectStatus {
    orderId: string;
    stage: "venda" | "pre_projeto" | "backlog_tecnico" | "planejamento" | "em_execucao";
    technicalTeam?: string;
    plannedStart?: string;
    plannedEnd?: string;
    responsiblePerson?: string;
    notes?: string;
  }

  const [projectStatuses, setProjectStatuses] = useState<Record<string, ProjectStatus>>({});

  const { data: erpCustomers = [], isLoading: loadingCustomers, refetch: refetchCustomers } = useQuery<ArcadiaCustomer[]>({
    queryKey: ["/api/erpnext/customers"],
    queryFn: async () => {
      const res = await api.get("/api/erpnext/resource/Customer?limit=100");
      return res.data || [];
    },
  });

  const { data: salesOrders = [], isLoading: loadingOrders, refetch: refetchOrders } = useQuery<ArcadiaSalesOrder[]>({
    queryKey: ["/api/erpnext/sales-orders"],
    queryFn: async () => {
      const res = await api.get("/api/erpnext/resource/Sales%20Order?limit=50");
      if (!res.data) return [];
      const orders = await Promise.all(
        res.data.slice(0, 10).map(async (o: any) => {
          try {
            const detail = await api.get(`/api/erpnext/resource/Sales%20Order/${o.name}`);
            return detail.data;
          } catch {
            return null;
          }
        })
      );
      return orders.filter(Boolean);
    },
  });

  const { data: proposals = [], refetch: refetchProposals } = useQuery<Proposal[]>({
    queryKey: ["/api/crm/proposals"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/crm/proposals");
        return res || [];
      } catch {
        return [];
      }
    },
  });

  const createProposalMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post("/api/crm/proposals", data);
    },
    onSuccess: () => {
      toast({ title: "Proposta criada com sucesso" });
      refetchProposals();
      setShowProposalDialog(false);
    },
    onError: () => toast({ title: "Erro ao criar proposta", variant: "destructive" }),
  });

  const { data: dbServices = [], isLoading: loadingServices, refetch: refetchServices } = useQuery<EnvironmentalService[]>({
    queryKey: ["/api/quality/services"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/quality/services");
        return res.data || [];
      } catch {
        return [];
      }
    },
  });

  const allServices = dbServices.length > 0 ? dbServices : defaultServices;

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => api.post("/api/quality/services", data),
    onSuccess: () => {
      toast({ title: "Serviço criado com sucesso" });
      refetchServices();
      setShowServiceDialog(false);
      setEditingService(null);
    },
    onError: () => toast({ title: "Erro ao criar serviço", variant: "destructive" }),
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => api.put(`/api/quality/services/${id}`, data),
    onSuccess: () => {
      toast({ title: "Serviço atualizado com sucesso" });
      refetchServices();
      setShowServiceDialog(false);
      setEditingService(null);
    },
    onError: () => toast({ title: "Erro ao atualizar serviço", variant: "destructive" }),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/api/quality/services/${id}`),
    onSuccess: () => {
      toast({ title: "Serviço excluído com sucesso" });
      refetchServices();
    },
    onError: () => toast({ title: "Erro ao excluir serviço", variant: "destructive" }),
  });

  const handleSaveService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemsArray = newItems.split("\n").filter(i => i.trim());
    const data = {
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      basePrice: formData.get("basePrice") as string,
      unit: formData.get("unit") as string,
      estimatedDuration: Number(formData.get("estimatedDuration")) || null,
      items: itemsArray.length > 0 ? itemsArray : null,
      isActive: 1,
    };
    if (editingService && editingService.id > 0) {
      updateServiceMutation.mutate({ id: editingService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  const openEditService = (service: EnvironmentalService) => {
    setEditingService(service);
    setNewItems(service.items?.join("\n") || "");
    setShowServiceDialog(true);
  };

  const openNewService = () => {
    setEditingService(null);
    setNewItems("");
    setShowServiceDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const color = statusColors[status] || "bg-gray-500";
    const label = status.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase());
    return <Badge className={`${color} text-white`}>{label}</Badge>;
  };

  const filteredCustomers = erpCustomers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPipeline = salesOrders.reduce((sum, o) => sum + (o.grand_total || 0), 0);
  const completedOrders = salesOrders.filter(o => o.status === "Completed").length;
  const pendingOrders = salesOrders.filter(o => o.status !== "Completed").length;

  return (
    <BrowserFrame>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Comercial - Engenharia Ambiental
            </h1>
            <p className="text-muted-foreground">
              Propostas, clientes e pipeline de vendas integrado ao Arcádia SOE
            </p>
          </div>
          <Button onClick={() => refetchCustomers()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" /> Sincronizar
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
          <TabsList className="h-12">
            <TabsTrigger value="dashboard" className="gap-2" data-testid="tab-commercial-dashboard">
              <BarChart3 className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2" data-testid="tab-erp-customers">
              <Building2 className="h-4 w-4" /> Clientes
            </TabsTrigger>
            <TabsTrigger value="proposals" className="gap-2" data-testid="tab-proposals">
              <FileText className="h-4 w-4" /> Propostas
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2" data-testid="tab-sales-orders">
              <Rocket className="h-4 w-4" /> Pedidos/Projetos
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2" data-testid="tab-services">
              <Target className="h-4 w-4" /> Serviços
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2" data-testid="tab-pipeline">
              <TrendingUp className="h-4 w-4" /> Pipeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Arcádia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{erpCustomers.length}</div>
                  <p className="text-xs text-muted-foreground">Total cadastrado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">Em andamento</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Concluídos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{completedOrders}</div>
                  <p className="text-xs text-muted-foreground">Finalizados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {totalPipeline.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                  <p className="text-xs text-muted-foreground">Valor em pedidos</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Últimos Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesOrders.slice(0, 5).map((order) => (
                        <TableRow key={order.name}>
                          <TableCell className="font-medium">{order.name}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.customer_name}</TableCell>
                          <TableCell>{order.grand_total?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                        </TableRow>
                      ))}
                      {salesOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Nenhum pedido encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Serviços Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allServices.slice(0, 4).map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.category}</p>
                        </div>
                        <Badge variant="outline">
                          {service.basePrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                  data-testid="search-customers"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => refetchCustomers()}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
                </Button>
                <Badge variant="secondary" className="h-9 px-3 flex items-center">
                  <Building2 className="h-4 w-4 mr-1" /> {erpCustomers.length} clientes
                </Badge>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {loadingCustomers ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Território</TableHead>
                        <TableHead>Grupo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.name}>
                          <TableCell className="font-mono text-sm">{customer.name}</TableCell>
                          <TableCell className="font-medium">{customer.customer_name || customer.name}</TableCell>
                          <TableCell>{customer.territory || "-"}</TableCell>
                          <TableCell>{customer.customer_group || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedCustomer(customer.name);
                                setShowProposalDialog(true);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" /> Nova Proposta
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Nenhum cliente encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Propostas Comerciais</h2>
              <Button onClick={() => setShowProposalDialog(true)} data-testid="btn-new-proposal">
                <Plus className="h-4 w-4 mr-2" /> Nova Proposta
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proposals.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.proposalNumber || `PROP-${p.id}`}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{p.title}</TableCell>
                        <TableCell>{p.customerName || "-"}</TableCell>
                        <TableCell>{p.serviceType || "-"}</TableCell>
                        <TableCell>{(p.totalValue || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                        <TableCell>{getStatusBadge(p.status || "rascunho")}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon"><Send className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {proposals.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhuma proposta cadastrada. Clique em "Nova Proposta" para começar.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Pedidos de Venda → Projetos</h2>
                <p className="text-sm text-muted-foreground">Gerencie o fluxo: Venda → Pré-Projeto → Backlog Técnico → Planejamento → Execução</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchOrders()}>
                <RefreshCw className="h-4 w-4 mr-2" /> Sincronizar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4 pb-2">
                  <p className="text-2xl font-bold">{salesOrders.length}</p>
                  <p className="text-xs text-muted-foreground">Vendas</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="pt-4 pb-2">
                  <p className="text-2xl font-bold">{Object.values(projectStatuses).filter(p => p.stage === "pre_projeto").length}</p>
                  <p className="text-xs text-muted-foreground">Pré-Projetos</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="pt-4 pb-2">
                  <p className="text-2xl font-bold">{Object.values(projectStatuses).filter(p => p.stage === "backlog_tecnico").length}</p>
                  <p className="text-xs text-muted-foreground">Backlog Técnico</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="pt-4 pb-2">
                  <p className="text-2xl font-bold">{Object.values(projectStatuses).filter(p => p.stage === "planejamento").length}</p>
                  <p className="text-xs text-muted-foreground">Em Planejamento</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-4 pb-2">
                  <p className="text-2xl font-bold">{Object.values(projectStatuses).filter(p => p.stage === "em_execucao").length}</p>
                  <p className="text-xs text-muted-foreground">Em Execução</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                {loadingOrders ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Etapa do Projeto</TableHead>
                        <TableHead>Entrega</TableHead>
                        <TableHead>Status ERP</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesOrders.map((order) => {
                        const projectStatus = projectStatuses[order.name];
                        return (
                          <TableRow key={order.name}>
                            <TableCell className="font-medium">{order.name}</TableCell>
                            <TableCell>{order.customer_name}</TableCell>
                            <TableCell>{order.grand_total?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                            <TableCell>
                              {!projectStatus && <Badge variant="outline">Venda</Badge>}
                              {projectStatus?.stage === "pre_projeto" && <Badge className="bg-purple-500">Pré-Projeto</Badge>}
                              {projectStatus?.stage === "backlog_tecnico" && <Badge className="bg-yellow-500">Backlog Técnico</Badge>}
                              {projectStatus?.stage === "planejamento" && <Badge className="bg-orange-500">Planejamento</Badge>}
                              {projectStatus?.stage === "em_execucao" && <Badge className="bg-green-500">Em Execução</Badge>}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: `${order.per_delivered || 0}%` }} />
                                </div>
                                <span className="text-xs">{order.per_delivered || 0}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => { setSelectedOrder(order); setShowProjectDialog(true); }}
                                data-testid={`btn-manage-project-${order.name}`}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {salesOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Nenhum pedido encontrado. Sincronize com o Arcádia SOE.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Catálogo de Serviços - Engenharia Ambiental</h2>
              <Button data-testid="btn-new-service" onClick={openNewService}>
                <Plus className="h-4 w-4 mr-2" /> Novo Serviço
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{service.category}</Badge>
                      {service.basePrice && (
                        <span className="text-lg font-bold text-green-600">
                          {Number(service.basePrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {service.items && service.items.length > 0 && (
                      <>
                        <p className="text-xs text-muted-foreground mb-2">Itens inclusos:</p>
                        <ul className="text-xs space-y-1">
                          {service.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    <div className="flex gap-2 mt-4">
                      {service.id > 0 && (
                        <Button variant="outline" size="sm" onClick={() => openEditService(service)}>
                          <Edit className="h-3 w-3 mr-1" /> Editar
                        </Button>
                      )}
                      <Button size="sm" onClick={() => { setSelectedService(service); setShowProposalDialog(true); }}>
                        Criar Proposta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pipeline de Vendas</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-t-4 border-t-gray-400">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Prospecção</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">R$ 0,00</p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-blue-400">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Proposta Enviada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{proposals.filter((p: any) => p.status === "enviada").length}</div>
                  <p className="text-xs text-muted-foreground">Em negociação</p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-yellow-400">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Em Execução</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {salesOrders.filter(o => o.status !== "Completed").reduce((s, o) => s + o.grand_total, 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-green-400">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Concluído</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {salesOrders.filter(o => o.status === "Completed").reduce((s, o) => s + o.grand_total, 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Fluxo: Proposta → Projeto</CardTitle>
                <CardDescription>Workflow de conversão comercial para Engenharia Ambiental</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <span className="text-sm mt-2">Proposta</span>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Send className="h-8 w-8 text-yellow-600" />
                    </div>
                    <span className="text-sm mt-2">Negociação</span>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-purple-600" />
                    </div>
                    <span className="text-sm mt-2">Aprovação</span>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                      <DollarSign className="h-8 w-8 text-orange-600" />
                    </div>
                    <span className="text-sm mt-2">Pedido</span>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <Rocket className="h-8 w-8 text-green-600" />
                    </div>
                    <span className="text-sm mt-2">Projeto</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showProposalDialog} onOpenChange={setShowProposalDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Proposta Comercial</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createProposalMutation.mutate({
                title: formData.get("title") as string,
                opportunityId: null,
                status: "rascunho",
                validUntil: formData.get("validUntil") as string,
                totalValue: selectedService?.basePrice || Number(formData.get("totalValue")) || 0,
                notes: formData.get("notes") as string,
              });
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Cliente</Label>
                    <Select name="customer" defaultValue={selectedCustomer}>
                      <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                      <SelectContent>
                        {erpCustomers.map((c) => (
                          <SelectItem key={c.name} value={c.name}>{c.customer_name || c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Serviço</Label>
                    <Select name="service" defaultValue={selectedService?.id?.toString()} onValueChange={(v) => {
                      const t = allServices.find(s => s.id.toString() === v);
                      setSelectedService(t || null);
                    }}>
                      <SelectTrigger><SelectValue placeholder="Selecione o serviço" /></SelectTrigger>
                      <SelectContent>
                        {allServices.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título da Proposta *</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Ex: Monitoramento Semestral - Cliente X" 
                    defaultValue={selectedService ? `${selectedService.name} - ${selectedCustomer}` : ""}
                    required 
                  />
                </div>

                {selectedService && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{selectedService.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{selectedService.description}</p>
                      {selectedService.items && selectedService.items.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedService.items.map((item, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                          ))}
                        </div>
                      )}
                      {selectedService.basePrice && (
                        <p className="mt-3 text-lg font-bold text-green-600">
                          Valor base: {Number(selectedService.basePrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalValue">Valor Total (R$)</Label>
                    <Input 
                      id="totalValue" 
                      name="totalValue" 
                      type="number" 
                      defaultValue={selectedService?.basePrice || ""} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Válida até</Label>
                    <Input id="validUntil" name="validUntil" type="date" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" name="notes" placeholder="Condições especiais, escopo adicional..." />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowProposalDialog(false)}>Cancelar</Button>
                <Button type="submit" disabled={createProposalMutation.isPending}>
                  {createProposalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Criar Proposta
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveService}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código</Label>
                    <Input id="code" name="code" placeholder="Ex: MON-001" defaultValue={editingService?.code || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select name="category" defaultValue={editingService?.category || "Monitoramento"}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Serviço *</Label>
                  <Input id="name" name="name" placeholder="Ex: Monitoramento de Águas Subterrâneas" defaultValue={editingService?.name || ""} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" name="description" placeholder="Descrição do serviço..." defaultValue={editingService?.description || ""} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Valor Base (R$)</Label>
                    <Input id="basePrice" name="basePrice" type="number" step="0.01" defaultValue={editingService?.basePrice || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidade</Label>
                    <Input id="unit" name="unit" placeholder="Ex: campanha" defaultValue={editingService?.unit || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDuration">Duração (dias)</Label>
                    <Input id="estimatedDuration" name="estimatedDuration" type="number" defaultValue={editingService?.estimatedDuration || ""} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="items">Itens Inclusos (um por linha)</Label>
                  <Textarea 
                    id="items" 
                    value={newItems}
                    onChange={(e) => setNewItems(e.target.value)}
                    placeholder={"Mobilização de equipe\nColeta de amostras\nAnálises laboratoriais\nRelatório técnico"}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowServiceDialog(false)}>Cancelar</Button>
                <Button type="submit" disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
                  {(createServiceMutation.isPending || updateServiceMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingService ? "Salvar" : "Criar Serviço"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Gerenciar Projeto - {selectedOrder?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <span className="text-sm text-muted-foreground">Cliente</span>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Valor Total</span>
                    <p className="font-medium text-green-600">{selectedOrder.grand_total?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fluxo do Projeto</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {["venda", "pre_projeto", "backlog_tecnico", "planejamento", "em_execucao"].map((stage, idx) => {
                      const currentStage = projectStatuses[selectedOrder.name]?.stage || "venda";
                      const stages = ["venda", "pre_projeto", "backlog_tecnico", "planejamento", "em_execucao"];
                      const currentIdx = stages.indexOf(currentStage);
                      const isActive = idx <= currentIdx;
                      const labels: Record<string, string> = {
                        venda: "Venda",
                        pre_projeto: "Pré-Projeto",
                        backlog_tecnico: "Backlog Técnico",
                        planejamento: "Planejamento",
                        em_execucao: "Em Execução"
                      };
                      return (
                        <div key={stage} className="flex items-center">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {labels[stage]}
                          </div>
                          {idx < 4 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-1" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Avançar para</Label>
                    <Select 
                      value={projectStatuses[selectedOrder.name]?.stage || "venda"}
                      onValueChange={(value) => {
                        setProjectStatuses({
                          ...projectStatuses,
                          [selectedOrder.name]: {
                            ...projectStatuses[selectedOrder.name],
                            orderId: selectedOrder.name,
                            stage: value as any
                          }
                        });
                      }}
                    >
                      <SelectTrigger data-testid="select-project-stage">
                        <SelectValue placeholder="Selecione a etapa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="venda">Venda (aguardando aprovação)</SelectItem>
                        <SelectItem value="pre_projeto">Pré-Projeto (aprovado, aguardando backlog)</SelectItem>
                        <SelectItem value="backlog_tecnico">Backlog Técnico (área técnica)</SelectItem>
                        <SelectItem value="planejamento">Planejamento (definindo execução)</SelectItem>
                        <SelectItem value="em_execucao">Em Execução</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(projectStatuses[selectedOrder.name]?.stage === "backlog_tecnico" || 
                    projectStatuses[selectedOrder.name]?.stage === "planejamento" ||
                    projectStatuses[selectedOrder.name]?.stage === "em_execucao") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="technicalTeam">Equipe Técnica Responsável</Label>
                        <Select name="technicalTeam">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar equipe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alfa">Equipe Alfa</SelectItem>
                            <SelectItem value="beta">Equipe Beta</SelectItem>
                            <SelectItem value="gamma">Equipe Gamma</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="responsiblePerson">Responsável Técnico</Label>
                        <Select name="responsiblePerson">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maria">Maria Santos - Eng. Ambiental</SelectItem>
                            <SelectItem value="carlos">Carlos Oliveira - Geólogo</SelectItem>
                            <SelectItem value="fernanda">Fernanda Souza - Hidrogeóloga</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {(projectStatuses[selectedOrder.name]?.stage === "planejamento" ||
                    projectStatuses[selectedOrder.name]?.stage === "em_execucao") && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="plannedStart">Data Início Planejada</Label>
                        <Input id="plannedStart" name="plannedStart" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="plannedEnd">Data Fim Planejada</Label>
                        <Input id="plannedEnd" name="plannedEnd" type="date" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="projectNotes">Observações</Label>
                    <Textarea id="projectNotes" name="projectNotes" placeholder="Notas sobre o projeto..." rows={2} />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowProjectDialog(false)}>Fechar</Button>
                  <Button onClick={() => {
                    toast({ title: "Projeto atualizado", description: `${selectedOrder.name} movido para ${projectStatuses[selectedOrder.name]?.stage || "venda"}` });
                    setShowProjectDialog(false);
                  }} data-testid="btn-save-project">
                    Salvar Alterações
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </BrowserFrame>
  );
}

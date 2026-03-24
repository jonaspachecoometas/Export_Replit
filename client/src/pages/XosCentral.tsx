import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { BrowserFrame } from "@/components/Browser/BrowserFrame";
import { 
  Users, Building2, TrendingUp, MessageSquare, Ticket, Zap, LayoutGrid, 
  ChevronRight, PlusCircle, Filter, Search, Bell, Calendar, Target,
  BarChart3, DollarSign, Clock, AlertCircle, Phone, Mail, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface XosStats {
  total_contacts: number;
  total_leads: number;
  total_customers: number;
  total_companies: number;
  open_deals: number;
  won_deals: number;
  pipeline_value: number;
  won_value: number;
  open_conversations: number;
  open_tickets: number;
  overdue_activities: number;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  type: string;
  lead_status: string;
  source: string;
  created_at: string;
}

interface Deal {
  id: number;
  title: string;
  value: number;
  status: string;
  stage_name: string;
  stage_color: string;
  contact_name: string;
  company_name: string;
  created_at: string;
}

interface Activity {
  id: number;
  type: string;
  title: string;
  status: string;
  priority: string;
  due_at: string;
  contact_name: string;
  deal_title: string;
}

export default function XosCentral() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", phone: "", company: "", position: "" });
  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: "task", title: "", description: "", due_at: "", priority: "normal" });
  const [isNewSelectorOpen, setIsNewSelectorOpen] = useState(false);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({ title: "", pipeline_id: "1", stage_id: "1", value: "" });
  const queryClient = useQueryClient();

  const createContactMutation = useMutation({
    mutationFn: async (data: typeof newContact) => {
      const res = await fetch("/api/xos/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao criar contato");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/xos/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/xos/stats"] });
      setIsNewContactOpen(false);
      setNewContact({ name: "", email: "", phone: "", company: "", position: "" });
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: typeof newDeal) => {
      const res = await fetch("/api/xos/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao criar negócio");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/xos/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/xos/stats"] });
      setIsNewDealOpen(false);
      setNewDeal({ title: "", pipeline_id: "1", stage_id: "1", value: "" });
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: typeof newActivity) => {
      const res = await fetch("/api/xos/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erro ao criar atividade");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/xos/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/xos/stats"] });
      setIsNewActivityOpen(false);
      setNewActivity({ type: "task", title: "", description: "", due_at: "", priority: "normal" });
    },
  });

  const { data: stats } = useQuery<XosStats>({
    queryKey: ["/api/xos/stats"],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/xos/contacts"],
  });

  const { data: deals = [] } = useQuery<Deal[]>({
    queryKey: ["/api/xos/deals"],
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/xos/activities"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const modules = [
    { id: "crm", name: "CRM", icon: Users, href: "/xos/crm", color: "bg-blue-100 text-blue-600", description: "Gestão de leads e clientes" },
    { id: "inbox", name: "Inbox", icon: MessageSquare, href: "/xos/inbox", color: "bg-green-100 text-green-600", description: "Central de atendimento" },
    { id: "tickets", name: "Tickets", icon: Ticket, href: "/xos/tickets", color: "bg-orange-100 text-orange-600", description: "Suporte e chamados" },
    { id: "automations", name: "Automações", icon: Zap, href: "/xos/automations", color: "bg-violet-100 text-violet-600", description: "Workflows automáticos" },
    { id: "campaigns", name: "Campanhas", icon: Target, href: "/xos/campaigns", color: "bg-pink-100 text-pink-600", description: "Marketing automation" },
    { id: "sites", name: "Sites", icon: LayoutGrid, href: "/xos/sites", color: "bg-cyan-100 text-cyan-600", description: "Site builder" },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-indigo-100 text-indigo-800",
      qualified: "bg-violet-100 text-violet-800",
      proposal: "bg-purple-100 text-purple-800",
      won: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStageColor = (color: string | null) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      purple: "bg-purple-500",
      indigo: "bg-indigo-500",
      pink: "bg-pink-500",
      orange: "bg-orange-500",
      cyan: "bg-cyan-500",
      emerald: "bg-emerald-500",
      violet: "bg-violet-500",
      slate: "bg-slate-500",
    };
    return colorMap[color || 'slate'] || "bg-slate-500";
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      call: Phone,
      email: Mail,
      meeting: Calendar,
      task: Target,
    };
    return icons[type] || Calendar;
  };

  return (
    <BrowserFrame>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl shadow-lg">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  XOS
                </h1>
                <p className="text-xs text-slate-500">Experience Operating System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar contatos, deals, tickets..." 
                  className="w-80 pl-10 bg-white/80"
                  data-testid="input-search"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
                {stats && stats.overdue_activities > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {stats.overdue_activities}
                  </span>
                )}
              </Button>
              <Button data-testid="button-new-contact" onClick={() => setIsNewSelectorOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Novo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="contacts" data-testid="tab-contacts">Contatos</TabsTrigger>
            <TabsTrigger value="deals" data-testid="tab-deals">Negócios</TabsTrigger>
            <TabsTrigger value="activities" data-testid="tab-activities">Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white" data-testid="card-contacts">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Contatos</p>
                      <p className="text-3xl font-bold">{stats?.total_contacts || 0}</p>
                    </div>
                    <Users className="h-10 w-10 text-blue-200" />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-blue-100">{stats?.total_leads || 0} leads</span>
                    <span>•</span>
                    <span className="text-blue-100">{stats?.total_customers || 0} clientes</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white" data-testid="card-pipeline">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">Pipeline</p>
                      <p className="text-3xl font-bold">{formatCurrency(Number(stats?.pipeline_value) || 0)}</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-emerald-200" />
                  </div>
                  <div className="mt-2 text-sm text-emerald-100">
                    {stats?.open_deals || 0} negócios abertos
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white" data-testid="card-conversations">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-violet-100 text-sm">Conversas</p>
                      <p className="text-3xl font-bold">{stats?.open_conversations || 0}</p>
                    </div>
                    <MessageSquare className="h-10 w-10 text-violet-200" />
                  </div>
                  <div className="mt-2 text-sm text-violet-100">
                    atendimentos em aberto
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white" data-testid="card-tickets">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Tickets</p>
                      <p className="text-3xl font-bold">{stats?.open_tickets || 0}</p>
                    </div>
                    <Ticket className="h-10 w-10 text-orange-200" />
                  </div>
                  <div className="mt-2 text-sm text-orange-100">
                    chamados pendentes
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Modules Grid */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Módulos XOS</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {modules.map((mod) => (
                  <Link key={mod.id} href={mod.href}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer group" data-testid={`card-module-${mod.id}`}>
                      <CardContent className="p-4 text-center">
                        <div className={`mx-auto w-12 h-12 rounded-xl ${mod.color.split(' ')[0]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <mod.icon className={`h-6 w-6 ${mod.color.split(' ')[1]}`} />
                        </div>
                        <p className="font-medium text-slate-800">{mod.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{mod.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Contacts */}
              <Card data-testid="card-recent-contacts">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Contatos Recentes</CardTitle>
                    <Link href="/xos/crm">
                      <Button variant="ghost" size="sm">
                        Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contacts.slice(0, 5).map((contact) => (
                      <div key={contact.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors" data-testid={`row-contact-${contact.id}`}>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                            {contact.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{contact.name}</p>
                          <p className="text-sm text-slate-500 truncate">{contact.company} • {contact.position}</p>
                        </div>
                        <Badge className={getStatusColor(contact.lead_status)}>{contact.lead_status}</Badge>
                      </div>
                    ))}
                    {contacts.length === 0 && (
                      <p className="text-center text-slate-500 py-4">Nenhum contato ainda</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Deals */}
              <Card data-testid="card-recent-deals">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Negócios Recentes</CardTitle>
                    <Link href="/xos/crm">
                      <Button variant="ghost" size="sm">
                        Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {deals.slice(0, 5).map((deal) => (
                      <div key={deal.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors" data-testid={`row-deal-${deal.id}`}>
                        <div className={`w-2 h-10 rounded-full ${getStageColor(deal.stage_color)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{deal.title}</p>
                          <p className="text-sm text-slate-500 truncate">{deal.contact_name || deal.company_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600">{formatCurrency(deal.value)}</p>
                          <p className="text-xs text-slate-500">{deal.stage_name}</p>
                        </div>
                      </div>
                    ))}
                    {deals.length === 0 && (
                      <p className="text-center text-slate-500 py-4">Nenhum negócio ainda</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activities */}
            <Card data-testid="card-activities">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Atividades Pendentes</CardTitle>
                  <Button variant="ghost" size="sm">
                    Ver todas <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activities.slice(0, 6).map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg" data-testid={`row-activity-${activity.id}`}>
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Icon className="h-4 w-4 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{activity.title}</p>
                          <p className="text-xs text-slate-500">{activity.contact_name}</p>
                          {activity.due_at && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              {new Date(activity.due_at).toLocaleDateString("pt-BR")}
                            </div>
                          )}
                        </div>
                        <Badge variant={activity.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                          {activity.priority}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                {activities.length === 0 && (
                  <p className="text-center text-slate-500 py-4">Nenhuma atividade pendente</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Todos os Contatos</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                    <Button size="sm" onClick={() => setIsNewContactOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Novo Contato
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg border transition-colors" data-testid={`row-contact-full-${contact.id}`}>
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-lg">
                          {contact.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{contact.name}</p>
                        <p className="text-sm text-slate-500">{contact.company} • {contact.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">{contact.email}</p>
                        <p className="text-sm text-slate-500">{contact.phone}</p>
                      </div>
                      <Badge className={getStatusColor(contact.lead_status)}>{contact.lead_status}</Badge>
                      <Badge variant="outline">{contact.source}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deals">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pipeline de Vendas</CardTitle>
                  <Link href="/xos/crm">
                    <Button>
                      Abrir Pipeline <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>Visualize e gerencie todos os seus negócios no modo Kanban</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deals.map((deal) => (
                    <div key={deal.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg border transition-colors" data-testid={`row-deal-full-${deal.id}`}>
                      <div className={`w-2 h-12 rounded-full ${getStageColor(deal.stage_color)}`} />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{deal.title}</p>
                        <p className="text-sm text-slate-500">{deal.contact_name} • {deal.company_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-emerald-600">{formatCurrency(deal.value)}</p>
                        <p className="text-sm text-slate-500">{deal.stage_name}</p>
                      </div>
                      <Badge className={getStatusColor(deal.status)}>{deal.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Atividades</CardTitle>
                  <Button size="sm" onClick={() => setIsNewActivityOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nova Atividade
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg border transition-colors" data-testid={`row-activity-full-${activity.id}`}>
                        <div className="p-3 bg-slate-100 rounded-lg">
                          <Icon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{activity.title}</p>
                          <p className="text-sm text-slate-500">{activity.contact_name} {activity.deal_title && `• ${activity.deal_title}`}</p>
                        </div>
                        {activity.due_at && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar className="h-4 w-4" />
                            {new Date(activity.due_at).toLocaleDateString("pt-BR")}
                          </div>
                        )}
                        <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                        <Badge variant={activity.priority === "high" ? "destructive" : "secondary"}>
                          {activity.priority}
                        </Badge>
                      </div>
                    );
                  })}
                  {activities.length === 0 && (
                    <p className="text-center text-slate-500 py-8">Nenhuma atividade cadastrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>

    {/* Seletor: o que deseja criar? */}
    <Dialog open={isNewSelectorOpen} onOpenChange={setIsNewSelectorOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>O que deseja criar?</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 pt-2">
          <button
            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
            onClick={() => { setIsNewSelectorOpen(false); setIsNewContactOpen(true); }}
          >
            <div className="bg-blue-100 p-2 rounded-lg"><Users className="h-5 w-5 text-blue-600" /></div>
            <div><p className="font-semibold text-slate-800">Contato</p><p className="text-sm text-slate-500">Adicionar lead ou cliente</p></div>
          </button>
          <button
            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-emerald-50 hover:border-emerald-300 transition-colors text-left"
            onClick={() => { setIsNewSelectorOpen(false); setIsNewDealOpen(true); }}
          >
            <div className="bg-emerald-100 p-2 rounded-lg"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="font-semibold text-slate-800">Negócio</p><p className="text-sm text-slate-500">Criar oportunidade de venda</p></div>
          </button>
          <button
            className="flex items-center gap-4 p-4 rounded-lg border hover:bg-violet-50 hover:border-violet-300 transition-colors text-left"
            onClick={() => { setIsNewSelectorOpen(false); setIsNewActivityOpen(true); }}
          >
            <div className="bg-violet-100 p-2 rounded-lg"><Calendar className="h-5 w-5 text-violet-600" /></div>
            <div><p className="font-semibold text-slate-800">Atividade</p><p className="text-sm text-slate-500">Agendar tarefa ou reunião</p></div>
          </button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Dialog Novo Negócio */}
    <Dialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Negócio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Título *</Label>
            <Input placeholder="Ex: Proposta comercial Empresa X" value={newDeal.title} onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })} />
          </div>
          <div>
            <Label>Estágio</Label>
            <select className="w-full mt-1 border rounded-md px-3 py-2 text-sm" value={newDeal.stage_id} onChange={(e) => setNewDeal({ ...newDeal, stage_id: e.target.value })}>
              <option value="1">Prospecção</option>
              <option value="2">Qualificação</option>
              <option value="3">Proposta</option>
              <option value="4">Negociação</option>
              <option value="5">Ganho</option>
              <option value="6">Perdido</option>
            </select>
          </div>
          <div>
            <Label>Valor (R$)</Label>
            <Input type="number" placeholder="0,00" value={newDeal.value} onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsNewDealOpen(false)}>Cancelar</Button>
            <Button
              className="flex-1"
              onClick={() => createDealMutation.mutate(newDeal)}
              disabled={!newDeal.title || createDealMutation.isPending}
            >
              {createDealMutation.isPending ? "Salvando..." : "Salvar Negócio"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={isNewContactOpen} onOpenChange={setIsNewContactOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Contato</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Nome *</Label>
            <Input placeholder="Nome completo" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input placeholder="email@empresa.com" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
          </div>
          <div>
            <Label>Telefone / WhatsApp</Label>
            <Input placeholder="(11) 99999-9999" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
          </div>
          <div>
            <Label>Empresa</Label>
            <Input placeholder="Nome da empresa" value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} />
          </div>
          <div>
            <Label>Cargo</Label>
            <Input placeholder="Cargo ou função" value={newContact.position} onChange={(e) => setNewContact({ ...newContact, position: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsNewContactOpen(false)}>Cancelar</Button>
            <Button
              className="flex-1"
              onClick={() => createContactMutation.mutate(newContact)}
              disabled={!newContact.name || createContactMutation.isPending}
            >
              {createContactMutation.isPending ? "Salvando..." : "Salvar Contato"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog open={isNewActivityOpen} onOpenChange={setIsNewActivityOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Atividade</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Tipo</Label>
            <select
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
              value={newActivity.type}
              onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
            >
              <option value="task">Tarefa</option>
              <option value="call">Ligação</option>
              <option value="email">E-mail</option>
              <option value="meeting">Reunião</option>
            </select>
          </div>
          <div>
            <Label>Título *</Label>
            <Input placeholder="Descreva a atividade" value={newActivity.title} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Input placeholder="Detalhes adicionais" value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} />
          </div>
          <div>
            <Label>Data prevista</Label>
            <Input type="datetime-local" value={newActivity.due_at} onChange={(e) => setNewActivity({ ...newActivity, due_at: e.target.value })} />
          </div>
          <div>
            <Label>Prioridade</Label>
            <select
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
              value={newActivity.priority}
              onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value })}
            >
              <option value="low">Baixa</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsNewActivityOpen(false)}>Cancelar</Button>
            <Button
              className="flex-1"
              onClick={() => createActivityMutation.mutate(newActivity)}
              disabled={!newActivity.title || createActivityMutation.isPending}
            >
              {createActivityMutation.isPending ? "Salvando..." : "Salvar Atividade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </BrowserFrame>
  );
}

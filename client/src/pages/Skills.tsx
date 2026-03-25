import { BrowserFrame } from "@/components/Browser/BrowserFrame";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Play,
  Trash2,
  Pencil,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Zap,
  Code2,
  ListChecks,
  ChevronRight,
  History,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  namespace: string;
  status: string;
  triggerType: string | null;
  body: string | null;
  parametersSchema: Record<string, unknown> | null;
  tags: string[] | null;
  extends: string[] | null;
  createdAt: string;
  updatedAt: string;
}

interface SkillExecution {
  id: string;
  skillId: string;
  status: string;
  triggeredBy: string;
  inputParams: Record<string, unknown> | null;
  outputResult: Record<string, unknown> | null;
  errorMessage: string | null;
  durationMs: number | null;
  startedAt: string;
  completedAt: string | null;
}

const EMPTY_SKILL = {
  name: "",
  slug: "",
  description: "",
  namespace: "tenant",
  status: "draft",
  triggerType: "manual",
  body: "# Skill\n\nDescreva o comportamento desta skill aqui.\n\n## Entradas\n\n/var/input\n\n## Processamento\n\n...\n\n## Saída\n\n...",
  parametersSchema: "{}",
  tags: "",
  extends: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    archived: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return map[status] ?? map.draft;
}

function execStatusIcon(status: string) {
  if (status === "success") return <CheckCircle className="w-4 h-4 text-green-400" />;
  if (status === "error") return <XCircle className="w-4 h-4 text-red-400" />;
  return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Skills() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [nsFilter, setNsFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editOpen, setEditOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [form, setForm] = useState(EMPTY_SKILL);

  const [execOpen, setExecOpen] = useState(false);
  const [execSkill, setExecSkill] = useState<Skill | null>(null);
  const [execParams, setExecParams] = useState("{}");
  const [execResult, setExecResult] = useState<SkillExecution | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySkill, setHistorySkill] = useState<Skill | null>(null);

  // Ref para skills — usado no completion provider sem closure stale
  const skillsRef = useRef<Skill[]>([]);
  const completionDisposable = useRef<{ dispose(): void } | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: skillsData, isLoading } = useQuery<{ skills: Skill[] }>({
    queryKey: ["/api/skills", search, nsFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (nsFilter !== "all") params.set("namespace", nsFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/skills?${params}`);
      return res.json();
    },
  });

  const { data: historyData } = useQuery<{ executions: SkillExecution[] }>({
    queryKey: ["/api/skills", historySkill?.id, "executions"],
    queryFn: async () => {
      const res = await fetch(`/api/skills/${historySkill!.id}/executions?limit=20`);
      return res.json();
    },
    enabled: !!historySkill && historyOpen,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      let paramsSchema: Record<string, unknown> = {};
      try { paramsSchema = JSON.parse(data.parametersSchema); } catch {}

      const payload = {
        name: data.name,
        slug: data.slug || toSlug(data.name),
        description: data.description || null,
        namespace: data.namespace,
        status: data.status,
        triggerType: data.triggerType,
        body: data.body,
        parametersSchema: paramsSchema,
        tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        extends: data.extends ? data.extends.split(",").map(t => t.trim()).filter(Boolean) : [],
      };

      const url = editingSkill ? `/api/skills/${editingSkill.id}` : "/api/skills";
      const method = editingSkill ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/skills"] });
      setEditOpen(false);
      toast({ title: editingSkill ? "Skill atualizada" : "Skill criada" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({ title: "Skill removida" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const executeMutation = useMutation({
    mutationFn: async ({ skillId, params }: { skillId: string; params: string }) => {
      let inputParams: Record<string, unknown> = {};
      try { inputParams = JSON.parse(params); } catch {}
      const res = await fetch(`/api/skills/${skillId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputParams, triggeredBy: "manual" }),
      });
      return res.json() as Promise<SkillExecution>;
    },
    onSuccess: (data) => {
      setExecResult(data);
      qc.invalidateQueries({ queryKey: ["/api/skills"] });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  function openNew() {
    setEditingSkill(null);
    setForm(EMPTY_SKILL);
    setEditOpen(true);
  }

  function openEdit(skill: Skill) {
    setEditingSkill(skill);
    setForm({
      name: skill.name,
      slug: skill.slug,
      description: skill.description ?? "",
      namespace: skill.namespace,
      status: skill.status,
      triggerType: skill.triggerType ?? "manual",
      body: skill.body ?? "",
      parametersSchema: JSON.stringify(skill.parametersSchema ?? {}, null, 2),
      tags: (skill.tags ?? []).join(", "),
      extends: (skill.extends ?? []).join(", "),
    });
    setEditOpen(true);
  }

  function openExec(skill: Skill) {
    setExecSkill(skill);
    setExecParams("{}");
    setExecResult(null);
    setExecOpen(true);
  }

  function openHistory(skill: Skill) {
    setHistorySkill(skill);
    setHistoryOpen(true);
  }

  const skills = skillsData?.skills ?? [];

  // Mantém ref atualizado para o completion provider
  useEffect(() => { skillsRef.current = skills; }, [skills]);

  // Cleanup do completion provider ao desmontar
  useEffect(() => () => { completionDisposable.current?.dispose(); }, []);

  // Handler do Monaco Body — registra completion provider de referências /
  function handleBodyEditorMount(editor: unknown, monaco: any) {
    completionDisposable.current?.dispose();

    const PREFIXES = [
      { label: "/skill/",         detail: "Skill do tenant atual" },
      { label: "/skill:system/",  detail: "Skill global do sistema" },
      { label: "/skill:company/", detail: "Skill da empresa" },
      { label: "/var/",           detail: "Variável de contexto ou parâmetro de entrada" },
      { label: "/data/",          detail: "Dado dinâmico do banco" },
      { label: "/kg/",            detail: "Nó do Knowledge Graph (Neo4j)" },
      { label: "/file/",          detail: "Arquivo no storage" },
      { label: "/tool/",          detail: "Tool disponível no Manus" },
      { label: "/agent/",         detail: "Agente especialista" },
    ];

    completionDisposable.current = monaco.languages.registerCompletionItemProvider("markdown", {
      triggerCharacters: ["/"],
      provideCompletionItems(model: any, position: any) {
        const line = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const match = line.match(/\/([\w:\/\-.]*)$/);
        if (!match) return { suggestions: [] };

        const typed = match[1];
        const startCol = position.column - typed.length - 1;
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: startCol,
          endColumn: position.column,
        };

        const CIK = monaco.languages.CompletionItemKind;

        // Sugestões de prefixos
        const prefixSuggestions = PREFIXES.map(p => ({
          label: p.label,
          kind: CIK.Reference,
          detail: p.detail,
          insertText: p.label,
          sortText: "0_" + p.label,
          range,
        }));

        // Sugestões de skills existentes quando digita /skill/...
        const skillSuggestions: any[] = [];
        if (typed.startsWith("skill/") || typed.startsWith("skill:")) {
          const afterSkill = typed.replace(/^skill(:[^/]+)?\//, "");
          skillsRef.current.forEach(s => {
            const ref = `/skill/${s.namespace}/${s.slug}`;
            if (!afterSkill || s.slug.includes(afterSkill) || s.name.toLowerCase().includes(afterSkill)) {
              skillSuggestions.push({
                label: ref,
                kind: CIK.Variable,
                detail: s.description ?? s.name,
                documentation: `namespace: ${s.namespace} | status: ${s.status}`,
                insertText: ref,
                sortText: "1_" + ref,
                range,
              });
            }
          });
        }

        return { suggestions: [...prefixSuggestions, ...skillSuggestions] };
      },
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <BrowserFrame title="Skills" icon="⚡">
      <div className="flex flex-col h-full bg-[#0a0f1a] text-white">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h1 className="text-lg font-semibold">Skills</h1>
            <p className="text-xs text-muted-foreground">Objetos reutilizáveis — herança, composição, polimorfismo</p>
          </div>
          <Button size="sm" onClick={openNew} className="bg-[#c89b3c] hover:bg-[#d4a94a] text-black">
            <Plus className="w-4 h-4 mr-1" /> Nova Skill
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-3 border-b border-white/10">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm bg-white/5 border-white/10"
            />
          </div>
          <Select value={nsFilter} onValueChange={setNsFilter}>
            <SelectTrigger className="w-32 h-8 text-xs bg-white/5 border-white/10">
              <SelectValue placeholder="Namespace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="tenant">Tenant</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28 h-8 text-xs bg-white/5 border-white/10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-[#c89b3c]" />
            </div>
          ) : skills.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
              <Zap className="w-8 h-8 opacity-30" />
              <p className="text-sm">Nenhuma skill encontrada</p>
              <Button size="sm" variant="outline" onClick={openNew}>Criar primeira skill</Button>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {skills.map(skill => (
                <Card key={skill.id} className="bg-white/5 border-white/10 hover:bg-white/8 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">{skill.name}</span>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusBadge(skill.status)}`}>
                            {skill.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-white/20 text-white/50">
                            {skill.namespace}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">/skill/{skill.namespace}/{skill.slug}</p>
                        {skill.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{skill.description}</p>
                        )}
                        {skill.tags && skill.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {skill.tags.map(tag => (
                              <span key={tag} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-green-500/20 hover:text-green-400"
                          onClick={() => openExec(skill)}
                          title="Executar"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-blue-500/20 hover:text-blue-400"
                          onClick={() => openHistory(skill)}
                          title="Histórico"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-white/10"
                          onClick={() => openEdit(skill)}
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-red-500/20 hover:text-red-400"
                          onClick={() => deleteMutation.mutate(skill.id)}
                          title="Deletar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ── Edit / Create Dialog ────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col bg-[#0f1729] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{editingSkill ? "Editar Skill" : "Nova Skill"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="form" className="flex-1 flex flex-col min-h-0">
            <TabsList className="bg-white/5 border border-white/10 w-fit">
              <TabsTrigger value="form" className="text-xs gap-1">
                <ListChecks className="w-3.5 h-3.5" /> Geral
              </TabsTrigger>
              <TabsTrigger value="body" className="text-xs gap-1">
                <Code2 className="w-3.5 h-3.5" /> Body
              </TabsTrigger>
              <TabsTrigger value="params" className="text-xs gap-1">
                <ChevronRight className="w-3.5 h-3.5" /> Parâmetros
              </TabsTrigger>
            </TabsList>

            {/* Tab: Geral */}
            <TabsContent value="form" className="flex-1 overflow-auto mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome *</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))}
                    placeholder="Relatório de Vendas"
                    className="bg-white/5 border-white/10 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="relatorio_vendas"
                    className="bg-white/5 border-white/10 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Descrição</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="bg-white/5 border-white/10 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Namespace</Label>
                  <Select value={form.namespace} onValueChange={v => setForm(f => ({ ...f, namespace: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">system</SelectItem>
                      <SelectItem value="tenant">tenant</SelectItem>
                      <SelectItem value="company">company</SelectItem>
                      <SelectItem value="user">user</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">draft</SelectItem>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="archived">archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Trigger</Label>
                  <Select value={form.triggerType} onValueChange={v => setForm(f => ({ ...f, triggerType: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">manual</SelectItem>
                      <SelectItem value="schedule">schedule</SelectItem>
                      <SelectItem value="event">event</SelectItem>
                      <SelectItem value="webhook">webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tags (separadas por vírgula)</Label>
                <Input
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="financeiro, relatório, automático"
                  className="bg-white/5 border-white/10 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Herança — extends (slugs separados por vírgula)</Label>
                <Input
                  value={form.extends}
                  onChange={e => setForm(f => ({ ...f, extends: e.target.value }))}
                  placeholder="/skill/system/base_report, /skill/tenant/financeiro"
                  className="bg-white/5 border-white/10 text-sm font-mono"
                />
              </div>
            </TabsContent>

            {/* Tab: Body (Monaco) */}
            <TabsContent value="body" className="flex-1 min-h-0 mt-3">
              <div className="h-full rounded border border-white/10 overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="markdown"
                  value={form.body}
                  onChange={v => setForm(f => ({ ...f, body: v ?? "" }))}
                  onMount={handleBodyEditorMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    wordWrap: "on",
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    padding: { top: 8 },
                    quickSuggestions: { other: true, comments: true, strings: true },
                    suggestOnTriggerCharacters: true,
                  }}
                />
              </div>
            </TabsContent>

            {/* Tab: Params (JSON Schema) */}
            <TabsContent value="params" className="flex-1 min-h-0 mt-3">
              <div className="space-y-2 h-full flex flex-col">
                <p className="text-xs text-muted-foreground">
                  JSON Schema dos parâmetros de entrada. Referenciáveis no body como <code className="bg-white/10 px-1 rounded">/var/nome_param</code>.
                </p>
                <div className="flex-1 rounded border border-white/10 overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={form.parametersSchema}
                    onChange={v => setForm(f => ({ ...f, parametersSchema: v ?? "{}" }))}
                    theme="vs-dark"
                    options={{
                      fontSize: 13,
                      minimap: { enabled: false },
                      formatOnType: true,
                      scrollBeyondLastLine: false,
                      padding: { top: 8 },
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10 mt-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending || !form.name}
              className="bg-[#c89b3c] hover:bg-[#d4a94a] text-black"
            >
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {editingSkill ? "Salvar" : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Execute Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={execOpen} onOpenChange={setExecOpen}>
        <DialogContent className="max-w-lg bg-[#0f1729] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-4 h-4 text-green-400" />
              Executar: {execSkill?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Parâmetros de entrada (JSON)</Label>
              <div className="rounded border border-white/10 overflow-hidden h-32">
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  value={execParams}
                  onChange={v => setExecParams(v ?? "{}")}
                  theme="vs-dark"
                  options={{ fontSize: 12, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 4 } }}
                />
              </div>
            </div>

            {execResult && (
              <div className="rounded border border-white/10 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {execStatusIcon(execResult.status)}
                  {execResult.status === "success" ? "Executado com sucesso" : "Erro na execução"}
                  {execResult.durationMs && (
                    <span className="text-xs text-muted-foreground ml-auto">{execResult.durationMs}ms</span>
                  )}
                </div>
                {execResult.status === "error" && execResult.errorMessage && (
                  <p className="text-xs text-red-400 font-mono">{execResult.errorMessage}</p>
                )}
                {execResult.outputResult && (
                  <ScrollArea className="h-40">
                    <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">
                      {JSON.stringify(execResult.outputResult, null, 2)}
                    </pre>
                  </ScrollArea>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(execResult.outputResult, null, 2))}
                >
                  <Copy className="w-3 h-3 mr-1" /> Copiar resultado
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <Button variant="ghost" size="sm" onClick={() => setExecOpen(false)}>Fechar</Button>
            <Button
              size="sm"
              onClick={() => execSkill && executeMutation.mutate({ skillId: execSkill.id, params: execParams })}
              disabled={executeMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {executeMutation.isPending
                ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Executando...</>
                : <><Play className="w-3.5 h-3.5 mr-1" /> Executar</>
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── History Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl bg-[#0f1729] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              Histórico: {historySkill?.name}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-80">
            {!historyData ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="w-5 h-5 animate-spin text-[#c89b3c]" />
              </div>
            ) : historyData.executions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma execução registrada</p>
            ) : (
              <div className="space-y-2 p-1">
                {historyData.executions.map(ex => (
                  <div key={ex.id} className="flex items-start gap-3 p-2.5 rounded bg-white/5 border border-white/10">
                    <div className="mt-0.5">{execStatusIcon(ex.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground truncate">{ex.id.slice(0, 8)}...</span>
                        <Badge variant="outline" className="text-[10px] px-1 border-white/20 text-white/50">
                          {ex.triggeredBy}
                        </Badge>
                        {ex.durationMs && (
                          <span className="text-[10px] text-muted-foreground ml-auto">{ex.durationMs}ms</span>
                        )}
                      </div>
                      {ex.errorMessage && (
                        <p className="text-xs text-red-400 font-mono truncate">{ex.errorMessage}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(ex.startedAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </BrowserFrame>
  );
}

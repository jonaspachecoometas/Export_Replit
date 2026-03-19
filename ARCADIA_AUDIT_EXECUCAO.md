# Arcádia Suite — Auditoria Completa e Plano de Execução
**Data:** 2026-03-13 | **Versão:** 1.0 | **Auditores:** Claude Code (4 agentes paralelos)

---

## 1. NÚMEROS DO SISTEMA

| Dimensão | Métrica |
|----------|---------|
| Tabelas no schema | **337** |
| Migration formal | **1 arquivo (4.602 linhas) — cobre todas as tabelas** |
| Tabelas COM tenantId | **~147 (44%)** |
| Tabelas SEM tenantId | **~190 (56%) — risco de isolamento** |
| Tabelas sem timestamps | **~40** |
| Tabelas sem insert schema | **36 (11%)** |
| Módulos backend auditados | **25 módulos / 400+ endpoints** |
| Páginas frontend auditadas | **64 páginas** |
| Páginas reais e funcionais | **48 (75%)** |
| Páginas parciais | **12 (19%)** |
| Páginas placeholder | **4 (6%)** |
| Ferramentas Manus definidas | **79** |
| Credenciais hardcoded | **3 locais** |
| Rotas sem autenticação (4 módulos) | **102+ endpoints expostos** |
| Serviços Python com CORS aberto | **6 de 6** |

---

## 2. SCORE POR DIMENSÃO

| Dimensão | Score | Status |
|----------|-------|--------|
| Funcionalidade | **7/10** | 75% real, 25% parcial/placeholder |
| Segurança | **3/10** | CORS aberto, auth ausente, credentials hardcoded |
| Multi-tenancy | **4/10** | 56% das tabelas sem isolamento |
| Inteligência (IA) | **5/10** | Manus funciona, embeddings vazios, ciclo quebrado |
| Integrações ERP | **4/10** | 25 conectores definidos, zero chamadas reais |
| Infraestrutura | **2/10** | No Replit, sem containers, sem CI/CD |
| Qualidade de código | **5/10** | Sem testes, sem logging estruturado, sem rate limit |
| Maturidade de produto | **6/10** | Boa visão, execução inconsistente entre módulos |

**Score geral: 4.5/10 — Excelente para MVP. Precisa de fundação antes de escalar.**

---

## 3. ACHADOS CRÍTICOS (🔴 Resolver antes de qualquer deploy público)

### SEC-01 — XOS: 100% das rotas sem autenticação e sem tenantId
```
server/xos/routes.ts — 40+ endpoints:
  GET /api/xos/contacts, /companies, /deals, /tickets, /conversations
  → Qualquer request não autenticado lista dados de qualquer tenant
```
**Risco:** Vazamento total de dados de CRM, tickets e conversas entre clientes.

### SEC-02 — LMS: 8+ rotas sem autenticação
```
server/lms/routes.ts:
  GET  /api/lms/courses     → público (todos os tenants)
  POST /api/lms/courses     → qualquer pessoa cria cursos
  POST /api/lms/:id/enroll  → matrícula sem login
```

### SEC-03 — Quality: 50+ rotas sem autenticação
```
server/quality/routes.ts — amostras, laudos, RNCs, documentos, treinamentos → todos públicos
```

### SEC-04 — Credenciais hardcoded em produção
```
server/metaset/routes.ts:7-8:
  ADMIN_EMAIL    = "admin@arcadia.app"      ← aparece em logs
  ADMIN_PASSWORD = "Arcadia2026!BI"         ← exposição crítica

server/auth.ts:34:
  SESSION_SECRET = "arcadia-browser-secret-key-2024"  ← fallback fraco
```

### SEC-05 — CORS aberto com credentials em TODOS os serviços Python
```
server/python/{automation,bi,contabil,fisco,people,bi_analysis}_service.py:
  allow_origins=["*"] + allow_credentials=True

  → Viola spec CORS (Chrome/Firefox rejeitam e o sistema quebra em prod)
  → Qualquer site pode fazer requisições autenticadas se bypassed
```

### SEC-06 — `/api/tenants` exposto sem autenticação
```
server/routes.ts:139 — GET /api/tenants → PUBLIC
→ Qualquer pessoa enumera todos os clientes do Arcádia
```

### SEC-07 — Manus com ferramentas perigosas sem sandboxing
```
server/manus/tools.ts — 79 ferramentas, incluindo:
  shell         → qualquer comando no servidor
  write_file    → escreve qualquer arquivo (incluindo .env)
  read_file     → lê qualquer arquivo
  python_execute → código Python arbitrário

BLOCKED_COMMANDS: rm, sudo, wget (bom)
ALLOWED_COMMANDS: npm, git, node ← ainda podem executar código arbitrário
```

### SEC-08 — Zero timeout em chamadas externas críticas
```
manus/service.ts     → OpenAI sem timeout → hang indefinido
crm/frappe-service.ts:45 → fetch sem timeout → hang indefinido
→ Cenário: OpenAI lento → requests acumulam → servidor trava
```

### SEC-09 — PipelineOrchestrator com risco de loop infinito
```
server/blackboard/PipelineOrchestrator.ts:171:
  setInterval(async () => { ... }, 2000ms)
  → operação async sem guard → múltiplas execuções simultâneas
  → agentes tentando processar a mesma task em loop
```

### SEC-10 — 190 tabelas sem isolamento multi-tenant
**Tabelas críticas:** `knowledge_base`, `conversations`, `chatThreads`, `chatMessages`,
`whatsappContacts`, `whatsappMessages`, `whatsappSessions`, `whatsappTickets`,
`manusRuns`, `workspacePages`, `pageBlocks`, `activityFeed`

---

## 4. ACHADOS DE ALTO IMPACTO (🟠 Funcionalidade core quebrada)

### FUNC-01 — Knowledge Graph: embeddings vazios — ciclo de aprendizado quebrado
O campo `embedding` em `graph_nodes` existe mas nunca é preenchido. A busca semântica do Manus retorna vazio. O sistema não aprende de nenhuma interação.

### FUNC-02 — AppCenter e Marketplace não se conversam
48 apps hardcoded no AppCenter. Marketplace tem billing e subscriptions funcionando. Nenhuma relação entre os dois — qualquer tenant vê todos os 58 apps independente do plano.

### FUNC-03 — 4 páginas placeholder das mais estratégicas
```
CentralApis.tsx → PLACEHOLDER (central de integrações)
ApiHub.tsx      → PLACEHOLDER (hub de APIs)
Agent.tsx       → PLACEHOLDER (página do agente principal)
ArcadiaNext.tsx → PLACEHOLDER
```

### FUNC-04 — 25 conectores ERP definidos, zero fazem chamadas reais
A Central de API tem UI completa com logs e métricas. Todos os dados são mockados. TOTVS, SAP, Omie, PIX — nenhum conecta de verdade.

### FUNC-05 — Python services não suportam uvicorn module-style (Docker)
`docker/python-entrypoint.sh` chama `python -m uvicorn server.python.X:app`, mas os arquivos usam `if __name__ == "__main__": uvicorn.run(app)`. Containers Python não sobem.

### FUNC-06 — Process Compass sem inteligência AI
PDCA, SWOT, Canvas modelados corretamente. Zero chamadas ao Manus. 100% manual.

### FUNC-07 — WhatsApp auto-reply só em memória
```
server/whatsapp/service.ts:50, 60-70
  autoReplyConfig: Map (in-memory)
  → Restart = perda total de configuração sem aviso ao cliente
```

### FUNC-08 — Dois sistemas de comunicação duplicados e divergentes
```
Legacy (sem tenantId):   whatsapp_*, chat_*, conversations, messages
Moderno (com tenantId):  comm_*, xosConversations, crmThreads
→ Rota de dados inconsistente, manutenção dupla
```

---

## 5. ACHADOS DE MÉDIO IMPACTO (🟡 Qualidade e maturidade)

### QUAL-01 — Zero testes automatizados em todo o repositório
### QUAL-02 — Sem paginação real (límites hardcoded: `LIMIT 100`)
### QUAL-03 — Sem error boundaries globais no React
### QUAL-04 — Sem rate limiting nas rotas da API
### QUAL-05 — Logging não estruturado (só console.log/console.error)
### QUAL-06 — 36 tabelas sem insert schema (11% do schema)
### QUAL-07 — 40+ tabelas sem timestamps createdAt/updatedAt
### QUAL-08 — Tokens WhatsApp no filesystem sem criptografia
### QUAL-09 — Connection pooling ausente nos serviços Python (nova conexão por request)
### QUAL-10 — Governance com endpoints públicos sem decisão documentada

---

## 6. ACHADOS DE ORGANIZAÇÃO (🔵 Arquitetura e estrutura)

### ARQ-01 — ERP integrations em 4 lugares diferentes
```
server/erpnext/          → adapter ERPNext
server/crm/frappe-service.ts → sync Frappe
server/api-central/      → conectores REST
server/migration/        → importação one-time
→ Deveriam estar: server/integrations/erp/
```

### ARQ-02 — Migration module escondido como tool técnica
Estratégico para onboarding de clientes mas sem fluxo guiado para consultores.

### ARQ-03 — Metabase e Superset sem estratégia definida
Dois sistemas de BI sem critério de quando usar cada um.

### ARQ-04 — IDE.tsx é só um wrapper `<Suspense>`
Nenhuma integração com backend de projetos ou contexto de desenvolvimento.

### ARQ-05 — Boolean/integer/varchar misturados para campos de status
Inconsistência: `isActive` (boolean) vs `is_active` (integer 0/1) vs `status` (varchar).

---

## 7. STATUS POR MÓDULO

### Backend (25 módulos auditados)

| Módulo | Rotas | Auth | Multi-tenant | Status |
|--------|-------|------|--------------|--------|
| Automations | CRUD completo | ✅ | ✅ | ✅ Completo |
| BI | 30+ endpoints | ✅ | ✅ | ✅ Completo |
| Blackboard | Pipeline completo | ✅ | ✅ | ✅ Completo |
| Communities | 15+ endpoints | ✅ | ✅ | ✅ Completo |
| CRM | CRUD completo | ✅ | ✅ | ✅ Completo |
| DevAgent/IDE | File+code ops | ✅ | N/A | ✅ Completo |
| Engine Room | Health+control | ✅ | N/A | ✅ Completo |
| Financeiro | 40+ endpoints | ✅ | ✅ | ✅ Completo |
| Governance | 20+ endpoints | ⚠️ alguns públicos | ✅ | ⚠️ Revisar |
| Graph (NOVO) | CRUD + search | ✅ | ✅ | ✅ Adicionado |
| LMS | 20+ endpoints | ❌ 8+ sem auth | ⚠️ | 🔴 Corrigir |
| Lowcode | 30+ endpoints | ⚠️ intencional? | ✅ | ⚠️ Revisar |
| Marketplace | CRUD subs | ⚠️ público | N/A | ⚠️ Revisar |
| MetaSet | 12 endpoints | ⚠️ credentials | ✅ | 🔴 Corrigir |
| Migration | 12 endpoints | ✅ | ✅ | ✅ Completo |
| Para | 30+ endpoints | ✅ | ✅ | ✅ Completo |
| People | CRUD+proxy | ✅ | ✅ | ✅ Completo |
| Production | 60+ endpoints | ✅ | ✅ | ✅ Completo |
| Quality | 50+ endpoints | ❌ maioria sem auth | ⚠️ | 🔴 Corrigir |
| Retail | CRUD completo | ✅ | ✅ | ✅ Completo |
| Support | 25+ endpoints | ✅ | ✅ | ✅ Completo |
| Valuation | 25+ endpoints | ✅ | ✅ | ✅ Completo |
| XOS | 40+ endpoints | ❌ ZERO auth | ❌ sem tenant | 🔴 Crítico |
| ERPNext | 10 endpoints | ✅ | N/A | ✅ Completo |
| GitHub | 9 endpoints | ⚠️ parcial | N/A | ⚠️ Revisar |

### Frontend (64 páginas auditadas)

| Grupo | Páginas | Status |
|-------|---------|--------|
| ✅ Completas com API real | 48 | AppCenter, Automations, BI, Canvas, Communities, Financeiro, Knowledge, LMS, Marketplace, Migration, People, ProcessCompass, Production, Quality, Retail, Scientist, Support, Valuation, WhatsApp, XOS (todos), Cockpit, e mais 25 |
| ⚠️ Parciais | 12 | IDE, CRM, DevCenter, ERP, Admin, Plus, Retail, Contabil, Fisco, Chat, WorkflowBuilder, MetabaseProxy |
| ❌ Placeholder | 4 | ArcadiaNext, Agent, ApiHub, CentralApis |

### Schema (337 tabelas)

| Módulo | Tabelas | tenantId | Status |
|--------|---------|----------|--------|
| Retail | 40 | ✅ | Completo |
| Valuation/PDCA | 30 | ✅ | Completo |
| Production/Compass | 35 | ✅ | Completo |
| CRM | 28 | ✅ | Completo |
| XOS | 25 | ⚠️ parcial | Corrigir |
| Fiscal | 18 | ✅ | Completo |
| HR/People | 15 | ✅ | Completo |
| Quality | 10 | ⚠️ | Corrigir |
| Financeiro | 7 | ✅ | Completo |
| Comunicação legacy | 30+ | ❌ | Corrigir |
| Comunicação moderna | 9 | ✅ | Completo |
| LMS | ⚠️ parcial | N/A | lms_courses criado dinamicamente |
| Knowledge/AI | 10+ | ⚠️ parcial | Corrigir |

---

## 8. PLANO DE EXECUÇÃO — SPRINTS

### 🔴 Sprint S — Segurança (Pré-requisito absoluto) — 1 semana

| # | Tarefa | Arquivo | Esforço |
|---|--------|---------|---------|
| S1 | Auth em todas as rotas XOS (40+) | `server/xos/routes.ts` | M |
| S2 | Auth em LMS (8 rotas) | `server/lms/routes.ts` | P |
| S3 | Auth em Quality (50+ rotas) | `server/quality/routes.ts` | M |
| S4 | Remover credentials hardcoded; SESSION_SECRET obrigatório | `server/auth.ts`, `server/metaset/routes.ts` | P |
| S5 | CORS: `["*"]` → `[APP_URL]` nos 6 serviços Python | `server/python/*.py` | P |
| S6 | Proteger `/api/tenants` | `server/routes.ts:139` | P |
| S7 | `requires_approval` + audit log nas tools `shell` e `write_file` | `server/manus/tools.ts` | M |
| S8 | Timeout 30s + retry 3x em OpenAI e Frappe | `server/manus/service.ts`, `server/crm/frappe-service.ts` | P |
| S9 | Guard anti-overlap no setInterval do PipelineOrchestrator | `server/blackboard/PipelineOrchestrator.ts:171` | P |
| S10 | tenantId nas tabelas de comunicação legacy | `shared/schema.ts` | G |

**Esforço:** P=Pequeno(<2h) M=Médio(2-4h) G=Grande(4-8h)

---

### 🟠 Sprint 0 — Deploy no Coolify — 1 semana (paralelo ao Sprint S)

| # | Tarefa | Esforço |
|---|--------|---------|
| 0.1 | Corrigir Python services para exportar `app` (uvicorn module) | P |
| 0.2 | Testar `docker compose up` local — todos sobem e `/health` retorna 200 | M |
| 0.3 | Exportar banco do Replit (`pg_dump`) antes de encerrar o plano | P |
| 0.4 | Deploy no Coolify com domínio real + SSL automático | M |
| 0.5 | Persistir config auto-reply WhatsApp no banco | P |
| 0.6 | Validar: NF-e, Manus, WhatsApp funcionando em produção | M |

---

### 🟠 Sprint 1 — Fechar o Ciclo de Inteligência — 2 semanas

| # | Tarefa | Esforço |
|---|--------|---------|
| 1.1 | Subir serviço de embeddings com pgvector | P |
| 1.2 | Popular embeddings com histórico de `learnedInteractions` | M |
| 1.3 | Configurar LiteLLM (OpenAI → Ollama fallback) | P |
| 1.4 | Validar ciclo: Manus aprende → armazena → recupera em contexto | M |
| 1.5 | Adicionar insert schemas nas 36 tabelas faltantes | M |
| 1.6 | Padronizar timestamps nas 40+ tabelas sem createdAt/updatedAt | M |

---

### 🟠 Sprint 2 — App Store Real — 1 semana

| # | Tarefa | Esforço |
|---|--------|---------|
| 2.1 | Endpoint `GET /api/marketplace/my-apps` por tenant | P |
| 2.2 | AppCenter consulta subscriptions → apps aparecem/somem por plano | M |
| 2.3 | Apps sem subscription → cadeado + CTA de ativar inline | M |
| 2.4 | Billing engine: MRR calculado por tenant automaticamente | M |

---

### 🟡 Sprint 3 — Process Compass com IA — 2 semanas

| # | Tarefa | Esforço |
|---|--------|---------|
| 3.1 | Brief automático: notas brutas → Manus extrai ações/responsáveis/prazos | M |
| 3.2 | Diagnóstico AI: Manus + BI cruzam dados → relatório de empresa | G |
| 3.3 | Health score automático de projeto (PDCA completude + prazo) | M |
| 3.4 | Gerador de proposta via Scientist (DOCX/PDF) | G |

---

### 🟡 Sprint 4 — Integrações ERP Reais — 3 semanas

| # | Tarefa | Esforço |
|---|--------|---------|
| 4.1 | Reorganizar `server/integrations/erp/` (unificar 4 módulos) | G |
| 4.2 | Adaptador Omie (REST mais simples) | G |
| 4.3 | Adaptador TOTVS RM (segundo mais comum PMEs BR) | G |
| 4.4 | UI de onboarding: ERP → espelhamento → BI em 5 passos | G |
| 4.5 | Dashboard de saúde das integrações (sync status, erros) | M |
| 4.6 | Completar páginas placeholder: `CentralApis.tsx`, `ApiHub.tsx`, `Agent.tsx` | G |

---

### 🟢 Sprint 5 — Soberania de IA — 1 semana

| # | Tarefa | Esforço |
|---|--------|---------|
| 5.1 | Ollama + Open WebUI no Coolify (`--profile ai`) | P |
| 5.2 | Baixar modelos: Llama 3.3, Qwen 2.5 Coder | P |
| 5.3 | RAG no Open WebUI conectado ao Knowledge Graph | M |
| 5.4 | Manus → LiteLLM em vez de OpenAI direto | M |

---

### 🔵 Sprint 6 — Qualidade de Engenharia — 2 semanas

| # | Tarefa | Esforço |
|---|--------|---------|
| 6.1 | Rate limiting nas rotas da API (`express-rate-limit`) | P |
| 6.2 | Logging estruturado com Winston (JSON + correlation ID) | M |
| 6.3 | Paginação em todas as listagens principais | G |
| 6.4 | Error boundaries globais no React | M |
| 6.5 | Primeiros testes de integração (auth, fiscal, Manus) | G |
| 6.6 | Connection pooling nos serviços Python | M |
| 6.7 | Consolidar sistemas de comunicação duplicados | G |

---

### 🟢 Sprint 7 — ERPNext como Container de Regras — 2 semanas

| # | Tarefa | Esforço |
|---|--------|---------|
| 7.1 | Container ERPNext no Coolify (MariaDB separado) | M |
| 7.2 | Configurar empresa + plano de contas BR | M |
| 7.3 | Bridge de autenticação (API Key por tenant) | M |
| 7.4 | Expandir `server/erpnext/`: GL, Estoque, RH, Projetos | G |
| 7.5 | Primeiro caso de uso real: pedido → lançamento GL no ERPNext | G |

---

## 9. LINHA DO TEMPO

```
Semanas →  1    2    3    4    5    6    7    8    9   10   11   12   13   14
          ┌─────────────────────────────────────────────────────────────────────
Sprint S  │████ ████                                    Segurança (obrigatório)
Sprint 0  │████ ████                                    Deploy Coolify
Sprint 1  │          ████ ████                          Inteligência + Schema
Sprint 2  │               ████                          App Store Real
Sprint 3  │                    ████ ████                Process Compass IA
Sprint 4  │                              ████ ████ ████ Integrações ERP reais
Sprint 5  │                                        ████ Soberania IA
Sprint 6  │                                             ████ ████ Qualidade
Sprint 7  │                                                       ████ ████ ERPNext
```

---

## 10. TOP 10 — MAIORES ALAVANCAS POR IMPACTO

| Rank | O que fazer | Impacto | Esforço |
|------|-------------|---------|---------|
| 1 | Autenticar rotas XOS, LMS, Quality | Segurança crítica | Baixo |
| 2 | Corrigir CORS nos serviços Python | Segurança crítica | Baixo |
| 3 | Deploy no Coolify com Docker | Infra — tudo depende disso | Médio |
| 4 | Fechar ciclo de embeddings (pgvector) | IA aprende de verdade | Médio |
| 5 | Conectar Marketplace → AppCenter | Modelo de negócio funciona | Médio |
| 6 | Adaptador Omie real na Central de API | Primeira integração ERP real | Médio |
| 7 | tenantId nas tabelas de comunicação | Isolamento de dados correto | Alto |
| 8 | Brief automático no Process Compass | Produto para consultores | Médio |
| 9 | Timeout + retry em chamadas externas | Estabilidade em produção | Baixo |
| 10 | Completar Agent.tsx, CentralApis.tsx | Páginas estratégicas com UI | Alto |

---

## 11. DECISÕES ARQUITETURAIS PENDENTES

Estas decisões precisam de resposta antes de codificar:

| # | Decisão | Opções |
|---|---------|--------|
| D1 | BI padrão do sistema? | Metabase (já existe) vs Superset (no docker-compose) |
| D2 | LMS usa tabelas dinâmicas ou schema.ts? | Hoje cria tabelas em runtime — inconsistente |
| D3 | Sistema de comunicação canônico? | Legacy whatsapp_* vs moderno comm_* vs XOS |
| D4 | Marketplace é público ou requer auth? | Hoje público (intencional?) |
| D5 | Governance/Lowcode são públicos? | Sem auth (intencional para parceiros?) |
| D6 | Usuários são globais ou por tenant? | Hoje global (users sem tenantId) — documentar |

---

*Documento gerado em 2026-03-13 via auditoria paralela com 4 agentes Claude Code.*
*Cobre: 25 módulos backend, 64 páginas frontend, 337 tabelas de schema, segurança e integrações.*

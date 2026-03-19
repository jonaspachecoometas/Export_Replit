# Arcádia XOS - Planejamento Consolidado

## Visão Geral

**XOS (Experience Operating System)** é o sistema operacional de experiência do cliente do Arcádia Suite, unificando marketing, vendas, atendimento e operações em uma única plataforma nativa.

### Mantra
> "O cliente no centro. A experiência como diferencial. A tecnologia como facilitadora."

### Inspiração
Baseado nos conceitos do erxes XOS, implementado nativamente na stack do Arcádia Suite (React + Express + PostgreSQL).

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ARCÁDIA XOS                                       │
│                 Experience Operating System                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │  SITE BUILDER │  │  MARKETING    │  │  CRM AVANÇADO │  │  ATENDIMENTO │ │
│  │               │  │  HUB          │  │               │  │              │ │
│  │  • Editor     │  │  • Campanhas  │  │  • Pipeline   │  │  • Inbox     │ │
│  │  • Templates  │  │  • Automações │  │  • Contatos   │  │  • Tickets   │ │
│  │  • Importador │  │  • Landing    │  │  • Lead Score │  │  • Chatbot   │ │
│  │  • Domínios   │  │  • Email/SMS  │  │  • Segmentos  │  │  • SLA       │ │
│  └───────────────┘  └───────────────┘  └───────────────┘  └──────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      VISÃO 360° DO CLIENTE                          │   │
│  │  Histórico completo: conversas, compras, tickets, interações       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      CAMADA DE INTELIGÊNCIA                         │   │
│  │  Manus AI | Knowledge Graph | Dev Agent | Scientist                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Módulos do XOS

### 1. XOS Central (Hub)
**Rota:** `/xos`

| Componente | Descrição |
|------------|-----------|
| Dashboard | Visão geral de métricas (leads, tickets, conversões) |
| Visão 360° | Perfil completo do cliente em uma tela |
| Timeline | Histórico de todas as interações |
| Quick Actions | Ações rápidas (enviar mensagem, criar ticket, etc) |

### 2. CRM Avançado
**Rota:** `/xos/crm`

| Funcionalidade | Descrição |
|----------------|-----------|
| Pipeline Visual | Kanban de oportunidades com drag & drop |
| Contatos | Gestão unificada de leads e clientes |
| Empresas | Gestão de contas B2B |
| Segmentação | Criar grupos por comportamento/atributos |
| Lead Scoring | Pontuação automática de leads |
| Atividades | Tarefas, ligações, reuniões agendadas |
| Relatórios | Funil, conversão, performance de vendedores |

### 3. Marketing Hub
**Rota:** `/xos/marketing`

| Funcionalidade | Descrição |
|----------------|-----------|
| Campanhas | Criar e gerenciar campanhas multicanal |
| Email Marketing | Templates, envio, rastreamento |
| SMS Marketing | Integração Twilio/Zenvia |
| WhatsApp Marketing | Campanhas via WhatsApp Business |
| Automações | Fluxos de nutrição e follow-up |
| Landing Pages | Páginas de captura integradas |
| Formulários | Captura de leads com campos customizados |
| Pop-ups | Widgets de captura para sites |
| Analytics | ROI de campanhas, conversões |

### 4. Atendimento (Inbox Omnichannel)
**Rota:** `/xos/inbox`

| Funcionalidade | Descrição |
|----------------|-----------|
| Inbox Unificado | WhatsApp + Chat + Email em uma tela |
| Tickets | Sistema de suporte com prioridades |
| SLA | Tempo de resposta e resolução |
| Atribuição | Distribuição automática para atendentes |
| Tags | Categorização de conversas |
| Macros | Respostas rápidas padronizadas |
| Knowledge Base | Base de conhecimento para clientes |
| Chatbot | Atendimento automático inicial |
| Satisfação | Pesquisa NPS/CSAT após atendimento |

### 5. Site Builder
**Rota:** `/xos/sites`

| Funcionalidade | Descrição |
|----------------|-----------|
| Editor Visual | Drag & drop de blocos |
| Templates | Modelos prontos por segmento |
| Importador | Importar sites existentes (HTML/CSS/URL) |
| Páginas | Criar páginas ilimitadas |
| Blog | Sistema de publicação de conteúdo |
| SEO | Meta tags, sitemap, Open Graph |
| Domínios | Conectar domínio próprio |
| Analytics | Visitas, conversões, origem |
| Responsivo | Preview mobile/tablet/desktop |

### 6. Automações
**Rota:** `/xos/automations`

| Funcionalidade | Descrição |
|----------------|-----------|
| Workflow Builder | Editor visual de fluxos |
| Triggers | Eventos que disparam automações |
| Ações | Email, WhatsApp, criar tarefa, webhook |
| Condições | Filtros e ramificações |
| Agendamento | Executar em horário específico |
| Logs | Histórico de execuções |

---

## Estrutura de Dados (PostgreSQL)

### Tabelas Principais

```sql
-- Contatos unificados
xos_contacts (
  id, company_id, type, -- lead, customer, partner
  name, email, phone, whatsapp,
  avatar_url, tags[], custom_fields,
  lead_score, lead_status, -- new, qualified, customer
  source, -- website, whatsapp, manual, import
  assigned_to, -- user_id
  created_at, updated_at
)

-- Empresas/Contas
xos_companies (
  id, company_id, name, domain,
  industry, size, revenue,
  address, city, state,
  contacts[], -- array de contact_ids
  custom_fields,
  created_at, updated_at
)

-- Pipeline de Vendas
xos_pipelines (
  id, company_id, name, 
  stages[], -- array de estágios
  is_default, created_at
)

xos_deals (
  id, company_id, pipeline_id, stage_id,
  contact_id, company_id,
  title, value, currency,
  expected_close_date,
  assigned_to, status, -- open, won, lost
  lost_reason, won_reason,
  created_at, updated_at, closed_at
)

-- Inbox / Conversas
xos_conversations (
  id, company_id, contact_id,
  channel, -- whatsapp, chat, email
  channel_id, -- session_id do canal
  status, -- open, pending, resolved
  assigned_to, tags[],
  first_response_at, resolved_at,
  satisfaction_score,
  created_at, updated_at
)

xos_messages (
  id, conversation_id, 
  direction, -- inbound, outbound
  sender_type, sender_id, -- contact ou user
  content, content_type, -- text, image, file
  metadata, -- attachments, etc
  read_at, created_at
)

-- Tickets
xos_tickets (
  id, company_id, contact_id, conversation_id,
  subject, description,
  priority, -- low, medium, high, urgent
  status, -- open, pending, in_progress, resolved, closed
  category, tags[],
  assigned_to,
  sla_due_at, first_response_at, resolved_at,
  satisfaction_score,
  created_at, updated_at
)

-- Campanhas
xos_campaigns (
  id, company_id, name,
  type, -- email, sms, whatsapp
  status, -- draft, scheduled, running, completed
  segment_id, -- filtro de contatos
  content, template_id,
  scheduled_at, started_at, completed_at,
  stats, -- sent, delivered, opened, clicked
  created_at, updated_at
)

-- Automações
xos_automations (
  id, company_id, name,
  trigger_type, trigger_config,
  actions[], -- array de ações
  conditions[], -- filtros
  is_active, 
  stats, -- executions, success, failures
  created_at, updated_at
)

-- Sites
xos_sites (
  id, company_id, name,
  domain, subdomain,
  template_id,
  settings, -- colors, fonts, etc
  is_published,
  created_at, updated_at
)

xos_pages (
  id, site_id, 
  title, slug, path,
  blocks[], -- array de blocos do editor
  meta_title, meta_description,
  is_published,
  created_at, updated_at
)

-- Blocos reutilizáveis
xos_blocks (
  id, company_id, name,
  type, -- header, hero, features, pricing, etc
  content, -- JSON do bloco
  is_global, -- disponível para todos
  created_at
)
```

---

## Integrações Nativas

| Sistema | Integração |
|---------|------------|
| **WhatsApp** | Baileys (já existe) → alimenta Inbox |
| **Chat Interno** | Já existe → alimenta Inbox |
| **ERPNext** | Clientes, produtos, pedidos |
| **Arcádia Fisco** | NF-e vinculada a deals |
| **Arcádia Retail** | Vendas PDV → histórico cliente |
| **Knowledge Graph** | Indexa conversas e interações |
| **Manus AI** | Atendimento automático, sugestões |
| **Dev Agent** | Customiza todos os módulos |
| **Scientist** | Análises e relatórios avançados |

---

## Casos de Uso

### 1. Venda Interna do Arcádia Suite
```
Landing Page → Formulário → Lead no CRM → 
Automação de nutrição → Manus qualifica → 
Demo agendada → Proposta → Fechamento → 
Onboarding automático
```

### 2. E-commerce (Cliente usando)
```
Visitante → Pop-up com cupom → Lead capturado →
Automação de abandono de carrinho →
WhatsApp com lembrete → Compra →
Pós-venda via Inbox → Pesquisa NPS
```

### 3. Serviços (Cliente usando)
```
Site com formulário → Lead → Pipeline de propostas →
Proposta enviada → Follow-up automático →
Contrato fechado → Projeto criado →
Suporte via Tickets → Renovação automática
```

---

## Fases de Implementação

### Fase 1: Fundação (2 semanas)
- [ ] Estrutura de dados (tabelas PostgreSQL)
- [ ] API base do XOS
- [ ] XOS Central (dashboard e navegação)
- [ ] Migração de contatos existentes

### Fase 2: CRM (2 semanas)
- [ ] Pipeline visual (Kanban)
- [ ] Gestão de contatos
- [ ] Lead scoring básico
- [ ] Atividades e tarefas

### Fase 3: Inbox Omnichannel (2 semanas)
- [ ] Inbox unificado
- [ ] Integração WhatsApp existente
- [ ] Integração Chat existente
- [ ] Sistema de tickets

### Fase 4: Marketing (2 semanas)
- [ ] Campanhas de email
- [ ] Campanhas WhatsApp
- [ ] Automações básicas
- [ ] Landing pages

### Fase 5: Site Builder (2 semanas)
- [ ] Editor visual
- [ ] Biblioteca de blocos
- [ ] Importador de sites
- [ ] Publicação e domínios

### Fase 6: Inteligência (2 semanas)
- [ ] Visão 360° completa
- [ ] Integração Manus AI
- [ ] Analytics e relatórios
- [ ] Chatbot avançado

---

## Monetização (Marketplace)

| Plano | Preço/mês | Inclui |
|-------|-----------|--------|
| **XOS Starter** | R$ 149 | CRM + Inbox (até 1.000 contatos) |
| **XOS Pro** | R$ 299 | + Marketing + Automações (até 10.000 contatos) |
| **XOS Business** | R$ 499 | + Site Builder + API (até 50.000 contatos) |
| **XOS Enterprise** | Sob consulta | Ilimitado + Suporte dedicado |

---

## Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| Tempo de implementação | 12 semanas |
| Conversão de leads | +30% |
| Tempo de resposta | -50% |
| Satisfação do cliente | NPS > 50 |
| Adoção do Marketplace | 100 assinaturas em 6 meses |

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | React + TypeScript + Tailwind + shadcn/ui |
| Backend | Express + Drizzle ORM |
| Banco | PostgreSQL |
| Real-time | Socket.IO (já existe) |
| Email | Integração SMTP / Amazon SES |
| SMS | Twilio / Zenvia |
| WhatsApp | Baileys (já existe) |
| IA | OpenAI API (já existe) |

---

## Próximos Passos

1. **Aprovar planejamento** ✓
2. **Criar estrutura de dados** (tabelas)
3. **Implementar XOS Central** (hub)
4. **Desenvolver módulos** em fases
5. **Testes e ajustes**
6. **Lançamento no Marketplace**

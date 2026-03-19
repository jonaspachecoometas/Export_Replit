# Análise de Requisitos CRM - XOS vs Documento

> **Data:** 29/01/2026  
> **Documento Base:** CRM_1769651134584.pdf

---

## Resumo Executivo

| Categoria | Status Geral | Cobertura |
|-----------|--------------|-----------|
| **Estrutura de Dados** | ✅ Implementado | 90% |
| **Live Chat + CRM** | 🟡 Parcial | 50% |
| **Distribuição de Leads** | 🟡 Estrutura | 30% |
| **Carteirização** | 🟡 Estrutura | 40% |
| **Automações Low-Code** | 🟡 Estrutura | 35% |
| **Follow-up Lists** | ⚪ Não impl. | 10% |
| **Disparos em Massa** | 🟡 Estrutura | 25% |
| **Gestão Meta/Templates** | ⚪ Não impl. | 0% |
| **Multi-Conexões API** | ⚪ Não impl. | 0% |
| **API/Webhook** | ⚪ Não impl. | 10% |
| **Controle de Acessos** | 🟡 Parcial | 40% |
| **Aba de Contatos** | ✅ Implementado | 85% |
| **Métricas/Dashboards** | 🟡 Parcial | 45% |

**Cobertura Geral Estimada: ~40%**

---

## Análise Detalhada por Requisito

### 1. Live Chat (WhatsApp API) + CRM

**Requisito:** Chat com lead onde pode conversar, mandar audio, documento, imagens.

| Sub-requisito | Status | Detalhe |
|---------------|--------|---------|
| Chat em tempo real | 🟡 | Estrutura de conversas e mensagens existe (`xos_conversations`, `xos_messages`) |
| Envio de áudio/doc/imagem | 🟡 | Campo `content_type` e `attachments` no schema |
| Notas internas no chat | ⚪ | Não implementado - precisa campo `is_internal` |
| Mini CRM dentro do chat | 🟡 | Dados do contato vinculados via `contact_id` |
| Troca de etapas do pipeline | ✅ | Pipeline e stages implementados |
| Transferir lead p/ outro membro | 🟡 | Campo `assigned_to` existe, UI não implementada |
| Finalizar lead (ganho/perda) | ✅ | Campos `status`, `won_reason`, `lost_reason` no Deal |
| Informações de contato padrões | ✅ | Nome, email, telefone, tags, etc. |
| Campos personalizados | ✅ | Campo `custom_fields` (JSONB) |
| Rastreamento UTM | ✅ | Campos `source`, `source_details` |
| Filtros avançados | 🟡 | Filtro básico por tipo/status/busca, **falta:** tag, etapa funil, status Meta, sem resposta, data |
| Ordenação múltipla | ⚪ | Apenas por data, falta opções avançadas |

**Cobertura: 50%** - Estrutura existe, falta UI de chat real e filtros avançados.

---

### 2. Distribuição Automática de Leads

**Requisito:** Lead chega e é atribuído automaticamente via fila.

| Sub-requisito | Status | Detalhe |
|---------------|--------|---------|
| Fila round-robin | ⚪ | Não implementado |
| Distribuição por percentual | ⚪ | Não implementado |
| Configuração de regras | ⚪ | Não implementado |

**O que temos:**
- Campo `assigned_to` em Contacts e Deals
- Estrutura de automações (`xos_automations`) que poderia acionar distribuição

**Cobertura: 30%** - Estrutura permite, lógica não implementada.

---

### 3. Carteirização

**Requisito:** Lead "pertence" a um consultor por X período.

| Sub-requisito | Status | Detalhe |
|---------------|--------|---------|
| Ownership por período | ⚪ | Não tem campo de expiração |
| Redirecionamento automático | ⚪ | Não implementado |
| Histórico de ownership | ⚪ | Não implementado |

**O que temos:**
- Campo `assigned_to` no contato
- Campo `last_contact_at` para tracking

**Cobertura: 40%** - Precisa adicionar `ownership_expires_at` e lógica.

---

### 4. Automações Low-Code

**Requisito:** Automações no-code/low-code com opções pré-dispostas.

| Sub-requisito | Status | Detalhe |
|---------------|--------|---------|
| Triggers (mensagem, clique, etc.) | ✅ | Campo `trigger_type` e `trigger_config` |
| Ações (tag, mensagem, distribuir) | ✅ | Campo `actions` (array de ações) |
| Condições | ✅ | Campo `conditions` (array) |
| UI visual de criação | 🟡 | Tela básica criada, não funcional |
| Execução real | ⚪ | Não implementado no backend |

**O que temos:**
```sql
xos_automations (
  trigger_type: "contact_created", "deal_stage_changed", "form_submitted"
  trigger_config: { ... }
  actions: [{ type: "add_tag", config: {...} }, { type: "send_message", config: {...} }]
  conditions: [{ field: "...", operator: "...", value: "..." }]
)
```

**Cobertura: 35%** - Schema pronto, execução não implementada.

---

### 5. Listas de Follow-up

**Requisito:** Lista de mensagens automáticas com delays.

| Sub-requisito | Status | Detalhe |
|---------------|--------|---------|
| Criação de lista | ⚪ | Não existe tabela específica |
| Sequência com delays | ⚪ | Não implementado |
| Saída automática ao responder | ⚪ | Não implementado |
| Integração com automações | ⚪ | Poderia usar `xos_automations` |

**Cobertura: 10%** - Precisa nova tabela `xos_follow_up_sequences`.

---

### 6. Central de Disparos em Massa (WhatsApp API)

**Requisito:** Fluxo para disparos em massa com agendamento.

| Sub-requisito | Status | Detalhe |
|---------------|--------|---------|
| Campanhas WhatsApp | ✅ | `xos_campaigns` com type "whatsapp" |
| Segmentação de contatos | ✅ | Campo `segment_query` (JSONB) |
| Agendamento | ✅ | Campo `scheduled_at` |
| Estatísticas | ✅ | Campo `stats` (sent, delivered, opened, etc.) |
| Fluxo de automação | 🟡 | Básico, não visual |
| Execução real | ⚪ | Não implementado |

**Cobertura: 25%** - Estrutura completa, execução não implementada.

---

### 7. Gestão de Templates Meta (WhatsApp)

**Requisito:** Criar/gerenciar templates da Meta Business.

| Sub-requisito | Status | Detalhe |
|---------------|--------|---------|
| Listagem de templates | ⚪ | Não implementado |
| Criação de templates | ⚪ | Não implementado |
| Aprovação Meta | ⚪ | Não implementado |
| Integração API Meta | ⚪ | Não implementado |

**Cobertura: 0%** - Requer integração com Meta Business API.

---

### 8. Múltiplas Conexões de API WhatsApp

**Requisito:** Conectar mais de um número WhatsApp.

| Sub-requisito | Status | Detalhe |
|---------------|--------|---------|
| Multi-número | ⚪ | Não implementado |
| Gestão de conexões | ⚪ | Não implementado |
| Configuração por equipe | ⚪ | Não implementado |

**O que temos:**
- Sistema WhatsApp via Baileys existe no projeto (pasta `whatsapp/`)
- Falta integração com XOS

**Cobertura: 0%** - Precisa integrar WhatsApp existente ao XOS.

---

### 9. API do CRM + Webhook

**Requisito:** API externa e webhooks para integrações.

| Sub-requisito | Status | Detalhe |
|---------------|--------|---------|
| API REST | ✅ | Rotas `/api/xos/*` completas |
| Webhooks de entrada | ⚪ | Não implementado |
| Webhooks de saída | ⚪ | Não implementado |
| Documentação API | ⚪ | Não documentado |

**Cobertura: 10%** - API existe, webhooks não.

---

### 10. Gerenciar Acessos (Hierarquia)

**Requisito:** Diferenciação de acessos por perfil.

| Sub-requisito | Status | Detalhe |
|---------------|--------|---------|
| Perfis de usuário | ✅ | Tabela `users` com `role` |
| Permissões por recurso | 🟡 | Sistema de roles básico existe |
| Visibilidade filtrada | ⚪ | Não implementado por tenant/equipe |
| Configuração de acessos | ⚪ | Não tem UI |

**O que temos:**
- Multi-tenancy (`tenant_id` em todas tabelas XOS)
- Usuários com roles

**Cobertura: 40%** - Estrutura existe, UI e lógica fina não.

---

### 11. Aba de Contatos

**Requisito:** Listagem com busca, filtros, import/export.

| Sub-requisito | Status | Detalhe |
|---------------|--------|---------|
| Listagem completa | ✅ | Implementado |
| Busca por nome/email | ✅ | Implementado |
| Filtro por tipo/status | ✅ | Implementado |
| Filtro por tag | ⚪ | Não implementado |
| Detalhes do contato | ✅ | Implementado com relacionamentos |
| Exportação | ⚪ | Não implementado |
| Importação em massa | ⚪ | Não implementado |

**Cobertura: 85%** - Falta import/export e filtro por tags.

---

### 12. Métricas e Dashboards

**Requisito:** Dashboards personalizáveis com KPIs.

| Sub-requisito | Status | Detalhe |
|---------------|--------|---------|
| Dashboard geral | ✅ | XosCentral com stats |
| Métricas de vendas | ✅ | Deals por stage, valor total |
| Métricas de atendimento | 🟡 | Conversas, tempo resposta básico |
| Métricas por vendedor | ⚪ | Não filtrado por usuário |
| Personalização | ⚪ | Layout fixo |
| Filtro de período | ⚪ | Não implementado |

**O que temos:**
```javascript
// Endpoint /api/xos/stats retorna:
{
  contacts: { total, leads, customers },
  deals: { total, open, won, lost, totalValue },
  conversations: { total, open, resolved },
  campaigns: { total, active }
}
```

**Cobertura: 45%** - Básico funciona, falta personalização e filtros.

---

## Comparativo com CRMs de Referência

| Recurso | Kommo | Clint | Front CRM | **XOS Atual** |
|---------|-------|-------|-----------|---------------|
| Live Chat WhatsApp | ✅ | ✅ | ✅ | 🟡 |
| Visual limpo | ⚪ | ✅ | ✅ | ✅ |
| Distribuição leads | ✅ | ✅ | ✅ | 🟡 |
| Automações | ✅ | 💰 | ✅ | 🟡 |
| Follow-ups | ✅ | ✅ | ✅ | ⚪ |
| Disparos massa | ✅ | ✅ | ✅ | 🟡 |
| Templates Meta | ✅ | ✅ | ✅ | ⚪ |
| Dashboards custom | ✅ | ✅ | ⚪ | ⚪ |
| API/Webhooks | ✅ | ✅ | ✅ | 🟡 |
| Multi-número | ✅ | ✅ | ✅ | ⚪ |

---

## Plano de Ação Prioritário

### Prioridade 1 (Crítico para Operação)

1. **Integrar WhatsApp ao XOS**
   - Conectar sistema Baileys existente
   - Criar canal `whatsapp` funcional em `xos_conversations`
   - UI de chat real-time

2. **Filtros Avançados no Chat**
   - Por tag, etapa, status, data
   - Ordenação múltipla

3. **Distribuição Automática de Leads**
   - Criar tabela `xos_lead_distribution_rules`
   - Implementar lógica round-robin

### Prioridade 2 (Diferencial Competitivo)

4. **Listas de Follow-up**
   - Criar tabela `xos_follow_up_sequences`
   - Engine de execução com delays

5. **Execução Real de Automações**
   - Worker para processar triggers
   - Ações reais (enviar mensagem, add tag, etc.)

6. **Carteirização**
   - Campo `ownership_expires_at`
   - Lógica de redirecionamento

### Prioridade 3 (Escala e Profissionalização)

7. **Gestão de Templates Meta**
   - Integração Meta Business API

8. **Multi-Número WhatsApp**
   - Tabela de conexões
   - Seletor de número por equipe

9. **Dashboards Personalizáveis**
   - Widgets configuráveis
   - Filtros por período/vendedor

10. **Import/Export de Contatos**
    - CSV/Excel upload
    - Exportação com filtros

---

## Schema Sugerido para Expansão

```sql
-- Follow-up Sequences
CREATE TABLE xos_follow_up_sequences (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  name VARCHAR(200) NOT NULL,
  trigger_event VARCHAR(50), -- 'contact_created', 'deal_created'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE xos_follow_up_steps (
  id SERIAL PRIMARY KEY,
  sequence_id INTEGER REFERENCES xos_follow_up_sequences(id),
  step_order INTEGER,
  delay_hours INTEGER,
  action_type VARCHAR(30), -- 'send_template', 'send_message', 'add_tag'
  action_config JSONB,
  exit_on_reply BOOLEAN DEFAULT true
);

CREATE TABLE xos_follow_up_enrollments (
  id SERIAL PRIMARY KEY,
  sequence_id INTEGER REFERENCES xos_follow_up_sequences(id),
  contact_id INTEGER REFERENCES xos_contacts(id),
  current_step INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'exited'
  started_at TIMESTAMP DEFAULT NOW(),
  next_action_at TIMESTAMP,
  exited_at TIMESTAMP
);

-- Lead Distribution
CREATE TABLE xos_distribution_rules (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  name VARCHAR(100),
  rule_type VARCHAR(30), -- 'round_robin', 'percentage', 'load_balanced'
  config JSONB, -- { users: [{ user_id, percentage }] }
  is_active BOOLEAN DEFAULT true
);

-- WhatsApp Connections
CREATE TABLE xos_whatsapp_connections (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  name VARCHAR(100),
  phone_number VARCHAR(20),
  status VARCHAR(20), -- 'connected', 'disconnected', 'qr_pending'
  session_data JSONB,
  assigned_teams JSONB, -- array of team IDs
  created_at TIMESTAMP DEFAULT NOW()
);

-- Meta Templates
CREATE TABLE xos_whatsapp_templates (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  connection_id INTEGER REFERENCES xos_whatsapp_connections(id),
  meta_template_id VARCHAR(100),
  name VARCHAR(100),
  category VARCHAR(50),
  language VARCHAR(10),
  status VARCHAR(30), -- 'APPROVED', 'PENDING', 'REJECTED'
  components JSONB,
  synced_at TIMESTAMP
);
```

---

## Conclusão

O XOS tem uma **base sólida** com ~40% dos requisitos cobertos estruturalmente. Os principais gaps são:

1. **Integração real com WhatsApp** (estrutura existe, execução não)
2. **Listas de Follow-up** (não existe)
3. **Execução de automações** (schema existe, engine não)
4. **Templates Meta** (não existe)
5. **Dashboards personalizáveis** (básico existe)

A boa notícia é que a arquitetura multi-tenant e os schemas JSONB flexíveis facilitam a expansão. Recomendo focar primeiro na integração WhatsApp + Filtros Avançados, que são os requisitos mais críticos para operação comercial diária.

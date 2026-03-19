# Análise Atendeon → XOS

> **Projeto:** https://github.com/JonasRodriguesPachceo/atendeon  
> **Stack:** Node.js (TypeScript) + React + PostgreSQL + Baileys  
> **Data:** 29/01/2026

---

## Resumo do Projeto Atendeon

O Atendeon é uma **central de atendimento WhatsApp multi-empresa** (SaaS) completa com:

- **477 arquivos TypeScript** no backend
- **41 Models** (Sequelize/PostgreSQL)
- **35+ Services** organizados por domínio
- Integração completa com **Baileys** (WhatsApp não-oficial)
- Suporte a **Typebot**, **N8N** e **OpenAI**

---

## Funcionalidades do Atendeon vs XOS Atual

### ✅ O que o Atendeon tem que NOS FALTA

| Funcionalidade | Atendeon | XOS Atual | Prioridade |
|----------------|----------|-----------|------------|
| **Filas de Atendimento (Queues)** | ✅ Completo | ⚪ Não existe | 🔴 Alta |
| **Distribuição Round-Robin** | ✅ Por fila/equipe | ⚪ Não existe | 🔴 Alta |
| **Notas Internas (TicketNote)** | ✅ Model dedicado | ⚪ Não existe | 🔴 Alta |
| **Mensagens Rápidas (QuickMessage)** | ✅ Com atalhos | ⚪ Não existe | 🟠 Média |
| **Agendamento de Mensagens** | ✅ Schedule model | ⚪ Não existe | 🟠 Média |
| **Tracking de Ticket** | ✅ TicketTraking | ⚪ Não existe | 🟠 Média |
| **Horário de Funcionamento** | ✅ outOfHoursMessage | ⚪ Não existe | 🟡 Baixa |
| **Rating/Avaliação** | ✅ UserRating | ⚪ Não existe | 🟡 Baixa |
| **Campos Customizados** | ✅ ContactCustomField | ✅ customFields JSONB | ✅ OK |
| **Multi-WhatsApp** | ✅ Whatsapp model | ⚪ Não integrado | 🔴 Alta |
| **Chatbot/Typebot** | ✅ Integração nativa | ⚪ Não existe | 🟠 Média |
| **Integração N8N** | ✅ QueueIntegrations | ⚪ Não existe | 🟠 Média |
| **Prompts OpenAI** | ✅ Prompt model | ✅ Manus Agent | ✅ OK |
| **Campanhas com 5 msgs** | ✅ message1-5 | 🟡 content único | 🟠 Média |
| **Disparo em massa** | ✅ CampaignShipping | 🟡 Estrutura só | 🔴 Alta |
| **Listas de Contatos** | ✅ ContactList/Item | ⚪ Não existe | 🟠 Média |
| **Tags em Tickets** | ✅ TicketTag M:N | 🟡 Array no ticket | ✅ OK |
| **Importação de Contatos** | ✅ ImportService | ⚪ Não existe | 🟠 Média |

---

## Models do Atendeon que Devemos Criar

### 1. **Filas de Atendimento** (Queue)
```typescript
// Atendeon: Queue.ts
{
  name: string,
  color: string,
  greetingMessage: string,        // Mensagem de boas-vindas
  outOfHoursMessage: string,      // Fora do expediente
  schedules: JSONB,               // Horários de funcionamento
  orderQueue: number,             // Ordem na distribuição
}
// Relacionamentos:
// - BelongsToMany → Users (UserQueue)
// - BelongsToMany → Whatsapps (WhatsappQueue)
```

**Sugestão para XOS:**
```sql
CREATE TABLE xos_queues (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20),
  greeting_message TEXT,
  out_of_hours_message TEXT,
  schedules JSONB, -- [{dayOfWeek: 1, startTime: "09:00", endTime: "18:00"}]
  order_priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE xos_queue_users (
  queue_id INTEGER REFERENCES xos_queues(id),
  user_id VARCHAR REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  PRIMARY KEY (queue_id, user_id)
);
```

### 2. **Notas Internas** (TicketNote)
```typescript
// Atendeon: TicketNote.ts
{
  note: string,
  userId: number,    // Quem escreveu
  contactId: number, // Sobre qual contato
  ticketId: number,  // Em qual ticket
}
```

**Sugestão para XOS:**
```sql
CREATE TABLE xos_internal_notes (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES xos_conversations(id),
  contact_id INTEGER REFERENCES xos_contacts(id),
  user_id VARCHAR REFERENCES users(id),
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. **Mensagens Rápidas** (QuickMessage)
```typescript
// Atendeon: QuickMessage.ts
{
  shortcode: string,  // Ex: "/preco", "/horario"
  message: string,
  mediaPath: string,  // Anexo opcional
  mediaName: string,
  userId: number,     // Dono da msg rápida
}
```

**Sugestão para XOS:**
```sql
CREATE TABLE xos_quick_messages (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  shortcode VARCHAR(50) NOT NULL, -- "/preco"
  title VARCHAR(200),
  content TEXT NOT NULL,
  media_url TEXT,
  media_type VARCHAR(30), -- image, file, audio
  scope VARCHAR(20) DEFAULT 'personal', -- personal, team, company
  user_id VARCHAR REFERENCES users(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. **Agendamento de Mensagens** (Schedule)
```typescript
// Atendeon: Schedule.ts
{
  body: string,       // Conteúdo da mensagem
  sendAt: Date,       // Quando enviar
  sentAt: Date,       // Quando foi enviada
  status: string,     // pending, sent, failed
  contactId: number,
  ticketId: number,
  mediaPath: string,
}
```

**Sugestão para XOS:**
```sql
CREATE TABLE xos_scheduled_messages (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  contact_id INTEGER REFERENCES xos_contacts(id),
  conversation_id INTEGER REFERENCES xos_conversations(id),
  content TEXT NOT NULL,
  media_url TEXT,
  media_type VARCHAR(30),
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, cancelled
  error_message TEXT,
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. **Tracking de Atendimento** (TicketTraking)
```typescript
// Atendeon: TicketTraking.ts
{
  ticketId: number,
  startedAt: Date,      // Início do atendimento
  queuedAt: Date,       // Quando entrou na fila
  finishedAt: Date,     // Quando finalizou
  ratingAt: Date,       // Quando foi avaliado
  chatbotAt: Date,      // Quando passou pelo bot
  rated: boolean,
}
```

**Sugestão para XOS:**
```sql
CREATE TABLE xos_conversation_tracking (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES xos_conversations(id) UNIQUE,
  queued_at TIMESTAMP,
  first_response_at TIMESTAMP,
  assigned_at TIMESTAMP,
  chatbot_ended_at TIMESTAMP,
  human_started_at TIMESTAMP,
  resolved_at TIMESTAMP,
  rated_at TIMESTAMP,
  rating_score INTEGER, -- 1-5
  rating_comment TEXT,
  total_duration_seconds INTEGER, -- calculado
  response_time_seconds INTEGER   -- calculado
);
```

### 6. **Conexões WhatsApp** (Whatsapp)
```typescript
// Atendeon: Whatsapp.ts
{
  name: string,
  session: string,           // Dados da sessão Baileys
  qrcode: string,            // QR code atual
  status: string,            // CONNECTED, DISCONNECTED, QR
  greetingMessage: string,
  farewellMessage: string,
  complationMessage: string, // Ao finalizar ticket
  ratingMessage: string,
  expiresTicket: number,     // Minutos para expirar
  expiresInactiveMessage: string,
  maxUseBotQueues: number,
}
```

**Sugestão para XOS:**
```sql
CREATE TABLE xos_whatsapp_connections (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  status VARCHAR(30) DEFAULT 'disconnected', -- connected, disconnected, qr_pending
  qr_code TEXT,
  session_data JSONB, -- Dados Baileys
  greeting_message TEXT,
  farewell_message TEXT,
  completion_message TEXT,
  rating_message TEXT,
  out_of_hours_message TEXT,
  ticket_expires_minutes INTEGER DEFAULT 1440, -- 24h
  inactive_message TEXT,
  is_default BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE xos_whatsapp_queue_links (
  whatsapp_id INTEGER REFERENCES xos_whatsapp_connections(id),
  queue_id INTEGER REFERENCES xos_queues(id),
  PRIMARY KEY (whatsapp_id, queue_id)
);
```

---

## Services do Atendeon para Referência

### Distribuição de Tickets
O Atendeon usa o conceito de **Filas** para distribuir leads:

```typescript
// FindOrCreateTicketService.ts (simplificado)
const ticket = await Ticket.create({
  contactId,
  whatsappId,
  status: "pending",  // Aguardando na fila
  queueId: defaultQueue.id,
  // NÃO atribui userId ainda - fica na fila
});

// UpdateTicketService.ts - Quando atendente pega o ticket
ticket.userId = attendantId;
ticket.status = "open";
```

### Lógica de Round-Robin
```typescript
// Distribui entre usuários da fila
const usersInQueue = await UserQueue.findAll({
  where: { queueId },
  include: [{ model: User, where: { online: true }}]
});

// Pega o próximo da lista (round-robin)
const nextUser = usersInQueue[currentIndex % usersInQueue.length];
```

### Chatbot com Opções
```typescript
// QueueOption.ts - Menu do chatbot
{
  title: string,       // "Vendas"
  option: string,      // "1"
  message: string,     // Resposta quando selecionar
  parentId: number,    // Para sub-menus
  queueId: number,
}
```

---

## Plano de Implementação

### Fase 1: Estrutura Base (1-2 semanas)
1. ✅ Criar tabelas: `xos_queues`, `xos_queue_users`
2. ✅ Criar tabelas: `xos_internal_notes`, `xos_quick_messages`
3. ✅ Criar tabelas: `xos_scheduled_messages`
4. ✅ Criar tabelas: `xos_conversation_tracking`
5. ✅ Atualizar APIs XOS com novos endpoints

### Fase 2: Distribuição de Leads (1 semana)
1. Implementar lógica de filas
2. Round-robin entre atendentes
3. Status: pending → open → resolved

### Fase 3: Integração WhatsApp (2-3 semanas)
1. Criar `xos_whatsapp_connections`
2. Integrar Baileys existente do projeto
3. Sincronizar mensagens com `xos_messages`
4. QR Code e gestão de sessões

### Fase 4: Features Avançadas (2 semanas)
1. Chatbot com menu de opções
2. Horário de funcionamento
3. Mensagens automáticas
4. Sistema de avaliação

---

## Código que Podemos Reutilizar

### 1. `wbotMessageListener.ts` (62KB)
- Lógica completa de recebimento de mensagens
- Tratamento de mídia (áudio, imagem, vídeo)
- Integração com OpenAI
- Fluxo de chatbot

### 2. `providers.ts` (79KB)
- Abstração do Baileys
- Gestão de sessões
- Envio de mensagens

### 3. `UpdateTicketService.ts`
- Lógica de transferência entre filas
- Tracking de tempos
- Notificações

### 4. `CampaignService/`
- Disparo em massa
- Agendamento
- Estatísticas

---

## Comparativo Final

| Aspecto | Atendeon | XOS |
|---------|----------|-----|
| **Foco** | WhatsApp CRM puro | Plataforma multi-propósito |
| **Multi-tenant** | Por company | Por tenant |
| **ORM** | Sequelize | Drizzle |
| **Real-time** | Socket.IO | Socket.IO |
| **WhatsApp** | Baileys integrado | Baileys separado |
| **AI** | OpenAI básico | Manus Agent completo |
| **Código** | ~500 arquivos | Integrado na Suite |

### Vantagens do Atendeon
- Sistema maduro e testado
- Lógica de filas pronta
- Chatbot funcional

### Vantagens do XOS
- Arquitetura mais moderna
- IA mais avançada (Manus)
- Integração com ERP
- Multi-canal nativo

---

## Recomendação

**Estratégia:** Não copiar código diretamente, mas **usar como referência** para:

1. **Schema de dados** → Adaptar models do Atendeon para Drizzle/PostgreSQL
2. **Lógica de negócio** → Implementar distribuição de leads similar
3. **Fluxos de chatbot** → Replicar QueueOption para menus
4. **Tracking** → Copiar conceito de TicketTraking

**Estimativa de Desenvolvimento:**
- Estrutura básica: 2-3 semanas
- Integração WhatsApp: 2-3 semanas
- Features completas: 4-6 semanas

**Total:** ~2 meses para paridade com Atendeon

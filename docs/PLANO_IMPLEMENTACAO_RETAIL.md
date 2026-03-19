# Plano de Implementação - Módulo Retail (Loja de Celular e Assistência Técnica)

**Versão:** 1.1  
**Data:** Janeiro 2026  
**Status:** Em Desenvolvimento

---

## 0. Requisitos Especiais Identificados

### 0.1 Fluxo Trade-In → O.S. Interna → Estoque

Quando um aparelho Trade-In é aprovado para aquisição, deve:
1. Criar automaticamente uma **Ordem de Serviço Interna** para revisão/manutenção
2. Ao finalizar a O.S., o aparelho entra no **estoque como produto normal**
3. O estoque deve **diferenciar a origem**: Trade-In vs Fornecedor

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   TRADE-IN      │     │   O.S. INTERNA    │     │    ESTOQUE      │
│   (Avaliação)   │ ──→ │   (Revisão)       │ ──→ │   (Disponível)  │
└─────────────────┘     └───────────────────┘     └─────────────────┘
     │                        │                        │
     ▼                        ▼                        ▼
 • Checklist OK           • Limpeza                • Origem: Trade-In
 • Valor acordado         • Teste funcional        • Custo: valor + OS
 • Assinatura             • Troca peças?           • Preço venda
 • Documento legal        • Laudo técnico          • IMEI rastreado
```

### 0.2 Cadastro Unificado de Pessoas

Uma única tabela de **Pessoas** com múltiplos papéis:
- Cliente
- Fornecedor
- Colaborador/Funcionário
- Técnico
- Representante

```
┌─────────────────────────────────────────────────────────────────┐
│                      PESSOA (person)                            │
│  • id, nome, cpf_cnpj, email, telefone, endereço               │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ CLIENTE  │   │FORNECEDOR│   │COLABORADOR│
        │ (role)   │   │ (role)   │   │ (role)    │
        └──────────┘   └──────────┘   └──────────┘
```

---

## 1. Análise do Estado Atual

### 1.1 O Que Já Temos Implementado

| Módulo | Funcionalidade | Status | Observações |
|--------|----------------|--------|-------------|
| **Estrutura Base** | Schema de tabelas (mobile_devices, device_evaluations, service_orders, pos_sales, stock_transfers) | ✅ Completo | Alinhado com requisitos |
| **Lojas/Filiais** | CRUD de lojas (retail_stores) e armazéns (retail_warehouses) | ✅ Completo | Suporte multi-loja |
| **Dispositivos/IMEI** | Cadastro, busca por IMEI, listagem | ✅ Básico | Falta histórico (Kardex) |
| **Trade-In** | Avaliação com checklist customizável, termo de transferência, assinatura digital | ✅ Completo | Documento imprimível |
| **Ordens de Serviço** | CRUD básico, itens da OS | ✅ Parcial | Falta fluxo completo de status |
| **PDV** | Sessões, vendas básicas, itens | ✅ Parcial | Falta carrinho funcional no frontend |
| **Transferências** | Estrutura para transferência entre lojas | ✅ Parcial | Falta workflow completo |
| **Dashboard** | Estatísticas básicas | ✅ Básico | Pode ser expandido |

### 1.2 O Que Está Faltando (Gap Analysis)

| Requisito (Documento) | Status | Prioridade | Esforço |
|-----------------------|--------|------------|---------|
| Histórico completo de IMEI (Kardex) | ❌ Não implementado | Alta | Médio |
| Geração de etiquetas com código de barras | ❌ Não implementado | Alta | Baixo |
| Fluxo completo de status da O.S. | ⚠️ Parcial | Alta | Médio |
| Orçamentação automática | ❌ Não implementado | Alta | Médio |
| Notificação ao cliente (WhatsApp/SMS) | ⚠️ Integração existe | Média | Baixo |
| Portal público de consulta O.S. | ❌ Não implementado | Média | Baixo |
| PDV com carrinho funcional | ⚠️ Parcial | Alta | Alto |
| Validação IMEI na venda | ❌ Não implementado | Alta | Baixo |
| Baixa automática de peças | ❌ Não implementado | Alta | Médio |
| Separação estoque venda/reparo | ⚠️ Via warehouses | Média | Baixo |
| Impressão de recibos/comprovantes | ❌ Não implementado | Média | Médio |
| Relatórios específicos | ⚠️ Parcial (BI existe) | Média | Médio |

---

## 2. Arquitetura de Integração

### 2.1 Reutilização de Módulos Existentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCÁDIA SUITE (Base)                         │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Clientes (customers) → Usar cadastro existente             │
│  ✅ Produtos (products) → Usar cadastro existente               │
│  ✅ Fornecedores (suppliers) → Usar cadastro existente          │
│  ✅ Usuários/Funcionários (users) → Usar sistema de auth        │
│  ✅ WhatsApp (Baileys) → Integrar notificações                  │
│  ✅ ERPNext → Sincronizar dados quando conectado                │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MÓDULO RETAIL (Novo)                         │
├─────────────────────────────────────────────────────────────────┤
│  📱 Dispositivos (mobile_devices) → Controle por IMEI          │
│  🔧 Ordens de Serviço (service_orders) → Assistência Técnica   │
│  💰 PDV (pos_sales) → Ponto de Venda                            │
│  📦 Estoque Retail (via warehouses) → Peças e Aparelhos        │
│  🔄 Trade-In (device_evaluations) → Avaliação de usados        │
│  🏪 Multi-Loja (retail_stores) → Franquias                     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Fluxo de Status da O.S. (Implementar)

```
┌──────────┐    ┌────────────┐    ┌───────────┐    ┌────────────────────┐
│  ABERTA  │ → │ DIAGNÓSTICO│ → │ ORÇAMENTO │ → │ AGUARDANDO_APROVAÇÃO│
└──────────┘    └────────────┘    └───────────┘    └────────────────────┘
                                                            │
                    ┌───────────────────────────────────────┴────┐
                    ▼                                            ▼
            ┌────────────┐                              ┌────────────┐
            │  RECUSADA  │                              │  APROVADA  │
            └────────────┘                              └────────────┘
                                                              │
                    ┌─────────────────────────────────────────┘
                    ▼
            ┌─────────────────┐    ┌───────────┐    ┌──────────┐
            │ AGUARDANDO_PECA │ ← │ EM_REPARO │ → │ QUALIDADE │
            └─────────────────┘    └───────────┘    └──────────┘
                                                          │
                                                          ▼
                                        ┌─────────────────────────┐
                                        │ AGUARDANDO_RETIRADA     │
                                        └─────────────────────────┘
                                                          │
                                                          ▼
                                                  ┌─────────────┐
                                                  │ FINALIZADA  │
                                                  └─────────────┘
```

---

## 3. Plano de Implementação por Fases

### Fase 0: Estrutura Base - Pessoas e Trade-In Flow (Semana 0-1) ⭐ PRIORIDADE

#### 0.1 Cadastro Unificado de Pessoas
- [ ] Criar tabela `persons` com campos base (nome, cpf_cnpj, email, telefone, endereço)
- [ ] Criar tabela `person_roles` (person_id, role_type, dados específicos do papel)
- [ ] Tipos de papel: `customer`, `supplier`, `employee`, `technician`, `partner`
- [ ] API CRUD `/persons` com filtro por papel
- [ ] Migrar referências de customers/suppliers para usar persons
- [ ] UI unificada de cadastro de pessoas com seleção de papéis

#### 0.2 Fluxo Trade-In → O.S. Interna → Estoque
- [ ] Adicionar campo `origin_type` em mobile_devices (trade_in, supplier, internal)
- [ ] Adicionar campo `is_internal` em service_orders para diferenciar OS cliente vs interna
- [ ] Criar trigger automático: ao aprovar Trade-In → criar O.S. Interna
- [ ] O.S. Interna com tipo: revisão, limpeza, manutenção preventiva
- [ ] Ao finalizar O.S. Interna → criar dispositivo no estoque
- [ ] Calcular custo total: valor_trade_in + custo_os
- [ ] Sugerir preço de venda baseado em margem configurável
- [ ] UI de acompanhamento do fluxo Trade-In completo

#### 0.3 Diferenciação de Estoque por Origem
- [ ] Campo `acquisition_type` em mobile_devices: trade_in, purchase, consignment
- [ ] Campo `acquisition_cost` (custo de aquisição)
- [ ] Campo `related_evaluation_id` (link com avaliação Trade-In)
- [ ] Campo `related_service_order_id` (link com O.S. de revisão)
- [ ] Filtros no estoque por origem
- [ ] Relatório de margem por origem

### Fase 1: Completar o Núcleo (Semana 2-3)

#### 1.1 Histórico de IMEI (Kardex)
- [ ] Criar tabela `imei_history` no schema
- [ ] API para registrar movimentações automáticas
- [ ] Endpoint GET `/devices/:imei/history`
- [ ] UI de visualização do histórico do dispositivo

#### 1.2 Fluxo Completo de O.S.
- [ ] Atualizar enum de status conforme fluxograma
- [ ] API PATCH `/service-orders/:id/status` com validação de transições
- [ ] Registrar automaticamente em `imei_history`
- [ ] UI com workflow visual de status
- [ ] Diferenciar O.S. Cliente vs O.S. Interna na listagem

#### 1.3 Orçamentação
- [ ] API POST `/service-orders/:id/generate-quote`
- [ ] Cálculo automático baseado em itens adicionados
- [ ] UI para adicionar peças/serviços e visualizar orçamento
- [ ] Impressão de orçamento

#### 1.4 Geração de Etiquetas
- [ ] API GET `/devices/:imei/label` retornando PDF
- [ ] Incluir código de barras (IMEI + número OS)
- [ ] Botão de impressão na tela de dispositivo/OS

### Fase 2: PDV Funcional (Semana 3-4)

#### 2.1 Carrinho de Vendas
- [ ] Componente de carrinho no frontend
- [ ] Busca de produtos por código/nome
- [ ] Leitura de IMEI para aparelhos
- [ ] Validação de IMEI disponível para venda

#### 2.2 Integração Venda + O.S.
- [ ] Adicionar O.S. finalizada como item da venda
- [ ] Baixa automática de peças no fechamento da OS

#### 2.3 Formas de Pagamento
- [ ] UI para múltiplas formas de pagamento
- [ ] Cálculo de troco
- [ ] Integração Trade-In como forma de pagamento

#### 2.4 Recibos e Comprovantes
- [ ] Geração de recibo de venda (impressão)
- [ ] Comprovante de entrega de OS

### Fase 3: Automação e Comunicação (Semana 5-6)

#### 3.1 Notificações ao Cliente
- [ ] Integrar com WhatsApp existente (Baileys)
- [ ] Templates de mensagem: orçamento pronto, OS pronta, lembrete
- [ ] API POST `/service-orders/:id/notify-customer`
- [ ] Histórico de notificações enviadas

#### 3.2 Portal do Cliente (Público)
- [ ] Rota pública GET `/public/os/:orderNumber`
- [ ] Página simples de consulta de status
- [ ] QR Code na etiqueta/recibo

#### 3.3 Relatórios Específicos
- [ ] OS por período/técnico/status
- [ ] Vendas por vendedor/produto/período
- [ ] Tempo médio de reparo
- [ ] Peças mais utilizadas

### Fase 4: Estoque Avançado (Semana 7-8)

#### 4.1 Separação Estoque Venda/Reparo
- [ ] Categorização de warehouses (tipo: venda/reparo)
- [ ] Regras de transferência entre tipos
- [ ] Alertas de estoque mínimo por categoria

#### 4.2 Baixa Automática de Peças
- [ ] Trigger ao finalizar reparo
- [ ] Reserva de peças ao aprovar OS
- [ ] Liberação se OS cancelada

#### 4.3 Inventário por IMEI
- [ ] Listagem de aparelhos em estoque por IMEI
- [ ] Localização física (prateleira/loja)
- [ ] Tempo em estoque

---

## 4. APIs a Implementar

### 4.0 Módulo Pessoas (Prioridade Máxima) ⭐

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| GET | `/persons` | Listar pessoas (filtro por papel) | ❌ Fazer |
| POST | `/persons` | Criar pessoa | ❌ Fazer |
| GET | `/persons/:id` | Detalhes da pessoa | ❌ Fazer |
| PUT | `/persons/:id` | Atualizar pessoa | ❌ Fazer |
| POST | `/persons/:id/roles` | Adicionar papel à pessoa | ❌ Fazer |
| DELETE | `/persons/:id/roles/:role` | Remover papel | ❌ Fazer |
| GET | `/persons/search?q=` | Buscar por nome/CPF | ❌ Fazer |

### 4.1 Módulo Trade-In Flow (Prioridade Máxima) ⭐

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| POST | `/evaluations/:id/approve-and-process` | Aprovar e criar O.S. Interna | ❌ Fazer |
| GET | `/evaluations/:id/full-flow` | Status completo do fluxo | ❌ Fazer |
| POST | `/service-orders/:id/finalize-internal` | Finalizar OS e criar no estoque | ❌ Fazer |

### 4.2 Módulo IMEI (Prioridade Alta)

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| GET | `/devices/:imei/history` | Histórico completo (Kardex) | ❌ Fazer |
| GET | `/devices/:imei/label` | Gerar etiqueta PDF | ❌ Fazer |
| PATCH | `/devices/:id/status` | Atualizar status c/ registro | ❌ Fazer |
| GET | `/devices?origin=trade_in` | Filtrar por origem | ❌ Fazer |

### 4.3 Módulo O.S. (Prioridade Alta)

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| POST | `/service-orders/:id/generate-quote` | Gerar orçamento | ❌ Fazer |
| PATCH | `/service-orders/:id/status` | Workflow de status | ⚠️ Melhorar |
| POST | `/service-orders/:id/notify-customer` | Enviar notificação | ❌ Fazer |
| GET | `/public/os/:orderNumber` | Consulta pública | ❌ Fazer |
| GET | `/service-orders?is_internal=true` | Filtrar OS internas | ❌ Fazer |

### 4.4 Módulo Vendas (Prioridade Alta)

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| POST | `/sales/validate-imei` | Validar IMEI para venda | ❌ Fazer |
| GET | `/sales/:id/receipt` | Gerar recibo PDF | ❌ Fazer |

### 4.5 Módulo Estoque (Prioridade Média)

| Método | Endpoint | Descrição | Status |
|--------|----------|-----------|--------|
| POST | `/inventory/:id/decrease` | Baixar do estoque | ❌ Fazer |
| GET | `/inventory/low-stock` | Itens abaixo do mínimo | ❌ Fazer |
| GET | `/inventory/by-origin` | Relatório por origem | ❌ Fazer |

---

## 5. Componentes de UI a Criar/Melhorar

### 5.0 Componentes Novos - Fase 0 ⭐

| Componente | Descrição | Prioridade |
|------------|-----------|------------|
| `PersonForm` | Cadastro unificado de pessoas com seleção de papéis | Máxima |
| `PersonSearch` | Busca de pessoas por nome/CPF com indicador de papéis | Máxima |
| `TradeInFlowTracker` | Acompanhamento visual: Avaliação → O.S. → Estoque | Máxima |
| `InternalServiceOrder` | Formulário de O.S. interna (revisão/manutenção) | Máxima |
| `DeviceOriginBadge` | Badge indicando origem (Trade-In / Fornecedor) | Alta |

### 5.1 Novos Componentes - Outras Fases

| Componente | Descrição | Prioridade |
|------------|-----------|------------|
| `IMEIHistory` | Timeline de movimentações do IMEI | Alta |
| `ServiceOrderWorkflow` | Painel visual de status da OS | Alta |
| `QuoteGenerator` | Formulário de orçamentação | Alta |
| `POSCart` | Carrinho do PDV funcional | Alta |
| `PaymentMethods` | Seletor de formas de pagamento | Alta |
| `ReceiptPreview` | Visualização/impressão de recibos | Média |
| `LabelPrint` | Impressão de etiquetas | Média |
| `CustomerPortal` | Página pública de consulta | Média |
| `NotificationHistory` | Histórico de mensagens enviadas | Baixa |

### 5.2 Melhorias em Componentes Existentes

| Componente | Melhoria | Prioridade |
|------------|----------|------------|
| `ArcadiaRetail.tsx` | Adicionar carrinho no PDV | Alta |
| Aba Estoque | Filtrar por origem (Trade-In/Fornecedor) | Alta |
| Aba Estoque | Separar por tipo (venda/reparo) | Média |
| Aba Serviços | Workflow visual de status | Alta |
| Aba Serviços | Diferenciar O.S. Cliente vs O.S. Interna | Alta |
| Aba Trade-In | Botão "Aprovar e Processar" com fluxo completo | Alta |
| Dashboard | KPIs específicos do negócio | Média |

---

## 6. Estimativa de Esforço

| Fase | Duração | Complexidade | Dependências |
|------|---------|--------------|--------------|
| **Fase 0 - Pessoas + Trade-In Flow** | 1-2 semanas | Alta | Nenhuma |
| Fase 1 - Núcleo (IMEI, OS, Orçamento) | 2 semanas | Média | Fase 0 |
| Fase 2 - PDV | 2 semanas | Alta | Fase 1 |
| Fase 3 - Automação | 2 semanas | Média | Fase 1, WhatsApp |
| Fase 4 - Estoque Avançado | 2 semanas | Média | Fases 1-2 |

**Total Estimado:** 8-10 semanas para MVP completo

---

## 7. Schema de Dados - Novas Tabelas

### 7.1 Tabela `persons` (Pessoas Unificadas)

```sql
CREATE TABLE persons (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  full_name VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(20) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  phone2 VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  birth_date DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7.2 Tabela `person_roles` (Papéis da Pessoa)

```sql
CREATE TABLE person_roles (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES persons(id) NOT NULL,
  role_type VARCHAR(20) NOT NULL, -- customer, supplier, employee, technician, partner
  -- Campos específicos por papel
  credit_limit NUMERIC(12,2), -- para customer
  payment_terms VARCHAR(50), -- para supplier
  employee_code VARCHAR(20), -- para employee
  commission_rate NUMERIC(5,2), -- para employee/technician
  hire_date DATE, -- para employee
  specialization VARCHAR(100), -- para technician
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7.3 Campos Adicionais em `mobile_devices`

```sql
ALTER TABLE mobile_devices ADD COLUMN acquisition_type VARCHAR(20) DEFAULT 'purchase';
-- Valores: trade_in, purchase, consignment, internal_transfer
ALTER TABLE mobile_devices ADD COLUMN acquisition_cost NUMERIC(12,2);
ALTER TABLE mobile_devices ADD COLUMN related_evaluation_id INTEGER REFERENCES device_evaluations(id);
ALTER TABLE mobile_devices ADD COLUMN related_service_order_id INTEGER REFERENCES service_orders(id);
ALTER TABLE mobile_devices ADD COLUMN person_id INTEGER REFERENCES persons(id); -- substituir supplier_id
```

### 7.4 Campos Adicionais em `service_orders`

```sql
ALTER TABLE service_orders ADD COLUMN is_internal BOOLEAN DEFAULT false;
ALTER TABLE service_orders ADD COLUMN internal_type VARCHAR(30); -- revision, cleaning, maintenance
ALTER TABLE service_orders ADD COLUMN source_evaluation_id INTEGER REFERENCES device_evaluations(id);
```

### 7.5 Tabela `imei_history` (Kardex do IMEI)

```sql
CREATE TABLE imei_history (
  id SERIAL PRIMARY KEY,
  device_id INTEGER REFERENCES mobile_devices(id) NOT NULL,
  action VARCHAR(50) NOT NULL,
  -- entrada, venda, devolucao, transferencia, reparo_iniciado, reparo_finalizado, trade_in_aprovado
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  related_order_id INTEGER, -- pode ser OS, venda, transferência
  related_order_type VARCHAR(20), -- service_order, sale, transfer, evaluation
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. Próximos Passos Imediatos

1. **Criar tabela `imei_history`** para rastreamento completo
2. **Implementar API de histórico** GET `/devices/:imei/history`
3. **Melhorar fluxo de status** da O.S. com validações
4. **Criar componente de carrinho** funcional no PDV
5. **Implementar geração de orçamento** automático

---

## 8. Integrações Existentes a Utilizar

| Sistema | Uso | Status |
|---------|-----|--------|
| ERPNext | Sincronizar clientes, produtos, fornecedores | ✅ Conectado |
| WhatsApp (Baileys) | Notificações ao cliente | ✅ Disponível |
| OpenAI | Sugestões inteligentes | ✅ Disponível |
| PostgreSQL | Banco de dados | ✅ Em uso |

---

*Este documento deve ser atualizado conforme o progresso da implementação.*

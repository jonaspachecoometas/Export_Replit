                                    │
│  2️⃣ ANÁLISE TRIBUTÁRIA (Estruturante)                        │
│     • Simulações de regime                                   │
│     • Comparativos                                           │
│     • Identificação de créditos                              │
│     • Alertas de risco                                       │
│                                                              │
│  3️⃣ PLANEJAMENTO (Governança)                                │
│     • Dashboard de impostos                                  │
│     • Projeções                                              │
│     • Compliance check                                       │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 RH

```
RECEBE              AJUSTA              ANALISA            SIMULA
─────────────────────────────────────────────────────────────────────
• Estrutura org.    • Alocação custo    • Custo real       • CLT × PJ
• Colaboradores     • Tipo despesa      • Produtividade    • Cenários
• Eventos           • Aprovar férias    • Competências     • Headcount
```

---

## 5. O MANUS (AGENTE CENTRAL)

### 5.1 Posição na Arquitetura

O Manus **não está em uma camada**. Ele **permeia todas**:

```
                    ┌─────────────┐
                    │   MANUS     │
                    │  (vê tudo)  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
    Apps Core      Estruturantes        Execução
```

### 5.2 Capacidades

| Capacidade | Descrição |
|------------|-----------|
| **Observação** | Acesso a todos os dados via Knowledge Graph |
| **Raciocínio** | Conecta pontos, identifica padrões |
| **Ação** | Alerta, sugere, prepara, executa (com limites) |
| **Aprendizado** | Melhora com cada interação |

### 5.3 Níveis de Autonomia

| Nível | O Que Faz | Exemplo |
|-------|-----------|---------|
| Informar | Notifica | "Estoque crítico de iPhone 13" |
| Sugerir | Propõe ação | "Sugiro pedir 10 unidades" |
| Preparar | Cria rascunho | "Preparei o pedido, quer enviar?" |
| Executar | Age (se autorizado) | "Enviei o pedido automaticamente" |

### 5.4 Limites do Manus

| Ação | Autonomia |
|------|-----------|
| Alertar | ✅ Sempre |
| Sugerir | ✅ Sempre |
| Criar rascunho | ✅ Sempre |
| Enviar mensagem | 🔶 Configurável |
| Criar pedido | 🔶 Configurável |
| Aprovar pagamento | ❌ Nunca |
| Excluir dados | ❌ Nunca |

---

## 6. SISTEMA DE AUTOMAÇÕES

### 6.1 Relação com o Manus

```
MANUS (Cérebro)
      │
      ▼
AUTOMAÇÕES (Sistema Nervoso)
      │
      ▼
MÓDULOS (Órgãos)
```

### 6.2 Três Níveis de Ação

| Nível | Quem Decide | Quem Executa |
|-------|-------------|--------------|
| Manual | Humano | Humano |
| Automação | Regra pré-definida | Sistema |
| Agêntico | Manus (IA) | Sistema |

### 6.3 Exemplo de Fluxo

```
EVENTO: Cliente comprou iPhone 14 por R$ 4.500

1. AUTOMAÇÃO (regra fixa)
   IF venda > R$1.000 THEN enviar_email_agradecimento
   → Executa automaticamente

2. MANUS (inteligência)
   "Este cliente comprou 3x nos últimos 60 dias.
    Sugestão: Criar programa VIP."
   → Sugere ao vendedor

3. MANUS + AUTOMAÇÃO (híbrido)
   Manus cria nova automação:
   "Clientes com 3+ compras em 60 dias → convite VIP"
```

---

## 7. CONCEITO DE APPS

### 7.1 Analogia

| Smartphone | Arcádia Suite |
|------------|---------------|
| iOS/Android | Arcádia Core |
| Apps nativos | Módulos Core |
| Apps instaláveis | Apps complementares |
| App Store | Arcádia Marketplace |
| Siri/Assistant | Manus |

### 7.2 Tipos de Apps

```
┌─────────────────────────────────────────────────────────────┐
│                      TIPOS DE APPS                           │
│                                                              │
│  CORE (Sempre presentes)                                     │
│  └── Financeiro, Contábil, Fiscal, RH, Comunicação, BI       │
│                                                              │
│  EXECUÇÃO (Por modelo de negócio)                            │
│  └── Retail, Serviços, Produção, Logística, Food             │
│                                                              │
│  COMPLEMENTARES (Funções extras)                             │
│  └── LMS, Marketing, CRM, Documentos, Agenda, OKRs           │
│                                                              │
│  SEGMENTO (Verticais específicas)                            │
│  └── Eng. Ambiental, Jurídico, Saúde, Agro, Construção       │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Comunicação Entre Apps (Event Bus)

```
App Retail ──────┐
                 │
App Marketing ───┼───► EVENTO: "sale.completed"
                 │           │
App LMS ─────────┘           ▼
                      ┌──────────────┐
                      │ Quem escuta: │
                      │ • Financeiro │ → Gera recebível
                      │ • Fiscal     │ → Emite NF-e
                      │ • CRM        │ → Atualiza cliente
                      │ • Marketing  │ → Envia email
                      │ • Manus      │ → Analisa padrão
                      └──────────────┘
```

---

## 8. CAMADA DE CONSULTORIA

### 8.1 Módulos

| Módulo | Função | Usuários |
|--------|--------|----------|
| **Process Compass** | Diagnóstico, mapeamento, roadmap | Consultores, gestores |
| **Produção** | Gestão de projetos de implementação | Gestores de projeto |
| **Suporte** | Atendimento e resolução | Equipe de suporte |

### 8.2 Modelo de Acesso

| Perfil | Vê Consultoria? | Vê Cliente? |
|--------|-----------------|-------------|
| Usuário final | ❌ | ✅ Só seu tenant |
| Gestor empresa | ❌ | ✅ Só seu tenant |
| Consultor Arcádia | ✅ | ✅ Todos os clientes |
| Parceiro | ✅ | ✅ Seus clientes |
| Gestor avançado | ✅ (Process Compass) | ✅ Seu tenant |

---

## 9. CAMADA DE PLATAFORMA

### 9.1 Componentes

| Componente | Direção | Função |
|------------|---------|--------|
| **Central API** | Arcádia → Mundo | Orquestra conexões de saída |
| **Hub API** | Mundo → Arcádia | Expõe dados para parceiros |
| **MCP/A2A** | IAs ↔ Arcádia | Protocolo agêntico |
| **Ciência Dados** | Interno | Cria modelos de IA |
| **IDE** | Interno | Desenvolve extensões |

### 9.2 Protocolos Agênticos (Já Implementados)

| Protocolo | Endpoint | Status |
|-----------|----------|--------|
| MCP | `/api/mcp/v1/tools` | ✅ 56 ferramentas |
| A2A | `/.well-known/agent.json` | ✅ Funcionando |
| Knowledge Graph | Interno | ✅ Funcionando |
| Learning System | Interno | ✅ Funcionando |

---

## 10. INTEGRAÇÃO COM ESCRITÓRIO CONTÁBIL

### 10.1 Modelo de Três Níveis

```
EMPRESA (Operação)
    ↓ gera fatos
ARCÁDIA (Retaguarda Inteligente)
    ↓ dados pré-classificados
ESCRITÓRIO PARCEIRO (Execução Legal)
```

### 10.2 Fluxo Bidirecional

```
┌─────────────────┐         ┌─────────────────┐
│    ARCÁDIA      │ ──API──→│   ESCRITÓRIO    │
│                 │         │                 │
│  Envia:         │         │  Recebe:        │
│  - Lançamentos  │         │  - Dados prontos│
│  - Notas        │         │  - Classificados│
│  - Eventos RH   │         │                 │
│                 │ ←─API── │  Retorna:       │
│  Recebe:        │         │  - Status       │
│  - Validações   │         │  - Alertas      │
│  - Obrigações OK│         │  - Pendências   │
└─────────────────┘         └─────────────────┘
```

### 10.3 Integrações Prioritárias

1. Domínio Sistemas (Thomson Reuters)
2. Alterdata
3. Fortes
4. Prosoft
5. Questor

---

## 11. ARCÁDIA PLUS (Motor ERP Laravel)

### 11.1 Visão Geral

O **Arcádia Plus** é o ERP canônico desenvolvido em PHP/Laravel, funcionando como um "lote dentro da cidade" Arcádia Suite.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    🏙️ CIDADE ARCÁDIA SUITE                       │
│                                                                  │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│    │ Retail  │  │ Fisco   │  │  Manus  │  │   BI    │          │
│    │  🏠     │  │  🏠     │  │  🏠     │  │  🏠     │          │
│    └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
│                                                                  │
│    ═══════════════════════════════════════════════════          │
│                        🛣️ AVENIDA API                            │
│    ═══════════════════════════════════════════════════          │
│                                                                  │
│    ┌─────────────────────────────────────────────────┐          │
│    │                                                  │          │
│    │           🏭 LOTE ARCÁDIA PLUS                   │          │
│    │              (Laravel/PHP)                       │          │
│    │                                                  │          │
│    │   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │          │
│    │   │Comp │ │Estoq│ │Finan│ │ RH  │ │ NF-e│      │          │
│    │   │ras  │ │ ue  │ │eiro│ │     │ │     │      │          │
│    │   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │          │
│    │                                                  │          │
│    └─────────────────────────────────────────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Características do Plus

| Aspecto | Detalhe |
|---------|---------|
| **Stack** | PHP 8 + Laravel 10+ |
| **Banco** | MySQL (migração para PostgreSQL planejada) |
| **Fiscal** | phpnfe (NF-e/NFC-e) |
| **Multi-tenant** | SaaS pronto |
| **Origem** | GitHub (repositório existente) |

### 11.3 Modelo de Integração

```
                    USUÁRIO
                       │
                       ▼
              ┌────────────────┐
              │ Arcádia Suite  │
              │   (Frontend)   │
              └───────┬────────┘
                      │
                      ▼
              ┌────────────────┐
              │  Central API   │
              │  (Orquestrador)│
              └───────┬────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Retail  │  │  PLUS   │  │  Fisco  │
   │ (Node)  │  │(Laravel)│  │(Python) │
   └────┬────┘  └────┬────┘  └────┬────┘
        │            │            │
        ▼            ▼            ▼
   PostgreSQL     MySQL      PostgreSQL
```

### 11.4 Acesso via Rota `/plus`

O Plus é acessado transparentemente dentro do Suite:

```
arcadia.app/              → Cockpit
arcadia.app/retail        → Arcádia Retail
arcadia.app/erp           → Arcádia ERP
arcadia.app/plus          → Arcádia Plus (Laravel embutido)
arcadia.app/fisco         → Arcádia Fisco
```

**Implementação via Proxy Reverso:**

```typescript
// server/routes.ts
app.use('/plus', createProxyMiddleware({
  target: process.env.ARCADIA_PLUS_URL,
  changeOrigin: true,
  pathRewrite: { '^/plus': '' }
}));
```

### 11.5 Comunicação Suite ↔ Plus

```
SUITE (Orquestrador)              PLUS (Motor ERP)
────────────────────────────────────────────────────

1. Suite solicita dados
        │
        ▼
   GET /api/v1/customers ────────► Plus retorna JSON
                                         │
2. Plus executa operação                 │
        │                                │
        ▼                                ▼
   POST /api/v1/orders ◄──────── Suite envia pedido

3. Plus emite evento
        │
        ▼
   webhook: order.created ───────► Suite captura
                                         │
                                         ▼
                                 Knowledge Graph armazena
                                         │
                                         ▼
                                   Manus analisa
```

### 11.6 SSO (Login Único)

```
1. Usuário loga no Suite
2. Suite gera token JWT
3. Token é passado para o Plus via header
4. Plus valida e cria sessão Laravel
```

### 11.7 Desenvolvimento Unificado (Monorepo)

Após importação do GitHub, estrutura do workspace:

```
/arcadia-workspace
├── /suite                 # Node.js (atual)
│   ├── /client
│   ├── /server
│   └── package.json
│
├── /plus                  # Laravel (importado)
│   ├── /app
│   ├── /routes
│   ├── artisan
│   └── composer.json
│
├── /fisco                 # Python/FastAPI
│   └── main.py
│
└── workflows.json         # Orquestra todos os serviços
```

**Workflows Múltiplos:**

```yaml
Suite:  cd suite && npm run dev          # :5000
Plus:   cd plus && php artisan serve     # :8080
Fisco:  cd fisco && uvicorn main:app     # :8002
```

### 11.8 Roadmap de Integração

| Fase | Ação | Status |
|------|------|--------|
| 1 | Expor API REST no Plus | 🔶 Pendente |
| 2 | Criar conector na Central API | 🔶 Pendente |
| 3 | Implementar proxy `/plus` | 🔶 Pendente |
| 4 | SSO com JWT compartilhado | 🔶 Pendente |
| 5 | Importar código para Replit | 🔶 Pendente |
| 6 | Migração MySQL → PostgreSQL | 🔶 Futuro |

### 11.9 Benefícios da Abordagem

| Aspecto | Benefício |
|---------|-----------|
| **Risco** | Zero - Plus continua funcionando |
| **Tempo** | Rápido - Só precisa de API |
| **Custo** | Baixo - Não reescreve nada |
| **Evolução** | Gradual - Migra quando quiser |
| **Manus** | Vê tudo via Knowledge Graph |
| **IDE** | Desenvolve tudo no mesmo lugar |

---

## 12. REGRAS DE PROTEÇÃO (Não Quebrar)

| # | Regra |
|---|-------|
| 1 | Retail nunca vira ERP completo |
| 2 | Governança não executa |
| 3 | ERP não decide |
| 4 | Arcádia não lança (contabilmente) |
| 5 | Fonte da verdade é única (ERP) |
| 6 | Segmentação fora da Suite |
| 7 | Apps conversam por eventos |
| 8 | Manus nunca deleta dados |

---

## 13. DECISÕES PENDENTES

### 13.1 Arquitetura

| Decisão | Opções | Status |
|---------|--------|--------|
| Estoque: Arcádia ou ERPNext? | Híbrido sugerido | 🔶 Pendente |
| Fonte da verdade em conflito | ERPNext sempre | 🔶 Pendente |
| Offline para PDV | PWA com sync | 🔶 Pendente |

### 13.2 Produto

| Decisão | Opções | Status |
|---------|--------|--------|
| App mobile nativo | Sim/PWA | 🔶 Pendente |
| White label | Sim/Não | 🔶 Pendente |
| Modelo de pricing | Híbrido sugerido | 🔶 Pendente |

### 13.3 Compliance

| Decisão | Opções | Status |
|---------|--------|--------|
| LGPD | Implementar | 🔶 Pendente |
| Backup/DR | Definir SLA | 🔶 Pendente |

---

## 14. ROADMAP SUGERIDO

### Fase 1: Fundação ✅

- [x] Identity & Permissions
- [x] Event Bus básico
- [x] Retail Core
- [x] Integração ERPNext
- [x] MCP/A2A

### Fase 2: Estruturantes (Em Andamento)

- [ ] Financeiro completo
- [ ] Contábil completo
- [ ] Fiscal híbrido
- [ ] RH completo
- [ ] Integração escritório contábil

### Fase 3: Inteligência

- [ ] Knowledge Graph avançado
- [ ] Manus com autonomia configurável
- [ ] Ciência de Dados
- [ ] Automações visuais

### Fase 4: Escala

- [ ] Marketplace de Apps
- [ ] Apps de segmento
- [ ] Parceiros desenvolvedores
- [ ] White label

---

## 15. DIFERENCIAL COMPETITIVO

| ERP Tradicional | Arcádia Suite |
|-----------------|---------------|
| IA é add-on | IA é o núcleo |
| Módulos isolados | Tudo conectado (Knowledge Graph) |
| Executa operações | Governa decisões |
| Usuário navega módulos | Usuário trabalha em UX única |
| Automações manuais | Manus cria automações |
| Relatórios estáticos | Insights proativos |

---

## 16. GLOSSÁRIO

| Termo | Definição |
|-------|-----------|
| **Arcádia Suite** | Plataforma completa (sistema operacional empresarial) |
| **Arcádia Plus** | ERP canônico em Laravel, funciona como "lote" dentro da Suite |
| **Arcádia Retail** | Motor de varejo nativo (Node.js) |
| **Arcádia Fisco** | Motor fiscal híbrido (Python/FastAPI) |
| **Manus** | Agente autônomo central (consciência) |
| **Knowledge Graph** | Grafo de conhecimento que conecta todas as entidades |
| **Estruturante** | Módulo com autonomia para ajustar, não criar |
| **Motor** | Sistema que executa operações (Retail, ERP, Plus) |
| **App** | Funcionalidade modular instalável |
| **Event Bus** | Barramento de comunicação entre apps |
| **MCP** | Model Context Protocol (protocolo agêntico) |
| **A2A** | Agent to Agent Protocol |
| **Proxy Reverso** | Técnica para rotear `/plus` ao Laravel transparentemente |
| **Monorepo** | Estrutura onde Suite, Plus e Fisco ficam no mesmo workspace |

---

## 17. ANEXOS

### 17.1 Diagrama de Eventos Principais

```
sale.completed
    → Financeiro: gera recebível
    → Fiscal: emite NF-e
    → Estoque: baixa
    → CRM: atualiza cliente
    → Manus: analisa

service.completed
    → Financeiro: gera recebível
    → Comunicação: notifica cliente
    → Manus: aprende padrão

tradein.approved
    → Estoque: cria dispositivo
    → Financeiro: gera crédito cliente
    → Serviços: cria O.S. preparação

payment.received
    → Financeiro: baixa recebível
    → Contábil: lançamento
    → Manus: atualiza score cliente
```

### 17.2 Matriz de Responsabilidades

```
                    │ Decide │ Ajusta │ Executa │ Registra │
────────────────────┼────────┼────────┼─────────┼──────────┤
Suite (Cockpit)     │   ✅   │   ❌   │    ❌   │    ❌    │
Estruturantes       │   ✅   │   ✅   │    ❌   │    ❌    │
Retail              │   ❌   │   ❌   │    ✅   │    ❌    │
Fiscal (Emissão)    │   ❌   │   ❌   │    ✅   │    ❌    │
ERP                 │   ❌   │   ❌   │    ✅   │    ✅    │
Manus               │   ✅   │   ❌   │   🔶*   │    ❌    │

* Manus executa apenas ações configuradas como automáticas
```

---

**Documento mantido por:** Equipe Arcádia  
**Última atualização:** Janeiro 2026  
**Próxima revisão:** Após decisões pendentes

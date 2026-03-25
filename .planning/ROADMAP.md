# Roadmap: Arcádia Agentic Suite

## Overview

Evolução do Arcádia Suite de ERP tradicional para Sistema Agêntico Orientado a Objetos. Skills são objetos reutilizáveis (POO), Agentes instanciam Skills, Automações são composições orquestradas, Dev Center é a fábrica de agentes.

## Phases

- [x] **Phase 1: Fundação** - Infraestrutura base: submodules MiroFlow/OpenClaw, tabelas skills, Neo4j, ReferenceParser
- [~] **Phase 2: Skills Engine** - Skills criáveis e executáveis com editor Monaco e Marketplace
- [ ] **Phase 3: MiroFlow Embutido** - Análises científicas via agentes especializados + bridge Superset
- [ ] **Phase 4: OpenClaw Embutido** - Skills emergentes com detecção de padrões
- [ ] **Phase 5: Automation Fabric** - Automações unificadas (XOS + Central)
- [ ] **Phase 6: Dev Center Completo** - Fábrica de agentes: Design → Assemble → Deploy

## Phase Details

### Phase 1: Fundação
**Goal**: Infraestrutura base funcionando com submodules, banco, KG e parser de referências
**Depends on**: Nothing
**Success Criteria** (what must be TRUE):
  1. Submodules MiroFlow e OpenClaw clonados e inicializados
  2. Tabelas arcadia_skills e skill_executions existem no banco
  3. Neo4j rodando via docker-compose
  4. ReferenceParser parseia referências /skill/, /kg/, /file/ etc.

Plans:
- [x] 01-01: Submodules MiroFlow + OpenClaw
- [x] 01-02: Schema tabelas skills + migration
- [x] 01-03: Neo4j docker-compose + ReferenceParser

### Phase 2: Skills Engine
**Goal**: Skills criáveis, editáveis e executáveis com marketplace
**Depends on**: Phase 1
**Success Criteria** (what must be TRUE):
  1. SkillEngine.ts suporta herança, composição e polimorfismo
  2. API REST /skills CRUD funcionando
  3. Editor Monaco com autocomplete de referências (/)
  4. Skill Marketplace lista e filtra skills disponíveis
  5. Versionamento Git-like de skills implementado

Plans:
- [x] 02-01: SkillEngine + API REST
- [x] 02-02: Editor Monaco + autocomplete + rota /skills
- [x] 02-03: Skill Marketplace (Biblioteca)
- [ ] 02-04: Versionamento Git-like de skills

### Phase 3: MiroFlow Embutido
**Goal**: Análises científicas disponíveis via agentes especializados integrados ao Superset
**Depends on**: Phase 2
**Success Criteria** (what must be TRUE):
  1. MiroFlow configurado para Ollama local com modelos até 14B
  2. Agente Statistician analisa dados SQL com deepseek-r1:14b
  3. Agente Fiscal Auditor valida NFe/SPED com deepseek-r1:14b
  4. Agente Researcher consulta KG com llama3.1:8b
  5. Endpoint POST /api/miroflow/analyze retorna análise estruturada
  6. MiroFlowControl.tsx toggle "Modo Científico" aparece no Superset
  7. Execuções registradas com imutabilidade no KG

**Plans**: 3 planos

Plans:
- [x] 03-01-PLAN.md — Setup (ollama pull llama3.1:8b) + miroflow_service.py FastAPI porta 8006 com 3 agentes
- [x] 03-02-PLAN.md — Node bridge (engine-proxy.ts + routes.ts) + KG logging SHA-256
- [ ] 03-03-PLAN.md — Frontend MiroFlowControl.tsx + tab "Científico" em BiWorkspace.tsx

### Phase 4: OpenClaw Embutido
**Goal**: Skills emergentes criadas automaticamente a partir de padrões detectados
**Depends on**: Phase 3
**Success Criteria** (what must be TRUE):
  1. PatternDetector detecta padrões (min 3 ocorrências, 30 dias, 80% confiança)
  2. Skills emergentes criadas como DRAFT aguardando aprovação
  3. Widget flutuante notifica usuário de sugestões
  4. Fluxo completo: Padrão → DRAFT → Dev Center aprovação
**Plans**: TBD

### Phase 5: Automation Fabric
**Goal**: Automações unificadas sob runtime único substituindo XOS + Central
**Depends on**: Phase 4
**Success Criteria** (what must be TRUE):
  1. 5 runtimes funcionando: WorkflowEngine, RuleEngine, AgentExecutor, ScheduleEngine, EventEngine
  2. Automações existentes do XOS migradas sem perda de dados
  3. Automações existentes do /automations Central migradas
  4. AutomationCenter.tsx lista todas as automações unificadas
**Plans**: TBD

### Phase 6: Dev Center Completo
**Goal**: Fábrica completa de agentes: Design → Assemble → Deploy
**Depends on**: Phase 5
**Success Criteria** (what must be TRUE):
  1. DesignStudio com modos UML, Visual Flow, Markdown Spec, Code Editor
  2. AssembleLine gera código via Blackboard (GeneratorAgent)
  3. OrchestrateCenter faz deploy, versionamento e monitoramento
  4. Galeria de agentes por tenant funcional
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fundação | 3/3 | Complete | 2026-03-25 |
| 2. Skills Engine | 3/4 | In progress | - |
| 3. MiroFlow Embutido | 2/3 | In Progress|  |
| 4. OpenClaw Embutido | 0/TBD | Not started | - |
| 5. Automation Fabric | 0/TBD | Not started | - |
| 6. Dev Center Completo | 0/TBD | Not started | - |

# Arcádia Suite — Contexto para Claude

## Stack
- **Frontend:** React 18 + TypeScript + Tailwind + shadcn/ui
- **Backend:** Express.js + Socket.IO + Drizzle ORM
- **DB:** PostgreSQL 16 + pgvector
- **Microserviços Python:** FastAPI (portas 8001-8005)
- **Deploy:** Docker Compose + Coolify + PM2
- **Real-time:** Socket.IO

## Estrutura principal
```
server/
  manus/service.ts        # Agente principal (169KB, 30+ tools, ReAct pattern)
  autonomous/             # Pipeline multi-agente (Architect→CodeGen→Validator)
  blackboard/             # Coordenação de agentes
  python/                 # 8 microserviços Python (fisco, contabil, bi, etc.)
  learning/service.ts     # Knowledge management
  [modulo]/routes.ts      # 38 grupos de rotas (crm, erp, whatsapp, chat...)
client/                   # 66 páginas React
shared/schema.ts          # Schema do banco (7317 linhas, Drizzle ORM)
docker/
  litellm-config.yaml     # Roteamento de LLMs (TIER 1: LLMFit, TIER 2: Ollama, TIER 3: externos)
```

## Arquitetura de IA
```
Manus / Agents / Embeddings
        │  AI_INTEGRATIONS_OPENAI_BASE_URL
        ▼
   LiteLLM :4000  (gateway unificado, loga tudo no banco)
        ├──► LLMFit (TIER 1 — fine-tuned, soberano) [slot pronto, comentado]
        ├──► Ollama :11434 (TIER 2 — local, padrão)
        └──► OpenAI/Anthropic/Groq (TIER 3 — opt-in, só se API key configurada)
```

**Variáveis chave do Manus:**
```
AI_INTEGRATIONS_OPENAI_BASE_URL=http://litellm:4000/v1
AI_INTEGRATIONS_OPENAI_API_KEY=${LITELLM_API_KEY}
```

## Docs estratégicos
- `DOCUMENTATION.md` — docs técnicas completas
- `PLANO_EVOLUCAO_ARCADIA.md` — roadmap e evolução
- `MAPA_SISTEMA_ARCADIA.md` — mapa do sistema

## Branch de desenvolvimento
Sempre commitar em: `claude/analyze-project-0mXjP`
Push: `git push -u origin claude/analyze-project-0mXjP`

## O que está implementado
- ✅ Manus (agente autônomo, 30+ ferramentas)
- ✅ Pipeline de agentes autônomos
- ✅ Embeddings semânticos (pgvector)
- ✅ CRM, WhatsApp, Email, Chat
- ✅ ERP/ERPNext, Fiscal (NF-e, SPED), Contábil (DRE, balanço)
- ✅ BI workspace, Retail/POS, RH, Produtividade
- ✅ Docker dev + prod, LiteLLM gateway

## O que ainda falta
- ❌ LLMFit: slot pronto em `litellm-config.yaml`, só habilitar quando disponível
- ❌ Testes automatizados / CI-CD
- ❌ Monitoramento (APM, Sentry, métricas)
- ❌ Multi-tenancy completo
- ❌ Rate limiting em todos os endpoints (parcial)

## Comandos úteis
```bash
# Dev
docker compose up -d
docker compose --profile ai up litellm ollama -d

# Prod (Coolify)
docker compose -f docker-compose.prod.yml up -d

# Migrations
npm run db:push

# Build
npm run build
```

## Variáveis de ambiente críticas (ver .env.example)
```
SESSION_SECRET, SSO_SECRET          # gerar strings seguras em prod
AI_INTEGRATIONS_OPENAI_BASE_URL     # aponta para LiteLLM
LLMFIT_BASE_URL                     # LLMFit quando disponível
OLLAMA_BASE_URL                     # Ollama host ou container
OPENAI_API_KEY                      # opcional (soberania: deixar vazio)
```

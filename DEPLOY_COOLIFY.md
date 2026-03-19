# Deploy no Coolify — Arcádia Suite

> Guia completo para subir o Arcádia Suite no Coolify com Docker Compose.

---

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Arquitetura de Serviços](#arquitetura-de-serviços)
3. [Configuração no Coolify](#configuração-no-coolify)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Serviços Opcionais (Profiles)](#serviços-opcionais-profiles)
6. [Sequência de Inicialização](#sequência-de-inicialização)
7. [Traefik e HTTPS](#traefik-e-https)
8. [Volumes e Persistência](#volumes-e-persistência)
9. [Stack de IA (LiteLLM + Ollama)](#stack-de-ia-litellm--ollama)
10. [Pós-deploy](#pós-deploy)
11. [Checklist Final](#checklist-final)

---

## Pré-requisitos

- Coolify instalado e acessível (v4+)
- Docker Engine 24+ e Docker Compose v2+ no servidor
- Domínio apontando para o IP do servidor (`A record`)
- Mínimo recomendado: **4 vCPU, 8 GB RAM, 50 GB SSD**
- Para IA local (Ollama): **16 GB RAM, GPU opcional**

---

## Arquitetura de Serviços

```
Internet → Traefik (Coolify) → app:5000     → arcadia-internal
                              → open-webui:8080 (opcional)

arcadia-internal:
  db (PostgreSQL 16 + pgvector) :5432
  redis                          :6379
  app (Node.js/Express)          :5000
  embeddings (Python FastAPI)    :8001
  fisco (Python FastAPI)         :8002
  contabil (Python FastAPI)      :8003
  bi (Python FastAPI)            :8004
  automation (Python FastAPI)    :8005
  litellm (gateway LLM)          :4000   ← profile: ai
  ollama (modelos locais)        :11434  ← profile: ai
  superset (BI)                  :8088   ← profile: bi
  plus (Laravel/ERP)             :8080   ← profile: plus
  erpnext                        :8090   ← profile: erpnext
```

---

## Configuração no Coolify

### 1. Criar novo projeto

No painel Coolify: **New Project → Docker Compose**.

### 2. Apontar para o repositório

- **Source:** Git (GitHub/GitLab/Gitea)
- **Branch:** `main` (ou sua branch de produção)
- **Docker Compose file:** `docker-compose.prod.yml`

### 3. Definir o domínio

Em **Domains**, adicione `seu-dominio.com`. O Coolify irá automaticamente:
- Criar as rotas no Traefik
- Emitir certificado Let's Encrypt

---

## Variáveis de Ambiente

Configure todas no painel **Environment Variables** do Coolify (nunca no `.env` do repositório).

### Obrigatórias

```env
# Aplicação
NODE_ENV=production
PORT=5000
DOMAIN=seu-dominio.com
DOCKER_MODE=true

# Segredos — gerar com: openssl rand -hex 32
SESSION_SECRET=<gerado>
SSO_SECRET=<gerado>

# Banco de dados
PGHOST=db
PGPORT=5432
PGUSER=arcadia
PGPASSWORD=<senha-forte>
PGDATABASE=arcadia
DATABASE_URL=postgresql://arcadia:<senha>@db:5432/arcadia

# Redis
REDIS_URL=redis://redis:6379

# IA — LiteLLM gateway
LITELLM_API_KEY=<gerado>
AI_INTEGRATIONS_OPENAI_BASE_URL=http://litellm:4000/v1
AI_INTEGRATIONS_OPENAI_API_KEY=<mesmo-que-LITELLM_API_KEY>
OLLAMA_BASE_URL=http://ollama:11434

# Microserviços Python
PYTHON_SERVICE_URL=http://embeddings:8001
FISCO_PYTHON_URL=http://fisco:8002
CONTABIL_PYTHON_URL=http://contabil:8003
BI_PYTHON_URL=http://bi:8004
AUTOMATION_PYTHON_URL=http://automation:8005
```

### LLMs externos (opcionais — soberania: deixar em branco)

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GROQ_API_KEY=
LLMFIT_BASE_URL=    # habilitar quando LLMFit estiver disponível
```

### Superset — profile `bi`

```env
SUPERSET_SECRET_KEY=<openssl rand -hex 32>
SUPERSET_ADMIN_USER=admin
SUPERSET_ADMIN_EMAIL=admin@seu-dominio.com
SUPERSET_ADMIN_PASSWORD=<senha-forte>
SUPERSET_HOST=superset
SUPERSET_PORT=8088
```

### Arcádia Plus — profile `plus`

```env
SSO_PLUS_BASE_URL=http://plus:8080
PLUS_APP_KEY=<laravel-key>
PLUS_DB_ROOT_PASSWORD=<senha>
PLUS_DB_PASSWORD=<senha>
PLUS_DB_DATABASE=arcadia_plus
PLUS_DB_USER=plus
```

### ERPNext — profile `erpnext`

```env
ERPNEXT_PROXY_ENABLED=true
ERPNEXT_CONTAINER_HOST=erpnext
ERPNEXT_DB_ROOT_PASSWORD=<senha>
ERPNEXT_DB_PASSWORD=<senha>
ERPNEXT_ADMIN_PASSWORD=<senha>
ERPNEXT_URL=http://erpnext:8090
```

---

## Serviços Opcionais (Profiles)

O `docker-compose.prod.yml` usa profiles para habilitar serviços sob demanda.
No Coolify, adicione a variável de ambiente `COMPOSE_PROFILES`:

| O que habilitar | `COMPOSE_PROFILES` |
|---|---|
| Somente core | *(vazio)* |
| IA local (Ollama + LiteLLM + WebUI) | `ai` |
| Superset BI | `bi` |
| Arcádia Plus (Laravel ERP) | `plus` |
| ERPNext | `erpnext` |
| Tudo | `ai,bi,plus,erpnext` |

> **Atenção:** Ollama com modelos grandes (llama3.3, qwen2.5) pode consumir 10–20 GB de disco. Certifique-se de ter espaço no volume `ollama_models`.

---

## Sequência de Inicialização

Os `depends_on` garantem a ordem correta automaticamente:

```
1. db          → healthcheck: pg_isready (até 10 tentativas)
2. redis       → healthcheck: redis-cli ping
3. embeddings, fisco, contabil, bi, automation  → aguardam db healthy
4. litellm, ollama                              → aguardam redis (se profile ai)
5. app         → aguarda db healthy + redis started
6. open-webui, superset, plus, erpnext          → aguardam serviços base
```

Se um serviço falhar ao iniciar, cheque os logs:

```bash
# No servidor
docker compose -f docker-compose.prod.yml logs app --tail 50
docker compose -f docker-compose.prod.yml logs db --tail 50
```

---

## Traefik e HTTPS

O Coolify gerencia o Traefik. As labels já estão no `docker-compose.prod.yml`:

```yaml
# Serviço principal
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.arcadia.rule=Host(`${DOMAIN}`)"
  - "traefik.http.routers.arcadia.tls=true"
  - "traefik.http.routers.arcadia.tls.certresolver=letsencrypt"
  - "traefik.http.services.arcadia.loadbalancer.server.port=5000"

# Open WebUI (profile ai) — subdomínio ai.seu-dominio.com
labels:
  - "traefik.http.routers.webui.rule=Host(`ai.${DOMAIN}`)"
  - "traefik.http.routers.webui.tls=true"
  - "traefik.http.routers.webui.tls.certresolver=letsencrypt"
  - "traefik.http.services.webui.loadbalancer.server.port=8080"
```

Certifique-se de que o DNS do subdomínio `ai.seu-dominio.com` também aponta para o servidor antes de habilitar o profile `ai`.

---

## Volumes e Persistência

| Volume | Conteúdo | Criticidade |
|---|---|---|
| `pgdata` | Banco de dados PostgreSQL | **CRÍTICO — fazer backup** |
| `redis_data` | Sessões e cache | Alta |
| `ollama_models` | Modelos LLM baixados (~10–20 GB) | Média (redownload possível) |
| `open_webui_data` | Histórico do WebUI | Baixa |
| `superset_home` | Dashboards Superset | Média |
| `plus_db` | Banco MySQL do Plus | Alta |
| `plus_storage` | Arquivos do Plus | Alta |
| `erpnext_sites` | Sites ERPNext | **CRÍTICO** |
| `erpnext_logs` | Logs ERPNext | Baixa |

### Backup do PostgreSQL

```bash
# Backup
docker exec arcadia-db pg_dump -U arcadia arcadia | gzip > backup-$(date +%Y%m%d).sql.gz

# Restore
gunzip < backup-20240101.sql.gz | docker exec -i arcadia-db psql -U arcadia arcadia
```

Configure backups automáticos no Coolify em **Project → Backups**.

---

## Stack de IA (LiteLLM + Ollama)

### Três tiers configurados em `docker/litellm-config.yaml`

```
TIER 1 — LLMFit (fine-tuned, soberano)   → slot pronto, habilitar via LLMFIT_BASE_URL
TIER 2 — Ollama (local, padrão)           → llama3.3, qwen2.5-coder, nomic-embed-text
TIER 3 — Externos (opt-in)               → OpenAI, Anthropic, Groq (apenas se API key definida)
```

### Baixar modelos Ollama após o primeiro deploy

```bash
docker exec arcadia-ollama ollama pull llama3.3
docker exec arcadia-ollama ollama pull qwen2.5-coder:7b
docker exec arcadia-ollama ollama pull nomic-embed-text
```

### Habilitar LLMFit (quando disponível)

1. Defina `LLMFIT_BASE_URL=http://seu-llmfit:porta`
2. Descomente o bloco TIER 1 em `docker/litellm-config.yaml`
3. Redeploy do serviço `litellm`

---

## Pós-deploy

### Rodar migrations do banco

```bash
# Via Coolify → Run Command, ou no servidor:
docker exec arcadia-app npm run db:push
```

### Verificar saúde dos serviços

```bash
docker compose -f docker-compose.prod.yml ps
```

Todos devem estar `healthy` ou `running`. Se algum ficar em `restarting`, verifique os logs.

### Verificar conectividade IA

```bash
curl -H "Authorization: Bearer $LITELLM_API_KEY" \
     http://localhost:4000/v1/models
```

---

## Checklist Final

### Antes do deploy

- [ ] Domínio DNS apontando para o servidor (`A record`)
- [ ] Todas as variáveis obrigatórias definidas no Coolify
- [ ] `SESSION_SECRET` e `SSO_SECRET` gerados com `openssl rand -hex 32`
- [ ] Senhas do banco definidas (nunca reutilizar senhas de dev)
- [ ] `DOCKER_MODE=true` definido

### No Coolify

- [ ] Projeto criado apontando para `docker-compose.prod.yml`
- [ ] Domínio configurado no Coolify
- [ ] HTTPS ativo (Let's Encrypt)
- [ ] Volumes persistentes configurados (especialmente `pgdata`)
- [ ] `COMPOSE_PROFILES` definido conforme os serviços desejados

### Após o deploy

- [ ] `npm run db:push` executado (migrations)
- [ ] Login funcional no `https://seu-dominio.com`
- [ ] Healthchecks verdes no painel Coolify
- [ ] Modelos Ollama baixados (se profile `ai` ativo)
- [ ] Backup automático configurado para `pgdata`
- [ ] Monitoramento/alertas configurados (Coolify suporta webhooks)

---

## Comandos de Referência Rápida

```bash
# Subir apenas o core
docker compose -f docker-compose.prod.yml up -d

# Subir com IA
docker compose -f docker-compose.prod.yml --profile ai up -d

# Subir tudo
docker compose -f docker-compose.prod.yml --profile ai --profile bi --profile plus up -d

# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f app

# Reiniciar um serviço específico
docker compose -f docker-compose.prod.yml restart app

# Atualizar para nova versão (após git pull)
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --no-deps app
```

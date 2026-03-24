-- Migration 0003: Arcádia Agentic Suite — Skills POO
-- Criado em: 2026-03-24 | Autor: João
-- Adiciona tabelas arcadia_skills e skill_executions
-- NÃO altera nem remove xos_skill_registry (modelo XOS legado preservado)

-- ─── Tabela principal de Skills (modelo orientado a objetos) ─────────────────
CREATE TABLE IF NOT EXISTS "arcadia_skills" (
  "id"                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identidade
  "name"                 VARCHAR(255) NOT NULL,
  "slug"                 VARCHAR(255) NOT NULL,
  "description"          TEXT,
  "version"              VARCHAR(50)  NOT NULL DEFAULT '1.0.0',
  "icon"                 VARCHAR(100),
  "tags"                 TEXT[],

  -- Namespace multi-tenant (system > tenant > company > user)
  "namespace"            VARCHAR(20)  NOT NULL DEFAULT 'tenant',
  "tenant_id"            INTEGER      REFERENCES "tenants"("id") ON DELETE CASCADE,
  "company_id"           INTEGER,
  "user_id"              VARCHAR      REFERENCES "users"("id")   ON DELETE SET NULL,

  -- Herança POO: lista de slugs referenciando outras skills
  "extends"              TEXT[],
  -- Interfaces / contratos implementados
  "implements"           TEXT[],

  -- Encapsulamento
  "visibility_execute"   VARCHAR(20)  DEFAULT 'public',
  "visibility_params"    VARCHAR(20)  DEFAULT 'public',

  -- Composição: dependências como referências /tipo/caminho
  "dependencies"         TEXT[],

  -- Trigger automático
  "trigger_type"         VARCHAR(30),
  "trigger_config"       JSONB,

  -- Corpo da skill (Markdown com blocos /skill/, /kg/, /tool/, etc.)
  "body"                 TEXT,

  -- Schemas de entrada e saída
  "parameters_schema"    JSONB,
  "return_schema"        JSONB,

  -- Estado
  "status"               VARCHAR(20)  NOT NULL DEFAULT 'draft',
  "is_system"            BOOLEAN      DEFAULT false,

  -- Autoria
  "author"               VARCHAR(255),
  "created_by"           VARCHAR      REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at"           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Slug único por namespace + tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_arcadia_skills_slug_tenant
  ON arcadia_skills(slug, tenant_id, namespace);

-- Índices de consulta frequente
CREATE INDEX IF NOT EXISTS idx_arcadia_skills_tenant     ON arcadia_skills(tenant_id);
CREATE INDEX IF NOT EXISTS idx_arcadia_skills_namespace  ON arcadia_skills(namespace);
CREATE INDEX IF NOT EXISTS idx_arcadia_skills_status     ON arcadia_skills(status);
CREATE INDEX IF NOT EXISTS idx_arcadia_skills_created_by ON arcadia_skills(created_by);

-- ─── Tabela de execuções de skills ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "skill_executions" (
  "id"                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "skill_id"                UUID        NOT NULL REFERENCES "arcadia_skills"("id") ON DELETE CASCADE,

  -- Contexto de execução
  "tenant_id"               INTEGER     REFERENCES "tenants"("id"),
  "company_id"              INTEGER,
  "user_id"                 VARCHAR     REFERENCES "users"("id") ON DELETE SET NULL,

  -- Origem
  "triggered_by"            VARCHAR(30),
  "automation_id"           INTEGER,
  "parent_execution_id"     UUID,

  -- Dados
  "input_params"            JSONB,
  "output_result"           JSONB,
  "resolved_dependencies"   JSONB,

  -- Estado
  "status"                  VARCHAR(20) NOT NULL DEFAULT 'pending',
  "error_message"           TEXT,
  "duration_ms"             INTEGER,

  -- Imutabilidade / auditoria
  "audit_hash"              VARCHAR(64),

  "started_at"              TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at"            TIMESTAMP
);

-- Índices de consulta frequente
CREATE INDEX IF NOT EXISTS idx_skill_executions_skill_id  ON skill_executions(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_executions_tenant    ON skill_executions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_skill_executions_status    ON skill_executions(status);
CREATE INDEX IF NOT EXISTS idx_skill_executions_started   ON skill_executions(started_at DESC);

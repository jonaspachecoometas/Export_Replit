-- Migration 0002: Add tenantId to critical tables missing multi-tenant isolation
-- Tables: workspace_pages, quick_notes, activity_feed, conversations,
--         knowledge_base, chat_threads, manus_runs

ALTER TABLE "workspace_pages"
  ADD COLUMN IF NOT EXISTS "tenant_id" integer
  REFERENCES "tenants"("id") ON DELETE CASCADE;

ALTER TABLE "quick_notes"
  ADD COLUMN IF NOT EXISTS "tenant_id" integer
  REFERENCES "tenants"("id") ON DELETE CASCADE;

ALTER TABLE "activity_feed"
  ADD COLUMN IF NOT EXISTS "tenant_id" integer
  REFERENCES "tenants"("id") ON DELETE CASCADE;

ALTER TABLE "conversations"
  ADD COLUMN IF NOT EXISTS "tenant_id" integer
  REFERENCES "tenants"("id") ON DELETE CASCADE;

ALTER TABLE "knowledge_base"
  ADD COLUMN IF NOT EXISTS "tenant_id" integer
  REFERENCES "tenants"("id") ON DELETE CASCADE;

ALTER TABLE "chat_threads"
  ADD COLUMN IF NOT EXISTS "tenant_id" integer
  REFERENCES "tenants"("id") ON DELETE CASCADE;

ALTER TABLE "manus_runs"
  ADD COLUMN IF NOT EXISTS "tenant_id" integer
  REFERENCES "tenants"("id") ON DELETE CASCADE;

-- Indexes for query performance on tenantId lookups
CREATE INDEX IF NOT EXISTS idx_workspace_pages_tenant ON workspace_pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quick_notes_tenant ON quick_notes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_tenant ON activity_feed(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tenant ON knowledge_base(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_tenant ON chat_threads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_manus_runs_tenant ON manus_runs(tenant_id);

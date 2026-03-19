-- ============================================================
-- CREATE MISSING TABLES
-- Gerado em: 2026-03-19
-- Tabelas presentes no schema Drizzle mas ausentes no banco
-- Ordenadas por dependência de FK (pais antes dos filhos)
-- ============================================================

-- ============================================================
-- GRUPO 1: Tabelas sem dependências de FK para tabelas faltantes
-- (dependem apenas de: tenants, users, migrationJobs, etc — já existentes)
-- ============================================================

-- tenant_empresas (depende de: tenants)
CREATE TABLE IF NOT EXISTS "tenant_empresas" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE NOT NULL,
  "razao_social" TEXT NOT NULL,
  "nome_fantasia" TEXT,
  "cnpj" TEXT NOT NULL,
  "ie" TEXT,
  "im" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "tipo" TEXT DEFAULT 'filial',
  "status" TEXT DEFAULT 'active',
  "cep" TEXT,
  "logradouro" TEXT,
  "numero" TEXT,
  "complemento" TEXT,
  "bairro" TEXT,
  "cidade" TEXT,
  "uf" TEXT,
  "codigo_ibge" TEXT,
  "regime_tributario" TEXT,
  "certificado_digital_id" INTEGER,
  "ambiente_fiscal" TEXT DEFAULT 'homologacao',
  "serie_nfe" INTEGER DEFAULT 1,
  "serie_nfce" INTEGER DEFAULT 1,
  "plus_empresa_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- etl_migration_jobs (depende de: users, staged_tables, staging_mappings, erp_connections — todos existentes)
CREATE TABLE IF NOT EXISTS "etl_migration_jobs" (
  "id" SERIAL PRIMARY KEY,
  "user_id" VARCHAR REFERENCES "users"("id") ON DELETE CASCADE,
  "staged_table_id" INTEGER REFERENCES "staged_tables"("id") ON DELETE CASCADE,
  "mapping_id" INTEGER REFERENCES "staging_mappings"("id") ON DELETE CASCADE,
  "erp_connection_id" INTEGER REFERENCES "erp_connections"("id") ON DELETE SET NULL,
  "status" TEXT DEFAULT 'pending',
  "total_records" INTEGER DEFAULT 0,
  "processed_records" INTEGER DEFAULT 0,
  "success_records" INTEGER DEFAULT 0,
  "error_records" INTEGER DEFAULT 0,
  "error_log" TEXT,
  "started_at" TIMESTAMP,
  "completed_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- migration_mappings (depende de: migration_jobs — já existe no banco)
CREATE TABLE IF NOT EXISTS "migration_mappings" (
  "id" SERIAL PRIMARY KEY,
  "job_id" INTEGER REFERENCES "migration_jobs"("id") ON DELETE CASCADE NOT NULL,
  "source_entity" VARCHAR(100) NOT NULL,
  "target_entity" VARCHAR(100) NOT NULL,
  "field_mappings" JSONB NOT NULL,
  "transformations" JSONB,
  "filters" JSONB,
  "is_enabled" BOOLEAN DEFAULT true,
  "priority" INTEGER DEFAULT 0,
  "record_count" INTEGER DEFAULT 0,
  "imported_count" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- migration_templates (sem FKs para tabelas faltantes)
CREATE TABLE IF NOT EXISTS "migration_templates" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "source_type" VARCHAR(50) NOT NULL,
  "source_system" VARCHAR(100),
  "mappings" JSONB NOT NULL,
  "is_public" BOOLEAN DEFAULT false,
  "usage_count" INTEGER DEFAULT 0,
  "created_by" VARCHAR(255),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- marketplace_modules (sem FKs)
CREATE TABLE IF NOT EXISTS "marketplace_modules" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(50) NOT NULL UNIQUE,
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "long_description" TEXT,
  "category" VARCHAR(50) NOT NULL,
  "icon" VARCHAR(100),
  "color" VARCHAR(20),
  "image_url" TEXT,
  "price" NUMERIC(12,2) DEFAULT 0,
  "setup_fee" NUMERIC(12,2) DEFAULT 0,
  "features" TEXT[],
  "dependencies" TEXT[],
  "route" VARCHAR(100),
  "api_endpoint" VARCHAR(200),
  "version" VARCHAR(20) DEFAULT '1.0.0',
  "is_core" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "is_featured" BOOLEAN DEFAULT false,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- valuation_governance (depende de: valuation_projects — já existe)
CREATE TABLE IF NOT EXISTS "valuation_governance" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER REFERENCES "valuation_projects"("id") ON DELETE CASCADE NOT NULL,
  "criterion_code" TEXT NOT NULL,
  "criterion_name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "current_score" INTEGER DEFAULT 0,
  "target_score" INTEGER DEFAULT 10,
  "weight" NUMERIC,
  "valuation_impact_pct" NUMERIC,
  "equity_impact_pct" NUMERIC,
  "roe_impact_pct" NUMERIC,
  "priority" TEXT DEFAULT 'medium',
  "implementation_quarter" TEXT,
  "implementation_cost" NUMERIC,
  "status" TEXT DEFAULT 'not_started',
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- valuation_results (depende de: valuation_projects — já existe)
CREATE TABLE IF NOT EXISTS "valuation_results" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER REFERENCES "valuation_projects"("id") ON DELETE CASCADE NOT NULL,
  "scenario" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "enterprise_value" NUMERIC,
  "equity_value" NUMERIC,
  "terminal_value" NUMERIC,
  "net_debt" NUMERIC,
  "roe" NUMERIC,
  "roa" NUMERIC,
  "weight" NUMERIC,
  "calculation_details" JSONB,
  "calculated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- valuation_assets (depende de: valuation_projects — já existe)
CREATE TABLE IF NOT EXISTS "valuation_assets" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER REFERENCES "valuation_projects"("id") ON DELETE CASCADE NOT NULL,
  "asset_type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "book_value" NUMERIC,
  "market_value" NUMERIC,
  "appraised_value" NUMERIC,
  "depreciation_rate" NUMERIC,
  "acquisition_date" TIMESTAMP,
  "status" TEXT DEFAULT 'active',
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- valuation_reports (depende de: valuation_projects, users — ambos existentes)
CREATE TABLE IF NOT EXISTS "valuation_reports" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER REFERENCES "valuation_projects"("id") ON DELETE CASCADE NOT NULL,
  "report_type" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "file_url" TEXT,
  "generated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "generated_by" VARCHAR REFERENCES "users"("id"),
  "version" INTEGER DEFAULT 1,
  "is_current" INTEGER DEFAULT 1
);

-- valuation_ai_log (depende de: valuation_projects — já existe)
CREATE TABLE IF NOT EXISTS "valuation_ai_log" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER REFERENCES "valuation_projects"("id") ON DELETE CASCADE NOT NULL,
  "event_type" TEXT NOT NULL,
  "trigger_source" TEXT NOT NULL,
  "input_summary" TEXT,
  "output_summary" TEXT,
  "full_response" JSONB,
  "confidence" NUMERIC,
  "tokens_used" INTEGER,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_payment_methods (depende de: tenants — já existe)
CREATE TABLE IF NOT EXISTS "retail_payment_methods" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "name" VARCHAR(100) NOT NULL,
  "type" VARCHAR(30) NOT NULL,
  "brand" VARCHAR(50),
  "fee_percent" NUMERIC(5,2) DEFAULT 0,
  "fixed_fee" NUMERIC(12,2) DEFAULT 0,
  "installments_max" INTEGER DEFAULT 1,
  "installment_fees" JSONB,
  "days_to_receive" INTEGER DEFAULT 1,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_sellers (depende de: tenants, persons, retail_stores — todos existentes)
CREATE TABLE IF NOT EXISTS "retail_sellers" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "person_id" INTEGER REFERENCES "persons"("id"),
  "code" VARCHAR(20),
  "name" VARCHAR(200) NOT NULL,
  "email" VARCHAR(100),
  "phone" VARCHAR(20),
  "store_id" INTEGER REFERENCES "retail_stores"("id"),
  "commission_plan_id" INTEGER,
  "hire_date" DATE,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_commission_plans (depende de: tenants — já existe)
CREATE TABLE IF NOT EXISTS "retail_commission_plans" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "type" VARCHAR(30) NOT NULL,
  "base_value" NUMERIC(12,2) DEFAULT 0,
  "base_percent" NUMERIC(5,2) DEFAULT 0,
  "rules" JSONB,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_store_goals (depende de: tenants, retail_stores — ambos existentes)
CREATE TABLE IF NOT EXISTS "retail_store_goals" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "store_id" INTEGER REFERENCES "retail_stores"("id"),
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "goal_amount" NUMERIC(14,2) NOT NULL,
  "achieved_amount" NUMERIC(14,2) DEFAULT 0,
  "achieved_percent" NUMERIC(5,2) DEFAULT 0,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_price_tables (depende de: tenants — já existe)
CREATE TABLE IF NOT EXISTS "retail_price_tables" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "name" VARCHAR(100) NOT NULL,
  "code" VARCHAR(20),
  "description" TEXT,
  "customer_type" VARCHAR(50),
  "discount_percent" NUMERIC(5,2) DEFAULT 0,
  "markup_percent" NUMERIC(5,2) DEFAULT 0,
  "valid_from" DATE,
  "valid_to" DATE,
  "is_default" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_product_types (depende de: tenants, fiscal_grupos_tributacao — ambos existentes)
CREATE TABLE IF NOT EXISTS "retail_product_types" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "category" VARCHAR(30) NOT NULL,
  "requires_imei" BOOLEAN DEFAULT false,
  "requires_serial" BOOLEAN DEFAULT false,
  "ncm" VARCHAR(10),
  "cest" VARCHAR(9),
  "origem" INTEGER DEFAULT 0,
  "cst_icms" VARCHAR(3),
  "csosn" VARCHAR(3),
  "cfop_venda_estadual" VARCHAR(4) DEFAULT '5102',
  "cfop_venda_interestadual" VARCHAR(4) DEFAULT '6102',
  "cfop_devolucao_estadual" VARCHAR(4) DEFAULT '1202',
  "cfop_devolucao_interestadual" VARCHAR(4) DEFAULT '2202',
  "aliq_icms" NUMERIC(5,2),
  "aliq_pis" NUMERIC(5,4) DEFAULT 0.65,
  "aliq_cofins" NUMERIC(5,4) DEFAULT 3.00,
  "aliq_ipi" NUMERIC(5,2) DEFAULT 0,
  "class_trib_ibs" VARCHAR(20),
  "aliq_ibs" NUMERIC(5,2),
  "class_trib_cbs" VARCHAR(20),
  "aliq_cbs" NUMERIC(5,2),
  "tax_group_id" INTEGER REFERENCES "fiscal_grupos_tributacao"("id"),
  "unidade_medida" VARCHAR(6) DEFAULT 'UN',
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_warehouse_stock (depende de: retail_warehouses, products — ambos existentes)
CREATE TABLE IF NOT EXISTS "retail_warehouse_stock" (
  "id" SERIAL PRIMARY KEY,
  "warehouse_id" INTEGER REFERENCES "retail_warehouses"("id") NOT NULL,
  "product_id" INTEGER REFERENCES "products"("id") NOT NULL,
  "quantity" NUMERIC(12,4) DEFAULT 0 NOT NULL,
  "reserved_quantity" NUMERIC(12,4) DEFAULT 0,
  "available_quantity" NUMERIC(12,4) DEFAULT 0,
  "min_stock" NUMERIC(12,4),
  "max_stock" NUMERIC(12,4),
  "last_movement_at" TIMESTAMP,
  "last_inventory_at" TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_stock_transfers (depende de: tenants, retail_warehouses, users — todos existentes)
CREATE TABLE IF NOT EXISTS "retail_stock_transfers" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "transfer_number" VARCHAR(20) NOT NULL,
  "source_warehouse_id" INTEGER REFERENCES "retail_warehouses"("id") NOT NULL,
  "destination_warehouse_id" INTEGER REFERENCES "retail_warehouses"("id") NOT NULL,
  "status" VARCHAR(30) DEFAULT 'pending',
  "notes" TEXT,
  "requested_by" VARCHAR REFERENCES "users"("id"),
  "approved_by" VARCHAR REFERENCES "users"("id"),
  "completed_by" VARCHAR REFERENCES "users"("id"),
  "requested_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "approved_at" TIMESTAMP,
  "completed_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_stock_movements (depende de: tenants, retail_warehouses, products, persons, users — todos existentes)
CREATE TABLE IF NOT EXISTS "retail_stock_movements" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "warehouse_id" INTEGER REFERENCES "retail_warehouses"("id") NOT NULL,
  "product_id" INTEGER REFERENCES "products"("id") NOT NULL,
  "movement_type" VARCHAR(30) NOT NULL,
  "operation_type" VARCHAR(50),
  "quantity" NUMERIC(12,4) NOT NULL,
  "previous_stock" NUMERIC(12,4),
  "new_stock" NUMERIC(12,4),
  "unit_cost" NUMERIC(12,4),
  "total_cost" NUMERIC(12,4),
  "reference_type" VARCHAR(50),
  "reference_id" INTEGER,
  "reference_number" VARCHAR(50),
  "supplier_id" INTEGER REFERENCES "persons"("id"),
  "notes" TEXT,
  "user_id" VARCHAR REFERENCES "users"("id"),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- xos_campaigns (depende de: tenants, users — ambos existentes)
CREATE TABLE IF NOT EXISTS "xos_campaigns" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE,
  "name" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "type" VARCHAR(30) NOT NULL,
  "status" VARCHAR(20) DEFAULT 'draft',
  "segment_query" JSONB,
  "template_id" INTEGER,
  "content" TEXT,
  "subject" VARCHAR(300),
  "scheduled_at" TIMESTAMP,
  "started_at" TIMESTAMP,
  "completed_at" TIMESTAMP,
  "stats" JSONB,
  "created_by" VARCHAR REFERENCES "users"("id"),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- xos_automations (depende de: tenants, users — ambos existentes)
CREATE TABLE IF NOT EXISTS "xos_automations" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE,
  "name" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "trigger_type" VARCHAR(50) NOT NULL,
  "trigger_config" JSONB,
  "actions" JSONB,
  "conditions" JSONB,
  "is_active" BOOLEAN DEFAULT true,
  "execution_count" INTEGER DEFAULT 0,
  "last_executed_at" TIMESTAMP,
  "created_by" VARCHAR REFERENCES "users"("id"),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- comm_channels (depende de: tenants — já existe)
CREATE TABLE IF NOT EXISTS "comm_channels" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE,
  "type" VARCHAR(30) NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "identifier" VARCHAR(200),
  "status" VARCHAR(30) DEFAULT 'disconnected',
  "config" JSONB,
  "greeting_message" TEXT,
  "out_of_hours_message" TEXT,
  "schedules" JSONB,
  "source_ref" VARCHAR(50),
  "is_active" BOOLEAN DEFAULT true,
  "last_connected_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- comm_contacts (depende de: tenants, users — ambos existentes)
CREATE TABLE IF NOT EXISTS "comm_contacts" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE,
  "type" VARCHAR(30) DEFAULT 'lead',
  "name" VARCHAR(200) NOT NULL,
  "email" VARCHAR(200),
  "phone" VARCHAR(50),
  "whatsapp" VARCHAR(50),
  "avatar_url" TEXT,
  "company" VARCHAR(200),
  "trade_name" VARCHAR(200),
  "cnpj" VARCHAR(20),
  "position" VARCHAR(100),
  "website" VARCHAR(300),
  "address" TEXT,
  "city" VARCHAR(100),
  "state" VARCHAR(50),
  "country" VARCHAR(50) DEFAULT 'Brasil',
  "segment" VARCHAR(100),
  "tags" TEXT[],
  "custom_fields" JSONB,
  "lead_score" INTEGER DEFAULT 0,
  "lead_status" VARCHAR(30) DEFAULT 'new',
  "source" VARCHAR(50),
  "source_details" TEXT,
  "assigned_to" VARCHAR REFERENCES "users"("id"),
  "primary_contact_name" VARCHAR(200),
  "primary_contact_email" VARCHAR(200),
  "primary_contact_phone" VARCHAR(50),
  "notes" TEXT,
  "last_contact_at" TIMESTAMP,
  "converted_at" TIMESTAMP,
  "xos_contact_id" INTEGER,
  "crm_client_id" INTEGER,
  "crm_lead_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- comm_queues (depende de: tenants — já existe)
CREATE TABLE IF NOT EXISTS "comm_queues" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) NOT NULL,
  "color" VARCHAR(20) DEFAULT 'blue',
  "greeting_message" TEXT,
  "out_of_hours_message" TEXT,
  "schedules" JSONB,
  "auto_assign" BOOLEAN DEFAULT false,
  "assignment_method" VARCHAR(20) DEFAULT 'round_robin',
  "order_priority" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "xos_queue_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- xos_whatsapp_connections (depende de: tenants — já existe)
CREATE TABLE IF NOT EXISTS "xos_whatsapp_connections" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) NOT NULL,
  "phone_number" VARCHAR(20),
  "status" VARCHAR(30) DEFAULT 'disconnected',
  "qr_code" TEXT,
  "session_data" JSONB,
  "greeting_message" TEXT,
  "farewell_message" TEXT,
  "completion_message" TEXT,
  "rating_message" TEXT,
  "out_of_hours_message" TEXT,
  "ticket_expires_minutes" INTEGER DEFAULT 1440,
  "inactive_message" TEXT,
  "is_default" BOOLEAN DEFAULT false,
  "last_seen_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- xos_sla_policies (depende de: tenants, xos_queues, users — todos existentes)
CREATE TABLE IF NOT EXISTS "xos_sla_policies" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE,
  "queue_id" INTEGER REFERENCES "xos_queues"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) NOT NULL,
  "priority" VARCHAR(20) DEFAULT 'normal',
  "first_response_minutes" INTEGER DEFAULT 60,
  "resolution_minutes" INTEGER DEFAULT 480,
  "escalation_agent_id" VARCHAR REFERENCES "users"("id") ON DELETE SET NULL,
  "notify_on_breach" BOOLEAN DEFAULT true,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- xos_protocols (depende de: tenants, xos_conversations, xos_tickets, xos_contacts, xos_queues, users — todos existentes)
CREATE TABLE IF NOT EXISTS "xos_protocols" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE,
  "protocol_number" VARCHAR(30) NOT NULL UNIQUE,
  "conversation_id" INTEGER REFERENCES "xos_conversations"("id") ON DELETE SET NULL,
  "ticket_id" INTEGER REFERENCES "xos_tickets"("id") ON DELETE SET NULL,
  "contact_id" INTEGER REFERENCES "xos_contacts"("id") ON DELETE SET NULL,
  "queue_id" INTEGER REFERENCES "xos_queues"("id") ON DELETE SET NULL,
  "assigned_to" VARCHAR REFERENCES "users"("id") ON DELETE SET NULL,
  "subject" TEXT,
  "status" VARCHAR(30) DEFAULT 'open',
  "opened_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "resolved_at" TIMESTAMP,
  "sla_deadline" TIMESTAMP,
  "sla_breach" BOOLEAN DEFAULT false,
  "satisfaction_score" INTEGER,
  "satisfaction_comment" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================
-- GRUPO 2: Tabelas que dependem de tabelas criadas no Grupo 1
-- ============================================================

-- module_subscriptions (depende de: tenants, marketplace_modules — marketplace_modules criada acima)
CREATE TABLE IF NOT EXISTS "module_subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE NOT NULL,
  "module_id" INTEGER REFERENCES "marketplace_modules"("id") ON DELETE CASCADE NOT NULL,
  "status" VARCHAR(20) DEFAULT 'active',
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "trial_ends_at" TIMESTAMP,
  "price" NUMERIC(12,2),
  "discount" NUMERIC(5,2) DEFAULT 0,
  "billing_cycle" VARCHAR(20) DEFAULT 'monthly',
  "auto_renew" BOOLEAN DEFAULT true,
  "notes" TEXT,
  "activated_by" VARCHAR,
  "activated_at" TIMESTAMP,
  "cancelled_by" VARCHAR,
  "cancelled_at" TIMESTAMP,
  "cancellation_reason" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- migration_logs (depende de: migration_jobs — existente; migration_mappings — criada acima)
CREATE TABLE IF NOT EXISTS "migration_logs" (
  "id" SERIAL PRIMARY KEY,
  "job_id" INTEGER REFERENCES "migration_jobs"("id") ON DELETE CASCADE NOT NULL,
  "mapping_id" INTEGER REFERENCES "migration_mappings"("id") ON DELETE SET NULL,
  "level" VARCHAR(20) DEFAULT 'info',
  "message" TEXT NOT NULL,
  "source_id" VARCHAR(100),
  "target_id" VARCHAR(100),
  "details" JSONB,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- valuation_pdca (depende de: valuation_projects — existente; valuation_governance — criada acima)
CREATE TABLE IF NOT EXISTS "valuation_pdca" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER REFERENCES "valuation_projects"("id") ON DELETE CASCADE NOT NULL,
  "governance_criterion_id" INTEGER REFERENCES "valuation_governance"("id"),
  "title" TEXT NOT NULL,
  "origin_area" TEXT NOT NULL,
  "phase" TEXT NOT NULL DEFAULT 'plan',
  "status" TEXT DEFAULT 'not_started',
  "priority" TEXT DEFAULT 'medium',
  "description" TEXT,
  "expected_result" TEXT,
  "actual_result" TEXT,
  "improvement_score" INTEGER,
  "heat_map_value" NUMERIC,
  "responsible" TEXT,
  "start_date" TIMESTAMP,
  "end_date" TIMESTAMP,
  "completed_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_seller_goals (depende de: tenants, retail_sellers — ambos criados acima ou existentes)
CREATE TABLE IF NOT EXISTS "retail_seller_goals" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "seller_id" INTEGER REFERENCES "retail_sellers"("id"),
  "store_id" INTEGER REFERENCES "retail_stores"("id"),
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "goal_amount" NUMERIC(14,2) NOT NULL,
  "goal_type" VARCHAR(20) DEFAULT 'sales',
  "achieved_amount" NUMERIC(14,2) DEFAULT 0,
  "achieved_percent" NUMERIC(5,2) DEFAULT 0,
  "bonus" NUMERIC(12,2) DEFAULT 0,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_commission_closures (depende de: tenants, retail_stores, retail_sellers — todos criados acima ou existentes)
CREATE TABLE IF NOT EXISTS "retail_commission_closures" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "store_id" INTEGER REFERENCES "retail_stores"("id"),
  "seller_id" INTEGER REFERENCES "retail_sellers"("id"),
  "period_type" VARCHAR(20) NOT NULL,
  "period_start" DATE NOT NULL,
  "period_end" DATE NOT NULL,
  "total_sales" NUMERIC(14,2) DEFAULT 0,
  "total_returns" NUMERIC(14,2) DEFAULT 0,
  "net_sales" NUMERIC(14,2) DEFAULT 0,
  "commission_rate" NUMERIC(5,2) DEFAULT 0,
  "commission_amount" NUMERIC(12,2) DEFAULT 0,
  "bonus_amount" NUMERIC(12,2) DEFAULT 0,
  "total_amount" NUMERIC(12,2) DEFAULT 0,
  "sales_count" INTEGER DEFAULT 0,
  "returns_count" INTEGER DEFAULT 0,
  "status" VARCHAR(20) DEFAULT 'open',
  "closed_at" TIMESTAMP,
  "closed_by" INTEGER,
  "paid_at" TIMESTAMP,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_price_table_items (depende de: retail_price_tables — criada acima; mobile_devices — existente)
CREATE TABLE IF NOT EXISTS "retail_price_table_items" (
  "id" SERIAL PRIMARY KEY,
  "price_table_id" INTEGER REFERENCES "retail_price_tables"("id") NOT NULL,
  "product_id" INTEGER,
  "device_id" INTEGER REFERENCES "mobile_devices"("id"),
  "product_code" VARCHAR(50),
  "custom_price" NUMERIC(12,2),
  "discount_percent" NUMERIC(5,2),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_promotions (depende de: tenants, retail_price_tables — ambas criadas/existentes)
CREATE TABLE IF NOT EXISTS "retail_promotions" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "type" VARCHAR(30) NOT NULL,
  "discount_value" NUMERIC(12,2),
  "discount_percent" NUMERIC(5,2),
  "apply_to" VARCHAR(30) DEFAULT 'all',
  "apply_to_ids" JSONB,
  "price_table_id" INTEGER REFERENCES "retail_price_tables"("id"),
  "min_quantity" INTEGER DEFAULT 1,
  "max_quantity" INTEGER,
  "valid_from" TIMESTAMP,
  "valid_to" TIMESTAMP,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_acquisitions (depende de: tenants, device_evaluations, service_orders, mobile_devices — todos existentes)
CREATE TABLE IF NOT EXISTS "retail_acquisitions" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "acquisition_number" VARCHAR(20) NOT NULL,
  "type" VARCHAR(30) NOT NULL,
  "source_evaluation_id" INTEGER REFERENCES "device_evaluations"("id"),
  "source_service_order_id" INTEGER REFERENCES "service_orders"("id"),
  "device_id" INTEGER REFERENCES "mobile_devices"("id"),
  "imei" VARCHAR(20),
  "brand" VARCHAR(50),
  "model" VARCHAR(100),
  "condition" VARCHAR(30),
  "acquisition_cost" NUMERIC(12,2) DEFAULT 0,
  "repair_cost" NUMERIC(12,2) DEFAULT 0,
  "total_cost" NUMERIC(12,2) DEFAULT 0,
  "suggested_price" NUMERIC(12,2),
  "final_price" NUMERIC(12,2),
  "linked_product_id" INTEGER,
  "linked_device_id" INTEGER REFERENCES "mobile_devices"("id"),
  "status" VARCHAR(30) DEFAULT 'pending',
  "notes" TEXT,
  "processed_by" VARCHAR,
  "processed_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_product_serials (depende de: tenants, products, retail_warehouses, retail_stock_movements, persons — todos criados/existentes)
CREATE TABLE IF NOT EXISTS "retail_product_serials" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "product_id" INTEGER REFERENCES "products"("id") NOT NULL,
  "warehouse_id" INTEGER REFERENCES "retail_warehouses"("id"),
  "serial_number" VARCHAR(50),
  "imei" VARCHAR(20),
  "imei2" VARCHAR(20),
  "status" VARCHAR(30) DEFAULT 'in_stock',
  "acquisition_cost" NUMERIC(12,4),
  "sale_price" NUMERIC(12,4),
  "sold_price" NUMERIC(12,4),
  "movement_id" INTEGER REFERENCES "retail_stock_movements"("id"),
  "sale_movement_id" INTEGER,
  "purchase_nfe_number" VARCHAR(50),
  "sale_nfe_number" VARCHAR(50),
  "customer_id" INTEGER REFERENCES "persons"("id"),
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_inventories (depende de: tenants, retail_warehouses, users — todos existentes)
CREATE TABLE IF NOT EXISTS "retail_inventories" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "warehouse_id" INTEGER REFERENCES "retail_warehouses"("id") NOT NULL,
  "inventory_number" VARCHAR(20) NOT NULL,
  "type" VARCHAR(30) DEFAULT 'full',
  "status" VARCHAR(30) DEFAULT 'open',
  "started_at" TIMESTAMP,
  "completed_at" TIMESTAMP,
  "notes" TEXT,
  "created_by" VARCHAR REFERENCES "users"("id"),
  "completed_by" VARCHAR REFERENCES "users"("id"),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_activity_feed (depende de: tenants, retail_stores — ambos existentes)
CREATE TABLE IF NOT EXISTS "retail_activity_feed" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "store_id" INTEGER REFERENCES "retail_stores"("id"),
  "activity_type" VARCHAR(50) NOT NULL,
  "entity_type" VARCHAR(50),
  "entity_id" INTEGER,
  "title" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "metadata" JSONB,
  "severity" VARCHAR(20) DEFAULT 'info',
  "created_by" VARCHAR,
  "created_by_name" VARCHAR(200),
  "is_read" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_reports (depende de: tenants — já existe)
CREATE TABLE IF NOT EXISTS "retail_reports" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "type" VARCHAR(30) DEFAULT 'custom',
  "query" TEXT,
  "filters" JSONB,
  "columns" JSONB,
  "is_system" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "created_by" VARCHAR,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- pos_cash_movements (depende de: tenants, pos_sessions, retail_stores — todos existentes)
CREATE TABLE IF NOT EXISTS "pos_cash_movements" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "session_id" INTEGER REFERENCES "pos_sessions"("id") NOT NULL,
  "store_id" INTEGER REFERENCES "retail_stores"("id") NOT NULL,
  "type" VARCHAR(20) NOT NULL,
  "amount" NUMERIC(12,2) NOT NULL,
  "reason" TEXT,
  "performed_by" VARCHAR,
  "performed_by_name" VARCHAR(200),
  "authorized_by" VARCHAR,
  "authorized_by_name" VARCHAR(200),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- service_warranties (depende de: tenants, retail_stores, service_orders, mobile_devices — todos existentes)
CREATE TABLE IF NOT EXISTS "service_warranties" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "store_id" INTEGER REFERENCES "retail_stores"("id"),
  "service_order_id" INTEGER REFERENCES "service_orders"("id") NOT NULL,
  "device_id" INTEGER REFERENCES "mobile_devices"("id"),
  "imei" VARCHAR(20),
  "service_type" VARCHAR(50) NOT NULL,
  "warranty_days" INTEGER NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "customer_name" VARCHAR(200),
  "customer_phone" VARCHAR(20),
  "description" TEXT,
  "status" VARCHAR(20) DEFAULT 'active',
  "claimed_at" TIMESTAMP,
  "claim_notes" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- customer_credits (depende de: tenants, retail_stores — ambos existentes)
CREATE TABLE IF NOT EXISTS "customer_credits" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id"),
  "store_id" INTEGER REFERENCES "retail_stores"("id"),
  "person_id" INTEGER NOT NULL,
  "customer_name" VARCHAR(200) NOT NULL,
  "customer_cpf" VARCHAR(20),
  "amount" NUMERIC(12,2) NOT NULL,
  "used_amount" NUMERIC(12,2) DEFAULT 0,
  "remaining_amount" NUMERIC(12,2) NOT NULL,
  "origin" VARCHAR(50) NOT NULL,
  "origin_id" INTEGER,
  "description" TEXT,
  "expires_at" TIMESTAMP,
  "status" VARCHAR(20) DEFAULT 'active',
  "used_in_sale_id" INTEGER,
  "created_by" VARCHAR,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- comm_threads (depende de: tenants, comm_contacts, comm_channels, users — comm_contacts e comm_channels criadas acima)
CREATE TABLE IF NOT EXISTS "comm_threads" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE,
  "contact_id" INTEGER REFERENCES "comm_contacts"("id"),
  "channel_id" INTEGER REFERENCES "comm_channels"("id"),
  "channel" VARCHAR(30) NOT NULL,
  "external_id" VARCHAR(200),
  "status" VARCHAR(20) DEFAULT 'open',
  "priority" VARCHAR(20) DEFAULT 'normal',
  "subject" VARCHAR(300),
  "assigned_to" VARCHAR REFERENCES "users"("id"),
  "queue_id" INTEGER,
  "tags" TEXT[],
  "metadata" JSONB,
  "messages_count" INTEGER DEFAULT 0,
  "unread_count" INTEGER DEFAULT 0,
  "first_response_at" TIMESTAMP,
  "last_message_at" TIMESTAMP,
  "resolved_at" TIMESTAMP,
  "satisfaction_score" INTEGER,
  "satisfaction_comment" TEXT,
  "xos_conversation_id" INTEGER,
  "crm_thread_id" INTEGER,
  "whatsapp_ticket_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- comm_queue_members (depende de: comm_queues — criada acima; users — existente)
CREATE TABLE IF NOT EXISTS "comm_queue_members" (
  "id" SERIAL PRIMARY KEY,
  "queue_id" INTEGER REFERENCES "comm_queues"("id") ON DELETE CASCADE NOT NULL,
  "user_id" VARCHAR REFERENCES "users"("id") NOT NULL,
  "role" VARCHAR(20) DEFAULT 'agent',
  "is_available" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- comm_quick_messages (depende de: tenants, users — ambos existentes)
CREATE TABLE IF NOT EXISTS "comm_quick_messages" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE,
  "shortcode" VARCHAR(50) NOT NULL,
  "title" VARCHAR(200),
  "content" TEXT NOT NULL,
  "media_url" TEXT,
  "media_type" VARCHAR(30),
  "category" VARCHAR(50),
  "scope" VARCHAR(20) DEFAULT 'company',
  "user_id" VARCHAR REFERENCES "users"("id"),
  "variables" TEXT[],
  "usage_count" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- xos_whatsapp_queue_links (depende de: xos_whatsapp_connections — criada acima; xos_queues — existente)
CREATE TABLE IF NOT EXISTS "xos_whatsapp_queue_links" (
  "id" SERIAL PRIMARY KEY,
  "whatsapp_id" INTEGER REFERENCES "xos_whatsapp_connections"("id") ON DELETE CASCADE NOT NULL,
  "queue_id" INTEGER REFERENCES "xos_queues"("id") ON DELETE CASCADE NOT NULL
);

-- xos_conversation_tracking (depende de: xos_conversations, xos_queues — ambos existentes)
CREATE TABLE IF NOT EXISTS "xos_conversation_tracking" (
  "id" SERIAL PRIMARY KEY,
  "conversation_id" INTEGER REFERENCES "xos_conversations"("id") ON DELETE CASCADE NOT NULL,
  "queue_id" INTEGER REFERENCES "xos_queues"("id"),
  "queued_at" TIMESTAMP,
  "first_response_at" TIMESTAMP,
  "assigned_at" TIMESTAMP,
  "chatbot_ended_at" TIMESTAMP,
  "human_started_at" TIMESTAMP,
  "resolved_at" TIMESTAMP,
  "rated_at" TIMESTAMP,
  "rating_score" INTEGER,
  "rating_comment" TEXT,
  "total_duration_seconds" INTEGER,
  "response_time_seconds" INTEGER
);

-- ============================================================
-- GRUPO 3: Tabelas que dependem de tabelas criadas no Grupo 2
-- ============================================================

-- module_usage (depende de: module_subscriptions — criada acima; tenants — existente)
CREATE TABLE IF NOT EXISTS "module_usage" (
  "id" SERIAL PRIMARY KEY,
  "subscription_id" INTEGER REFERENCES "module_subscriptions"("id") ON DELETE CASCADE NOT NULL,
  "tenant_id" INTEGER REFERENCES "tenants"("id") NOT NULL,
  "module_code" VARCHAR(50) NOT NULL,
  "period" VARCHAR(7) NOT NULL,
  "usage_count" INTEGER DEFAULT 0,
  "api_calls" INTEGER DEFAULT 0,
  "storage_used_mb" NUMERIC(12,2) DEFAULT 0,
  "documents_generated" INTEGER DEFAULT 0,
  "active_users" INTEGER DEFAULT 0,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- valuation_swot (depende de: valuation_projects — existente; valuation_pdca — criada acima)
CREATE TABLE IF NOT EXISTS "valuation_swot" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER REFERENCES "valuation_projects"("id") ON DELETE CASCADE NOT NULL,
  "quadrant" TEXT NOT NULL,
  "item" TEXT NOT NULL,
  "impact" TEXT DEFAULT 'medium',
  "valuation_relevance" INTEGER DEFAULT 0,
  "governance_relevance" INTEGER DEFAULT 0,
  "linked_pdca_id" INTEGER REFERENCES "valuation_pdca"("id"),
  "valuation_impact_pct" NUMERIC,
  "order_index" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_commission_closure_items (depende de: retail_commission_closures — criada acima; pos_sales, return_exchanges — existentes)
CREATE TABLE IF NOT EXISTS "retail_commission_closure_items" (
  "id" SERIAL PRIMARY KEY,
  "closure_id" INTEGER REFERENCES "retail_commission_closures"("id") NOT NULL,
  "sale_id" INTEGER REFERENCES "pos_sales"("id"),
  "return_id" INTEGER REFERENCES "return_exchanges"("id"),
  "item_type" VARCHAR(20) NOT NULL,
  "amount" NUMERIC(12,2) NOT NULL,
  "commission" NUMERIC(12,2) DEFAULT 0,
  "original_date" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- retail_stock_transfer_items (depende de: retail_stock_transfers — criada acima; products — existente)
CREATE TABLE IF NOT EXISTS "retail_stock_transfer_items" (
  "id" SERIAL PRIMARY KEY,
  "transfer_id" INTEGER REFERENCES "retail_stock_transfers"("id") NOT NULL,
  "product_id" INTEGER REFERENCES "products"("id") NOT NULL,
  "requested_quantity" NUMERIC(12,4) NOT NULL,
  "transferred_quantity" NUMERIC(12,4),
  "received_quantity" NUMERIC(12,4),
  "notes" TEXT
);

-- retail_inventory_items (depende de: retail_inventories — criada acima; products, users — existentes)
CREATE TABLE IF NOT EXISTS "retail_inventory_items" (
  "id" SERIAL PRIMARY KEY,
  "inventory_id" INTEGER REFERENCES "retail_inventories"("id") NOT NULL,
  "product_id" INTEGER REFERENCES "products"("id") NOT NULL,
  "system_quantity" NUMERIC(12,4),
  "counted_quantity" NUMERIC(12,4),
  "difference" NUMERIC(12,4),
  "adjustment_applied" BOOLEAN DEFAULT false,
  "counted_by" VARCHAR REFERENCES "users"("id"),
  "counted_at" TIMESTAMP,
  "notes" TEXT
);

-- comm_messages (depende de: comm_threads, comm_channels — ambas criadas acima)
CREATE TABLE IF NOT EXISTS "comm_messages" (
  "id" SERIAL PRIMARY KEY,
  "thread_id" INTEGER REFERENCES "comm_threads"("id") ON DELETE CASCADE NOT NULL,
  "channel_id" INTEGER REFERENCES "comm_channels"("id"),
  "direction" VARCHAR(10) NOT NULL,
  "sender_type" VARCHAR(20) NOT NULL,
  "sender_id" VARCHAR,
  "sender_name" VARCHAR(200),
  "content" TEXT,
  "content_type" VARCHAR(30) DEFAULT 'text',
  "media_url" TEXT,
  "media_type" VARCHAR(30),
  "attachments" JSONB,
  "metadata" JSONB,
  "external_id" VARCHAR(200),
  "status" VARCHAR(20) DEFAULT 'sent',
  "is_from_agent" BOOLEAN DEFAULT false,
  "read_at" TIMESTAMP,
  "delivered_at" TIMESTAMP,
  "xos_message_id" INTEGER,
  "crm_message_id" INTEGER,
  "whatsapp_message_id" INTEGER,
  "email_message_id" INTEGER,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- comm_events (depende de: tenants — existente)
CREATE TABLE IF NOT EXISTS "comm_events" (
  "id" SERIAL PRIMARY KEY,
  "tenant_id" INTEGER REFERENCES "tenants"("id") ON DELETE CASCADE,
  "type" VARCHAR(50) NOT NULL,
  "entity_type" VARCHAR(30) NOT NULL,
  "entity_id" INTEGER NOT NULL,
  "data" JSONB,
  "processed_by_kg" BOOLEAN DEFAULT false,
  "processed_by_agents" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================
-- GRUPO 4: Tabelas que dependem de tabelas criadas no Grupo 3
-- ============================================================

-- retail_transfer_serials (depende de: retail_stock_transfer_items — criada acima; retail_product_serials — criada acima)
CREATE TABLE IF NOT EXISTS "retail_transfer_serials" (
  "id" SERIAL PRIMARY KEY,
  "transfer_item_id" INTEGER REFERENCES "retail_stock_transfer_items"("id") NOT NULL,
  "serial_id" INTEGER REFERENCES "retail_product_serials"("id") NOT NULL
);

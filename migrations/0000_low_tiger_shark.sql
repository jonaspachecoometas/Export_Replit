CREATE TABLE "activity_feed" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"actor_id" varchar,
	"type" text NOT NULL,
	"module" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"entity_title" text,
	"description" text,
	"metadata" text,
	"is_read" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"schedule" text,
	"erp_connection_id" integer,
	"config" text,
	"status" text DEFAULT 'active',
	"last_run" timestamp,
	"next_run" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"icon" text NOT NULL,
	"status" text NOT NULL,
	"url" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "arc_doctypes" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" varchar(100) NOT NULL,
	"label" varchar(200) NOT NULL,
	"module" varchar(100),
	"description" text,
	"icon" varchar(50) DEFAULT 'FileText',
	"color" varchar(20) DEFAULT 'blue',
	"is_submittable" boolean DEFAULT false,
	"is_child" boolean DEFAULT false,
	"parent_doctype_id" integer,
	"is_single" boolean DEFAULT false,
	"is_tree" boolean DEFAULT false,
	"track_changes" boolean DEFAULT true,
	"allow_import" boolean DEFAULT true,
	"allow_export" boolean DEFAULT true,
	"has_web_view" boolean DEFAULT true,
	"permissions" jsonb,
	"hooks" jsonb,
	"status" varchar(20) DEFAULT 'active',
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arc_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctype_id" integer NOT NULL,
	"field_name" varchar(100) NOT NULL,
	"label" varchar(200) NOT NULL,
	"field_type" varchar(50) NOT NULL,
	"options" text,
	"default_value" text,
	"mandatory" boolean DEFAULT false,
	"unique" boolean DEFAULT false,
	"read_only" boolean DEFAULT false,
	"hidden" boolean DEFAULT false,
	"in_list_view" boolean DEFAULT false,
	"in_filter" boolean DEFAULT false,
	"searchable" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"section" varchar(100),
	"column" integer DEFAULT 1,
	"width" varchar(20),
	"placeholder" text,
	"help_text" text,
	"validation" jsonb,
	"depends_on" text,
	"fetch_from" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arc_layouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" varchar(100) NOT NULL,
	"description" text,
	"layout_type" varchar(50) DEFAULT 'form',
	"config" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arc_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" varchar(100) NOT NULL,
	"title" varchar(200) NOT NULL,
	"route" varchar(200) NOT NULL,
	"page_type" varchar(50) DEFAULT 'page',
	"doctype_id" integer,
	"icon" varchar(50),
	"module" varchar(100),
	"is_public" boolean DEFAULT false,
	"roles" text[],
	"layout" jsonb,
	"script" text,
	"style" text,
	"status" varchar(20) DEFAULT 'active',
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arc_scripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" varchar(100) NOT NULL,
	"doctype_id" integer,
	"script_type" varchar(50) NOT NULL,
	"trigger_event" varchar(50),
	"script" text NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arc_widgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" varchar(100) NOT NULL,
	"label" varchar(200) NOT NULL,
	"widget_type" varchar(50) NOT NULL,
	"category" varchar(50),
	"icon" varchar(50),
	"config" jsonb,
	"data_source" jsonb,
	"is_system" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arc_workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"nodes" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(50) DEFAULT 'draft',
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"automation_id" integer NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"action_type" text NOT NULL,
	"action_config" text,
	"condition_config" text
);
--> statement-breakpoint
CREATE TABLE "automation_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"automation_id" integer NOT NULL,
	"status" text NOT NULL,
	"trigger_data" text,
	"result" text,
	"error" text,
	"started_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "automations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"trigger_type" text NOT NULL,
	"trigger_config" text,
	"is_active" text DEFAULT 'true',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "backup_artifacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"backup_job_id" integer,
	"automation_log_id" integer,
	"filename" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer,
	"checksum" text,
	"status" text DEFAULT 'pending',
	"started_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "backup_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"data_source_id" integer,
	"name" text NOT NULL,
	"backup_type" text NOT NULL,
	"include_schema" text DEFAULT 'true',
	"include_tables" text,
	"exclude_tables" text,
	"compression_type" text DEFAULT 'gzip',
	"retention_days" integer DEFAULT 30,
	"storage_location" text,
	"is_active" text DEFAULT 'true',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bi_charts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"dataset_id" integer,
	"name" text NOT NULL,
	"chart_type" text NOT NULL,
	"config" text,
	"x_axis" text,
	"y_axis" text,
	"group_by" text,
	"aggregation" text,
	"colors" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bi_dashboard_charts" (
	"id" serial PRIMARY KEY NOT NULL,
	"dashboard_id" integer NOT NULL,
	"chart_id" integer NOT NULL,
	"position_x" integer DEFAULT 0,
	"position_y" integer DEFAULT 0,
	"width" integer DEFAULT 6,
	"height" integer DEFAULT 4
);
--> statement-breakpoint
CREATE TABLE "bi_dashboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"layout" text,
	"is_public" text DEFAULT 'false',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bi_datasets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"data_source_id" integer,
	"name" text NOT NULL,
	"description" text,
	"query_type" text DEFAULT 'table',
	"table_name" text,
	"sql_query" text,
	"columns" text,
	"filters" text,
	"is_public" text DEFAULT 'false',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"sender_id" varchar,
	"body" text NOT NULL,
	"message_type" text DEFAULT 'text',
	"status" text DEFAULT 'sent',
	"sent_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"edited_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "chat_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" text DEFAULT 'member',
	"joined_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"last_read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "chat_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text DEFAULT 'direct' NOT NULL,
	"name" text,
	"created_by" varchar,
	"latest_message_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "command_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"command" text NOT NULL,
	"frequency" integer DEFAULT 1,
	"last_used_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon_emoji" varchar(10) DEFAULT '🏢',
	"icon_color" varchar(20) DEFAULT '#3b82f6',
	"is_private" boolean DEFAULT false,
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"community_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"type" varchar(20) DEFAULT 'text',
	"is_private" boolean DEFAULT false,
	"order_index" integer DEFAULT 0,
	"project_id" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"community_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar(20) DEFAULT 'member',
	"nickname" varchar(100),
	"status" varchar(20) DEFAULT 'offline',
	"status_message" varchar(200),
	"joined_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"last_active_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "community_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"reply_to_id" integer,
	"is_pinned" boolean DEFAULT false,
	"edited_at" timestamp,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contabil_centros_custo" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"codigo" varchar(20) NOT NULL,
	"descricao" varchar(200) NOT NULL,
	"tipo" varchar(20),
	"centro_pai" integer,
	"responsavel" varchar,
	"status" varchar(20) DEFAULT 'ativo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contabil_config_lancamento" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"origem" varchar(50) NOT NULL,
	"descricao" varchar(200),
	"conta_debito" integer,
	"conta_credito" integer,
	"centro_custo" integer,
	"historico_template" text,
	"ativo" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contabil_lancamentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"numero" varchar(20),
	"data_lancamento" timestamp NOT NULL,
	"data_competencia" timestamp,
	"tipo_documento" varchar(50),
	"numero_documento" varchar(50),
	"historico" text NOT NULL,
	"valor" numeric(15, 2) NOT NULL,
	"origem" varchar(50),
	"origem_id" integer,
	"status" varchar(20) DEFAULT 'pendente',
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contabil_partidas" (
	"id" serial PRIMARY KEY NOT NULL,
	"lancamento_id" integer NOT NULL,
	"conta_id" integer NOT NULL,
	"centro_custo_id" integer,
	"tipo" varchar(10) NOT NULL,
	"valor" numeric(15, 2) NOT NULL,
	"historico" text
);
--> statement-breakpoint
CREATE TABLE "contabil_periodos" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"ano" integer NOT NULL,
	"mes" integer NOT NULL,
	"data_inicio" timestamp NOT NULL,
	"data_fim" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'aberto',
	"fechado_por" varchar,
	"fechado_em" timestamp
);
--> statement-breakpoint
CREATE TABLE "contabil_plano_contas" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"codigo" varchar(20) NOT NULL,
	"descricao" varchar(200) NOT NULL,
	"tipo" varchar(20) NOT NULL,
	"natureza" varchar(10) NOT NULL,
	"nivel" integer DEFAULT 1,
	"conta_pai" integer,
	"aceita_lancamento" integer DEFAULT 1,
	"codigo_reduzido" varchar(10),
	"status" varchar(20) DEFAULT 'ativo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contabil_saldos" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"conta_id" integer NOT NULL,
	"centro_custo_id" integer,
	"ano" integer NOT NULL,
	"mes" integer NOT NULL,
	"saldo_anterior" numeric(15, 2) DEFAULT '0',
	"debitos" numeric(15, 2) DEFAULT '0',
	"creditos" numeric(15, 2) DEFAULT '0',
	"saldo_atual" numeric(15, 2) DEFAULT '0',
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_campaign_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"phone" text,
	"email" text,
	"name" text,
	"status" text DEFAULT 'pending',
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "crm_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"channel_id" integer,
	"name" text NOT NULL,
	"description" text,
	"message_content" text NOT NULL,
	"media_url" text,
	"status" text DEFAULT 'draft',
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"total_contacts" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"read_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"created_by_id" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"identifier" text,
	"status" text DEFAULT 'disconnected',
	"session_data" text,
	"qr_code" text,
	"last_connected_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"user_id" varchar,
	"name" text NOT NULL,
	"trade_name" text,
	"cnpj" text,
	"email" text,
	"phone" text,
	"website" text,
	"address" text,
	"city" text,
	"state" text,
	"segment" text,
	"primary_contact_name" text,
	"primary_contact_email" text,
	"primary_contact_phone" text,
	"notes" text,
	"status" text DEFAULT 'active',
	"source" text,
	"converted_from_lead_id" integer,
	"converted_from_partner_id" integer,
	"partner_id" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_commission_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"revenue_type" text NOT NULL,
	"sale_scenario" text NOT NULL,
	"role" text,
	"month_range_start" integer,
	"month_range_end" integer,
	"percentage" integer NOT NULL,
	"is_active" text DEFAULT 'true',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_id" integer NOT NULL,
	"revenue_schedule_id" integer,
	"rule_id" integer,
	"partner_id" integer,
	"user_id" varchar,
	"role" text,
	"base_value" integer NOT NULL,
	"percentage" integer NOT NULL,
	"commission_value" integer NOT NULL,
	"period" text NOT NULL,
	"status" text DEFAULT 'pending',
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_contract_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"due_date" timestamp,
	"completed_date" timestamp,
	"status" text DEFAULT 'pending',
	"deliverables" text,
	"billing_amount" integer DEFAULT 0,
	"billing_status" text DEFAULT 'pending',
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"client_id" integer,
	"partner_id" integer,
	"opportunity_id" integer,
	"contract_number" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'draft',
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"monthly_value" integer DEFAULT 0,
	"total_value" integer DEFAULT 0,
	"payment_terms" text,
	"billing_cycle" text DEFAULT 'monthly',
	"auto_renew" text DEFAULT 'true',
	"signed_at" timestamp,
	"signed_by" text,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"user_id" varchar NOT NULL,
	"opportunity_id" integer,
	"lead_id" integer,
	"client_id" integer,
	"title" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'meeting',
	"start_at" timestamp NOT NULL,
	"end_at" timestamp,
	"all_day" text DEFAULT 'false',
	"location" text,
	"meeting_link" text,
	"google_event_id" text,
	"attendees" text[],
	"reminders" text,
	"status" text DEFAULT 'scheduled',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_frappe_connectors" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" text NOT NULL,
	"base_url" text NOT NULL,
	"api_key" text NOT NULL,
	"api_secret" text NOT NULL,
	"frappe_user" text,
	"default_company" text,
	"target_system" text DEFAULT 'erpnext',
	"sync_mode" text DEFAULT 'manual',
	"sync_entities" text[],
	"last_sync_at" timestamp,
	"status" text DEFAULT 'inactive',
	"error_message" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_frappe_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"connector_id" integer NOT NULL,
	"local_entity" text NOT NULL,
	"frappe_doctype" text NOT NULL,
	"field_mappings" text,
	"status_mappings" text,
	"sync_direction" text DEFAULT 'push',
	"is_enabled" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "crm_google_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp,
	"scope" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "crm_google_tokens_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "crm_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"user_id" varchar,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"position" text,
	"source" text,
	"status" text DEFAULT 'new',
	"notes" text,
	"tags" text[],
	"assigned_to" varchar,
	"converted_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"channel_id" integer,
	"direction" text NOT NULL,
	"type" text DEFAULT 'text',
	"content" text,
	"media_url" text,
	"media_type" text,
	"external_id" text,
	"status" text DEFAULT 'sent',
	"sent_by_id" varchar,
	"is_from_agent" text DEFAULT 'false',
	"metadata" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"user_id" varchar,
	"lead_id" integer,
	"partner_id" integer,
	"stage_id" integer,
	"name" text NOT NULL,
	"description" text,
	"value" integer DEFAULT 0,
	"currency" text DEFAULT 'BRL',
	"probability" integer DEFAULT 50,
	"expected_close_date" timestamp,
	"actual_close_date" timestamp,
	"status" text DEFAULT 'open',
	"loss_reason" text,
	"assigned_to" varchar,
	"approval_status" text DEFAULT 'pending',
	"approved_at" timestamp,
	"approved_by" varchar,
	"process_compass_project_id" integer,
	"billing_status" text DEFAULT 'none',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_opportunity_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1,
	"unit_price" integer DEFAULT 0,
	"discount" integer DEFAULT 0,
	"total" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "crm_opportunity_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"opportunity_id" integer NOT NULL,
	"registered_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp NOT NULL,
	"status" text DEFAULT 'active',
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "crm_partner_certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"user_id" varchar,
	"certification_name" text NOT NULL,
	"certification_date" timestamp NOT NULL,
	"expiration_date" timestamp,
	"score" integer,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_partner_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"period" text NOT NULL,
	"period_type" text NOT NULL,
	"arr_generated" integer DEFAULT 0,
	"new_clients" integer DEFAULT 0,
	"certified_professionals" integer DEFAULT 0,
	"nps_average" integer,
	"cases_published" integer DEFAULT 0,
	"portal_usage_rate" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" text NOT NULL,
	"trade_name" text,
	"cnpj" text,
	"email" text,
	"phone" text,
	"website" text,
	"type" text NOT NULL,
	"tier" text DEFAULT 'partner',
	"status" text DEFAULT 'pending',
	"contract_start_date" timestamp,
	"contract_end_date" timestamp,
	"primary_contact_name" text,
	"primary_contact_email" text,
	"primary_contact_phone" text,
	"address" text,
	"city" text,
	"state" text,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_pipeline_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#3b82f6',
	"order_index" integer DEFAULT 0,
	"probability" integer DEFAULT 50,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'service',
	"category" text,
	"price" integer DEFAULT 0,
	"currency" text DEFAULT 'BRL',
	"unit" text DEFAULT 'unit',
	"is_active" text DEFAULT 'true',
	"sku" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_proposal_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"proposal_id" integer NOT NULL,
	"product_id" integer,
	"item_type" text DEFAULT 'product',
	"name" text NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1,
	"unit_price" integer DEFAULT 0,
	"discount" integer DEFAULT 0,
	"total" integer DEFAULT 0,
	"order_index" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "crm_proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"opportunity_id" integer,
	"client_id" integer,
	"code" text,
	"title" text NOT NULL,
	"description" text,
	"version" integer DEFAULT 1,
	"status" text DEFAULT 'draft',
	"valid_until" timestamp,
	"total_value" integer DEFAULT 0,
	"currency" text DEFAULT 'BRL',
	"payment_terms" text,
	"delivery_terms" text,
	"notes" text,
	"internal_notes" text,
	"sent_at" timestamp,
	"viewed_at" timestamp,
	"accepted_at" timestamp,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"created_by_id" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_quick_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"user_id" varchar,
	"shortcut" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"media_url" text,
	"category" text,
	"is_global" text DEFAULT 'false',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_revenue_schedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_id" integer NOT NULL,
	"month" integer NOT NULL,
	"due_date" timestamp NOT NULL,
	"value" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"invoice_number" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm_sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"connector_id" integer NOT NULL,
	"sync_type" text NOT NULL,
	"entity" text,
	"records_processed" integer DEFAULT 0,
	"records_success" integer DEFAULT 0,
	"records_failed" integer DEFAULT 0,
	"status" text NOT NULL,
	"error_details" text,
	"started_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "crm_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"channel_id" integer,
	"client_id" integer,
	"lead_id" integer,
	"contact_phone" text,
	"contact_email" text,
	"contact_name" text,
	"status" text DEFAULT 'open',
	"priority" text DEFAULT 'normal',
	"assigned_to_id" varchar,
	"queue_id" integer,
	"last_message_at" timestamp,
	"unread_count" integer DEFAULT 0,
	"tags" text[],
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_mcp_servers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"transport_type" text DEFAULT 'http' NOT NULL,
	"server_url" text,
	"command" text,
	"args" text[],
	"icon_url" text,
	"description" text,
	"custom_headers" jsonb,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"code" varchar(50) NOT NULL,
	"name" varchar(256) NOT NULL,
	"type" varchar(50) DEFAULT 'company',
	"tax_id" varchar(50),
	"email" varchar(256),
	"phone" varchar(50),
	"address" text,
	"city" varchar(100),
	"state" varchar(50),
	"country" varchar(100) DEFAULT 'Brasil',
	"credit_limit" numeric(15, 2) DEFAULT '0',
	"payment_terms" integer DEFAULT 30,
	"status" varchar(50) DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_widgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"config" text,
	"position" text,
	"is_visible" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"host" text,
	"port" integer,
	"database" text,
	"username" text,
	"password" text,
	"connection_string" text,
	"is_active" text DEFAULT 'true',
	"last_tested_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"store_id" integer,
	"imei" varchar(20) NOT NULL,
	"brand" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"color" varchar(50),
	"customer_id" varchar,
	"customer_name" varchar(200),
	"customer_phone" varchar(20),
	"evaluation_date" date DEFAULT CURRENT_DATE,
	"screen_condition" varchar(20),
	"screen_notes" text,
	"body_condition" varchar(20),
	"body_notes" text,
	"charger_included" boolean DEFAULT false,
	"charger_condition" varchar(20),
	"battery_health" integer,
	"battery_notes" text,
	"camera_front_working" boolean DEFAULT true,
	"camera_rear_working" boolean DEFAULT true,
	"audio_working" boolean DEFAULT true,
	"buttons_working" boolean DEFAULT true,
	"connectivity_working" boolean DEFAULT true,
	"water_damage_detected" boolean DEFAULT false,
	"overall_condition" varchar(20),
	"estimated_value" numeric(12, 2),
	"approved" boolean DEFAULT false,
	"rejection_reason" text,
	"evaluated_by" varchar,
	"approved_by" varchar,
	"device_id" integer,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" integer NOT NULL,
	"imei" varchar(20) NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"event_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"from_location" varchar(100),
	"to_location" varchar(100),
	"reference_type" varchar(50),
	"reference_id" integer,
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctype_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctype_id" integer NOT NULL,
	"fieldname" varchar(100) NOT NULL,
	"label" varchar(200) NOT NULL,
	"fieldtype" varchar(50) NOT NULL,
	"options" text,
	"default_value" text,
	"description" text,
	"reqd" integer DEFAULT 0,
	"unique" integer DEFAULT 0,
	"in_list_view" integer DEFAULT 0,
	"in_standard_filter" integer DEFAULT 0,
	"hidden" integer DEFAULT 0,
	"read_only" integer DEFAULT 0,
	"idx" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctype_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctype_name" varchar(100) NOT NULL,
	"name" varchar(256) NOT NULL,
	"tenant_id" integer,
	"owner_id" varchar,
	"data" jsonb NOT NULL,
	"docstatus" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctypes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"module" varchar(100) DEFAULT 'Core',
	"label" varchar(200) NOT NULL,
	"description" text,
	"is_single" integer DEFAULT 0,
	"is_submittable" integer DEFAULT 0,
	"is_child" integer DEFAULT 0,
	"parent_doctype" varchar(100),
	"icon" varchar(50),
	"color" varchar(20),
	"track_changes" integer DEFAULT 1,
	"permissions" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "doctypes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "email_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"tenant_id" integer,
	"email" varchar(256) NOT NULL,
	"password" text,
	"display_name" varchar(256),
	"provider" varchar(50) DEFAULT 'gmail',
	"imap_host" varchar(256),
	"imap_port" integer DEFAULT 993,
	"smtp_host" varchar(256),
	"smtp_port" integer DEFAULT 587,
	"status" varchar(50) DEFAULT 'disconnected',
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" integer NOT NULL,
	"filename" varchar(512) NOT NULL,
	"mime_type" varchar(256),
	"size" integer,
	"content_id" varchar(256),
	"storage_path" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"name" varchar(256) NOT NULL,
	"type" varchar(50) DEFAULT 'custom',
	"unread_count" integer DEFAULT 0,
	"total_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"folder_id" integer,
	"message_id" varchar(512),
	"thread_id" varchar(512),
	"from_address" varchar(256) NOT NULL,
	"from_name" varchar(256),
	"to_addresses" text[],
	"cc_addresses" text[],
	"bcc_addresses" text[],
	"subject" text,
	"body_text" text,
	"body_html" text,
	"snippet" text,
	"is_read" integer DEFAULT 0,
	"is_starred" integer DEFAULT 0,
	"has_attachments" integer DEFAULT 0,
	"labels" text[],
	"reply_to_id" integer,
	"received_at" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "environmental_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"code" varchar(50),
	"name" text NOT NULL,
	"description" text,
	"category" varchar(100),
	"base_price" numeric(15, 2),
	"unit" varchar(50) DEFAULT 'projeto',
	"estimated_duration" integer,
	"items" text[],
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erp_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"segment_id" integer,
	"company_name" varchar(256),
	"trade_name" varchar(256),
	"tax_id" varchar(20),
	"state_registration" varchar(50),
	"city_registration" varchar(50),
	"tax_regime" varchar(50),
	"address" text,
	"city" varchar(100),
	"state" varchar(2),
	"zip_code" varchar(10),
	"phone" varchar(20),
	"email" varchar(256),
	"website" varchar(256),
	"logo_url" text,
	"erpnext_url" varchar(512),
	"erpnext_enabled" integer DEFAULT 0,
	"modules_crm" integer DEFAULT 1,
	"modules_sales" integer DEFAULT 1,
	"modules_purchases" integer DEFAULT 1,
	"modules_stock" integer DEFAULT 1,
	"modules_finance" integer DEFAULT 1,
	"modules_accounting" integer DEFAULT 0,
	"modules_production" integer DEFAULT 0,
	"modules_projects" integer DEFAULT 0,
	"modules_hr" integer DEFAULT 0,
	"modules_service_order" integer DEFAULT 0,
	"default_currency" varchar(10) DEFAULT 'BRL',
	"decimal_places" integer DEFAULT 2,
	"fiscal_document_series" varchar(10) DEFAULT '1',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "erp_config_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "erp_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"base_url" text NOT NULL,
	"api_key" text,
	"api_secret" text,
	"username" text,
	"password" text,
	"is_active" text DEFAULT 'true',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erp_segments" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text,
	"modules" text[],
	"features" jsonb,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "erp_segments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "external_app_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"app_name" text NOT NULL,
	"app_url" text,
	"can_access" integer DEFAULT 1,
	"api_key_id" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"project_id" integer,
	"expense_code" varchar(50),
	"responsible_id" varchar,
	"expense_date" timestamp,
	"category" varchar(100),
	"description" text,
	"amount" numeric(15, 2) NOT NULL,
	"payment_method" varchar(50),
	"card_id" varchar(50),
	"receipt_url" text,
	"cost_center" varchar(100),
	"status" varchar(50) DEFAULT 'pendente',
	"approved_by_leader" varchar,
	"approved_by_leader_at" timestamp,
	"approved_by_finance" varchar,
	"approved_by_finance_at" timestamp,
	"rejection_reason" text,
	"observations" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_accounts_payable" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"document_number" varchar(100),
	"supplier_id" integer,
	"supplier_name" varchar(256),
	"category_id" integer,
	"description" text,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"original_amount" numeric(15, 2) NOT NULL,
	"discount_amount" numeric(15, 2) DEFAULT '0',
	"interest_amount" numeric(15, 2) DEFAULT '0',
	"fine_amount" numeric(15, 2) DEFAULT '0',
	"paid_amount" numeric(15, 2) DEFAULT '0',
	"remaining_amount" numeric(15, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"payment_method_id" integer,
	"bank_account_id" integer,
	"paid_at" timestamp,
	"purchase_order_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_accounts_receivable" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"document_number" varchar(100),
	"customer_id" integer,
	"customer_name" varchar(256),
	"category_id" integer,
	"description" text,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"original_amount" numeric(15, 2) NOT NULL,
	"discount_amount" numeric(15, 2) DEFAULT '0',
	"interest_amount" numeric(15, 2) DEFAULT '0',
	"fine_amount" numeric(15, 2) DEFAULT '0',
	"received_amount" numeric(15, 2) DEFAULT '0',
	"remaining_amount" numeric(15, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"payment_method_id" integer,
	"bank_account_id" integer,
	"received_at" timestamp,
	"sales_order_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_bank_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"code" varchar(50) NOT NULL,
	"name" varchar(256) NOT NULL,
	"bank_code" varchar(10),
	"bank_name" varchar(100),
	"agency" varchar(20),
	"account_number" varchar(30),
	"account_digit" varchar(5),
	"account_type" varchar(50) DEFAULT 'checking',
	"initial_balance" numeric(15, 2) DEFAULT '0',
	"current_balance" numeric(15, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_cash_flow_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"parent_id" integer,
	"contabil_account_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"default_bank_account_id" integer,
	"fee" numeric(5, 2) DEFAULT '0',
	"days_to_receive" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_payment_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"installments" integer DEFAULT 1,
	"interval_days" integer DEFAULT 30,
	"first_due_days" integer DEFAULT 30,
	"discount_percent" numeric(5, 2) DEFAULT '0',
	"interest_percent" numeric(5, 2) DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fin_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"bank_account_id" integer NOT NULL,
	"type" varchar(20) NOT NULL,
	"category_id" integer,
	"amount" numeric(15, 2) NOT NULL,
	"balance_after" numeric(15, 2),
	"transaction_date" date NOT NULL,
	"description" text,
	"document_number" varchar(100),
	"payable_id" integer,
	"receivable_id" integer,
	"transfer_from_id" integer,
	"transfer_to_id" integer,
	"reconciled" boolean DEFAULT false,
	"reconciled_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fiscal_certificados" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"nome" varchar(100) NOT NULL,
	"tipo" varchar(5) NOT NULL,
	"cnpj" varchar(20) NOT NULL,
	"razao_social" varchar(200),
	"serial_number" varchar(100),
	"valido_ate" timestamp,
	"arquivo" text,
	"senha" text,
	"ambiente" varchar(20) DEFAULT 'homologacao',
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fiscal_cests" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" varchar(9) NOT NULL,
	"descricao" text NOT NULL,
	"ncm_inicio" varchar(10),
	"ncm_fim" varchar(10),
	"segmento" varchar(100),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "fiscal_cests_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "fiscal_cfops" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" varchar(4) NOT NULL,
	"descricao" text NOT NULL,
	"tipo" varchar(20) NOT NULL,
	"natureza" varchar(50),
	"gera_credito" integer DEFAULT 0,
	"gera_debito" integer DEFAULT 0,
	"movimenta_estoque" integer DEFAULT 1,
	"aplicacao" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "fiscal_cfops_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "fiscal_configuracoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"cnpj" varchar(20),
	"ie" varchar(20),
	"im" varchar(20),
	"cnae" varchar(10),
	"crt" varchar(2),
	"serie_nfe" integer DEFAULT 1,
	"serie_nfce" integer DEFAULT 1,
	"proximo_num_nfe" integer DEFAULT 1,
	"proximo_num_nfce" integer DEFAULT 1,
	"csc_id" varchar(10),
	"csc_token" varchar(50),
	"ambiente" varchar(20) DEFAULT 'homologacao',
	"certificado_id" integer,
	"horario_inicio" varchar(5),
	"horario_fim" varchar(5),
	"enviar_email_automatico" integer DEFAULT 0,
	"imprimir_danfe_automatico" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "fiscal_configuracoes_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "fiscal_eventos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nota_id" integer NOT NULL,
	"tipo_evento" varchar(10) NOT NULL,
	"sequencia" integer DEFAULT 1,
	"descricao" text,
	"justificativa" text,
	"protocolo" varchar(50),
	"data_evento" timestamp,
	"status" varchar(30),
	"xml_evento" text,
	"xml_retorno" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fiscal_grupos_tributacao" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"nome" varchar(100) NOT NULL,
	"descricao" text,
	"ncm" varchar(10),
	"cest" varchar(9),
	"cst_csosn" varchar(5),
	"perc_icms" numeric(5, 2) DEFAULT '0',
	"perc_red_bc" numeric(5, 2) DEFAULT '0',
	"mod_bc_st" varchar(5),
	"perc_mva_st" numeric(5, 2) DEFAULT '0',
	"perc_icms_st" numeric(5, 2) DEFAULT '0',
	"perc_red_bc_st" numeric(5, 2) DEFAULT '0',
	"cst_pis" varchar(3),
	"perc_pis" numeric(5, 2) DEFAULT '0',
	"cst_cofins" varchar(3),
	"perc_cofins" numeric(5, 2) DEFAULT '0',
	"cst_ipi" varchar(3),
	"perc_ipi" numeric(5, 2) DEFAULT '0',
	"c_enq" varchar(3),
	"cfop_estadual" varchar(4),
	"cfop_outro_estado" varchar(4),
	"cfop_entrada_estadual" varchar(4),
	"cfop_entrada_outro_estado" varchar(4),
	"codigo_beneficio_fiscal" varchar(20),
	"cst_ibs_cbs" varchar(5),
	"classe_trib_ibs_cbs" varchar(10),
	"perc_ibs_uf" numeric(5, 2) DEFAULT '0',
	"perc_ibs_mun" numeric(5, 2) DEFAULT '0',
	"perc_cbs" numeric(5, 2) DEFAULT '0',
	"perc_dif" numeric(5, 2) DEFAULT '0',
	"padrao" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fiscal_ibpt" (
	"id" serial PRIMARY KEY NOT NULL,
	"ncm" varchar(10) NOT NULL,
	"ex_tipi" varchar(3),
	"tabela" varchar(3),
	"aliq_nac" numeric(5, 2) DEFAULT '0',
	"aliq_imp" numeric(5, 2) DEFAULT '0',
	"aliq_est" numeric(5, 2) DEFAULT '0',
	"aliq_mun" numeric(5, 2) DEFAULT '0',
	"vigencia_inicio" timestamp,
	"vigencia_fim" timestamp,
	"versao" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "fiscal_natureza_operacao" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"codigo" varchar(20),
	"descricao" varchar(200) NOT NULL,
	"cst_csosn" varchar(5),
	"cst_pis" varchar(3),
	"cst_cofins" varchar(3),
	"cst_ipi" varchar(3),
	"cfop_estadual" varchar(4),
	"cfop_outro_estado" varchar(4),
	"cfop_entrada_estadual" varchar(4),
	"cfop_entrada_outro_estado" varchar(4),
	"perc_icms" numeric(5, 2) DEFAULT '0',
	"perc_pis" numeric(5, 2) DEFAULT '0',
	"perc_cofins" numeric(5, 2) DEFAULT '0',
	"perc_ipi" numeric(5, 2) DEFAULT '0',
	"sobrescrever_cfop" integer DEFAULT 0,
	"movimentar_estoque" integer DEFAULT 1,
	"padrao" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fiscal_ncms" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" varchar(10) NOT NULL,
	"descricao" text NOT NULL,
	"aliq_ipi" numeric(5, 2) DEFAULT '0',
	"aliq_import" numeric(5, 2) DEFAULT '0',
	"unidade_tributavel" varchar(10),
	"ex_tipi" varchar(3),
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "fiscal_ncms_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "fiscal_nota_itens" (
	"id" serial PRIMARY KEY NOT NULL,
	"nota_id" integer NOT NULL,
	"produto_id" integer,
	"codigo" varchar(60),
	"descricao" varchar(256) NOT NULL,
	"ncm" varchar(10),
	"cest" varchar(9),
	"cfop" varchar(4),
	"unidade" varchar(10),
	"quantidade" numeric(15, 4) NOT NULL,
	"valor_unitario" numeric(15, 4) NOT NULL,
	"valor_desconto" numeric(15, 2) DEFAULT '0',
	"valor_total" numeric(15, 2) NOT NULL,
	"origem" varchar(2),
	"cst_csosn" varchar(5),
	"bc_icms" numeric(15, 2) DEFAULT '0',
	"perc_icms" numeric(5, 2) DEFAULT '0',
	"valor_icms" numeric(15, 2) DEFAULT '0',
	"bc_icms_st" numeric(15, 2) DEFAULT '0',
	"perc_icms_st" numeric(5, 2) DEFAULT '0',
	"valor_icms_st" numeric(15, 2) DEFAULT '0',
	"cst_pis" varchar(3),
	"bc_pis" numeric(15, 2) DEFAULT '0',
	"perc_pis" numeric(5, 2) DEFAULT '0',
	"valor_pis" numeric(15, 2) DEFAULT '0',
	"cst_cofins" varchar(3),
	"bc_cofins" numeric(15, 2) DEFAULT '0',
	"perc_cofins" numeric(5, 2) DEFAULT '0',
	"valor_cofins" numeric(15, 2) DEFAULT '0',
	"cst_ipi" varchar(3),
	"bc_ipi" numeric(15, 2) DEFAULT '0',
	"perc_ipi" numeric(5, 2) DEFAULT '0',
	"valor_ipi" numeric(15, 2) DEFAULT '0',
	"cst_ibs_cbs" varchar(5),
	"valor_ibs_uf" numeric(15, 2) DEFAULT '0',
	"valor_ibs_mun" numeric(15, 2) DEFAULT '0',
	"valor_cbs" numeric(15, 2) DEFAULT '0',
	"ordem" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "fiscal_notas" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"modelo" varchar(3) NOT NULL,
	"serie" integer NOT NULL,
	"numero" integer NOT NULL,
	"chave" varchar(44),
	"natureza_operacao" varchar(100),
	"data_emissao" timestamp NOT NULL,
	"data_saida" timestamp,
	"tipo_operacao" varchar(5),
	"tipo_emissao" varchar(5) DEFAULT '1',
	"finalidade" varchar(5) DEFAULT '1',
	"consumidor_final" varchar(5) DEFAULT '0',
	"presenca_comprador" varchar(5) DEFAULT '1',
	"destinatario_id" integer,
	"destinatario_tipo" varchar(20),
	"destinatario_doc" varchar(20),
	"destinatario_nome" varchar(200),
	"valor_produtos" numeric(15, 2) DEFAULT '0',
	"valor_frete" numeric(15, 2) DEFAULT '0',
	"valor_seguro" numeric(15, 2) DEFAULT '0',
	"valor_desconto" numeric(15, 2) DEFAULT '0',
	"valor_outros" numeric(15, 2) DEFAULT '0',
	"valor_total" numeric(15, 2) DEFAULT '0',
	"valor_icms" numeric(15, 2) DEFAULT '0',
	"valor_icms_st" numeric(15, 2) DEFAULT '0',
	"valor_pis" numeric(15, 2) DEFAULT '0',
	"valor_cofins" numeric(15, 2) DEFAULT '0',
	"valor_ipi" numeric(15, 2) DEFAULT '0',
	"valor_ibs_uf" numeric(15, 2) DEFAULT '0',
	"valor_ibs_mun" numeric(15, 2) DEFAULT '0',
	"valor_cbs" numeric(15, 2) DEFAULT '0',
	"status" varchar(30) DEFAULT 'rascunho',
	"codigo_status" varchar(10),
	"motivo_status" text,
	"protocolo" varchar(50),
	"data_autorizacao" timestamp,
	"xml_envio" text,
	"xml_retorno" text,
	"xml_autorizado" text,
	"pedido_origem_id" integer,
	"pedido_origem_tipo" varchar(20),
	"informacoes_adicionais" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_code" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" varchar(256) NOT NULL,
	"description" text,
	"language" varchar(20) DEFAULT 'python' NOT NULL,
	"code_type" varchar(50) NOT NULL,
	"code" text NOT NULL,
	"parameters" jsonb,
	"generated_from" varchar(256),
	"usage_count" integer DEFAULT 0,
	"last_used_at" timestamp,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "graph_edges" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"target_id" integer NOT NULL,
	"relation" varchar(256) NOT NULL,
	"weight" numeric DEFAULT '1.0',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "graph_nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"type" varchar(256) NOT NULL,
	"external_id" varchar(512),
	"data" jsonb NOT NULL,
	"embedding" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "imei_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"device_id" integer NOT NULL,
	"imei" varchar(20) NOT NULL,
	"action" varchar(50) NOT NULL,
	"previous_status" varchar(50),
	"new_status" varchar(50),
	"previous_location" varchar(100),
	"new_location" varchar(100),
	"related_order_id" integer,
	"related_order_type" varchar(30),
	"related_order_number" varchar(30),
	"cost" numeric(12, 2),
	"notes" text,
	"created_by" varchar,
	"created_by_name" varchar(200),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_base" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"author" text NOT NULL,
	"category" text NOT NULL,
	"source" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learned_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"user_id" varchar,
	"source" varchar(50) NOT NULL,
	"session_id" varchar(256),
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"context" jsonb,
	"tools_used" text[],
	"data_sources_accessed" text[],
	"confidence" numeric(5, 2),
	"feedback" varchar(20),
	"category" varchar(100),
	"tags" text[],
	"is_indexed" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learned_patterns" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" varchar(256) NOT NULL,
	"description" text,
	"pattern_type" varchar(50) NOT NULL,
	"source_dataset" varchar(256),
	"source_table" varchar(256),
	"pattern" jsonb NOT NULL,
	"confidence" numeric(5, 2),
	"usage_count" integer DEFAULT 0,
	"last_used_at" timestamp,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"user_id" varchar,
	"session_id" varchar(256),
	"event_type" varchar(50) NOT NULL,
	"module" varchar(100) NOT NULL,
	"data" jsonb,
	"url" text,
	"time_spent" integer,
	"is_processed" integer DEFAULT 0,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lease_agreements" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"store_id" integer,
	"agreement_number" varchar(20) NOT NULL,
	"customer_id" varchar,
	"customer_name" varchar(200) NOT NULL,
	"customer_cpf" varchar(14),
	"customer_phone" varchar(20),
	"device_id" integer NOT NULL,
	"imei" varchar(20) NOT NULL,
	"lease_start_date" date NOT NULL,
	"lease_end_date" date NOT NULL,
	"number_of_months" integer NOT NULL,
	"monthly_payment" numeric(12, 2) NOT NULL,
	"total_lease_cost" numeric(12, 2) NOT NULL,
	"purchase_option_available" boolean DEFAULT true,
	"purchase_price" numeric(12, 2),
	"purchase_price_includes_paid_rent" boolean DEFAULT false,
	"rent_credit_percent" numeric(5, 2) DEFAULT '50',
	"paid_months" integer DEFAULT 0,
	"total_paid" numeric(12, 2) DEFAULT '0',
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lease_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"lease_id" integer NOT NULL,
	"payment_number" integer NOT NULL,
	"due_date" date NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"paid_amount" numeric(12, 2) DEFAULT '0',
	"paid_date" date,
	"payment_method" varchar(50),
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manus_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"prompt" text NOT NULL,
	"status" text DEFAULT 'running',
	"result" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "manus_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"run_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"thought" text,
	"tool" text,
	"tool_input" text,
	"tool_output" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"interaction_id" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "migration_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"staged_table_id" integer,
	"mapping_id" integer,
	"erp_connection_id" integer,
	"status" text DEFAULT 'pending',
	"total_records" integer DEFAULT 0,
	"processed_records" integer DEFAULT 0,
	"success_records" integer DEFAULT 0,
	"error_records" integer DEFAULT 0,
	"error_log" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mobile_devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"imei" varchar(20) NOT NULL,
	"imei2" varchar(20),
	"brand" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"color" varchar(50),
	"storage" varchar(20),
	"ram" varchar(20),
	"condition" varchar(20) DEFAULT 'new',
	"purchase_date" date,
	"purchase_price" numeric(12, 2),
	"selling_price" numeric(12, 2),
	"warranty_expiry" date,
	"warehouse_id" integer,
	"store_id" integer,
	"status" varchar(20) DEFAULT 'in_stock',
	"sold_date" date,
	"sold_to_customer" varchar,
	"last_service_date" date,
	"notes" text,
	"acquisition_type" varchar(20) DEFAULT 'purchase',
	"acquisition_cost" numeric(12, 2),
	"related_evaluation_id" integer,
	"related_service_order_id" integer,
	"person_id" integer,
	"suggested_price" numeric(12, 2),
	"profit_margin" numeric(5, 2),
	"erpnext_item_code" varchar(140),
	"erpnext_serial_no" varchar(140),
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "module_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"module" text NOT NULL,
	"can_access" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"parent_block_id" integer,
	"type" text NOT NULL,
	"content" text,
	"properties" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_page_id" integer NOT NULL,
	"target_page_id" integer NOT NULL,
	"block_id" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "para_archive" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"original_type" varchar(20) NOT NULL,
	"original_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"metadata" jsonb,
	"archived_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "para_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"color" varchar(20) DEFAULT '#10b981',
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "para_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"project_type" varchar(20) DEFAULT 'personal',
	"production_project_id" integer,
	"status" varchar(20) DEFAULT 'active',
	"color" varchar(20) DEFAULT '#3b82f6',
	"icon" varchar(50),
	"due_date" timestamp,
	"completed_at" timestamp,
	"progress" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "para_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"type" varchar(50) DEFAULT 'link',
	"url" text,
	"content" text,
	"tags" text[],
	"project_id" integer,
	"area_id" integer,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "para_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar(300) NOT NULL,
	"description" text,
	"project_id" integer,
	"area_id" integer,
	"triad_category" varchar(20) DEFAULT 'importante' NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"priority" integer DEFAULT 0,
	"due_date" timestamp,
	"reminder_at" timestamp,
	"estimated_minutes" integer,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "partner_clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"commission_rate" numeric(5, 2),
	"status" text DEFAULT 'active',
	"notes" text,
	"started_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "partner_commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"reference_month" text NOT NULL,
	"client_plan_code" text,
	"client_plan_value" integer NOT NULL,
	"commission_rate" numeric(5, 2) NOT NULL,
	"commission_value" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"approved_at" timestamp,
	"paid_at" timestamp,
	"payment_reference" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_plan_installments" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"installment_number" integer NOT NULL,
	"due_date" date NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"paid_amount" numeric(12, 2) DEFAULT '0',
	"paid_date" date,
	"payment_method" varchar(50),
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"sale_id" integer,
	"customer_id" varchar,
	"customer_name" varchar(200),
	"total_amount" numeric(12, 2) NOT NULL,
	"down_payment" numeric(12, 2) DEFAULT '0',
	"remaining_amount" numeric(12, 2) NOT NULL,
	"number_of_installments" integer NOT NULL,
	"installment_amount" numeric(12, 2) NOT NULL,
	"interest_rate" numeric(5, 2) DEFAULT '0',
	"first_installment_date" date NOT NULL,
	"paid_installments" integer DEFAULT 0,
	"total_paid" numeric(12, 2) DEFAULT '0',
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_canvas_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"block_type" text NOT NULL,
	"level" text DEFAULT 'intencao' NOT NULL,
	"title" text,
	"content" text,
	"notes" text,
	"synthesis" text,
	"score" integer DEFAULT 0,
	"status" text DEFAULT 'pending',
	"pdca_status" text DEFAULT 'plan',
	"pdca_action_plan" text,
	"pdca_result" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_canvas_expected_outputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_id" integer NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_canvas_pdca_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_id" integer NOT NULL,
	"title" text NOT NULL,
	"pdca_status" text DEFAULT 'plan',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_canvas_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_id" integer NOT NULL,
	"question" text NOT NULL,
	"answer" text,
	"score" integer DEFAULT 0,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_canvas_swot_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_id" integer NOT NULL,
	"swot_item_id" integer,
	"title" text,
	"type" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_client_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"email" text,
	"phone" text,
	"is_primary" text DEFAULT 'false',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"industry" text,
	"website" text,
	"address" text,
	"notes" text,
	"logo_url" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_collaborators" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"type" text DEFAULT 'programador' NOT NULL,
	"hourly_rate" numeric(10, 2) DEFAULT '0',
	"skills" text[],
	"status" text DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_crm_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"opportunity_id" integer,
	"lead_id" integer,
	"client_id" integer,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_date" timestamp,
	"completed_at" timestamp,
	"is_completed" text DEFAULT 'false',
	"assigned_to_id" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_crm_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"source" text,
	"status" text DEFAULT 'new',
	"notes" text,
	"assigned_to_id" varchar,
	"converted_to_client_id" integer,
	"converted_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_crm_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"client_id" integer,
	"lead_id" integer,
	"stage_id" integer,
	"name" text NOT NULL,
	"description" text,
	"value" integer DEFAULT 0,
	"probability" integer DEFAULT 50,
	"expected_close_date" timestamp,
	"actual_close_date" timestamp,
	"status" text DEFAULT 'open',
	"lost_reason" text,
	"assigned_to_id" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_crm_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#3b82f6',
	"order_index" integer DEFAULT 0,
	"is_default" text DEFAULT 'false',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_deliverables" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text,
	"due_date" timestamp,
	"status" text DEFAULT 'pending',
	"file_url" text,
	"assigned_to_id" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pc_erp_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"is_active" integer DEFAULT 1,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_erp_parameterization_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_completed" integer DEFAULT 0,
	"completed_at" timestamp,
	"completed_by_id" varchar,
	"notes" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_erp_parameterization_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"erp_module" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_erp_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"project_id" integer NOT NULL,
	"process_id" integer,
	"erp_module_id" integer,
	"requirement" text NOT NULL,
	"description" text,
	"erp_module" text,
	"adherence_status" text DEFAULT 'nao_atendido',
	"priority" text DEFAULT 'media',
	"customization_notes" text,
	"estimated_effort" text,
	"process_redesign_required" integer DEFAULT 0,
	"pdca_status" text DEFAULT 'plan',
	"recommendation" text,
	"action_due_date" timestamp,
	"action_assignee_id" varchar,
	"action_result" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_generated_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"configuration_id" integer,
	"project_id" integer,
	"name" text NOT NULL,
	"report_type" text,
	"content" text,
	"format" text DEFAULT 'pdf' NOT NULL,
	"file_path" text,
	"file_size" integer,
	"status" text DEFAULT 'pending',
	"generated_by" varchar,
	"generated_at" timestamp,
	"updated_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "pc_pdca_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"cycle_id" integer NOT NULL,
	"phase" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"responsible" text,
	"status" text DEFAULT 'pending',
	"due_date" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_pdca_cycles" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"project_id" integer,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'plan',
	"priority" text DEFAULT 'medium',
	"due_date" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pc_process_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"process_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"responsible" text,
	"inputs" text,
	"outputs" text,
	"systems" text,
	"duration" text,
	"pain_points" text,
	"improvements" text,
	"order_index" integer DEFAULT 0,
	"status" text DEFAULT 'active',
	"pdca_status" text DEFAULT 'plan',
	"pdca_action_plan" text,
	"pdca_result" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_processes" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"owner" text,
	"status" text DEFAULT 'draft',
	"priority" integer DEFAULT 0,
	"order_index" integer DEFAULT 0,
	"diagram_nodes" jsonb DEFAULT '[]'::jsonb,
	"diagram_edges" jsonb DEFAULT '[]'::jsonb,
	"diagram_viewport" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_project_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" varchar,
	"activity_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"metadata" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_project_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_project_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "pc_project_history_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "pc_project_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" varchar,
	"collaborator_id" integer,
	"role" text DEFAULT 'member',
	"is_external" integer DEFAULT 0,
	"assigned_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_project_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"assigned_to" text,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_project_team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"client_id" integer,
	"name" text NOT NULL,
	"description" text,
	"project_type" text DEFAULT 'consultoria' NOT NULL,
	"prod_type" text DEFAULT 'internal',
	"client_name" text,
	"compass_project_id" integer,
	"history" text,
	"status" text DEFAULT 'backlog' NOT NULL,
	"manager_id" varchar,
	"start_date" timestamp,
	"due_date" timestamp,
	"priority" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_report_configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"project_id" integer,
	"template_id" integer,
	"name" text NOT NULL,
	"description" text,
	"sections" jsonb DEFAULT '[]'::jsonb,
	"section_options" jsonb DEFAULT '{}'::jsonb,
	"layout_options" jsonb DEFAULT '{}'::jsonb,
	"filters" jsonb DEFAULT '{}'::jsonb,
	"last_generated_at" timestamp,
	"created_by_id" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_report_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"template_type" text NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb,
	"is_default" integer DEFAULT 0,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"project_id" integer,
	"code" text,
	"title" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'functional',
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'draft',
	"source" text,
	"category" text,
	"acceptance_criteria" text,
	"pdca_status" text DEFAULT 'plan',
	"pdca_action_plan" text,
	"pdca_result" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_sprints" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"project_id" integer,
	"squad_id" integer,
	"name" text NOT NULL,
	"goal" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" text DEFAULT 'planning',
	"velocity" integer,
	"completed_points" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_squad_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"squad_id" integer NOT NULL,
	"user_id" varchar,
	"collaborator_id" varchar,
	"member_role" text DEFAULT 'member',
	"joined_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_squads" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" text NOT NULL,
	"description" text,
	"leader_id" varchar,
	"product_owner_id" varchar,
	"tech_lead_id" varchar,
	"color" text DEFAULT '#3b82f6',
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_swot_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sector" text,
	"analysis_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"status" text DEFAULT 'draft',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_swot_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"swot_analysis_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"description" text NOT NULL,
	"impact" text DEFAULT 'medium',
	"impact_score" integer DEFAULT 3,
	"priority_level" text DEFAULT 'medium',
	"priority" integer DEFAULT 0,
	"action_plan" text,
	"result" text,
	"pdca_status" text DEFAULT 'plan',
	"responsible" text,
	"due_date" timestamp,
	"status" text DEFAULT 'identified',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"deliverable_id" integer,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'todo',
	"priority" text DEFAULT 'medium',
	"due_date" timestamp,
	"assigned_to_id" varchar,
	"created_by_id" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pc_timesheet_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"work_item_id" integer,
	"project_id" integer,
	"sprint_id" integer,
	"user_id" varchar,
	"collaborator_id" integer,
	"date" timestamp NOT NULL,
	"hours" numeric(6, 2) NOT NULL,
	"description" text,
	"billable" integer DEFAULT 1,
	"hourly_rate" numeric(10, 2),
	"total_cost" numeric(12, 2),
	"status" text DEFAULT 'draft',
	"timer_started_at" timestamp,
	"approved_by_id" varchar,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_work_item_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_item_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_work_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"project_id" integer,
	"sprint_id" integer,
	"parent_id" integer,
	"code" text,
	"title" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'task' NOT NULL,
	"origin" text DEFAULT 'direct',
	"origin_id" integer,
	"origin_type" text,
	"status" text DEFAULT 'backlog',
	"priority" text DEFAULT 'medium',
	"story_points" integer,
	"effort_score" integer,
	"estimated_hours" numeric(10, 2),
	"actual_hours" numeric(10, 2),
	"hourly_rate" numeric(10, 2),
	"total_cost" numeric(12, 2),
	"due_date" timestamp,
	"assignee_id" varchar,
	"created_by_id" varchar,
	"tags" text[],
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "people_beneficios" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"codigo" varchar(20),
	"nome" varchar(100) NOT NULL,
	"tipo" varchar(30),
	"fornecedor" varchar(100),
	"valor_empresa" numeric(15, 2),
	"valor_funcionario" numeric(15, 2),
	"percentual_desconto" numeric(5, 2),
	"evento_desconto_id" integer,
	"status" varchar(20) DEFAULT 'ativo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people_cargos" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"codigo" varchar(20),
	"nome" varchar(100) NOT NULL,
	"descricao" text,
	"cbo" varchar(10),
	"nivel" varchar(50),
	"departamento" varchar(100),
	"salario_base" numeric(15, 2),
	"status" varchar(20) DEFAULT 'ativo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people_departamentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"codigo" varchar(20),
	"nome" varchar(100) NOT NULL,
	"centro_custo_id" integer,
	"gerente" varchar,
	"departamento_pai" integer,
	"status" varchar(20) DEFAULT 'ativo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people_dependentes" (
	"id" serial PRIMARY KEY NOT NULL,
	"funcionario_id" integer NOT NULL,
	"nome" varchar(200) NOT NULL,
	"cpf" varchar(14),
	"data_nascimento" timestamp,
	"parentesco" varchar(30),
	"irrf" integer DEFAULT 0,
	"salario_familia" integer DEFAULT 0,
	"plano_saude" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people_eventos_folha" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"codigo" varchar(10) NOT NULL,
	"nome" varchar(100) NOT NULL,
	"tipo" varchar(20) NOT NULL,
	"natureza" varchar(20),
	"incidencias" jsonb,
	"formula" text,
	"conta_debito" integer,
	"conta_credito" integer,
	"status" varchar(20) DEFAULT 'ativo',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people_ferias" (
	"id" serial PRIMARY KEY NOT NULL,
	"funcionario_id" integer NOT NULL,
	"periodo_aquisitivo_inicio" timestamp NOT NULL,
	"periodo_aquisitivo_fim" timestamp NOT NULL,
	"dias_direito" integer DEFAULT 30,
	"dias_gozados" integer DEFAULT 0,
	"dias_vendidos" integer DEFAULT 0,
	"data_inicio" timestamp,
	"data_fim" timestamp,
	"valor_ferias" numeric(15, 2),
	"valor_terco" numeric(15, 2),
	"valor_abono" numeric(15, 2),
	"status" varchar(20) DEFAULT 'pendente',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people_folha_eventos" (
	"id" serial PRIMARY KEY NOT NULL,
	"folha_item_id" integer NOT NULL,
	"evento_id" integer NOT NULL,
	"referencia" numeric(10, 2),
	"valor" numeric(15, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people_folha_itens" (
	"id" serial PRIMARY KEY NOT NULL,
	"folha_id" integer NOT NULL,
	"funcionario_id" integer NOT NULL,
	"salario_base" numeric(15, 2),
	"dias_trabalhados" integer,
	"horas_extras_50" numeric(10, 2) DEFAULT '0',
	"horas_extras_100" numeric(10, 2) DEFAULT '0',
	"horas_noturnas" numeric(10, 2) DEFAULT '0',
	"faltas" integer DEFAULT 0,
	"atrasos" numeric(10, 2) DEFAULT '0',
	"total_proventos" numeric(15, 2) DEFAULT '0',
	"total_descontos" numeric(15, 2) DEFAULT '0',
	"total_liquido" numeric(15, 2) DEFAULT '0',
	"base_inss" numeric(15, 2) DEFAULT '0',
	"valor_inss" numeric(15, 2) DEFAULT '0',
	"base_irrf" numeric(15, 2) DEFAULT '0',
	"valor_irrf" numeric(15, 2) DEFAULT '0',
	"base_fgts" numeric(15, 2) DEFAULT '0',
	"valor_fgts" numeric(15, 2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "people_folha_pagamento" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"competencia" varchar(7) NOT NULL,
	"tipo" varchar(20) NOT NULL,
	"data_calculo" timestamp,
	"data_pagamento" timestamp,
	"total_bruto" numeric(15, 2) DEFAULT '0',
	"total_descontos" numeric(15, 2) DEFAULT '0',
	"total_liquido" numeric(15, 2) DEFAULT '0',
	"total_inss" numeric(15, 2) DEFAULT '0',
	"total_irrf" numeric(15, 2) DEFAULT '0',
	"total_fgts" numeric(15, 2) DEFAULT '0',
	"status" varchar(20) DEFAULT 'aberta',
	"contabilizado" integer DEFAULT 0,
	"lancamento_contabil_id" integer,
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people_funcionario_beneficios" (
	"id" serial PRIMARY KEY NOT NULL,
	"funcionario_id" integer NOT NULL,
	"beneficio_id" integer NOT NULL,
	"data_inicio" timestamp,
	"data_fim" timestamp,
	"valor_personalizado" numeric(15, 2),
	"status" varchar(20) DEFAULT 'ativo'
);
--> statement-breakpoint
CREATE TABLE "people_funcionarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"user_id" varchar,
	"matricula" varchar(20),
	"nome" varchar(200) NOT NULL,
	"cpf" varchar(14),
	"rg" varchar(20),
	"data_nascimento" timestamp,
	"sexo" varchar(1),
	"estado_civil" varchar(20),
	"nacionalidade" varchar(50),
	"naturalidade" varchar(100),
	"nome_mae" varchar(200),
	"nome_pai" varchar(200),
	"email" varchar(200),
	"telefone" varchar(20),
	"celular" varchar(20),
	"cep" varchar(10),
	"logradouro" varchar(200),
	"numero" varchar(20),
	"complemento" varchar(100),
	"bairro" varchar(100),
	"cidade" varchar(100),
	"uf" varchar(2),
	"pis" varchar(20),
	"ctps" varchar(20),
	"ctps_serie" varchar(10),
	"ctps_uf" varchar(2),
	"banco" varchar(10),
	"agencia" varchar(10),
	"conta" varchar(20),
	"tipo_conta" varchar(20),
	"chave_pix" varchar(100),
	"cargo_id" integer,
	"departamento_id" integer,
	"data_admissao" timestamp,
	"data_demissao" timestamp,
	"tipo_contrato" varchar(20),
	"jornada_trabalho" varchar(20),
	"salario" numeric(15, 2),
	"matricula_esocial" varchar(30),
	"categoria_esocial" varchar(5),
	"status" varchar(20) DEFAULT 'ativo',
	"foto" text,
	"observacoes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people_ponto" (
	"id" serial PRIMARY KEY NOT NULL,
	"funcionario_id" integer NOT NULL,
	"data" timestamp NOT NULL,
	"entrada1" varchar(5),
	"saida1" varchar(5),
	"entrada2" varchar(5),
	"saida2" varchar(5),
	"horas_trabalhadas" numeric(10, 2),
	"horas_extras" numeric(10, 2),
	"horas_noturnas" numeric(10, 2),
	"atraso" numeric(10, 2),
	"falta" integer DEFAULT 0,
	"justificativa" text,
	"status" varchar(20) DEFAULT 'normal',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people_tabelas_calculo" (
	"id" serial PRIMARY KEY NOT NULL,
	"tipo" varchar(20) NOT NULL,
	"vigencia" timestamp NOT NULL,
	"faixa_inicio" numeric(15, 2) NOT NULL,
	"faixa_fim" numeric(15, 2),
	"aliquota" numeric(5, 2),
	"deducao" numeric(15, 2),
	"valor" numeric(15, 2)
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"module" text NOT NULL,
	"action" text NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "person_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer NOT NULL,
	"role_type" varchar(30) NOT NULL,
	"credit_limit" numeric(12, 2),
	"payment_terms" varchar(50),
	"customer_since" date,
	"supplier_code" varchar(30),
	"supplier_category" varchar(50),
	"lead_time" integer,
	"min_order_value" numeric(12, 2),
	"employee_code" varchar(30),
	"department" varchar(50),
	"position" varchar(100),
	"hire_date" date,
	"termination_date" date,
	"salary" numeric(12, 2),
	"commission_rate" numeric(5, 2),
	"specializations" text[],
	"certifications" text[],
	"avg_repair_time" integer,
	"quality_score" numeric(5, 2),
	"is_active" boolean DEFAULT true,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "persons" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"full_name" varchar(255) NOT NULL,
	"cpf_cnpj" varchar(20),
	"rg_ie" varchar(30),
	"email" varchar(255),
	"phone" varchar(20),
	"phone2" varchar(20),
	"whatsapp" varchar(20),
	"address" text,
	"address_number" varchar(20),
	"complement" varchar(100),
	"neighborhood" varchar(100),
	"city" varchar(100),
	"state" varchar(2),
	"zip_code" varchar(10),
	"country" varchar(50) DEFAULT 'Brasil',
	"birth_date" date,
	"gender" varchar(20),
	"notes" text,
	"photo_url" text,
	"is_active" boolean DEFAULT true,
	"erpnext_customer_id" varchar(140),
	"erpnext_supplier_id" varchar(140),
	"erpnext_employee_id" varchar(140),
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pos_sale_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"item_type" varchar(20) DEFAULT 'product',
	"item_code" varchar(50),
	"item_name" varchar(200) NOT NULL,
	"imei" varchar(20),
	"device_id" integer,
	"quantity" integer DEFAULT 1,
	"unit_price" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0',
	"total_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pos_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"session_id" integer NOT NULL,
	"store_id" integer NOT NULL,
	"sale_number" varchar(20) NOT NULL,
	"sale_type" varchar(20) DEFAULT 'direct_sale',
	"customer_id" varchar,
	"customer_name" varchar(200),
	"customer_phone" varchar(20),
	"customer_cpf" varchar(14),
	"subtotal" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0',
	"discount_percent" numeric(5, 2) DEFAULT '0',
	"trade_in_value" numeric(12, 2) DEFAULT '0',
	"trade_in_evaluation_id" integer,
	"total_amount" numeric(12, 2) NOT NULL,
	"payment_method" varchar(50),
	"payment_details" jsonb,
	"installments" integer DEFAULT 1,
	"payment_plan_id" integer,
	"status" varchar(20) DEFAULT 'completed',
	"sold_by" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pos_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"store_id" integer NOT NULL,
	"cashier_id" varchar NOT NULL,
	"cashier_name" varchar(200),
	"session_start_time" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"session_end_time" timestamp,
	"opening_balance" numeric(12, 2) DEFAULT '0',
	"closing_balance" numeric(12, 2),
	"total_sales" numeric(12, 2) DEFAULT '0',
	"total_refunds" numeric(12, 2) DEFAULT '0',
	"net_sales" numeric(12, 2) DEFAULT '0',
	"cash_payments" numeric(12, 2) DEFAULT '0',
	"card_payments" numeric(12, 2) DEFAULT '0',
	"pix_payments" numeric(12, 2) DEFAULT '0',
	"other_payments" numeric(12, 2) DEFAULT '0',
	"transaction_count" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'open',
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"code" varchar(50) NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"category" varchar(100),
	"unit" varchar(20) DEFAULT 'UN',
	"cost_price" numeric(15, 2) DEFAULT '0',
	"sale_price" numeric(15, 2) DEFAULT '0',
	"stock_qty" numeric(15, 3) DEFAULT '0',
	"min_stock" numeric(15, 3) DEFAULT '0',
	"barcode" varchar(50),
	"ncm" varchar(20),
	"tax_group_id" integer,
	"status" varchar(50) DEFAULT 'active',
	"image_url" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'custom' NOT NULL,
	"allowed_modules" text[],
	"is_system" integer DEFAULT 0,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "profiles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"product_name" varchar(256) NOT NULL,
	"quantity" numeric(15, 3) NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"total" numeric(15, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"order_number" varchar(50) NOT NULL,
	"supplier_id" integer,
	"order_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expected_date" timestamp,
	"status" varchar(50) DEFAULT 'draft',
	"subtotal" numeric(15, 2) DEFAULT '0',
	"discount" numeric(15, 2) DEFAULT '0',
	"tax" numeric(15, 2) DEFAULT '0',
	"total" numeric(15, 2) DEFAULT '0',
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quality_document_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer,
	"version" varchar(20),
	"revision_number" integer,
	"change_description" text,
	"revised_by" varchar,
	"revised_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"file_url" text
);
--> statement-breakpoint
CREATE TABLE "quality_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"document_code" varchar(50) NOT NULL,
	"title" varchar(256) NOT NULL,
	"type" varchar(50),
	"category" varchar(100),
	"version" varchar(20) DEFAULT '01',
	"revision_number" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'vigente',
	"effective_date" timestamp,
	"expiry_date" timestamp,
	"next_review_date" timestamp,
	"author" varchar(256),
	"approved_by" varchar,
	"approved_at" timestamp,
	"file_url" text,
	"description" text,
	"keywords" text[],
	"access_level" varchar(20) DEFAULT 'interno',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quality_field_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"project_id" integer,
	"form_type" varchar(100) NOT NULL,
	"form_code" varchar(50),
	"title" varchar(256),
	"collection_date" timestamp,
	"location" text,
	"coordinates" varchar(100),
	"responsible_id" varchar,
	"team_members" text[],
	"weather_conditions" varchar(100),
	"form_data" jsonb,
	"photos" text[],
	"signature" text,
	"status" varchar(50) DEFAULT 'rascunho',
	"synced_at" timestamp,
	"observations" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quality_lab_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"sample_id" integer,
	"report_number" varchar(100),
	"laboratory_id" integer,
	"issue_date" timestamp,
	"reception_date" timestamp,
	"parameters" jsonb,
	"conclusion" text,
	"status" varchar(50) DEFAULT 'recebido',
	"file_url" text,
	"observations" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quality_non_conformities" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"project_id" integer,
	"rnc_number" varchar(50) NOT NULL,
	"title" varchar(256) NOT NULL,
	"description" text,
	"type" varchar(50) DEFAULT 'nao_conformidade',
	"source" varchar(100),
	"severity" varchar(20) DEFAULT 'media',
	"detected_by" varchar(256),
	"detected_at" timestamp,
	"root_cause" text,
	"immediate_action" text,
	"corrective_action" text,
	"preventive_action" text,
	"responsible_id" varchar,
	"due_date" timestamp,
	"closed_at" timestamp,
	"closed_by" varchar,
	"verification_date" timestamp,
	"verified_by" varchar,
	"effectiveness_verified" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'aberta',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quality_samples" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"project_id" integer,
	"sample_code" varchar(50) NOT NULL,
	"sample_type" varchar(100),
	"collection_date" timestamp,
	"collection_location" text,
	"collection_responsible" varchar(256),
	"collection_method" varchar(100),
	"preservation_method" varchar(100),
	"laboratory_id" integer,
	"sent_to_lab_date" timestamp,
	"lab_reception_date" timestamp,
	"expected_result_date" timestamp,
	"actual_result_date" timestamp,
	"status" varchar(50) DEFAULT 'coletada',
	"observations" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quality_training_matrix" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"employee_id" varchar,
	"training_name" varchar(256) NOT NULL,
	"training_type" varchar(100),
	"provider" varchar(256),
	"completed_date" timestamp,
	"expiry_date" timestamp,
	"certificate_url" text,
	"hours" integer,
	"status" varchar(50) DEFAULT 'pendente',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quick_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"is_pinned" integer DEFAULT 0,
	"color" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retail_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"code" varchar(20) NOT NULL,
	"name" varchar(200) NOT NULL,
	"store_type" varchar(50) DEFAULT 'store',
	"parent_store_id" integer,
	"warehouse_id" integer,
	"cnpj" varchar(20),
	"legal_name" varchar(200),
	"address" text,
	"city" varchar(100),
	"state" varchar(2),
	"zip_code" varchar(10),
	"phone" varchar(20),
	"email" varchar(100),
	"manager_id" varchar,
	"pos_enabled" boolean DEFAULT true,
	"service_enabled" boolean DEFAULT true,
	"lease_enabled" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "retail_warehouses" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"code" varchar(20) NOT NULL,
	"name" varchar(200) NOT NULL,
	"parent_store_id" integer,
	"is_main_warehouse" boolean DEFAULT false,
	"address" text,
	"city" varchar(100),
	"state" varchar(2),
	"phone" varchar(20),
	"manager_id" varchar,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "return_exchange_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"return_id" integer NOT NULL,
	"item_code" varchar(50),
	"item_name" varchar(200) NOT NULL,
	"quantity" integer DEFAULT 1,
	"imei" varchar(20),
	"device_id" integer,
	"reason" text,
	"refund_amount" numeric(12, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "return_exchanges" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"store_id" integer,
	"return_number" varchar(20) NOT NULL,
	"original_sale_id" integer,
	"customer_id" varchar,
	"customer_name" varchar(200),
	"return_type" varchar(20) DEFAULT 'return',
	"reason" text,
	"refund_amount" numeric(12, 2) DEFAULT '0',
	"refund_method" varchar(50),
	"processed_by" varchar,
	"return_date" date DEFAULT CURRENT_DATE,
	"processed_date" date,
	"status" varchar(20) DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_system" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sales_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"product_name" varchar(256) NOT NULL,
	"quantity" numeric(15, 3) NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"discount" numeric(15, 2) DEFAULT '0',
	"total" numeric(15, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"order_number" varchar(50) NOT NULL,
	"customer_id" integer,
	"order_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"delivery_date" timestamp,
	"status" varchar(50) DEFAULT 'draft',
	"subtotal" numeric(15, 2) DEFAULT '0',
	"discount" numeric(15, 2) DEFAULT '0',
	"tax" numeric(15, 2) DEFAULT '0',
	"total" numeric(15, 2) DEFAULT '0',
	"payment_method" varchar(50),
	"notes" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"automation_id" integer,
	"cron_expression" text,
	"interval_minutes" integer,
	"next_run_at" timestamp,
	"last_run_at" timestamp,
	"is_active" text DEFAULT 'true'
);
--> statement-breakpoint
CREATE TABLE "service_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_order_id" integer NOT NULL,
	"item_type" varchar(20) DEFAULT 'part',
	"item_code" varchar(50),
	"item_name" varchar(200) NOT NULL,
	"quantity" integer DEFAULT 1,
	"unit_price" numeric(12, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"order_number" varchar(20) NOT NULL,
	"store_id" integer,
	"device_id" integer,
	"imei" varchar(20) NOT NULL,
	"brand" varchar(50),
	"model" varchar(100),
	"customer_id" varchar,
	"customer_name" varchar(200) NOT NULL,
	"customer_phone" varchar(20),
	"customer_email" varchar(100),
	"person_id" integer,
	"service_type" varchar(50) DEFAULT 'repair',
	"issue_description" text NOT NULL,
	"diagnosis_notes" text,
	"origin" varchar(50) DEFAULT 'customer_request',
	"assigned_to" varchar,
	"technician_name" varchar(200),
	"technician_person_id" integer,
	"parts_cost" numeric(12, 2) DEFAULT '0',
	"labor_cost" numeric(12, 2) DEFAULT '0',
	"total_cost" numeric(12, 2) DEFAULT '0',
	"expected_completion_date" date,
	"actual_completion_date" date,
	"payment_status" varchar(20) DEFAULT 'pending',
	"status" varchar(20) DEFAULT 'open',
	"priority" varchar(20) DEFAULT 'normal',
	"is_internal" boolean DEFAULT false,
	"internal_type" varchar(30),
	"source_evaluation_id" integer,
	"erpnext_doc_type" varchar(50),
	"erpnext_doc_name" varchar(140),
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staged_tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"name" text NOT NULL,
	"source_type" text NOT NULL,
	"source_file" text,
	"table_name" text NOT NULL,
	"columns" text,
	"row_count" integer DEFAULT 0,
	"status" text DEFAULT 'ready',
	"target_erp" text,
	"description" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staging_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"staged_table_id" integer,
	"name" text NOT NULL,
	"target_erp" text NOT NULL,
	"target_entity" text NOT NULL,
	"field_mappings" text NOT NULL,
	"filters" text,
	"transformations" text,
	"is_active" text DEFAULT 'true',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_transfer_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"transfer_id" integer NOT NULL,
	"device_id" integer NOT NULL,
	"imei" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_transfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"transfer_number" varchar(20) NOT NULL,
	"from_warehouse_id" integer,
	"from_store_id" integer,
	"to_warehouse_id" integer,
	"to_store_id" integer,
	"requested_date" date DEFAULT CURRENT_DATE,
	"shipped_date" date,
	"received_date" date,
	"tracking_number" varchar(100),
	"total_items" integer DEFAULT 0,
	"requested_by" varchar,
	"approved_by" varchar,
	"received_by" varchar,
	"status" varchar(20) DEFAULT 'draft',
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"code" varchar(50) NOT NULL,
	"name" varchar(256) NOT NULL,
	"tax_id" varchar(50),
	"email" varchar(256),
	"phone" varchar(50),
	"address" text,
	"city" varchar(100),
	"state" varchar(50),
	"country" varchar(100) DEFAULT 'Brasil',
	"payment_terms" integer DEFAULT 30,
	"status" varchar(50) DEFAULT 'active',
	"notes" text,
	"is_homologated" integer DEFAULT 0,
	"homologation_date" timestamp,
	"homologation_expiry" timestamp,
	"homologation_status" varchar(50),
	"certifications" text[],
	"quality_score" integer,
	"last_audit_date" timestamp,
	"next_audit_date" timestamp,
	"blocked_for_purchase" integer DEFAULT 0,
	"block_reason" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"user_id" varchar,
	"sender_type" text NOT NULL,
	"content" text NOT NULL,
	"is_ai_generated" integer DEFAULT 0,
	"ai_model" text,
	"attachments" text[],
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_knowledge_base" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text,
	"tags" text[],
	"status" text DEFAULT 'published',
	"view_count" integer DEFAULT 0,
	"helpful_count" integer DEFAULT 0,
	"author_id" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"client_id" integer,
	"project_id" integer,
	"code" text,
	"title" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general',
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'open',
	"channel" text DEFAULT 'portal',
	"assignee_id" varchar,
	"created_by_id" varchar,
	"work_item_id" integer,
	"resolved_at" timestamp,
	"first_response_at" timestamp,
	"closed_at" timestamp,
	"sla_deadline" timestamp,
	"satisfaction" integer,
	"tags" text[],
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer,
	"status" text NOT NULL,
	"result" text,
	"error" text,
	"started_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tenant_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"tenant_type" text NOT NULL,
	"max_users" integer DEFAULT 5,
	"max_storage_mb" integer DEFAULT 1000,
	"features" jsonb,
	"monthly_price" integer DEFAULT 0,
	"yearly_price" integer DEFAULT 0,
	"trial_days" integer DEFAULT 14,
	"is_active" text DEFAULT 'true',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "tenant_plans_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tenant_production_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"timesheet_requires_approval" integer DEFAULT 0,
	"timesheet_allow_timer" integer DEFAULT 1,
	"default_hourly_rate" numeric(10, 2) DEFAULT '0',
	"work_hours_per_day" numeric(4, 2) DEFAULT '8',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "tenant_production_settings_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "tenant_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" text DEFAULT 'member',
	"is_owner" text DEFAULT 'false',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"email" text,
	"phone" text,
	"logo_url" text,
	"plan" text DEFAULT 'free',
	"status" text DEFAULT 'active',
	"settings" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"tenant_type" text DEFAULT 'client',
	"parent_tenant_id" integer,
	"partner_code" text,
	"commission_rate" numeric(5, 2),
	"max_users" integer DEFAULT 5,
	"max_storage_mb" integer DEFAULT 1000,
	"features" jsonb,
	"billing_email" text,
	"trial_ends_at" timestamp,
	"commercial_contact" text,
	"commercial_phone" text,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "trade_in_checklist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"category" varchar(50) NOT NULL,
	"item_name" varchar(100) NOT NULL,
	"item_description" text,
	"evaluation_type" varchar(20) DEFAULT 'condition',
	"options" text,
	"impact_on_value" numeric(5, 2) DEFAULT '0',
	"is_required" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_in_checklist_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"name" varchar(100) NOT NULL,
	"description" text,
	"device_category" varchar(50) DEFAULT 'smartphone',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_in_evaluation_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"evaluation_id" integer NOT NULL,
	"checklist_item_id" integer NOT NULL,
	"result" varchar(50),
	"percent_value" integer,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade_in_transfer_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"store_id" integer,
	"evaluation_id" integer NOT NULL,
	"document_number" varchar(30) NOT NULL,
	"customer_name" varchar(200) NOT NULL,
	"customer_cpf" varchar(14),
	"customer_rg" varchar(20),
	"customer_address" text,
	"customer_phone" varchar(20),
	"customer_email" varchar(100),
	"device_brand" varchar(50) NOT NULL,
	"device_model" varchar(100) NOT NULL,
	"device_imei" varchar(20) NOT NULL,
	"device_imei2" varchar(20),
	"device_color" varchar(50),
	"device_storage" varchar(20),
	"device_condition" varchar(50),
	"agreed_value" numeric(12, 2) NOT NULL,
	"payment_method" varchar(50),
	"customer_signature" text,
	"customer_signed_at" timestamp,
	"employee_signature" text,
	"employee_name" varchar(200),
	"employee_signed_at" timestamp,
	"terms_accepted" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'draft',
	"pdf_url" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_applications" (
	"user_id" varchar NOT NULL,
	"application_id" varchar NOT NULL,
	CONSTRAINT "user_applications_user_id_application_id_pk" PRIMARY KEY("user_id","application_id")
);
--> statement-breakpoint
CREATE TABLE "user_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"module" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"entity_title" text,
	"entity_icon" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" varchar NOT NULL,
	"role_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"role" text DEFAULT 'user',
	"profile_id" integer,
	"partner_id" integer,
	"collaborator_type" text,
	"hourly_rate" numeric(10, 2) DEFAULT '0',
	"skills" text[],
	"status" text DEFAULT 'active',
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "valuation_agent_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"confidence" numeric,
	"source" text,
	"status" text DEFAULT 'pending',
	"applied_at" timestamp,
	"applied_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_assumptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"value" numeric,
	"unit" text,
	"source" text,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_calculations" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"method" text NOT NULL,
	"weight" numeric,
	"enterprise_value" numeric,
	"equity_value" numeric,
	"assumptions" jsonb,
	"sensitivity_matrix" jsonb,
	"details" jsonb,
	"version" integer DEFAULT 1,
	"status" text DEFAULT 'draft',
	"calculated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"calculated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "valuation_canvas" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"block" text NOT NULL,
	"content" text,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_canvas_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"block_type" text NOT NULL,
	"title" text,
	"items" text[],
	"notes" text,
	"order_index" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_canvas_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text,
	"canvas_data" jsonb NOT NULL,
	"consistency_score" integer,
	"consistency_notes" text[],
	"created_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_cap_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"shareholder_name" text NOT NULL,
	"shareholder_type" text,
	"share_class" text DEFAULT 'common',
	"shares_owned" integer,
	"percentage_owned" numeric,
	"investment_amount" numeric,
	"liquidation_preference" numeric,
	"vesting_schedule" text,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_category_weights" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"segment" text NOT NULL,
	"category_code" text NOT NULL,
	"weight" integer DEFAULT 10 NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_checklist_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"progress_id" integer NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"storage_path" text NOT NULL,
	"uploaded_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_checklist_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0,
	"icon" text,
	"segment_filter" text,
	CONSTRAINT "valuation_checklist_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "valuation_checklist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"format" text,
	"is_required" integer DEFAULT 1,
	"order_index" integer DEFAULT 0,
	"segment_filter" text,
	"agent_prompt" text,
	CONSTRAINT "valuation_checklist_items_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "valuation_checklist_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"status" text DEFAULT 'pending',
	"notes" text,
	"document_id" integer,
	"data_json" text,
	"agent_analysis" text,
	"completed_at" timestamp,
	"completed_by" varchar,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_document_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"user_id" varchar,
	"action" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"transaction_id" integer,
	"name" text NOT NULL,
	"folder" text,
	"file_url" text,
	"file_type" text,
	"file_size" integer,
	"access_level" text DEFAULT 'view_only',
	"watermark" integer DEFAULT 0,
	"uploaded_by" varchar,
	"view_count" integer DEFAULT 0,
	"download_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_inputs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"year" integer NOT NULL,
	"is_projection" integer DEFAULT 0,
	"revenue" numeric,
	"gross_profit" numeric,
	"ebitda" numeric,
	"ebit" numeric,
	"net_income" numeric,
	"total_assets" numeric,
	"total_liabilities" numeric,
	"total_equity" numeric,
	"cash" numeric,
	"debt" numeric,
	"working_capital" numeric,
	"capex" numeric,
	"depreciation" numeric,
	"free_cash_flow" numeric,
	"arr" numeric,
	"mrr" numeric,
	"churn_rate" numeric,
	"ltv" numeric,
	"cac" numeric,
	"gmv" numeric,
	"tpv" numeric,
	"take_rate" numeric,
	"growth_rate" numeric,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_maturity_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"dimension" text NOT NULL,
	"score" integer,
	"max_score" integer DEFAULT 100,
	"benchmark" integer,
	"responses" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"cnpj" text,
	"sector" text NOT NULL,
	"business_model" text,
	"stage" text NOT NULL,
	"size" text NOT NULL,
	"status" text DEFAULT 'draft',
	"consultant_id" varchar,
	"client_user_id" varchar,
	"client_id" integer,
	"valuation_range_min" numeric,
	"valuation_range_max" numeric,
	"final_value" numeric,
	"currency" text DEFAULT 'BRL',
	"report_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_sector_benchmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"segment" text NOT NULL,
	"indicator_code" text NOT NULL,
	"indicator_name" text NOT NULL,
	"min_value" numeric,
	"max_value" numeric,
	"avg_value" numeric,
	"top_quartile" numeric,
	"unit" text,
	"source" text,
	"year" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_sector_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"overall_score" integer,
	"category_scores" jsonb,
	"indicator_scores" jsonb,
	"strengths" text[],
	"weaknesses" text[],
	"recommendations" text[],
	"analysis_notes" text,
	"calculated_by" varchar,
	"calculated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "valuation_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"type" text NOT NULL,
	"phase" text NOT NULL,
	"target_close_date" timestamp,
	"actual_close_date" timestamp,
	"deal_value" numeric,
	"status" text DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"whatsapp_id" text NOT NULL,
	"name" text,
	"push_name" text,
	"phone_number" text,
	"profile_pic_url" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"whatsapp_contact_id" integer,
	"remote_jid" text NOT NULL,
	"message_id" text NOT NULL,
	"from_me" text DEFAULT 'false',
	"body" text,
	"message_type" text DEFAULT 'text',
	"timestamp" timestamp NOT NULL,
	"status" text DEFAULT 'received',
	"quoted_message_id" text,
	"quoted_body" text,
	"is_deleted" integer DEFAULT 0,
	"is_edited" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_queues" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#10B981',
	"greeting" text,
	"is_active" integer DEFAULT 1,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"session_data" text,
	"status" text DEFAULT 'disconnected',
	"phone_number" text,
	"last_sync" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" varchar NOT NULL,
	"contact_id" integer NOT NULL,
	"queue_id" integer,
	"assigned_to_id" varchar,
	"status" text DEFAULT 'open',
	"last_message" text,
	"unread_count" integer DEFAULT 0,
	"protocol" text,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"parent_id" integer,
	"title" text DEFAULT 'Sem título' NOT NULL,
	"icon" text,
	"cover_image" text,
	"is_public" integer DEFAULT 0,
	"is_favorite" integer DEFAULT 0,
	"is_archived" integer DEFAULT 0,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_erp_connection_id_erp_connections_id_fk" FOREIGN KEY ("erp_connection_id") REFERENCES "public"."erp_connections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arc_doctypes" ADD CONSTRAINT "arc_doctypes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arc_fields" ADD CONSTRAINT "arc_fields_doctype_id_arc_doctypes_id_fk" FOREIGN KEY ("doctype_id") REFERENCES "public"."arc_doctypes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arc_layouts" ADD CONSTRAINT "arc_layouts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arc_pages" ADD CONSTRAINT "arc_pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arc_pages" ADD CONSTRAINT "arc_pages_doctype_id_arc_doctypes_id_fk" FOREIGN KEY ("doctype_id") REFERENCES "public"."arc_doctypes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arc_scripts" ADD CONSTRAINT "arc_scripts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arc_scripts" ADD CONSTRAINT "arc_scripts_doctype_id_arc_doctypes_id_fk" FOREIGN KEY ("doctype_id") REFERENCES "public"."arc_doctypes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arc_widgets" ADD CONSTRAINT "arc_widgets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arc_workflows" ADD CONSTRAINT "arc_workflows_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_actions" ADD CONSTRAINT "automation_actions_automation_id_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_logs" ADD CONSTRAINT "automation_logs_automation_id_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automations" ADD CONSTRAINT "automations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_artifacts" ADD CONSTRAINT "backup_artifacts_backup_job_id_backup_jobs_id_fk" FOREIGN KEY ("backup_job_id") REFERENCES "public"."backup_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_artifacts" ADD CONSTRAINT "backup_artifacts_automation_log_id_automation_logs_id_fk" FOREIGN KEY ("automation_log_id") REFERENCES "public"."automation_logs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_jobs" ADD CONSTRAINT "backup_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backup_jobs" ADD CONSTRAINT "backup_jobs_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."data_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bi_charts" ADD CONSTRAINT "bi_charts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bi_charts" ADD CONSTRAINT "bi_charts_dataset_id_bi_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."bi_datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bi_dashboard_charts" ADD CONSTRAINT "bi_dashboard_charts_dashboard_id_bi_dashboards_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "public"."bi_dashboards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bi_dashboard_charts" ADD CONSTRAINT "bi_dashboard_charts_chart_id_bi_charts_id_fk" FOREIGN KEY ("chart_id") REFERENCES "public"."bi_charts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bi_dashboards" ADD CONSTRAINT "bi_dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bi_datasets" ADD CONSTRAINT "bi_datasets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bi_datasets" ADD CONSTRAINT "bi_datasets_data_source_id_data_sources_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "public"."data_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_attachments" ADD CONSTRAINT "chat_attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_thread_id_chat_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_thread_id_chat_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "command_history" ADD CONSTRAINT "command_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_channels" ADD CONSTRAINT "community_channels_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_messages" ADD CONSTRAINT "community_messages_channel_id_community_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."community_channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_messages" ADD CONSTRAINT "community_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabil_config_lancamento" ADD CONSTRAINT "contabil_config_lancamento_conta_debito_contabil_plano_contas_id_fk" FOREIGN KEY ("conta_debito") REFERENCES "public"."contabil_plano_contas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabil_config_lancamento" ADD CONSTRAINT "contabil_config_lancamento_conta_credito_contabil_plano_contas_id_fk" FOREIGN KEY ("conta_credito") REFERENCES "public"."contabil_plano_contas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabil_config_lancamento" ADD CONSTRAINT "contabil_config_lancamento_centro_custo_contabil_centros_custo_id_fk" FOREIGN KEY ("centro_custo") REFERENCES "public"."contabil_centros_custo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabil_lancamentos" ADD CONSTRAINT "contabil_lancamentos_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabil_partidas" ADD CONSTRAINT "contabil_partidas_lancamento_id_contabil_lancamentos_id_fk" FOREIGN KEY ("lancamento_id") REFERENCES "public"."contabil_lancamentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabil_partidas" ADD CONSTRAINT "contabil_partidas_conta_id_contabil_plano_contas_id_fk" FOREIGN KEY ("conta_id") REFERENCES "public"."contabil_plano_contas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabil_partidas" ADD CONSTRAINT "contabil_partidas_centro_custo_id_contabil_centros_custo_id_fk" FOREIGN KEY ("centro_custo_id") REFERENCES "public"."contabil_centros_custo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabil_periodos" ADD CONSTRAINT "contabil_periodos_fechado_por_users_id_fk" FOREIGN KEY ("fechado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabil_saldos" ADD CONSTRAINT "contabil_saldos_conta_id_contabil_plano_contas_id_fk" FOREIGN KEY ("conta_id") REFERENCES "public"."contabil_plano_contas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabil_saldos" ADD CONSTRAINT "contabil_saldos_centro_custo_id_contabil_centros_custo_id_fk" FOREIGN KEY ("centro_custo_id") REFERENCES "public"."contabil_centros_custo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_campaign_contacts" ADD CONSTRAINT "crm_campaign_contacts_campaign_id_crm_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."crm_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_campaigns" ADD CONSTRAINT "crm_campaigns_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_campaigns" ADD CONSTRAINT "crm_campaigns_channel_id_crm_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."crm_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_campaigns" ADD CONSTRAINT "crm_campaigns_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_channels" ADD CONSTRAINT "crm_channels_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_clients" ADD CONSTRAINT "crm_clients_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_clients" ADD CONSTRAINT "crm_clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_commissions" ADD CONSTRAINT "crm_commissions_contract_id_crm_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."crm_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_commissions" ADD CONSTRAINT "crm_commissions_revenue_schedule_id_crm_revenue_schedule_id_fk" FOREIGN KEY ("revenue_schedule_id") REFERENCES "public"."crm_revenue_schedule"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_commissions" ADD CONSTRAINT "crm_commissions_rule_id_crm_commission_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."crm_commission_rules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_commissions" ADD CONSTRAINT "crm_commissions_partner_id_crm_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."crm_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_commissions" ADD CONSTRAINT "crm_commissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contract_milestones" ADD CONSTRAINT "crm_contract_milestones_contract_id_crm_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."crm_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contracts" ADD CONSTRAINT "crm_contracts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contracts" ADD CONSTRAINT "crm_contracts_client_id_pc_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."pc_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contracts" ADD CONSTRAINT "crm_contracts_partner_id_crm_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."crm_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_contracts" ADD CONSTRAINT "crm_contracts_opportunity_id_pc_crm_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."pc_crm_opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_events" ADD CONSTRAINT "crm_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_events" ADD CONSTRAINT "crm_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_events" ADD CONSTRAINT "crm_events_opportunity_id_pc_crm_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."pc_crm_opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_events" ADD CONSTRAINT "crm_events_lead_id_pc_crm_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."pc_crm_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_events" ADD CONSTRAINT "crm_events_client_id_pc_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."pc_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_frappe_mappings" ADD CONSTRAINT "crm_frappe_mappings_connector_id_crm_frappe_connectors_id_fk" FOREIGN KEY ("connector_id") REFERENCES "public"."crm_frappe_connectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_google_tokens" ADD CONSTRAINT "crm_google_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_leads" ADD CONSTRAINT "crm_leads_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_leads" ADD CONSTRAINT "crm_leads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_leads" ADD CONSTRAINT "crm_leads_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_messages" ADD CONSTRAINT "crm_messages_thread_id_crm_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."crm_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_messages" ADD CONSTRAINT "crm_messages_channel_id_crm_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."crm_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_messages" ADD CONSTRAINT "crm_messages_sent_by_id_users_id_fk" FOREIGN KEY ("sent_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_lead_id_crm_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."crm_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_partner_id_crm_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."crm_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_stage_id_crm_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."crm_pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_products" ADD CONSTRAINT "crm_opportunity_products_opportunity_id_crm_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_products" ADD CONSTRAINT "crm_opportunity_products_product_id_crm_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."crm_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_registrations" ADD CONSTRAINT "crm_opportunity_registrations_partner_id_crm_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."crm_partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_opportunity_registrations" ADD CONSTRAINT "crm_opportunity_registrations_opportunity_id_pc_crm_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."pc_crm_opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_partner_certifications" ADD CONSTRAINT "crm_partner_certifications_partner_id_crm_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."crm_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_partner_certifications" ADD CONSTRAINT "crm_partner_certifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_partner_performance" ADD CONSTRAINT "crm_partner_performance_partner_id_crm_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."crm_partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_partners" ADD CONSTRAINT "crm_partners_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_pipeline_stages" ADD CONSTRAINT "crm_pipeline_stages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_products" ADD CONSTRAINT "crm_products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_proposal_items" ADD CONSTRAINT "crm_proposal_items_proposal_id_crm_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."crm_proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_proposal_items" ADD CONSTRAINT "crm_proposal_items_product_id_crm_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."crm_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_proposals" ADD CONSTRAINT "crm_proposals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_proposals" ADD CONSTRAINT "crm_proposals_opportunity_id_crm_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."crm_opportunities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_proposals" ADD CONSTRAINT "crm_proposals_client_id_crm_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."crm_clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_proposals" ADD CONSTRAINT "crm_proposals_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_quick_messages" ADD CONSTRAINT "crm_quick_messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_quick_messages" ADD CONSTRAINT "crm_quick_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_revenue_schedule" ADD CONSTRAINT "crm_revenue_schedule_contract_id_crm_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."crm_contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_sync_logs" ADD CONSTRAINT "crm_sync_logs_connector_id_crm_frappe_connectors_id_fk" FOREIGN KEY ("connector_id") REFERENCES "public"."crm_frappe_connectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_threads" ADD CONSTRAINT "crm_threads_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_threads" ADD CONSTRAINT "crm_threads_channel_id_crm_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."crm_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_threads" ADD CONSTRAINT "crm_threads_client_id_pc_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."pc_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_threads" ADD CONSTRAINT "crm_threads_lead_id_pc_crm_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."pc_crm_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_threads" ADD CONSTRAINT "crm_threads_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_mcp_servers" ADD CONSTRAINT "custom_mcp_servers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_evaluations" ADD CONSTRAINT "device_evaluations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_evaluations" ADD CONSTRAINT "device_evaluations_store_id_retail_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."retail_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_evaluations" ADD CONSTRAINT "device_evaluations_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."mobile_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_history" ADD CONSTRAINT "device_history_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."mobile_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctype_fields" ADD CONSTRAINT "doctype_fields_doctype_id_doctypes_id_fk" FOREIGN KEY ("doctype_id") REFERENCES "public"."doctypes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctype_records" ADD CONSTRAINT "doctype_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctype_records" ADD CONSTRAINT "doctype_records_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_accounts" ADD CONSTRAINT "email_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_accounts" ADD CONSTRAINT "email_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_attachments" ADD CONSTRAINT "email_attachments_message_id_email_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."email_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_folders" ADD CONSTRAINT "email_folders_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."email_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."email_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_folder_id_email_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."email_folders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environmental_services" ADD CONSTRAINT "environmental_services_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_config" ADD CONSTRAINT "erp_config_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_config" ADD CONSTRAINT "erp_config_segment_id_erp_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."erp_segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_app_permissions" ADD CONSTRAINT "external_app_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_expenses" ADD CONSTRAINT "field_expenses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_expenses" ADD CONSTRAINT "field_expenses_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_expenses" ADD CONSTRAINT "field_expenses_responsible_id_users_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_expenses" ADD CONSTRAINT "field_expenses_approved_by_leader_users_id_fk" FOREIGN KEY ("approved_by_leader") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_expenses" ADD CONSTRAINT "field_expenses_approved_by_finance_users_id_fk" FOREIGN KEY ("approved_by_finance") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_accounts_payable" ADD CONSTRAINT "fin_accounts_payable_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_accounts_payable" ADD CONSTRAINT "fin_accounts_payable_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_accounts_payable" ADD CONSTRAINT "fin_accounts_payable_category_id_fin_cash_flow_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."fin_cash_flow_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_accounts_payable" ADD CONSTRAINT "fin_accounts_payable_payment_method_id_fin_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."fin_payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_accounts_payable" ADD CONSTRAINT "fin_accounts_payable_bank_account_id_fin_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."fin_bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_accounts_payable" ADD CONSTRAINT "fin_accounts_payable_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_accounts_receivable" ADD CONSTRAINT "fin_accounts_receivable_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_accounts_receivable" ADD CONSTRAINT "fin_accounts_receivable_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_accounts_receivable" ADD CONSTRAINT "fin_accounts_receivable_category_id_fin_cash_flow_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."fin_cash_flow_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_accounts_receivable" ADD CONSTRAINT "fin_accounts_receivable_payment_method_id_fin_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."fin_payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_accounts_receivable" ADD CONSTRAINT "fin_accounts_receivable_bank_account_id_fin_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."fin_bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_accounts_receivable" ADD CONSTRAINT "fin_accounts_receivable_sales_order_id_sales_orders_id_fk" FOREIGN KEY ("sales_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_bank_accounts" ADD CONSTRAINT "fin_bank_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_cash_flow_categories" ADD CONSTRAINT "fin_cash_flow_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_payment_methods" ADD CONSTRAINT "fin_payment_methods_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_payment_methods" ADD CONSTRAINT "fin_payment_methods_default_bank_account_id_fin_bank_accounts_id_fk" FOREIGN KEY ("default_bank_account_id") REFERENCES "public"."fin_bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_payment_plans" ADD CONSTRAINT "fin_payment_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_transactions" ADD CONSTRAINT "fin_transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_transactions" ADD CONSTRAINT "fin_transactions_bank_account_id_fin_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."fin_bank_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_transactions" ADD CONSTRAINT "fin_transactions_category_id_fin_cash_flow_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."fin_cash_flow_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_transactions" ADD CONSTRAINT "fin_transactions_payable_id_fin_accounts_payable_id_fk" FOREIGN KEY ("payable_id") REFERENCES "public"."fin_accounts_payable"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fin_transactions" ADD CONSTRAINT "fin_transactions_receivable_id_fin_accounts_receivable_id_fk" FOREIGN KEY ("receivable_id") REFERENCES "public"."fin_accounts_receivable"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_certificados" ADD CONSTRAINT "fiscal_certificados_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_configuracoes" ADD CONSTRAINT "fiscal_configuracoes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_configuracoes" ADD CONSTRAINT "fiscal_configuracoes_certificado_id_fiscal_certificados_id_fk" FOREIGN KEY ("certificado_id") REFERENCES "public"."fiscal_certificados"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_eventos" ADD CONSTRAINT "fiscal_eventos_nota_id_fiscal_notas_id_fk" FOREIGN KEY ("nota_id") REFERENCES "public"."fiscal_notas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_eventos" ADD CONSTRAINT "fiscal_eventos_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_grupos_tributacao" ADD CONSTRAINT "fiscal_grupos_tributacao_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_natureza_operacao" ADD CONSTRAINT "fiscal_natureza_operacao_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_nota_itens" ADD CONSTRAINT "fiscal_nota_itens_nota_id_fiscal_notas_id_fk" FOREIGN KEY ("nota_id") REFERENCES "public"."fiscal_notas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_notas" ADD CONSTRAINT "fiscal_notas_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiscal_notas" ADD CONSTRAINT "fiscal_notas_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_code" ADD CONSTRAINT "generated_code_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "graph_edges" ADD CONSTRAINT "graph_edges_source_id_graph_nodes_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."graph_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "graph_edges" ADD CONSTRAINT "graph_edges_target_id_graph_nodes_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."graph_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "graph_nodes" ADD CONSTRAINT "graph_nodes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imei_history" ADD CONSTRAINT "imei_history_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "imei_history" ADD CONSTRAINT "imei_history_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."mobile_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learned_interactions" ADD CONSTRAINT "learned_interactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learned_interactions" ADD CONSTRAINT "learned_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learned_patterns" ADD CONSTRAINT "learned_patterns_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_events" ADD CONSTRAINT "learning_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_events" ADD CONSTRAINT "learning_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lease_agreements" ADD CONSTRAINT "lease_agreements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lease_agreements" ADD CONSTRAINT "lease_agreements_store_id_retail_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."retail_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lease_agreements" ADD CONSTRAINT "lease_agreements_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."mobile_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lease_payments" ADD CONSTRAINT "lease_payments_lease_id_lease_agreements_id_fk" FOREIGN KEY ("lease_id") REFERENCES "public"."lease_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manus_runs" ADD CONSTRAINT "manus_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manus_steps" ADD CONSTRAINT "manus_steps_run_id_manus_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."manus_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "migration_jobs" ADD CONSTRAINT "migration_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "migration_jobs" ADD CONSTRAINT "migration_jobs_staged_table_id_staged_tables_id_fk" FOREIGN KEY ("staged_table_id") REFERENCES "public"."staged_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "migration_jobs" ADD CONSTRAINT "migration_jobs_mapping_id_staging_mappings_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "public"."staging_mappings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "migration_jobs" ADD CONSTRAINT "migration_jobs_erp_connection_id_erp_connections_id_fk" FOREIGN KEY ("erp_connection_id") REFERENCES "public"."erp_connections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_devices" ADD CONSTRAINT "mobile_devices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_devices" ADD CONSTRAINT "mobile_devices_warehouse_id_retail_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."retail_warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_devices" ADD CONSTRAINT "mobile_devices_store_id_retail_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."retail_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_access" ADD CONSTRAINT "module_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_page_id_workspace_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."workspace_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_links" ADD CONSTRAINT "page_links_source_page_id_workspace_pages_id_fk" FOREIGN KEY ("source_page_id") REFERENCES "public"."workspace_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_links" ADD CONSTRAINT "page_links_target_page_id_workspace_pages_id_fk" FOREIGN KEY ("target_page_id") REFERENCES "public"."workspace_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_links" ADD CONSTRAINT "page_links_block_id_page_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."page_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "para_archive" ADD CONSTRAINT "para_archive_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "para_areas" ADD CONSTRAINT "para_areas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "para_projects" ADD CONSTRAINT "para_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "para_resources" ADD CONSTRAINT "para_resources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "para_resources" ADD CONSTRAINT "para_resources_project_id_para_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."para_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "para_resources" ADD CONSTRAINT "para_resources_area_id_para_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."para_areas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "para_tasks" ADD CONSTRAINT "para_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "para_tasks" ADD CONSTRAINT "para_tasks_project_id_para_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."para_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "para_tasks" ADD CONSTRAINT "para_tasks_area_id_para_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."para_areas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_clients" ADD CONSTRAINT "partner_clients_partner_id_tenants_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_clients" ADD CONSTRAINT "partner_clients_client_id_tenants_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_commissions" ADD CONSTRAINT "partner_commissions_partner_id_tenants_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_commissions" ADD CONSTRAINT "partner_commissions_client_id_tenants_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_installments" ADD CONSTRAINT "payment_plan_installments_plan_id_payment_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_sale_id_pos_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."pos_sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_canvas_blocks" ADD CONSTRAINT "pc_canvas_blocks_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_canvas_expected_outputs" ADD CONSTRAINT "pc_canvas_expected_outputs_block_id_pc_canvas_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."pc_canvas_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_canvas_pdca_links" ADD CONSTRAINT "pc_canvas_pdca_links_block_id_pc_canvas_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."pc_canvas_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_canvas_questions" ADD CONSTRAINT "pc_canvas_questions_block_id_pc_canvas_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."pc_canvas_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_canvas_swot_links" ADD CONSTRAINT "pc_canvas_swot_links_block_id_pc_canvas_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."pc_canvas_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_canvas_swot_links" ADD CONSTRAINT "pc_canvas_swot_links_swot_item_id_pc_swot_items_id_fk" FOREIGN KEY ("swot_item_id") REFERENCES "public"."pc_swot_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_client_contacts" ADD CONSTRAINT "pc_client_contacts_client_id_pc_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."pc_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_clients" ADD CONSTRAINT "pc_clients_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_clients" ADD CONSTRAINT "pc_clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_collaborators" ADD CONSTRAINT "pc_collaborators_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_activities" ADD CONSTRAINT "pc_crm_activities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_activities" ADD CONSTRAINT "pc_crm_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_activities" ADD CONSTRAINT "pc_crm_activities_opportunity_id_pc_crm_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."pc_crm_opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_activities" ADD CONSTRAINT "pc_crm_activities_lead_id_pc_crm_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."pc_crm_leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_activities" ADD CONSTRAINT "pc_crm_activities_client_id_pc_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."pc_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_activities" ADD CONSTRAINT "pc_crm_activities_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_leads" ADD CONSTRAINT "pc_crm_leads_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_leads" ADD CONSTRAINT "pc_crm_leads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_leads" ADD CONSTRAINT "pc_crm_leads_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_leads" ADD CONSTRAINT "pc_crm_leads_converted_to_client_id_pc_clients_id_fk" FOREIGN KEY ("converted_to_client_id") REFERENCES "public"."pc_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_opportunities" ADD CONSTRAINT "pc_crm_opportunities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_opportunities" ADD CONSTRAINT "pc_crm_opportunities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_opportunities" ADD CONSTRAINT "pc_crm_opportunities_client_id_pc_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."pc_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_opportunities" ADD CONSTRAINT "pc_crm_opportunities_lead_id_pc_crm_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."pc_crm_leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_opportunities" ADD CONSTRAINT "pc_crm_opportunities_stage_id_pc_crm_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."pc_crm_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_opportunities" ADD CONSTRAINT "pc_crm_opportunities_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_stages" ADD CONSTRAINT "pc_crm_stages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_crm_stages" ADD CONSTRAINT "pc_crm_stages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_deliverables" ADD CONSTRAINT "pc_deliverables_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_deliverables" ADD CONSTRAINT "pc_deliverables_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_erp_modules" ADD CONSTRAINT "pc_erp_modules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_erp_parameterization_items" ADD CONSTRAINT "pc_erp_parameterization_items_topic_id_pc_erp_parameterization_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."pc_erp_parameterization_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_erp_parameterization_items" ADD CONSTRAINT "pc_erp_parameterization_items_completed_by_id_users_id_fk" FOREIGN KEY ("completed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_erp_parameterization_topics" ADD CONSTRAINT "pc_erp_parameterization_topics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_erp_parameterization_topics" ADD CONSTRAINT "pc_erp_parameterization_topics_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_erp_requirements" ADD CONSTRAINT "pc_erp_requirements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_erp_requirements" ADD CONSTRAINT "pc_erp_requirements_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_erp_requirements" ADD CONSTRAINT "pc_erp_requirements_process_id_pc_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."pc_processes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_erp_requirements" ADD CONSTRAINT "pc_erp_requirements_erp_module_id_pc_erp_modules_id_fk" FOREIGN KEY ("erp_module_id") REFERENCES "public"."pc_erp_modules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_erp_requirements" ADD CONSTRAINT "pc_erp_requirements_action_assignee_id_users_id_fk" FOREIGN KEY ("action_assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_generated_reports" ADD CONSTRAINT "pc_generated_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_generated_reports" ADD CONSTRAINT "pc_generated_reports_configuration_id_pc_report_configurations_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."pc_report_configurations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_generated_reports" ADD CONSTRAINT "pc_generated_reports_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_generated_reports" ADD CONSTRAINT "pc_generated_reports_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_pdca_actions" ADD CONSTRAINT "pc_pdca_actions_cycle_id_pc_pdca_cycles_id_fk" FOREIGN KEY ("cycle_id") REFERENCES "public"."pc_pdca_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_pdca_cycles" ADD CONSTRAINT "pc_pdca_cycles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_pdca_cycles" ADD CONSTRAINT "pc_pdca_cycles_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_process_steps" ADD CONSTRAINT "pc_process_steps_process_id_pc_processes_id_fk" FOREIGN KEY ("process_id") REFERENCES "public"."pc_processes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_processes" ADD CONSTRAINT "pc_processes_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_project_activities" ADD CONSTRAINT "pc_project_activities_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_project_activities" ADD CONSTRAINT "pc_project_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_project_files" ADD CONSTRAINT "pc_project_files_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_project_history" ADD CONSTRAINT "pc_project_history_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_project_members" ADD CONSTRAINT "pc_project_members_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_project_members" ADD CONSTRAINT "pc_project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_project_tasks" ADD CONSTRAINT "pc_project_tasks_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_project_team_members" ADD CONSTRAINT "pc_project_team_members_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_projects" ADD CONSTRAINT "pc_projects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_projects" ADD CONSTRAINT "pc_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_projects" ADD CONSTRAINT "pc_projects_client_id_crm_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."crm_clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_projects" ADD CONSTRAINT "pc_projects_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_report_configurations" ADD CONSTRAINT "pc_report_configurations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_report_configurations" ADD CONSTRAINT "pc_report_configurations_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_report_configurations" ADD CONSTRAINT "pc_report_configurations_template_id_pc_report_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."pc_report_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_report_configurations" ADD CONSTRAINT "pc_report_configurations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_requirements" ADD CONSTRAINT "pc_requirements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_requirements" ADD CONSTRAINT "pc_requirements_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_sprints" ADD CONSTRAINT "pc_sprints_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_sprints" ADD CONSTRAINT "pc_sprints_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_sprints" ADD CONSTRAINT "pc_sprints_squad_id_pc_squads_id_fk" FOREIGN KEY ("squad_id") REFERENCES "public"."pc_squads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_squad_members" ADD CONSTRAINT "pc_squad_members_squad_id_pc_squads_id_fk" FOREIGN KEY ("squad_id") REFERENCES "public"."pc_squads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_squad_members" ADD CONSTRAINT "pc_squad_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_squads" ADD CONSTRAINT "pc_squads_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_squads" ADD CONSTRAINT "pc_squads_leader_id_users_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_swot_analyses" ADD CONSTRAINT "pc_swot_analyses_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_swot_items" ADD CONSTRAINT "pc_swot_items_swot_analysis_id_pc_swot_analyses_id_fk" FOREIGN KEY ("swot_analysis_id") REFERENCES "public"."pc_swot_analyses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_tasks" ADD CONSTRAINT "pc_tasks_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_tasks" ADD CONSTRAINT "pc_tasks_deliverable_id_pc_deliverables_id_fk" FOREIGN KEY ("deliverable_id") REFERENCES "public"."pc_deliverables"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_tasks" ADD CONSTRAINT "pc_tasks_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_tasks" ADD CONSTRAINT "pc_tasks_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_timesheet_entries" ADD CONSTRAINT "pc_timesheet_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_timesheet_entries" ADD CONSTRAINT "pc_timesheet_entries_work_item_id_pc_work_items_id_fk" FOREIGN KEY ("work_item_id") REFERENCES "public"."pc_work_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_timesheet_entries" ADD CONSTRAINT "pc_timesheet_entries_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_timesheet_entries" ADD CONSTRAINT "pc_timesheet_entries_sprint_id_pc_sprints_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."pc_sprints"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_timesheet_entries" ADD CONSTRAINT "pc_timesheet_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_timesheet_entries" ADD CONSTRAINT "pc_timesheet_entries_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_work_item_comments" ADD CONSTRAINT "pc_work_item_comments_work_item_id_pc_work_items_id_fk" FOREIGN KEY ("work_item_id") REFERENCES "public"."pc_work_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_work_item_comments" ADD CONSTRAINT "pc_work_item_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_work_items" ADD CONSTRAINT "pc_work_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_work_items" ADD CONSTRAINT "pc_work_items_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_work_items" ADD CONSTRAINT "pc_work_items_sprint_id_pc_sprints_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."pc_sprints"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_work_items" ADD CONSTRAINT "pc_work_items_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_work_items" ADD CONSTRAINT "pc_work_items_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_beneficios" ADD CONSTRAINT "people_beneficios_evento_desconto_id_people_eventos_folha_id_fk" FOREIGN KEY ("evento_desconto_id") REFERENCES "public"."people_eventos_folha"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_departamentos" ADD CONSTRAINT "people_departamentos_centro_custo_id_contabil_centros_custo_id_fk" FOREIGN KEY ("centro_custo_id") REFERENCES "public"."contabil_centros_custo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_dependentes" ADD CONSTRAINT "people_dependentes_funcionario_id_people_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."people_funcionarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_eventos_folha" ADD CONSTRAINT "people_eventos_folha_conta_debito_contabil_plano_contas_id_fk" FOREIGN KEY ("conta_debito") REFERENCES "public"."contabil_plano_contas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_eventos_folha" ADD CONSTRAINT "people_eventos_folha_conta_credito_contabil_plano_contas_id_fk" FOREIGN KEY ("conta_credito") REFERENCES "public"."contabil_plano_contas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_ferias" ADD CONSTRAINT "people_ferias_funcionario_id_people_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."people_funcionarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_folha_eventos" ADD CONSTRAINT "people_folha_eventos_folha_item_id_people_folha_itens_id_fk" FOREIGN KEY ("folha_item_id") REFERENCES "public"."people_folha_itens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_folha_eventos" ADD CONSTRAINT "people_folha_eventos_evento_id_people_eventos_folha_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."people_eventos_folha"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_folha_itens" ADD CONSTRAINT "people_folha_itens_folha_id_people_folha_pagamento_id_fk" FOREIGN KEY ("folha_id") REFERENCES "public"."people_folha_pagamento"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_folha_itens" ADD CONSTRAINT "people_folha_itens_funcionario_id_people_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."people_funcionarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_folha_pagamento" ADD CONSTRAINT "people_folha_pagamento_lancamento_contabil_id_contabil_lancamentos_id_fk" FOREIGN KEY ("lancamento_contabil_id") REFERENCES "public"."contabil_lancamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_folha_pagamento" ADD CONSTRAINT "people_folha_pagamento_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_funcionario_beneficios" ADD CONSTRAINT "people_funcionario_beneficios_funcionario_id_people_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."people_funcionarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_funcionario_beneficios" ADD CONSTRAINT "people_funcionario_beneficios_beneficio_id_people_beneficios_id_fk" FOREIGN KEY ("beneficio_id") REFERENCES "public"."people_beneficios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_funcionarios" ADD CONSTRAINT "people_funcionarios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_funcionarios" ADD CONSTRAINT "people_funcionarios_cargo_id_people_cargos_id_fk" FOREIGN KEY ("cargo_id") REFERENCES "public"."people_cargos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_funcionarios" ADD CONSTRAINT "people_funcionarios_departamento_id_people_departamentos_id_fk" FOREIGN KEY ("departamento_id") REFERENCES "public"."people_departamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_ponto" ADD CONSTRAINT "people_ponto_funcionario_id_people_funcionarios_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."people_funcionarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_roles" ADD CONSTRAINT "person_roles_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persons" ADD CONSTRAINT "persons_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sale_items" ADD CONSTRAINT "pos_sale_items_sale_id_pos_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."pos_sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sale_items" ADD CONSTRAINT "pos_sale_items_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."mobile_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sales" ADD CONSTRAINT "pos_sales_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sales" ADD CONSTRAINT "pos_sales_session_id_pos_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pos_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sales" ADD CONSTRAINT "pos_sales_store_id_retail_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."retail_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sales" ADD CONSTRAINT "pos_sales_trade_in_evaluation_id_device_evaluations_id_fk" FOREIGN KEY ("trade_in_evaluation_id") REFERENCES "public"."device_evaluations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_sessions" ADD CONSTRAINT "pos_sessions_store_id_retail_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."retail_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tax_group_id_fiscal_grupos_tributacao_id_fk" FOREIGN KEY ("tax_group_id") REFERENCES "public"."fiscal_grupos_tributacao"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_order_id_purchase_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_document_revisions" ADD CONSTRAINT "quality_document_revisions_document_id_quality_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."quality_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_document_revisions" ADD CONSTRAINT "quality_document_revisions_revised_by_users_id_fk" FOREIGN KEY ("revised_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_documents" ADD CONSTRAINT "quality_documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_documents" ADD CONSTRAINT "quality_documents_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_field_forms" ADD CONSTRAINT "quality_field_forms_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_field_forms" ADD CONSTRAINT "quality_field_forms_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_field_forms" ADD CONSTRAINT "quality_field_forms_responsible_id_users_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_lab_reports" ADD CONSTRAINT "quality_lab_reports_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_lab_reports" ADD CONSTRAINT "quality_lab_reports_sample_id_quality_samples_id_fk" FOREIGN KEY ("sample_id") REFERENCES "public"."quality_samples"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_lab_reports" ADD CONSTRAINT "quality_lab_reports_laboratory_id_suppliers_id_fk" FOREIGN KEY ("laboratory_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_non_conformities" ADD CONSTRAINT "quality_non_conformities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_non_conformities" ADD CONSTRAINT "quality_non_conformities_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_non_conformities" ADD CONSTRAINT "quality_non_conformities_responsible_id_users_id_fk" FOREIGN KEY ("responsible_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_non_conformities" ADD CONSTRAINT "quality_non_conformities_closed_by_users_id_fk" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_non_conformities" ADD CONSTRAINT "quality_non_conformities_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_samples" ADD CONSTRAINT "quality_samples_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_samples" ADD CONSTRAINT "quality_samples_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_samples" ADD CONSTRAINT "quality_samples_laboratory_id_suppliers_id_fk" FOREIGN KEY ("laboratory_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_training_matrix" ADD CONSTRAINT "quality_training_matrix_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quality_training_matrix" ADD CONSTRAINT "quality_training_matrix_employee_id_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quick_notes" ADD CONSTRAINT "quick_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retail_stores" ADD CONSTRAINT "retail_stores_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retail_warehouses" ADD CONSTRAINT "retail_warehouses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "retail_warehouses" ADD CONSTRAINT "retail_warehouses_parent_store_id_retail_stores_id_fk" FOREIGN KEY ("parent_store_id") REFERENCES "public"."retail_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_exchange_items" ADD CONSTRAINT "return_exchange_items_return_id_return_exchanges_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."return_exchanges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_exchange_items" ADD CONSTRAINT "return_exchange_items_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."mobile_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_exchanges" ADD CONSTRAINT "return_exchanges_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_exchanges" ADD CONSTRAINT "return_exchanges_store_id_retail_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."retail_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_exchanges" ADD CONSTRAINT "return_exchanges_original_sale_id_pos_sales_id_fk" FOREIGN KEY ("original_sale_id") REFERENCES "public"."pos_sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_tasks" ADD CONSTRAINT "scheduled_tasks_automation_id_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."automations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_order_items" ADD CONSTRAINT "service_order_items_service_order_id_service_orders_id_fk" FOREIGN KEY ("service_order_id") REFERENCES "public"."service_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_store_id_retail_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."retail_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."mobile_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staged_tables" ADD CONSTRAINT "staged_tables_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staging_mappings" ADD CONSTRAINT "staging_mappings_staged_table_id_staged_tables_id_fk" FOREIGN KEY ("staged_table_id") REFERENCES "public"."staged_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_transfer_id_stock_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."stock_transfers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_device_id_mobile_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."mobile_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_from_warehouse_id_retail_warehouses_id_fk" FOREIGN KEY ("from_warehouse_id") REFERENCES "public"."retail_warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_from_store_id_retail_stores_id_fk" FOREIGN KEY ("from_store_id") REFERENCES "public"."retail_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_to_warehouse_id_retail_warehouses_id_fk" FOREIGN KEY ("to_warehouse_id") REFERENCES "public"."retail_warehouses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_to_store_id_retail_stores_id_fk" FOREIGN KEY ("to_store_id") REFERENCES "public"."retail_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_conversations" ADD CONSTRAINT "support_conversations_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_conversations" ADD CONSTRAINT "support_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_knowledge_base" ADD CONSTRAINT "support_knowledge_base_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_knowledge_base" ADD CONSTRAINT "support_knowledge_base_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_client_id_crm_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."crm_clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_project_id_pc_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."pc_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_work_item_id_pc_work_items_id_fk" FOREIGN KEY ("work_item_id") REFERENCES "public"."pc_work_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_executions" ADD CONSTRAINT "task_executions_task_id_agent_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."agent_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_production_settings" ADD CONSTRAINT "tenant_production_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_in_checklist_items" ADD CONSTRAINT "trade_in_checklist_items_template_id_trade_in_checklist_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."trade_in_checklist_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_in_checklist_templates" ADD CONSTRAINT "trade_in_checklist_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_in_evaluation_results" ADD CONSTRAINT "trade_in_evaluation_results_evaluation_id_device_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."device_evaluations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_in_evaluation_results" ADD CONSTRAINT "trade_in_evaluation_results_checklist_item_id_trade_in_checklist_items_id_fk" FOREIGN KEY ("checklist_item_id") REFERENCES "public"."trade_in_checklist_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_in_transfer_documents" ADD CONSTRAINT "trade_in_transfer_documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_in_transfer_documents" ADD CONSTRAINT "trade_in_transfer_documents_store_id_retail_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."retail_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade_in_transfer_documents" ADD CONSTRAINT "trade_in_transfer_documents_evaluation_id_device_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."device_evaluations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_applications" ADD CONSTRAINT "user_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_applications" ADD CONSTRAINT "user_applications_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_agent_insights" ADD CONSTRAINT "valuation_agent_insights_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_agent_insights" ADD CONSTRAINT "valuation_agent_insights_applied_by_users_id_fk" FOREIGN KEY ("applied_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_assumptions" ADD CONSTRAINT "valuation_assumptions_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_calculations" ADD CONSTRAINT "valuation_calculations_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_calculations" ADD CONSTRAINT "valuation_calculations_calculated_by_users_id_fk" FOREIGN KEY ("calculated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_canvas" ADD CONSTRAINT "valuation_canvas_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_canvas_blocks" ADD CONSTRAINT "valuation_canvas_blocks_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_canvas_snapshots" ADD CONSTRAINT "valuation_canvas_snapshots_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_canvas_snapshots" ADD CONSTRAINT "valuation_canvas_snapshots_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_cap_table" ADD CONSTRAINT "valuation_cap_table_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_category_weights" ADD CONSTRAINT "valuation_category_weights_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_checklist_attachments" ADD CONSTRAINT "valuation_checklist_attachments_progress_id_valuation_checklist_progress_id_fk" FOREIGN KEY ("progress_id") REFERENCES "public"."valuation_checklist_progress"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_checklist_attachments" ADD CONSTRAINT "valuation_checklist_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_checklist_items" ADD CONSTRAINT "valuation_checklist_items_category_id_valuation_checklist_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."valuation_checklist_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_checklist_progress" ADD CONSTRAINT "valuation_checklist_progress_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_checklist_progress" ADD CONSTRAINT "valuation_checklist_progress_item_id_valuation_checklist_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."valuation_checklist_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_checklist_progress" ADD CONSTRAINT "valuation_checklist_progress_document_id_valuation_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."valuation_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_checklist_progress" ADD CONSTRAINT "valuation_checklist_progress_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_document_logs" ADD CONSTRAINT "valuation_document_logs_document_id_valuation_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."valuation_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_document_logs" ADD CONSTRAINT "valuation_document_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_documents" ADD CONSTRAINT "valuation_documents_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_documents" ADD CONSTRAINT "valuation_documents_transaction_id_valuation_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."valuation_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_documents" ADD CONSTRAINT "valuation_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_inputs" ADD CONSTRAINT "valuation_inputs_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_maturity_scores" ADD CONSTRAINT "valuation_maturity_scores_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_projects" ADD CONSTRAINT "valuation_projects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_projects" ADD CONSTRAINT "valuation_projects_consultant_id_users_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_projects" ADD CONSTRAINT "valuation_projects_client_user_id_users_id_fk" FOREIGN KEY ("client_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_projects" ADD CONSTRAINT "valuation_projects_client_id_crm_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."crm_clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_sector_scores" ADD CONSTRAINT "valuation_sector_scores_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_sector_scores" ADD CONSTRAINT "valuation_sector_scores_calculated_by_users_id_fk" FOREIGN KEY ("calculated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "valuation_transactions" ADD CONSTRAINT "valuation_transactions_project_id_valuation_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."valuation_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_contacts" ADD CONSTRAINT "whatsapp_contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_whatsapp_contact_id_whatsapp_contacts_id_fk" FOREIGN KEY ("whatsapp_contact_id") REFERENCES "public"."whatsapp_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_queues" ADD CONSTRAINT "whatsapp_queues_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "whatsapp_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_tickets" ADD CONSTRAINT "whatsapp_tickets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_tickets" ADD CONSTRAINT "whatsapp_tickets_contact_id_whatsapp_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."whatsapp_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_tickets" ADD CONSTRAINT "whatsapp_tickets_queue_id_whatsapp_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."whatsapp_queues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whatsapp_tickets" ADD CONSTRAINT "whatsapp_tickets_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_pages" ADD CONSTRAINT "workspace_pages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
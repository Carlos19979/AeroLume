CREATE TYPE "public"."field_type" AS ENUM('select', 'radio', 'number', 'text');--> statement-breakpoint
CREATE TYPE "public"."sail_type" AS ENUM('gvstd', 'gvfull', 'gve', 'gse', 'gn', 'spiasy', 'spisym', 'furling', 'gen');--> statement-breakpoint
CREATE TYPE "public"."quote_status" AS ENUM('draft', 'sent', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('owner', 'admin', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."tenant_plan" AS ENUM('prueba', 'pro', 'enterprise');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"boat_model" text,
	"product_id" uuid,
	"sail_type" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"session_id" text,
	"ip_address" "inet",
	"user_agent" text,
	"referrer" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"name" text NOT NULL,
	"scopes" text[] DEFAULT '{"read"}',
	"rate_limit" integer DEFAULT 1000,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "boats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"model" text NOT NULL,
	"boat_model" text,
	"length" numeric,
	"i" numeric,
	"j" numeric,
	"p" numeric,
	"e" numeric,
	"gg" numeric,
	"lp" numeric,
	"sl" numeric,
	"smw" numeric,
	"genoa_area" numeric,
	"genoa_furler_area" numeric,
	"mainsail_area" numeric,
	"mainsail_full_area" numeric,
	"mainsail_furler_area" numeric,
	"spinnaker_area" numeric,
	"spinnaker_asym_area" numeric,
	"sgen_area" numeric,
	"is_multihull" boolean DEFAULT false,
	"gvstd" numeric,
	"gvfull" numeric,
	"gve" numeric,
	"gse" numeric,
	"gn" numeric,
	"gen" numeric,
	"spisym" numeric,
	"spiasy" numeric,
	"furling" numeric,
	"id_sail_boat_type" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_config_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"field_type" "field_type" DEFAULT 'select',
	"options" jsonb DEFAULT '[]'::jsonb,
	"sort_order" integer DEFAULT 0,
	"required" boolean DEFAULT true,
	"price_modifiers" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"external_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sail_type" "sail_type" NOT NULL,
	"base_price" numeric,
	"currency" text DEFAULT 'EUR',
	"description_short" text,
	"images" text[] DEFAULT '{}',
	"active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quote_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"product_id" uuid,
	"sail_type" text NOT NULL,
	"product_name" text NOT NULL,
	"sail_area" numeric,
	"quantity" integer DEFAULT 1,
	"unit_price" numeric,
	"configuration" jsonb DEFAULT '{}'::jsonb,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"boat_id" uuid,
	"boat_model" text,
	"boat_length" numeric,
	"status" "quote_status" DEFAULT 'draft' NOT NULL,
	"customer_name" text,
	"customer_email" text,
	"customer_phone" text,
	"customer_notes" text,
	"total_price" numeric,
	"currency" text DEFAULT 'EUR',
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenant_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "member_role" DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tenant_member_unique" UNIQUE("tenant_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"custom_domain" text,
	"logo_url" text,
	"theme_accent" text DEFAULT '#0b5faa',
	"theme_accent_dim" text DEFAULT '#1a7fd4',
	"theme_navy" text DEFAULT '#0a2540',
	"theme_text" text DEFAULT '#0a1e3d',
	"theme_font_display" text DEFAULT 'Cormorant',
	"theme_font_body" text DEFAULT 'Manrope',
	"theme_color_main" text DEFAULT '#3b82f6',
	"theme_color_head" text DEFAULT '#10b981',
	"theme_color_spi" text DEFAULT '#a855f7',
	"locale" text DEFAULT 'es',
	"currency" text DEFAULT 'EUR',
	"plan" "tenant_plan" DEFAULT 'prueba',
	"ls_customer_id" text,
	"ls_subscription_id" text,
	"subscription_status" "subscription_status" DEFAULT 'trialing',
	"trial_ends_at" timestamp with time zone,
	"allowed_origins" text[] DEFAULT '{}',
	"webhook_url" text,
	"sailonet_import" boolean DEFAULT false,
	"company_name" text,
	"phone" text,
	"website" text,
	"country" text,
	"city" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tenants_custom_domain_unique" UNIQUE("custom_domain")
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boats" ADD CONSTRAINT "boats_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_config_fields" ADD CONSTRAINT "product_config_fields_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_boat_id_boats_id_fk" FOREIGN KEY ("boat_id") REFERENCES "public"."boats"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analytics_tenant_date" ON "analytics_events" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "api_keys_hash_idx" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "api_keys_tenant_idx" ON "api_keys" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_boats_tenant" ON "boats" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_boats_model" ON "boats" USING btree ("model");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_config_product_key" ON "product_config_fields" USING btree ("product_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_products_tenant_slug" ON "products" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "idx_products_sail_type" ON "products" USING btree ("tenant_id","sail_type");--> statement-breakpoint
CREATE INDEX "quote_items_quote_idx" ON "quote_items" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quotes_tenant_idx" ON "quotes" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "quotes_status_idx" ON "quotes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quotes_customer_email_idx" ON "quotes" USING btree ("customer_email");
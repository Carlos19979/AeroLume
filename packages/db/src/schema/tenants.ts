import { pgTable, uuid, text, timestamp, boolean, pgEnum, unique } from 'drizzle-orm/pg-core';

export const tenantPlanEnum = pgEnum('tenant_plan', ['prueba', 'pro', 'enterprise']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['trialing', 'active', 'past_due', 'canceled']);
export const memberRoleEnum = pgEnum('member_role', ['owner', 'admin', 'viewer']);

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  customDomain: text('custom_domain').unique(),
  logoUrl: text('logo_url'),

  // Theme
  themeAccent: text('theme_accent').default('#0b5faa'),
  themeAccentDim: text('theme_accent_dim').default('#1a7fd4'),
  themeNavy: text('theme_navy').default('#0a2540'),
  themeText: text('theme_text').default('#0a1e3d'),
  themeFontDisplay: text('theme_font_display').default('Cormorant'),
  themeFontBody: text('theme_font_body').default('Manrope'),

  // Sail group colors
  themeColorMain: text('theme_color_main').default('#3b82f6'),
  themeColorHead: text('theme_color_head').default('#10b981'),
  themeColorSpi: text('theme_color_spi').default('#a855f7'),

  // Localization
  locale: text('locale').default('es'),
  currency: text('currency').default('EUR'),

  // Subscription
  plan: tenantPlanEnum('plan').default('prueba'),
  stripeCustomerId: text('stripe_customer_id'),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').default('trialing'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),

  // Settings
  allowedOrigins: text('allowed_origins').array().default([]),
  webhookUrl: text('webhook_url'),
  sailonetImport: boolean('sailonet_import').default(false),

  // Company info
  companyName: text('company_name'),
  phone: text('phone'),
  website: text('website'),
  country: text('country'),
  city: text('city'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

export const tenantMembers = pgTable(
  'tenant_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id').notNull(), // References Supabase auth.users
    role: memberRoleEnum('role').default('admin').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique('tenant_member_unique').on(table.tenantId, table.userId),
  ],
);

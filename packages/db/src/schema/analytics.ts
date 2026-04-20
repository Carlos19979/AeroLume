import { pgTable, uuid, text, timestamp, inet, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),

    eventType: text('event_type').notNull(), // configurator_opened, boat_search, product_view, quote_created
    boatModel: text('boat_model'),
    productId: uuid('product_id'),
    sailType: text('sail_type'),

    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    referrer: text('referrer'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_analytics_tenant_date').on(table.tenantId, table.createdAt),
  ],
);

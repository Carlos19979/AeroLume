import { pgTable, uuid, text, numeric, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { boats } from './boats';
import { products } from './products';

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .references(() => tenants.id, { onDelete: 'cascade' })
    .notNull(),

  boatId: uuid('boat_id').references(() => boats.id),
  boatModel: text('boat_model'),
  boatLength: numeric('boat_length'),

  status: text('status').default('draft').notNull(),

  customerName: text('customer_name'),
  customerEmail: text('customer_email'),
  customerPhone: text('customer_phone'),
  customerNotes: text('customer_notes'),

  totalPrice: numeric('total_price'),
  currency: text('currency').default('EUR'),

  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const quoteItems = pgTable('quote_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id')
    .references(() => quotes.id, { onDelete: 'cascade' })
    .notNull(),
  productId: uuid('product_id').references(() => products.id),

  sailType: text('sail_type').notNull(),
  productName: text('product_name').notNull(),
  sailArea: numeric('sail_area'),
  quantity: integer('quantity').default(1),
  unitPrice: numeric('unit_price'),
  configuration: jsonb('configuration').default({}),
  sortOrder: integer('sort_order').default(0),
});

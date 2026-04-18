import { pgTable, uuid, text, numeric, integer, timestamp, jsonb, index, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
import { boats } from './boats';
import { products } from './products';

export const quoteStatusEnum = pgEnum('quote_status', ['draft', 'sent', 'accepted', 'rejected', 'expired']);

export const quotes = pgTable(
  'quotes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),

    boatId: uuid('boat_id').references(() => boats.id, { onDelete: 'set null' }),
    boatModel: text('boat_model'),
    boatLength: numeric('boat_length'),

    status: quoteStatusEnum('status').default('draft').notNull(),

    customerName: text('customer_name'),
    customerEmail: text('customer_email'),
    customerPhone: text('customer_phone'),
    customerNotes: text('customer_notes'),

    totalPrice: numeric('total_price'),
    currency: text('currency').default('EUR'),

    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
  },
  (table) => [
    index('quotes_tenant_idx').on(table.tenantId),
    index('quotes_status_idx').on(table.status),
    index('quotes_customer_email_idx').on(table.customerEmail),
  ],
);

export const quoteItems = pgTable(
  'quote_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    quoteId: uuid('quote_id')
      .references(() => quotes.id, { onDelete: 'cascade' })
      .notNull(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),

    sailType: text('sail_type').notNull(),
    productName: text('product_name').notNull(),
    sailArea: numeric('sail_area'),
    quantity: integer('quantity').default(1),
    unitPrice: numeric('unit_price'),
    cost: numeric('cost'),
    configuration: jsonb('configuration').default({}),
    sortOrder: integer('sort_order').default(0),
  },
  (table) => [
    index('quote_items_quote_idx').on(table.quoteId),
  ],
);

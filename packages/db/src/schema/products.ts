import { pgTable, uuid, text, numeric, boolean, integer, timestamp, jsonb, uniqueIndex, unique, index, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const sailTypeEnum = pgEnum('sail_type', ['gvstd', 'gvfull', 'gve', 'gse', 'gn', 'spiasy', 'spisym', 'furling', 'gen']);
export const fieldTypeEnum = pgEnum('field_type', ['select', 'radio', 'number', 'text']);
export const productVariantEnum = pgEnum('product_variant', ['cruising', 'cruising_plus', 'cruising_racing']);

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Nullable: NULL means shared/base catalog available to all tenants.
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),

    externalId: text('external_id'),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    sailType: sailTypeEnum('sail_type').notNull(),
    variant: productVariantEnum('variant'),

    // Fallback per-m² prices when no tier matches.
    basePrice: numeric('base_price'),
    costPerSqm: numeric('cost_per_sqm'),
    currency: text('currency').default('EUR'),

    descriptionShort: text('description_short'),
    images: text('images').array().default([]),
    features: text('features').array().default([]),

    active: boolean('active').default(true),
    sortOrder: integer('sort_order').default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
  },
  (table) => [
    unique('uq_products_tenant_slug').on(table.tenantId, table.slug).nullsNotDistinct(),
    index('idx_products_sail_type').on(table.tenantId, table.sailType),
  ],
);

export const productPricingTiers = pgTable(
  'product_pricing_tiers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),

    minSqm: numeric('min_sqm').notNull(),
    maxSqm: numeric('max_sqm').notNull(),
    costPerSqm: numeric('cost_per_sqm').notNull(),
    msrpPerSqm: numeric('msrp_per_sqm').notNull(),
    sortOrder: integer('sort_order').default(0),
  },
  (table) => [
    index('idx_pricing_tiers_product').on(table.productId),
  ],
);

export const productConfigFields = pgTable(
  'product_config_fields',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),

    key: text('key').notNull(),
    label: text('label').notNull(),
    fieldType: fieldTypeEnum('field_type').default('select'),
    options: jsonb('options').default([]),
    sortOrder: integer('sort_order').default(0),
    required: boolean('required').default(true),

    priceModifiers: jsonb('price_modifiers').default({}),
    // Fractional surcharge per option applied to base price (e.g. {"3 rizos": 0.10} = +10%).
    percentModifiers: jsonb('percent_modifiers').default({}),
  },
  (table) => [
    uniqueIndex('idx_config_product_key').on(table.productId, table.key),
  ],
);

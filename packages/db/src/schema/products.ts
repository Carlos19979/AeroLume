import { pgTable, uuid, text, numeric, boolean, integer, timestamp, jsonb, uniqueIndex, index, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const sailTypeEnum = pgEnum('sail_type', ['gvstd', 'gvfull', 'gve', 'gse', 'gn', 'spiasy', 'spisym', 'furling', 'gen']);
export const fieldTypeEnum = pgEnum('field_type', ['select', 'radio', 'number', 'text']);

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),

    externalId: text('external_id'), // Sailonet id_product for imports
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    sailType: sailTypeEnum('sail_type').notNull(), // gvstd, gvfull, gve, gse, gn, spiasy, spisym, furling, gen
    gamme: text('gamme'), // product line/range

    basePrice: numeric('base_price'),
    currency: text('currency').default('EUR'),

    descriptionShort: text('description_short'),
    descriptionFull: text('description_full'),

    images: text('images').array().default([]),
    sku: text('sku'),
    weight: text('weight'),
    availability: text('availability').default('InStock'),

    // Boat compatibility ranges
    minBoatLength: numeric('min_boat_length'),
    maxBoatLength: numeric('max_boat_length'),
    minSailArea: numeric('min_sail_area'),
    maxSailArea: numeric('max_sail_area'),

    active: boolean('active').default(true),
    sortOrder: integer('sort_order').default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex('idx_products_tenant_slug').on(table.tenantId, table.slug),
    index('idx_products_sail_type').on(table.tenantId, table.sailType),
  ],
);

export const productConfigFields = pgTable(
  'product_config_fields',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),

    key: text('key').notNull(), // 'surface', 'fabric', 'rizos'
    label: text('label').notNull(), // 'Superficie (m²)'
    fieldType: fieldTypeEnum('field_type').default('select'), // select, radio, number, text
    options: jsonb('options').default([]), // ["option1", "option2"]
    sortOrder: integer('sort_order').default(0),
    required: boolean('required').default(true),

    // Price modifiers per option
    priceModifiers: jsonb('price_modifiers').default({}), // {"option1": 0, "option2": 50}
  },
  (table) => [
    uniqueIndex('idx_config_product_key').on(table.productId, table.key),
  ],
);

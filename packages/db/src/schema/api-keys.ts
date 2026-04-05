import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),

    keyHash: text('key_hash').notNull(), // SHA-256 of the actual key
    keyPrefix: text('key_prefix').notNull(), // First 8 chars for identification
    name: text('name').notNull(), // "Production", "Staging"
    scopes: text('scopes').array().default(['read']),
    rateLimit: integer('rate_limit').default(1000), // requests per hour

    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('api_keys_hash_idx').on(table.keyHash),
    index('api_keys_tenant_idx').on(table.tenantId),
  ],
);

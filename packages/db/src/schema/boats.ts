import { pgTable, uuid, text, numeric, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const boats = pgTable(
  'boats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
    // NULL tenant_id = shared/global boat database

    model: text('model').notNull(),
    boatModel: text('boat_model'),
    length: numeric('length'),
    i: numeric('i'),
    j: numeric('j'),
    p: numeric('p'),
    e: numeric('e'),
    gg: numeric('gg'),
    lp: numeric('lp'),
    sl: numeric('sl'),
    smw: numeric('smw'),

    // Sail areas
    genoaArea: numeric('genoa_area'),
    genoaFurlerArea: numeric('genoa_furler_area'),
    mainsailArea: numeric('mainsail_area'),
    mainsailFullArea: numeric('mainsail_full_area'),
    mainsailFurlerArea: numeric('mainsail_furler_area'),
    spinnakerArea: numeric('spinnaker_area'),
    spinnakerAsymArea: numeric('spinnaker_asym_area'),
    sgenArea: numeric('sgen_area'),

    isMultihull: boolean('is_multihull').default(false),

    // Sail type-specific areas
    gvstd: numeric('gvstd'),
    gvfull: numeric('gvfull'),
    gve: numeric('gve'),
    gse: numeric('gse'),
    gn: numeric('gn'),
    gen: numeric('gen'),
    spisym: numeric('spisym'),
    spiasy: numeric('spiasy'),
    furling: numeric('furling'),

    // Legacy Sailonet ID
    idSailBoatType: text('id_sail_boat_type'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_boats_tenant').on(table.tenantId),
    index('idx_boats_model').on(table.model),
  ],
);

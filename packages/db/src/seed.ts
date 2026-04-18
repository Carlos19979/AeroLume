/**
 * Seed script: cleans DB and sets up a complete dev environment.
 *
 * Usage: pnpm --filter @aerolume/db seed
 * Requires DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 */
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash, randomBytes } from 'crypto';

import { boats } from './schema/boats';
import { tenants } from './schema/tenants';
import { tenantMembers } from './schema/tenants';
import { products, productConfigFields, productPricingTiers } from './schema/products';
import { cloneBaseCatalogToTenant } from './clone-catalog';
import { apiKeys } from './schema/api-keys';
import { analyticsEvents } from './schema/analytics';
import { quotes, quoteItems } from './schema/quotes';

// ─── Config ─────────────────────────────────────────────

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error('Required env var: SEED_ADMIN_PASSWORD');
  process.exit(1);
}
const TENANT_NAME = 'Aerolume';
const TENANT_SLUG = 'aerolume';

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DATABASE_URL || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Required env vars: DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Helpers ────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function upsertEnvVar(envPath: string, key: string, value: string) {
  if (!existsSync(envPath)) return false;
  let content = readFileSync(envPath, 'utf-8');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content = content.trimEnd() + `\n${key}=${value}\n`;
  }
  writeFileSync(envPath, content);
  return true;
}

// ─── 1. Clean ───────────────────────────────────────────

async function cleanDatabase() {
  console.log('Cleaning database...');
  await db.execute(sql`TRUNCATE TABLE
    analytics_events,
    quote_items,
    quotes,
    api_keys,
    product_pricing_tiers,
    product_config_fields,
    products,
    tenant_members,
    tenants,
    boats
    CASCADE`);
  console.log('✓ All tables truncated');

  // Clean Supabase Auth users
  console.log('Cleaning auth users...');
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  if (existingUsers?.users) {
    for (const user of existingUsers.users) {
      await supabase.auth.admin.deleteUser(user.id);
      console.log(`  Deleted auth user: ${user.email}`);
    }
  }
  console.log('✓ Auth users cleaned');
}

// ─── 2. Boats ───────────────────────────────────────────

type RawBoat = Record<string, string>;

async function seedBoats() {
  console.log('Seeding boats...');
  const boatsPath = resolve(__dirname, '../../../apps/web/src/data/boats.json');
  const rawBoats: RawBoat[] = JSON.parse(readFileSync(boatsPath, 'utf-8'));
  console.log(`  Found ${rawBoats.length} boats`);

  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < rawBoats.length; i += BATCH_SIZE) {
    const batch = rawBoats.slice(i, i + BATCH_SIZE).map((raw) => ({
      tenantId: null,
      model: raw.model || raw.boat_model || 'Unknown',
      boatModel: raw.boat_model || null,
      length: raw.length || null,
      i: raw.i || null,
      j: raw.j || null,
      p: raw.p || null,
      e: raw.e || null,
      gg: raw.gg || null,
      lp: raw.lp || null,
      sl: raw.sl || null,
      smw: raw.smw || null,
      genoaArea: raw.genoa_area || null,
      genoaFurlerArea: raw.genoa_furler_area || null,
      mainsailArea: raw.mainsail_area || null,
      mainsailFullArea: raw.mainsail_full_area || null,
      mainsailFurlerArea: raw.mainsail_furler_area || null,
      spinnakerArea: raw.spinnaker_area || null,
      spinnakerAsymArea: raw.spinnaker_asym_area || null,
      sgenArea: raw.sgen_area || null,
      isMultihull: raw.is_multihull === 'y' || raw.multi === 'y',
      gvstd: raw.gvstd || null,
      gvfull: raw.gvfull || null,
      gve: raw.gve || null,
      gse: raw.gse || null,
      gn: raw.gn || null,
      gen: raw.gen || null,
      spisym: raw.spisym || null,
      spiasy: raw.spiasy || null,
      furling: raw.furling || null,
      idSailBoatType: raw.id_sail_boat_type || null,
    }));

    await db.insert(boats).values(batch);
    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${rawBoats.length}`);
  }

  console.log(`✓ Seeded ${inserted} boats`);
}

// ─── 3. Auth user ───────────────────────────────────────

async function createAuthUser(): Promise<string> {
  console.log(`Creating auth user (${ADMIN_EMAIL})...`);

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  if (existing) {
    console.log(`✓ Auth user already exists: ${existing.id}`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    console.error('Failed to create auth user:', error.message);
    process.exit(1);
  }

  console.log(`✓ Created auth user: ${data.user.id}`);
  console.log(`  Email: ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  return data.user.id;
}

// ─── 4. Tenant + member ────────────────────────────────

async function createTenant(userId: string): Promise<string> {
  console.log('Creating tenant...');

  const [tenant] = await db
    .insert(tenants)
    .values({
      name: TENANT_NAME,
      slug: TENANT_SLUG,
      locale: 'es',
      currency: 'EUR',
      plan: 'pro',
      subscriptionStatus: 'active',
    })
    .returning();

  console.log(`✓ Created tenant: ${tenant.name} (${tenant.id})`);

  await db.insert(tenantMembers).values({
    tenantId: tenant.id,
    userId,
    role: 'owner',
  });

  console.log(`✓ Assigned ${ADMIN_EMAIL} as owner`);
  return tenant.id;
}

// ─── 5. Products ────────────────────────────────────────

// Catalog reflects Orduña 1755 "VELAS ACABADAS 2025 e3" — cost = VELA ACABADA, msrp = PVP recomendado.
// FOQUE/GENOVA pricing applies to both gn (classical) and gse (furling) per the PDF categorisation.

type SailType = 'gvstd' | 'gvfull' | 'gve' | 'gse' | 'gn' | 'spiasy' | 'spisym' | 'furling' | 'gen';
type Variant = 'cruising' | 'cruising_plus' | 'cruising_racing';
type Tier = { min: number; max: number; cost: number; msrp: number };
type CatalogEntry = {
  sailType: SailType;
  variant: Variant;
  name: string;
  hasThirdReef: boolean; // adds "3º rizo" option with +10% surcharge
  tiers: Tier[];
  features: string[];
};

const MAYOR_CRUISING = [
  'Ollados de puños en acero inoxidable',
  'Balumero con mordaza de nylon',
  'Pujamero con mordaza de nylon',
  'Sables planos de poliéster',
  '2 rizos (3º opcional)',
  'Catavientos en sables',
  'Saco de transporte',
  'Velcro en escota',
  'Puños escalonados',
];
const MAYOR_CRUISING_PLUS = [
  'Anillas inoxidable cosidas en puños',
  'Balumero reenviado con mordaza de aluminio',
  'Pujamero con mordaza de nylon',
  'Sables redondos con cajeras en baluma y pujamen',
  'Catavientos en sables',
  'Saco de transporte',
  'Velcro en escota',
  'Puños radiales',
  'Protección en sable forzado',
  'Patín rodamiento sables forzado',
  'Cuningam',
  '2 líneas de trimado',
];
const MAYOR_CRUISING_RACING = [
  'Corte radial',
  'Anillas inoxidable cosidas en puños',
  'Balumero reenviado con mordaza de aluminio',
  'Pujamero con mordaza de nylon',
  'Sables redondos con cajeras en baluma y pujamen',
  'Catavientos en sables',
  'Saco de transporte',
  'Velcro en escota',
  'Puños radiales',
  'Protección en sables forzado',
  'Patín rodamiento sable forzado',
  'Cuningam',
  '3 líneas de trimado',
  'Número de vela',
];

const FULL_BATTEN_CRUISING = [
  'Ollados de puños en acero inoxidable',
  'Balumero con mordaza de nylon',
  'Pujamero con mordaza de nylon',
  'Sables redondos de poliéster',
  'Catavientos en sables',
  'Saco de transporte',
  'Velcro en escota',
  'Puños escalonados',
];
const FULL_BATTEN_CRUISING_PLUS = [
  'Anillas inoxidable cosidas en puños',
  'Balumero reenviado con mordaza de aluminio',
  'Pujamero con mordaza de nylon',
  'Sables redondos de poliéster con cajeras',
  'Catavientos en sables',
  'Saco de transporte',
  'Puños radiales',
  'Protección en sable forzado',
  'Patín rodamiento sable forzado',
  'Cuningam',
  '2 líneas de trimado',
  'Velcro en escota',
];
const FULL_BATTEN_CRUISING_RACING = [
  'Corte radial',
  'Anillas inoxidable cosidas en puños',
  'Balumero reenviado con mordaza de aluminio',
  'Pujamero con mordaza de nylon',
  'Sables redondos de poliéster con cajeras',
  'Catavientos en sables',
  'Saco de transporte',
  'Velcro en escota',
  'Puños radiales',
  'Protección en sable forzado',
  'Patín rodamiento sable forzado',
  'Cuningam',
  '3 líneas de trimado',
  'Número de vela',
];

const FOQUE_CRUISING = [
  'Ollados de puño de escota en acero inoxidable',
  'Balumero con mordaza de nylon',
  'Pujamero con mordaza de nylon',
  'Cintas de poliéster en amura y driza',
  'Banda UV acrílica con relinga UV en baluma y pujamen (hilo SunStop)',
  '3 pares de catavientos',
  'Saco de transporte',
  'Puños escalonados',
];
const FOQUE_CRUISING_PLUS = [
  'Ollados de puño de escota en acero inoxidable',
  'Balumero con mordaza de aluminio con bolsillo',
  'Pujamero con mordaza de nylon',
  'Cintas de poliéster en amura y driza',
  'Banda UV acrílica con relinga UV en baluma y pujamen (hilo SunStop)',
  '3 pares de catavientos',
  'Saco de transporte',
  'Puños radiales',
  'Relinga gratil reforzada',
  '2 líneas de trimado',
];
const FOQUE_CRUISING_RACING = [
  'Corte radial',
  'Ollados de puño de escota en acero inoxidable',
  'Balumero con mordaza de aluminio con bolsillo',
  'Pujamero con mordaza de nylon',
  'Cintas de poliéster en amura y driza',
  'Banda UV acrílica con relinga UV en baluma y pujamen (hilo SunStop)',
  '3 pares de catavientos',
  'Saco de transporte',
  'Puños radiales',
  'Relinga gratil reforzada',
  '3 líneas de trimado',
  'Número de vela',
];

const MAYOR_ENROLLABLE_CRUISING = [
  'Polea en puño de escota',
  'Balumero con mordaza de nylon',
  'Cintas de poliéster en amura y driza',
  'Banda UV acrílica en triángulo de escota (hilo SunStop)',
  'Saco de transporte',
  'Puños escalonados',
];
const MAYOR_ENROLLABLE_CRUISING_PLUS = [
  'Polea en puño de escota',
  'Balumero con mordaza de aluminio con bolsillo',
  'Cintas de poliéster en amura y driza',
  'Banda UV acrílica en triángulo de escota (hilo SunStop)',
  '4 pares de catavientos',
  'Saco de transporte',
  'Puños radiales',
  '2 líneas de trimado',
  'Relinga de gratil reforzada',
  'Relinga de baluma UV',
];
const MAYOR_ENROLLABLE_CRUISING_RACING = [
  'Polea en puño de escota',
  'Balumero con mordaza de aluminio con bolsillo',
  'Cintas de poliéster en amura y driza',
  'Banda UV acrílica en triángulo de escota (hilo SunStop)',
  '4 pares de catavientos',
  'Saco de transporte',
  'Puños escalonados',
  '3 líneas de trimado',
  'Relinga de gratil reforzada',
  'Relinga de baluma UV',
  'Número de vela',
];

const ASIMETRICO_CRUISING_PLUS = [
  'Anillas de inoxidable en los 3 puños',
  'Balumeros y pujameros',
  '3 pares de catavientos',
  'Saco de transporte básico',
  'Corte radial',
  'Puños radiales',
  'Opción de calcetín',
  'Tejido NFS',
];
const ASIMETRICO_CRUISING_RACING = [
  'Anillas de inoxidable en los 3 puños',
  'Balumeros y pujameros',
  '3 pares de catavientos',
  'Saco de regatas',
  'Corte radial con panelaje optimizado',
  'Puños radiales',
  'Opción de calcetín',
  'Número de vela',
  'Tejido Super Series',
  'Cuerno en amura',
];

const SIMETRICO_CRUISING_PLUS = [
  'Anillas de inoxidable en los 3 puños',
  'Balumeros y pujameros',
  'Saco de transporte básico',
  'Corte radial',
  'Puños radiales',
  'Opción de calcetín',
  'Tejido NFS',
];
const SIMETRICO_CRUISING_RACING = [
  'Anillas de inoxidable en los 3 puños',
  'Balumeros y pujameros',
  'Saco de regatas',
  'Corte radial con panelaje optimizado',
  'Puños radiales',
  'Opción de calcetín',
  'Número de vela pintado',
  'Tejido Super Series',
];

const CODE_EASY_CRUISING = [
  'Anillas de inoxidable en escota',
  'Balumeros y pujameros',
  '3 pares de catavientos',
  'Saco de transporte básico',
  'Corte radial',
  'Puños radiales',
  'Cabo antitorsión en gratil con gazas y guardacabos',
  'Tejido NFS',
];
const CODE_EASY_CRUISING_PLUS = [
  'Anillas de inoxidable en escota',
  'Balumeros y pujameros',
  '3 pares de catavientos',
  'Saco de transporte con cremallera',
  'Corte radial con panelaje optimizado',
  'Puños radiales',
  'Cabo antitorsión en gratil con gazas y guardacabos',
  'Tejido NFS',
];

const CODE_ZERO_CRUISING = [
  'Anillas de inoxidable en escota',
  'Balumeros y pujameros',
  '3 pares de catavientos',
  'Saco de transporte básico',
  'Corte radial',
  'Puños radiales',
  'Cabo antitorsión en gratil con gazas y guardacabos',
  'Tejido CODE-TEC',
];
const CODE_ZERO_CRUISING_RACING = [
  'Anillas de inoxidable en escota',
  'Balumeros y pujameros',
  '3 pares de catavientos',
  'Saco de transporte con cremallera',
  'Corte radial con panelaje optimizado',
  'Puños radiales',
  'Cabo antitorsión en gratil con gazas y guardacabos',
  'Tejido BALTIC',
  'Líneas de trimado',
  'Número de vela',
];

const MAYOR_RANGES = [[10, 20], [21, 32], [33, 45], [46, 60], [61, 70]] as const;
const SPI_RANGES = [[20, 40], [41, 70], [71, 100], [101, 130], [131, 160]] as const;

const mayorTiers = (costs: number[], msrps: number[]): Tier[] =>
  MAYOR_RANGES.map(([min, max], i) => ({ min, max, cost: costs[i], msrp: msrps[i] }));
const spiTiers = (costs: number[], msrps: number[]): Tier[] =>
  SPI_RANGES.map(([min, max], i) => ({ min, max, cost: costs[i], msrp: msrps[i] }));

const CATALOG: CatalogEntry[] = [
  // MAYOR (gvstd)
  { sailType: 'gvstd', variant: 'cruising', name: 'Mayor Clásica — Cruising', hasThirdReef: true,
    tiers: mayorTiers([43.62, 43.51, 43.84, 44.94, 46.98], [61.07, 60.92, 61.37, 62.92, 65.77]),
    features: MAYOR_CRUISING },
  { sailType: 'gvstd', variant: 'cruising_plus', name: 'Mayor Clásica — Cruising Plus', hasThirdReef: true,
    tiers: mayorTiers([48.12, 45.73, 48.30, 49.47, 50.93], [67.37, 64.02, 67.63, 69.26, 71.30]),
    features: MAYOR_CRUISING_PLUS },
  { sailType: 'gvstd', variant: 'cruising_racing', name: 'Mayor Clásica — Cruising Racing', hasThirdReef: true,
    tiers: mayorTiers([68.98, 68.84, 73.51, 76.69, 79.31], [96.57, 96.38, 102.92, 107.37, 111.03]),
    features: MAYOR_CRUISING_RACING },

  // MAYOR FULL BATTEN (gvfull)
  { sailType: 'gvfull', variant: 'cruising', name: 'Mayor Full Batten — Cruising', hasThirdReef: true,
    tiers: mayorTiers([47.51, 47.40, 48.63, 48.83, 50.86], [66.51, 66.36, 68.09, 68.36, 71.21]),
    features: FULL_BATTEN_CRUISING },
  { sailType: 'gvfull', variant: 'cruising_plus', name: 'Mayor Full Batten — Cruising Plus', hasThirdReef: true,
    tiers: mayorTiers([59.68, 57.29, 59.86, 61.03, 62.49], [83.56, 80.21, 83.81, 85.44, 87.48]),
    features: FULL_BATTEN_CRUISING_PLUS },
  { sailType: 'gvfull', variant: 'cruising_racing', name: 'Mayor Full Batten — Cruising Racing', hasThirdReef: true,
    tiers: mayorTiers([80.69, 80.55, 85.22, 88.40, 91.01], [112.96, 112.77, 119.31, 123.76, 127.42]),
    features: FULL_BATTEN_CRUISING_RACING },

  // FOQUE/GENOVA → gn (classical) and gse (furling) share pricing per PDF
  { sailType: 'gn', variant: 'cruising', name: 'Génova Clásica — Cruising', hasThirdReef: false,
    tiers: mayorTiers([34.08, 35.10, 36.12, 37.51, 41.64], [47.72, 49.14, 50.57, 52.51, 58.30]),
    features: FOQUE_CRUISING },
  { sailType: 'gn', variant: 'cruising_plus', name: 'Génova Clásica — Cruising Plus', hasThirdReef: false,
    tiers: mayorTiers([38.81, 39.08, 40.82, 42.26, 45.82], [54.34, 54.72, 57.14, 59.16, 64.14]),
    features: FOQUE_CRUISING_PLUS },
  { sailType: 'gn', variant: 'cruising_racing', name: 'Génova Clásica — Cruising Racing', hasThirdReef: false,
    tiers: mayorTiers([52.76, 54.98, 58.30, 61.37, 65.79], [73.87, 76.97, 81.62, 85.92, 92.10]),
    features: FOQUE_CRUISING_RACING },

  { sailType: 'gse', variant: 'cruising', name: 'Génova Enrollable — Cruising', hasThirdReef: false,
    tiers: mayorTiers([34.08, 35.10, 36.12, 37.51, 41.64], [47.72, 49.14, 50.57, 52.51, 58.30]),
    features: FOQUE_CRUISING },
  { sailType: 'gse', variant: 'cruising_plus', name: 'Génova Enrollable — Cruising Plus', hasThirdReef: false,
    tiers: mayorTiers([38.81, 39.08, 40.82, 42.26, 45.82], [54.34, 54.72, 57.14, 59.16, 64.14]),
    features: FOQUE_CRUISING_PLUS },
  { sailType: 'gse', variant: 'cruising_racing', name: 'Génova Enrollable — Cruising Racing', hasThirdReef: false,
    tiers: mayorTiers([52.76, 54.98, 58.30, 61.37, 65.79], [73.87, 76.97, 81.62, 85.92, 92.10]),
    features: FOQUE_CRUISING_RACING },

  // MAYOR ENROLLABLE (gve)
  { sailType: 'gve', variant: 'cruising', name: 'Mayor Enrollable — Cruising', hasThirdReef: false,
    tiers: mayorTiers([29.61, 30.62, 31.65, 34.43, 37.17], [41.45, 42.87, 44.31, 48.21, 52.03]),
    features: MAYOR_ENROLLABLE_CRUISING },
  { sailType: 'gve', variant: 'cruising_plus', name: 'Mayor Enrollable — Cruising Plus', hasThirdReef: false,
    tiers: mayorTiers([32.03, 32.30, 34.03, 36.88, 39.03], [44.84, 45.22, 47.64, 51.63, 54.65]),
    features: MAYOR_ENROLLABLE_CRUISING_PLUS },
  { sailType: 'gve', variant: 'cruising_racing', name: 'Mayor Enrollable — Cruising Racing', hasThirdReef: false,
    tiers: mayorTiers([47.86, 50.08, 53.40, 57.87, 60.89], [67.01, 70.11, 74.76, 81.02, 85.24]),
    features: MAYOR_ENROLLABLE_CRUISING_RACING },

  // ASIMETRICO (spiasy) — no CRUISING in PDF
  { sailType: 'spiasy', variant: 'cruising_plus', name: 'Spinnaker Asimétrico — Cruising Plus', hasThirdReef: false,
    tiers: spiTiers([23.20, 22.78, 22.22, 22.36, 22.50], [32.48, 31.89, 31.11, 31.30, 31.50]),
    features: ASIMETRICO_CRUISING_PLUS },
  { sailType: 'spiasy', variant: 'cruising_racing', name: 'Spinnaker Asimétrico — Cruising Racing', hasThirdReef: false,
    tiers: spiTiers([27.90, 27.48, 26.92, 27.06, 27.20], [39.06, 38.48, 37.69, 37.89, 38.08]),
    features: ASIMETRICO_CRUISING_RACING },

  // SIMETRICO (spisym) — no CRUISING
  { sailType: 'spisym', variant: 'cruising_plus', name: 'Spinnaker Simétrico — Cruising Plus', hasThirdReef: false,
    tiers: spiTiers([22.39, 21.97, 21.41, 21.55, 21.69], [31.34, 30.75, 29.97, 30.16, 30.36]),
    features: SIMETRICO_CRUISING_PLUS },
  { sailType: 'spisym', variant: 'cruising_racing', name: 'Spinnaker Simétrico — Cruising Racing', hasThirdReef: false,
    tiers: spiTiers([28.13, 27.71, 27.15, 27.29, 27.43], [39.38, 38.79, 38.01, 38.21, 38.40]),
    features: SIMETRICO_CRUISING_RACING },

  // CODE EASY (furling) — no RACING
  { sailType: 'furling', variant: 'cruising', name: 'Code Easy — Cruising', hasThirdReef: false,
    tiers: spiTiers([27.22, 26.80, 26.52, 26.59, 26.66], [38.11, 37.52, 37.13, 37.23, 37.33]),
    features: CODE_EASY_CRUISING },
  { sailType: 'furling', variant: 'cruising_plus', name: 'Code Easy — Cruising Plus', hasThirdReef: false,
    tiers: spiTiers([28.96, 28.54, 28.26, 28.33, 28.40], [40.55, 39.96, 39.57, 39.67, 39.76]),
    features: CODE_EASY_CRUISING_PLUS },

  // CODE ZERO (gen) — no PLUS
  { sailType: 'gen', variant: 'cruising', name: 'Code Zero — Cruising', hasThirdReef: false,
    tiers: spiTiers([31.37, 31.85, 32.10, 32.87, 37.53], [43.92, 44.60, 44.94, 46.02, 52.54]),
    features: CODE_ZERO_CRUISING },
  { sailType: 'gen', variant: 'cruising_racing', name: 'Code Zero — Cruising Racing', hasThirdReef: false,
    tiers: spiTiers([45.68, 45.26, 46.91, 48.89, 53.84], [63.95, 63.37, 65.67, 68.45, 75.38]),
    features: CODE_ZERO_CRUISING_RACING },
];

function avg(values: number[]): number {
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

async function seedProducts() {
  console.log('Seeding shared catalog (tenantId=null)...');

  let order = 0;
  for (const entry of CATALOG) {
    const slug = slugify(`${entry.sailType}-${entry.variant}`);
    const avgMsrp = avg(entry.tiers.map((t) => t.msrp));
    const avgCost = avg(entry.tiers.map((t) => t.cost));

    const [product] = await db
      .insert(products)
      .values({
        tenantId: null,
        name: entry.name,
        slug,
        sailType: entry.sailType,
        variant: entry.variant,
        basePrice: avgMsrp.toFixed(2),
        costPerSqm: avgCost.toFixed(2),
        features: entry.features,
        sortOrder: order++,
        active: true,
      })
      .returning();

    await db.insert(productPricingTiers).values(
      entry.tiers.map((t, i) => ({
        productId: product.id,
        minSqm: t.min.toString(),
        maxSqm: t.max.toString(),
        costPerSqm: t.cost.toFixed(2),
        msrpPerSqm: t.msrp.toFixed(2),
        sortOrder: i,
      })),
    );

    if (entry.hasThirdReef) {
      await db.insert(productConfigFields).values({
        productId: product.id,
        key: 'rizos',
        label: 'Número de rizos',
        fieldType: 'select',
        options: ['2 rizos', '3 rizos'],
        sortOrder: 0,
        required: true,
        priceModifiers: {},
        percentModifiers: { '3 rizos': 0.10 },
      });
    }

    console.log(`  ✓ ${entry.name} (${entry.tiers.length} tiers${entry.hasThirdReef ? ', +3º rizo' : ''})`);
  }

  console.log(`✓ Seeded ${CATALOG.length} products in shared catalog`);
}

// ─── 6. API key ─────────────────────────────────────────

async function createApiKey(tenantId: string) {
  console.log('Creating API key...');

  const rawKey = 'ak_' + randomBytes(20).toString('hex');
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 11);

  await db.insert(apiKeys).values({
    tenantId,
    keyHash,
    keyPrefix,
    name: 'Development',
    scopes: ['read'],
    rateLimit: 1000,
  });

  console.log(`✓ API key created: ${keyPrefix}...`);
  return rawKey;
}

// ─── 7. Write env vars ─────────────────────────────────

function writeEnvVars(apiKey: string) {
  console.log('Writing env vars...');

  const envPaths = [
    resolve(__dirname, '../../../.env'),
    resolve(__dirname, '../../../apps/web/.env'),
  ];

  for (const envPath of envPaths) {
    if (!existsSync(envPath)) continue;
    upsertEnvVar(envPath, 'NEXT_PUBLIC_DEMO_API_KEY', apiKey);
    upsertEnvVar(envPath, 'SUPER_ADMIN_EMAILS', ADMIN_EMAIL);
    console.log(`  ✓ Updated ${envPath}`);
  }
}

// ─── Main ───────────────────────────────────────────────

async function main() {
  console.log('=== Aerolume Database Seed ===\n');

  try {
    await cleanDatabase();
    console.log('');
    await seedBoats();
    console.log('');
    await seedProducts();
    console.log('');
    const userId = await createAuthUser();
    console.log('');
    const tenantId = await createTenant(userId);
    console.log('');
    const cloned = await cloneBaseCatalogToTenant(tenantId, db);
    console.log(`✓ Cloned ${cloned} base catalog products to dev tenant`);
    console.log('');
    const apiKey = await createApiKey(tenantId);
    console.log('');
    writeEnvVars(apiKey);

    console.log('\n=== Seed complete! ===');
    console.log(`\n  Login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log(`  API key: ${apiKey}`);
    console.log(`  Tenant: ${TENANT_NAME} (${TENANT_SLUG})`);
    console.log(`\n  Restart dev server to pick up new env vars.`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

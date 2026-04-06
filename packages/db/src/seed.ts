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
import { products, productConfigFields } from './schema/products';
import { apiKeys } from './schema/api-keys';
import { analyticsEvents } from './schema/analytics';
import { quotes, quoteItems } from './schema/quotes';

// ─── Config ─────────────────────────────────────────────

const ADMIN_EMAIL = 'carloscode23@icloud.com';
const ADMIN_PASSWORD = 'Aerolume2026!';
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

const PRODUCT_CONFIGS: Record<string, { name: string; sailType: string; fields: { key: string; label: string; options: string[] }[] }> = {
  '3':  { name: 'Mayor Clásica Horizontal', sailType: 'gvstd', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['320 AP / 300 SF'] },
    { key: 'rizos', label: 'Número de rizos', options: ['2 rizos', '3 rizos'] },
    { key: 'reef_choice', label: 'Elección arrecife 1 y 2', options: ['1 - Clavel / Oreja de perro','2 - Polea / Orejas de perro','3 - Polea / Polea'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['Dacron NEWPORT / CHALLENGE','Dacron AP / DIMENSION POLYANT'] },
  ]},
  '5':  { name: 'Mayor Clásica Triradial', sailType: 'gvstd', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['66/L-M'] },
    { key: 'rizos', label: 'Número de rizos', options: ['2 rizos', '3 rizos'] },
    { key: 'reef_choice', label: 'Elección arrecife 1 y 2', options: ['1 - Clavel / Oreja de perro','2 - Polea / Orejas de perro','3 - Polea / Polea'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['PalmaTec Ultra','DCX (blanco)','DCX 2400 (gris)','Pro Radial'] },
  ]},
  '4':  { name: 'Mayor Full Batten Horizontal', sailType: 'gvfull', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['320 AP / 300 SF'] },
    { key: 'rizos', label: 'Número de rizos', options: ['2 rizos', '3 rizos'] },
    { key: 'reef_choice', label: 'Elección arrecife 1 y 2', options: ['1 - Clavel / Oreja de perro','2 - Polea / Orejas de perro','3 - Polea / Polea'] },
    { key: 'multi', label: 'Multicasco', options: ['No', 'Si'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['Dacron NEWPORT / CHALLENGE','Dacron AP / DIMENSION POLYANT'] },
  ]},
  '9':  { name: 'Mayor Full Batten Triradial', sailType: 'gvfull', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['66/L-M'] },
    { key: 'rizos', label: 'Número de rizos', options: ['2 rizos', '3 rizos'] },
    { key: 'reef_choice', label: 'Elección arrecife 1 y 2', options: ['1 - Clavel / Oreja de perro','2 - Polea / Orejas de perro','3 - Polea / Polea'] },
    { key: 'multi', label: 'Multicasco', options: ['No', 'Si'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['PalmaTec Ultra','DCX (blanco)','DCX 2400 (gris)','Pro Radial'] },
  ]},
  '10': { name: 'Mayor Enrollable Horizontal', sailType: 'gve', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['320 AP / 300 SF'] },
    { key: 'vertical_battens', label: 'Opción sables verticales', options: ['No', 'Si'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['Dacron NEWPORT / CHALLENGE','Dacron AP / DIMENSION POLYANT'] },
  ]},
  '11': { name: 'Mayor Enrollable Triradial', sailType: 'gve', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['66/L-M'] },
    { key: 'vertical_battens', label: 'Opción sables verticales', options: ['No', 'Si'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['PalmaTec Ultra','DCX (blanco)','DCX 2400 (gris)','Pro Radial'] },
  ]},
  '2':  { name: 'Génova Enrollable Horizontal', sailType: 'gse', fields: [
    { key: 'foresail', label: 'Elección de vela de proa', options: ['GENOVA','Vela de Estay (introduzca su superficie)','Solent (introduzca su zona)'] },
    { key: 'surface', label: 'LGF Max (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['320 AP / 300 SF'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['Dacron NEWPORT / CHALLENGE','Dacron AP / DIMENSION POLYANT'] },
  ]},
  '8':  { name: 'Génova Enrollable Triradial', sailType: 'gse', fields: [
    { key: 'foresail', label: 'Elección de vela de proa', options: ['GENOVA','Vela de Estay (introduzca su superficie)','Solent (introduzca su zona)'] },
    { key: 'surface', label: 'LGF Max (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['66/L-M'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['PalmaTec Ultra','DCX (blanco)','DCX 2400 (gris)','Pro Radial'] },
  ]},
  '1':  { name: 'Génova Mosquetones Horizontal', sailType: 'gn', fields: [
    { key: 'foresail', label: 'Elección de vela de proa', options: ['GENOVA','Vela de Estay (introduzca su superficie)','Solent (introduzca su zona)'] },
    { key: 'surface', label: 'LGF Max (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['320 AP / 300 SF'] },
    { key: 'horizontal_battens', label: 'Opción sables horizontales', options: ['No', 'Si'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['Dacron NEWPORT / CHALLENGE','Dacron AP / DIMENSION POLYANT'] },
  ]},
  '7':  { name: 'Génova Mosquetones Triradial', sailType: 'gn', fields: [
    { key: 'foresail', label: 'Elección de vela de proa', options: ['GENOVA','Vela de Estay (introduzca su superficie)','Solent (introduzca su zona)'] },
    { key: 'surface', label: 'LGF Max (m²)', options: ['6.10','6.70','7.50','7.95','8.55','9.14','9.50','9.75','10.50','11.60','12.20','12.80','13.70','14.05','14.65','15.25','15.85','16.45','17.10','17.70'] },
    { key: 'peso', label: 'Estimación peso', options: ['320 AP / 300 SF'] },
    { key: 'horizontal_battens', label: 'Opción sables horizontales', options: ['No', 'Si'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['PalmaTec Ultra','DCX (blanco)','DCX 2400 (gris)','Pro Radial'] },
  ]},
  '14': { name: 'Spinnaker Asimétrico', sailType: 'spiasy', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['30','60','70','80','100','130'] },
    { key: 'color', label: 'Color', options: ['Monocolor','Color a elegir (maximo 3)'] },
  ]},
  '6':  { name: 'Spinnaker Simétrico', sailType: 'spisym', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['30','60','70','80','100','130'] },
    { key: 'color', label: 'Color', options: ['Monocolor','Color a elegir (maximo 3)'] },
  ]},
  '17': { name: 'Code S', sailType: 'furling', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['30','60','70','80','100','130'] },
    { key: 'color', label: 'Color', options: ['Blanco','Color a elegir (maximo 3)'] },
  ]},
  '15': { name: 'Gennaker / Code 0', sailType: 'gen', fields: [
    { key: 'surface', label: 'Superficie (m²)', options: ['30','60','70','80','100','130'] },
    { key: 'fabric', label: 'Elección del tejido', options: ['Maxilite / Stormlite blanco','Maxilite / Stormlite Color (max 3)','Laminado CZ PES (un solo color)'] },
  ]},
};

async function seedProducts(tenantId: string) {
  console.log('Seeding products...');

  for (const [externalId, cfg] of Object.entries(PRODUCT_CONFIGS)) {
    const slug = slugify(cfg.name);

    const [product] = await db
      .insert(products)
      .values({
        tenantId,
        externalId,
        name: cfg.name,
        slug,
        sailType: cfg.sailType,
        active: true,
      })
      .returning();

    const fieldValues = cfg.fields.map((field, idx) => ({
      productId: product.id,
      key: field.key,
      label: field.label,
      fieldType: 'select' as const,
      options: field.options,
      sortOrder: idx,
      required: true,
    }));

    await db.insert(productConfigFields).values(fieldValues);
    console.log(`  ✓ ${cfg.name} (${cfg.fields.length} fields)`);
  }

  console.log(`✓ Seeded ${Object.keys(PRODUCT_CONFIGS).length} products`);
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
    const userId = await createAuthUser();
    console.log('');
    const tenantId = await createTenant(userId);
    console.log('');
    await seedProducts(tenantId);
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

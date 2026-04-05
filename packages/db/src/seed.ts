/**
 * Seed script: migrates boats.json and product-config.ts data into Supabase.
 *
 * Usage: pnpm --filter @aerolume/db seed
 * Requires DATABASE_URL in .env
 */
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../.env') });
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import { boats } from './schema/boats';
import { tenants } from './schema/tenants';
import { products } from './schema/products';
import { productConfigFields } from './schema/products';
import { readFileSync } from 'fs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is required. Copy .env.example to .env and fill in your Supabase credentials.');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

// ─── Boat data ───────────────────────────────────────────

type RawBoat = Record<string, string>;

async function seedBoats() {
  console.log('Seeding boats...');

  const boatsPath = resolve(__dirname, '../../../apps/web/src/data/boats.json');
  const rawBoats: RawBoat[] = JSON.parse(readFileSync(boatsPath, 'utf-8'));

  console.log(`Found ${rawBoats.length} boats to import`);

  // Insert in batches of 500
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < rawBoats.length; i += BATCH_SIZE) {
    const batch = rawBoats.slice(i, i + BATCH_SIZE).map((raw) => ({
      tenantId: null, // Global/shared boat database
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

    try {
      await db.insert(boats).values(batch).onConflictDoNothing();
      inserted += batch.length;
      console.log(`  Inserted ${inserted}/${rawBoats.length} boats`);
    } catch (err: any) {
      console.error(`  Batch ${i}-${i + batch.length} failed:`);
      console.error('  Cause:', err.cause?.message || err.cause || 'unknown');
      console.error('  Code:', err.cause?.code);
      console.error('  Detail:', err.cause?.detail);
      throw err;
    }
  }

  console.log(`✓ Seeded ${inserted} boats`);
}

// ─── Demo tenant + products ──────────────────────────────

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedDemoTenant() {
  console.log('Creating demo tenant...');

  // Check if demo tenant already exists (idempotent)
  const existing = await db.select().from(tenants).where(eq(tenants.slug, 'demo'));
  let tenant;

  if (existing.length > 0) {
    tenant = existing[0];
    console.log(`✓ Demo tenant already exists: ${tenant.name} (${tenant.id})`);
  } else {
    [tenant] = await db
      .insert(tenants)
      .values({
        name: 'Aerolume Demo',
        slug: 'demo',
        locale: 'es',
        currency: 'EUR',
        plan: 'enterprise',
        subscriptionStatus: 'active',
      })
      .returning();

    console.log(`✓ Created tenant: ${tenant.name} (${tenant.id})`);
  }

  console.log('Seeding products and config fields...');

  for (const [externalId, config] of Object.entries(PRODUCT_CONFIGS)) {
    const slug = slugify(config.name);

    const [product] = await db
      .insert(products)
      .values({
        tenantId: tenant.id,
        externalId,
        name: config.name,
        slug,
        sailType: config.sailType,
        active: true,
      })
      .onConflictDoNothing({ target: [products.tenantId, products.slug] })
      .returning();

    // If product already existed, skip config fields
    if (!product) {
      console.log(`  - ${config.name} already exists, skipping`);
      continue;
    }

    // Insert config fields
    const fieldValues = config.fields.map((field, idx) => ({
      productId: product.id,
      key: field.key,
      label: field.label,
      fieldType: 'select' as const,
      options: field.options,
      sortOrder: idx,
      required: true,
    }));

    await db.insert(productConfigFields).values(fieldValues);

    console.log(`  ✓ ${config.name} (${config.fields.length} fields)`);
  }

  console.log(`✓ Seeded ${Object.keys(PRODUCT_CONFIGS).length} products`);
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  console.log('=== Aerolume Database Seed ===\n');

  try {
    await seedBoats();
    console.log('');
    await seedDemoTenant();
    console.log('\n=== Seed complete! ===');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, products, eq } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const list = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sailType: products.sailType,
      basePrice: products.basePrice,
      currency: products.currency,
      active: products.active,
      sortOrder: products.sortOrder,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(eq(products.tenantId, tenant.id));

  return NextResponse.json({ data: list });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const body = await request.json();
  if (!body.name || !body.sailType) {
    return NextResponse.json({ error: 'name and sailType are required' }, { status: 400 });
  }

  const [created] = await db
    .insert(products)
    .values({
      tenantId: tenant.id,
      name: body.name,
      slug: slugify(body.name),
      sailType: body.sailType,
      basePrice: body.basePrice || null,
      descriptionShort: body.descriptionShort || null,
      active: true,
    })
    .returning();

  return NextResponse.json({ data: created });
}

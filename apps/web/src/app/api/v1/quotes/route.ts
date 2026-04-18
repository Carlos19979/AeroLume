import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { db, quotes, quoteItems, products, productPricingTiers, productConfigFields, tenants, tenantMembers, eq, inArray, and, or, isNull } from '@aerolume/db';
import { withCors } from '@/lib/cors';
import { validateBody, createQuoteSchema } from '@/lib/validations';
import { priceItem } from '@/lib/pricing';
import { dispatchQuoteWebhook } from '@/lib/quote-webhook';
import { sendEmail } from '@/lib/email/resend';
import { quoteCustomerTemplate } from '@/lib/email/templates/quote-customer';
import { quoteTenantNotificationTemplate } from '@/lib/email/templates/quote-tenant-notification';

export async function POST(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth.ok) {
    if ('rateLimited' in auth) return auth.response;
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const validation = validateBody(createQuoteSchema, body);
  if ('error' in validation) {
    const origin = request.headers.get('origin');
    return withCors(NextResponse.json({ error: validation.error }, { status: 400 }), origin);
  }
  const data = validation.data;

  const [quote] = await db
    .insert(quotes)
    .values({
      tenantId: auth.ctx.tenantId,
      boatId: data.boatId || null,
      boatModel: data.boatModel || null,
      boatLength: data.boatLength || null,
      status: 'draft',
      customerName: data.customerName || null,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone || null,
      customerNotes: data.customerNotes || null,
      currency: data.currency,
    })
    .returning();

  let items: (typeof quoteItems.$inferSelect)[] = [];
  if (data.items && Array.isArray(data.items) && data.items.length > 0) {
    const productIds = data.items
      .map((it) => it.productId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    // Tenant-scoped product lookup: only the tenant's own products or the shared base catalog
    // (tenantId IS NULL) may be resolved. Foreign tenants' products silently fall through to
    // the "missing productId" branch so cross-tenant probes can't leak pricing data.
    const productRows = productIds.length
      ? await db
          .select()
          .from(products)
          .where(
            and(
              inArray(products.id, productIds),
              or(eq(products.tenantId, auth.ctx.tenantId), isNull(products.tenantId))
            )
          )
      : [];
    const resolvedProductIds = new Set(productRows.map((p) => p.id));
    const resolvedIdList = Array.from(resolvedProductIds);
    const tierRows = resolvedIdList.length
      ? await db.select().from(productPricingTiers).where(inArray(productPricingTiers.productId, resolvedIdList))
      : [];
    const fieldRows = resolvedIdList.length
      ? await db.select().from(productConfigFields).where(inArray(productConfigFields.productId, resolvedIdList))
      : [];

    const itemValues = data.items.map((item: typeof data.items[number], idx: number) => {
      const isResolved = !!item.productId && resolvedProductIds.has(item.productId);
      const product = isResolved ? productRows.find((p) => p.id === item.productId) ?? null : null;
      const productTiers = product ? tierRows.filter((t) => t.productId === product.id) : [];
      const productFields = product ? fieldRows.filter((f) => f.productId === product.id) : [];
      const priced = priceItem({
        product,
        tiers: productTiers,
        fields: productFields,
        sailArea: item.sailArea ? Number(item.sailArea) : null,
        configuration: (item.configuration ?? {}) as Record<string, string>,
      });

      // If the client sent a productId that doesn't resolve to the caller's tenant scope,
      // null it out (and pricing) — same shape as a custom line.
      const safeProductId = item.productId ? (isResolved ? item.productId : null) : null;
      const fallbackUnitPrice = safeProductId ? (item.unitPrice || null) : null;

      return {
        quoteId: quote.id,
        productId: safeProductId,
        sailType: item.sailType || 'unknown',
        productName: item.productName || 'Unknown',
        sailArea: item.sailArea || null,
        quantity: item.quantity || 1,
        // Server-authoritative pricing: override client-sent unitPrice with computed msrp.
        unitPrice: priced ? priced.msrp.toFixed(2) : fallbackUnitPrice,
        cost: priced ? priced.cost.toFixed(2) : null,
        configuration: item.configuration || {},
        sortOrder: idx,
      };
    });

    items = await db.insert(quoteItems).values(itemValues).returning();
  }

  // Email notifications (fire and forget) — both customer + tenant owner
  ;(async () => {
    try {
      // Resolve tenant name and owner email in parallel
      const [tenantRow] = await db
        .select({ name: tenants.name, companyName: tenants.companyName })
        .from(tenants)
        .where(eq(tenants.id, auth.ctx.tenantId))
        .limit(1);
      const tenantName = tenantRow?.companyName ?? tenantRow?.name ?? 'Aerolume';

      const emailItems = items.map((i) => ({
        productName: i.productName,
        sailType: i.sailType,
        sailArea: i.sailArea,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      }));

      // Customer email
      if (data.customerEmail) {
        sendEmail({
          to: data.customerEmail,
          ...quoteCustomerTemplate({
            customerName: quote.customerName ?? 'Cliente',
            boatModel: quote.boatModel ?? '',
            items: emailItems,
            totalPrice: null,
            currency: quote.currency ?? 'EUR',
            tenantName,
          }),
        }).catch((err) => console.error('[email] customer:', err));
      }

      // Tenant owner notification
      const [ownerMember] = await db
        .select({ userId: tenantMembers.userId })
        .from(tenantMembers)
        .where(and(eq(tenantMembers.tenantId, auth.ctx.tenantId), eq(tenantMembers.role, 'owner')))
        .limit(1);
      if (ownerMember) {
        const { createClient } = await import('@supabase/supabase-js');
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } },
        );
        const { data: userData } = await admin.auth.admin.getUserById(ownerMember.userId);
        const ownerEmail = userData?.user?.email;
        if (ownerEmail) {
          sendEmail({
            to: ownerEmail,
            ...quoteTenantNotificationTemplate({
              customerName: quote.customerName ?? 'Desconocido',
              customerEmail: data.customerEmail ?? '',
              customerPhone: quote.customerPhone,
              customerNotes: quote.customerNotes,
              boatModel: quote.boatModel ?? '',
              items: emailItems,
              totalPrice: null,
              currency: quote.currency ?? 'EUR',
            }),
          }).catch((err) => console.error('[email] tenant notification:', err));
        }
      }
    } catch (err) {
      console.error('[email] quote notification error:', err);
    }
  })();

  // Send webhook notification (fire and forget)
  dispatchQuoteWebhook(auth.ctx.tenantId, 'quote.created', {
    id: quote.id,
    status: quote.status,
    boatModel: quote.boatModel,
    boatLength: quote.boatLength,
    customerName: quote.customerName,
    customerEmail: quote.customerEmail,
    customerPhone: quote.customerPhone,
    customerNotes: quote.customerNotes,
    currency: quote.currency,
    createdAt: quote.createdAt,
    items: items.map((i) => ({
      productId: i.productId,
      sailType: i.sailType,
      productName: i.productName,
      sailArea: i.sailArea,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      configuration: i.configuration as Record<string, unknown>,
    })),
  }).catch(() => {});

  const origin = request.headers.get('origin');
  const res = withCors(NextResponse.json({ data: { id: quote.id, status: quote.status } }), origin);
  const rl = auth.ctx.rateLimitResult;
  res.headers.set('X-RateLimit-Limit', String(rl.limit));
  res.headers.set('X-RateLimit-Remaining', String(rl.remaining));
  res.headers.set('X-RateLimit-Reset', String(rl.reset));
  return res;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return withCors(new NextResponse(null, { status: 204 }), origin);
}

import { db, analyticsEvents, quotes, tenants, eq, desc, sql } from '@aerolume/db';
import { LogsClient } from './client';

export default async function AdminLogsPage() {
  // Get all tenants for the filter
  const allTenants = await db
    .select({ id: tenants.id, name: tenants.name })
    .from(tenants)
    .orderBy(tenants.name);

  const recentEvents = await db
    .select({
      id: analyticsEvents.id,
      eventType: analyticsEvents.eventType,
      boatModel: analyticsEvents.boatModel,
      tenantId: analyticsEvents.tenantId,
      tenantName: tenants.name,
      createdAt: analyticsEvents.createdAt,
    })
    .from(analyticsEvents)
    .leftJoin(tenants, eq(analyticsEvents.tenantId, tenants.id))
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(100);

  const recentQuotes = await db
    .select({
      id: quotes.id,
      boatModel: quotes.boatModel,
      customerName: quotes.customerName,
      customerEmail: quotes.customerEmail,
      status: quotes.status,
      tenantId: quotes.tenantId,
      tenantName: tenants.name,
      createdAt: quotes.createdAt,
    })
    .from(quotes)
    .leftJoin(tenants, eq(quotes.tenantId, tenants.id))
    .orderBy(desc(quotes.createdAt))
    .limit(50);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Actividad</h2>
      <LogsClient tenants={allTenants} events={recentEvents} quotes={recentQuotes} />
    </div>
  );
}

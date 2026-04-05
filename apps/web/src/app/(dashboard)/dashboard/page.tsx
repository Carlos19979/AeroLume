import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { db, products, quotes, boats, analyticsEvents, eq, sql, or } from '@aerolume/db';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const tenant = await getTenantForUser(user.id, user.email);
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';

    if (!tenant) {
        return (
            <div className="text-center py-12 text-gray-500">
                No tienes un workspace configurado.
            </div>
        );
    }

    const [productCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(eq(products.tenantId, tenant.id));

    const [quoteCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(quotes)
        .where(eq(quotes.tenantId, tenant.id));

    const [boatCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(boats)
        .where(or(eq(boats.tenantId, tenant.id), sql`${boats.tenantId} IS NULL`));

    const [eventCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(analyticsEvents)
        .where(eq(analyticsEvents.tenantId, tenant.id));

    return (
        <DashboardClient
            userName={userName}
            metrics={{
                products: productCount?.count ?? 0,
                quotes: quoteCount?.count ?? 0,
                boats: boatCount?.count ?? 0,
                events: eventCount?.count ?? 0,
            }}
        />
    );
}

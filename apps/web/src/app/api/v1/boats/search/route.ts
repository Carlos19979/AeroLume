import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { db, boats, sql, or, eq } from '@aerolume/db';
import { withCors } from '@/lib/cors';

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get('query')?.trim();
  const limit = Math.min(Number(url.searchParams.get('limit') || '20'), 100);

  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  const pattern = `%${query}%`;

  const results = await db
    .select({
      id: boats.id,
      model: boats.model,
      boatModel: boats.boatModel,
      length: boats.length,
      genoaArea: boats.genoaArea,
      genoaFurlerArea: boats.genoaFurlerArea,
      mainsailArea: boats.mainsailArea,
      mainsailFullArea: boats.mainsailFullArea,
      mainsailFurlerArea: boats.mainsailFurlerArea,
      spinnakerArea: boats.spinnakerArea,
      spinnakerAsymArea: boats.spinnakerAsymArea,
      sgenArea: boats.sgenArea,
      isMultihull: boats.isMultihull,
      gvstd: boats.gvstd,
      gvfull: boats.gvfull,
      gve: boats.gve,
      gse: boats.gse,
      gn: boats.gn,
      gen: boats.gen,
      spisym: boats.spisym,
      spiasy: boats.spiasy,
      furling: boats.furling,
    })
    .from(boats)
    .where(
      sql`(${boats.tenantId} IS NULL OR ${boats.tenantId} = ${auth.ctx.tenantId})
          AND ${boats.model} ILIKE ${pattern}`
    )
    .limit(limit);

  const origin = request.headers.get('origin');
  return withCors(NextResponse.json({ data: results }), origin);
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return withCors(new NextResponse(null, { status: 204 }), origin);
}

# Guia de Desarrollo

## Convenciones de Codigo

### Server Components vs Client Components

- **Por defecto, todo es Server Component.** Solo anadir `'use client'` cuando sea estrictamente necesario (hooks, interactividad, event handlers).
- Patron comun: `page.tsx` (server) carga datos y renderiza un componente `client.tsx` que maneja la interactividad.

```
dashboard/products/
├── page.tsx       # Server component: getAuthenticatedTenant(), fetch data
└── client.tsx     # Client component: 'use client', formularios, estado
```

### Autenticacion en API Routes

**Nunca duplicar logica de autenticacion.** Usar siempre los wrappers:

```typescript
// API interna (dashboard) - usa sesion Supabase + tenant membership
import { withTenantAuth } from '@/lib/auth-helpers';

export const GET = withTenantAuth(async (req, { user, tenant }) => {
  // user.id, user.email disponibles
  // tenant.id para filtrar queries
  return NextResponse.json({ data: results });
});

// API admin - usa sesion Supabase + super admin check
import { withAdminAuth } from '@/lib/auth-helpers';

export const GET = withAdminAuth(async (req, { user }) => {
  // Solo super admins llegan aqui
  return NextResponse.json({ data: results });
});

// API v1 (publica) - usa API key
import { validateApiKey } from '@/lib/api-auth';

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // auth.ctx.tenantId disponible
}
```

### Autenticacion en Server Pages

```typescript
import { getAuthenticatedTenant } from '@/lib/auth-page';
import { redirect } from 'next/navigation';

export default async function MyPage() {
  const auth = await getAuthenticatedTenant();
  if (!auth) redirect('/login');

  const { user, tenant } = auth;
  // Fetch data con tenant.id y renderizar
}
```

> **Nota desarrollo local:** `getAuthenticatedTenant()` crea el tenant automaticamente si el usuario no tiene uno y `NODE_ENV === 'development'`. Esto permite trabajar con email confirmation desactivada en Supabase. En produccion, el tenant se crea exclusivamente en `/auth/callback` tras confirmar el email.

### Creacion de tenant

La logica de creacion de tenant esta en `@/lib/create-tenant.ts` (`createTenantForUser`). Se usa desde:
- `/auth/callback` — tras confirmar email (produccion)
- `getAuthenticatedTenant()` — fallback automatico (solo desarrollo)

### Validacion con Zod

- Todos los schemas estan en `apps/web/src/lib/validations.ts`
- Usar `validateBody(schema, body)` en API routes de mutacion
- Para columnas `numeric` de Drizzle, usar el helper `numericString` que acepta number o string

```typescript
import { validateBody, createQuoteSchema } from '@/lib/validations';

const body = await request.json();
const validation = validateBody(createQuoteSchema, body);
if ('error' in validation) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}
const data = validation.data; // Tipado automaticamente
```

### Validacion obligatoria en mutaciones

- **TODOS** los campos escritos a la DB deben pasar por validacion Zod. Nunca leer directamente de `body.field` — siempre usar `validation.data` del schema validado.
- Al anadir nuevos campos a un endpoint PUT/POST, siempre expandir el schema Zod correspondiente en `@/lib/validations.ts`.

### Formato de Fechas y Numeros

Usar los helpers del paquete shared:

```typescript
import { formatPrice, formatDimension, formatNumber, toNumber } from '@aerolume/shared';

formatPrice(1200.50);        // "1.200,50 EUR"
formatDimension("11.50");    // "11.50 m"
formatNumber(1234567);       // "1.234.567"
toNumber("35.20");           // 35.2
toNumber(null);              // null
```

### Componentes UI

- Los componentes UI base (Button, Input, Select, Dialog, etc.) estan en `apps/web/src/components/ui/`
- Usan Tailwind CSS para estilos
- Para combinar clases CSS, usar `clsx` + `tailwind-merge`:

```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Hooks Compartidos

Los custom hooks estan en `apps/web/src/hooks/`. Encapsulan logica reutilizable como fetching, formularios, etc.

### Importaciones

- Usar alias `@/` para imports dentro de `apps/web/src/`
- Usar `@aerolume/db` para schemas y operaciones de DB
- Usar `@aerolume/shared` para tipos y utilidades compartidas

## Como Anadir un Nuevo Endpoint API

### Endpoint interno (dashboard)

1. Crear archivo en `apps/web/src/app/api/internal/<recurso>/route.ts`
2. Usar `withTenantAuth` wrapper
3. Si es mutacion, crear schema Zod en `lib/validations.ts`
4. Filtrar siempre por `ctx.tenant.id`

```typescript
// apps/web/src/app/api/internal/mi-recurso/route.ts
import { NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/auth-helpers';
import { db, miTabla, eq } from '@aerolume/db';

export const GET = withTenantAuth(async (req, { tenant }) => {
  const results = await db
    .select()
    .from(miTabla)
    .where(eq(miTabla.tenantId, tenant.id));

  return NextResponse.json({ data: results });
});

export const POST = withTenantAuth(async (req, { tenant }) => {
  const body = await req.json();
  const validation = validateBody(miSchema, body);
  if ('error' in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const [created] = await db
    .insert(miTabla)
    .values({ ...validation.data, tenantId: tenant.id })
    .returning();

  return NextResponse.json({ data: created });
});
```

### Endpoint v1 (publico)

1. Crear archivo en `apps/web/src/app/api/v1/<recurso>/route.ts`
2. Usar `validateApiKey` + `withCors`
3. Exportar handler `OPTIONS` para preflight
4. Si es mutacion, crear schema Zod

```typescript
// apps/web/src/app/api/v1/mi-recurso/route.ts
import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { withCors } from '@/lib/cors';

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // ... logica con auth.ctx.tenantId
  const origin = request.headers.get('origin');
  return withCors(NextResponse.json({ data: results }), origin);
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');
  return withCors(new NextResponse(null, { status: 204 }), origin);
}
```

## Como Anadir una Nueva Pagina de Dashboard

1. Crear directorio en `apps/web/src/app/(dashboard)/dashboard/<pagina>/`
2. Crear `page.tsx` (server component) y opcionalmente `client.tsx`
3. Usar `getAuthenticatedTenant()` en la page
4. Anadir enlace en el sidebar (`AppSidebar`)

```typescript
// apps/web/src/app/(dashboard)/dashboard/mi-pagina/page.tsx
import { getAuthenticatedTenant } from '@/lib/auth-page';
import { redirect } from 'next/navigation';
import { MiPaginaClient } from './client';

export default async function MiPaginaPage() {
  const auth = await getAuthenticatedTenant();
  if (!auth) redirect('/login');

  // Fetch data server-side
  const data = await fetchData(auth.tenant.id);

  return <MiPaginaClient data={data} />;
}
```

```typescript
// apps/web/src/app/(dashboard)/dashboard/mi-pagina/client.tsx
'use client';

import { useState } from 'react';

export function MiPaginaClient({ data }: { data: any }) {
  const [state, setState] = useState(data);
  // ... interactividad
}
```

## Como Anadir un Nuevo Schema de DB

1. Crear archivo en `packages/db/src/schema/<tabla>.ts`
2. Definir la tabla con `pgTable` de Drizzle
3. Incluir `tenantId` como FK a tenants (si aplica)
4. Anadir indices relevantes
5. Exportar desde `packages/db/src/index.ts`
6. Generar y aplicar migracion

```typescript
// packages/db/src/schema/mi-tabla.ts
import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const miTabla = pgTable(
  'mi_tabla',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    nombre: text('nombre').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
  },
  (table) => [
    index('idx_mi_tabla_tenant').on(table.tenantId),
  ],
);
```

```typescript
// packages/db/src/index.ts - anadir export
export * from './schema/mi-tabla';
```

```bash
# Generar y aplicar migracion
cd packages/db
pnpm generate
pnpm migrate
```

## Estructura de Archivos Tipica

```
feature/
├── page.tsx           # Server component (datos + layout)
├── client.tsx         # Client component (interactividad)
├── loading.tsx        # Loading skeleton (opcional)
└── error.tsx          # Error boundary (opcional)
```

Para API routes:

```
api/internal/recurso/
├── route.ts           # GET (lista) + POST (crear)
└── [id]/
    └── route.ts       # GET (detalle) + PUT (actualizar) + DELETE (eliminar)
```

## Paquetes del Monorepo

### @aerolume/db

- Schemas Drizzle, cliente de DB, migraciones y seed
- Importar: `import { db, tenants, products, eq, and } from '@aerolume/db';`
- Re-exporta operadores de Drizzle: `eq`, `and`, `or`, `desc`, `asc`, `sql`, `inArray`

### @aerolume/shared

- Tipos TypeScript compartidos entre apps
- Utilidades de formato (`formatPrice`, `formatDimension`, `toNumber`)
- Funciones de normalizacion
- Importar: `import { toNumber, formatPrice } from '@aerolume/shared';`

## Testing

Pendiente de implementar. Se planea usar:
- Vitest para unit tests
- Playwright para E2E tests

## Deploy

Pendiente de documentar. La arquitectura soporta despliegue en:
- **apps/web:** Vercel (Next.js) o cualquier plataforma con soporte Node.js
- **apps/widget:** CDN estatico (output IIFE)
- **Base de datos:** Supabase (PostgreSQL gestionado)

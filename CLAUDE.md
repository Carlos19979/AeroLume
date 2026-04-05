# Aerolume

Plataforma SaaS B2B de configuracion de velas para retailers nauticos. Permite a clientes buscar barcos, configurar velas y generar presupuestos.

## Tech Stack

- **Monorepo:** Turborepo + pnpm 10
- **Web app:** Next.js 16 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS 4, Framer Motion
- **State:** Zustand, React Hook Form + Zod
- **Auth:** Supabase (@supabase/ssr)
- **DB:** PostgreSQL + Drizzle ORM
- **Widget:** Vite (IIFE bundle)

## Estructura del monorepo

```
apps/web/          → Next.js app principal (dashboard, landing, API, admin)
apps/widget/       → Widget embebible JS para sitios de terceros
packages/db/       → Drizzle ORM schemas, client, seed
packages/shared/   → Tipos TypeScript y utilidades compartidas
docs/              → Documentacion completa del proyecto
```

## Documentacion

Antes de hacer cambios significativos, lee la documentacion relevante en `docs/`:

- `docs/README.md` — Setup, variables de entorno, scripts
- `docs/architecture.md` — Multi-tenancy, auth, middleware, webhooks
- `docs/database.md` — Tablas, campos, enums, relaciones, migraciones
- `docs/api.md` — Endpoints v1, internal, admin con ejemplos
- `docs/dashboard.md` — Rutas, plan gates, impersonacion
- `docs/widget.md` — Integracion, eventos, postMessage
- `docs/security.md` — API keys, SSRF, Zod, headers, CORS
- `docs/development.md` — Convenciones de codigo y guias

## Convenciones criticas

### API Routes
- Rutas internas: usar `withTenantAuth()` de `@/lib/auth-helpers`
- Rutas admin: usar `withAdminAuth()` de `@/lib/auth-helpers`
- NUNCA duplicar boilerplate de auth — siempre usar los wrappers
- Validar input con Zod schemas de `@/lib/validations`
- Errores de API en ingles, UI en espanol

### Server Pages
- Usar `getAuthenticatedTenant()` de `@/lib/auth-page`
- Pattern: `page.tsx` (server) + `client.tsx` (client component)

### Constantes y utilidades
- Sail types, status labels, event labels: `@/lib/constants`
- Formateo de fechas: `@/lib/format` (formatDate, formatDateTime, formatDateShort)
- Slugify: `@/lib/utils`
- Navegacion: `@/lib/navigation`

### Componentes UI reutilizables
- `@/components/ui/Logo` — Logo con variantes light/dark
- `@/components/ui/PageHeader` — Header de pagina con titulo y descripcion
- `@/components/ui/DataTable` — Tabla generica tipada
- `@/components/ui/SaveButton` — Boton guardar con estado + hook `useSaveState()`
- `@/components/ui/AppSidebar` — Sidebar compartido dashboard/admin

### Hooks
- `@/hooks/useClickOutside` — Detectar click fuera de un elemento

### Base de datos
- Schemas en `packages/db/src/schema/`
- Columnas `numeric` devuelven string — usar `toNumber()` de `@aerolume/shared`
- Enums tipados con pgEnum (plan, status, role, sailType, fieldType)
- `updatedAt` se actualiza automaticamente via `$onUpdateFn`

### Seguridad
- API keys solo via header `x-api-key` (no query params)
- Webhook URLs validadas contra IPs internas (`isInternalUrl`)
- Super admin configurable via env var `SUPER_ADMIN_EMAILS`
- CORS headers en todas las rutas v1
- Todas las mutaciones API validadas con Zod — nunca usar `body.field`, siempre `data.field` del schema validado

## Comandos

```bash
pnpm dev          # Dev server (turbo)
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm db:generate  # Generar migraciones Drizzle
pnpm db:migrate   # Aplicar migraciones
pnpm db:seed      # Seed de datos de prueba
```

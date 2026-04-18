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

### Catalogo base
- Al crear un tenant, llamar `cloneBaseCatalogToTenant(tenantId, db?)` de `@aerolume/db` — nunca replicar la logica de clonado
- Pasar `db` explicito cuando el caller tiene su propia conexion (scripts, fixtures)
- Implementacion: `packages/db/src/clone-catalog.ts` (no transaccional — decision deliberada para evitar regresiones de concurrencia en E2E)

### Pricing server-side
- El calculo de precios (tiers, modifiers, fallback a basePrice) vive en `apps/web/src/lib/pricing.ts` — funcion pura `priceItem()`
- Llamar siempre desde el server en `/api/v1/quotes`; nunca confiar en `unitPrice`/`cost` enviados por el cliente

### Nullable en validations
- Los schemas Zod que recibe el embed o el dashboard deben aceptar `null` en campos opcionales que el cliente envia como `null` en lugar de `undefined` (patron actual)
- Cuando añadas un campo opcional-string, usa `.nullable()` — ver `createQuoteSchema` y `updateTenantSettingsSchema` como referencia

### Trial gate
- Los checks de plan en rutas internas que mutan deben leer `trialEndsAt` del tenant (no solo `plan`)
- `canCreateProducts`, `canCreateApiKey`, etc. aceptan el par `{ plan, trialEndsAt }`

### Testing
- Frameworks: **Playwright** (E2E) + **Vitest** (unit)
- Configs: `apps/web/playwright.config.ts` / `apps/web/vitest.config.ts`
- Layout:
  - Unit: `apps/web/tests/unit/**/*.test.ts`
  - E2E: `apps/web/tests/e2e/<area>/**/*.spec.ts` — areas: `smoke`, `auth`, `configurator`, `dashboard`, `admin`, `api-public`, `api-internal`, `security`, `webhooks`, `widget`
- Fixtures: importar `test`/`expect` desde `../fixtures/auth` (no desde `@playwright/test`) para obtener tenant + user + API key por test. Para specs de admin, usar `../fixtures/admin-auth`
- Selectores: todo `data-testid` nuevo debe registrarse en `apps/web/tests/e2e/fixtures/selectors.ts` bajo el namespace correcto (`dashboard:` o `admin:`). Nunca duplicar literales en los specs
- DB assertions: usar `dbQuery` de `fixtures/api.ts` (params posicionales, resultados como strings — castear columnas numeric/date con `::text`)
- Super admin E2E: la provision del super-admin ocurre una sola vez en `globalSetup.ts`. Los specs solo leen/login; no llamar `updateUserById` en `beforeAll`
- Comandos: ver `README.md` para el listado completo

## Comandos

Ver `README.md` para el listado completo. Los mas usados:

```bash
pnpm dev                                                        # Dev server (turbo)
pnpm build                                                      # Build all packages
pnpm lint                                                       # Lint all packages
pnpm test                                                       # Unit tests (vitest)
pnpm test:e2e                                                   # E2E tests (playwright)
pnpm exec playwright test --project=chromium tests/e2e/<dir>/  # E2E de un area
pnpm --filter @aerolume/db migrate                              # Aplicar migraciones
```

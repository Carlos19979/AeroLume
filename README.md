# Aerolume

Plataforma SaaS B2B de configuración de velas para retailers náuticos. Monorepo Turborepo + pnpm.

- **`apps/web`** — Next.js 16 (App Router), dashboard, landing, API, admin panel
- **`apps/widget`** — Widget JS embebible (Vite IIFE) para sitios de terceros
- **`packages/db`** — Drizzle ORM schemas, cliente, seed, clone-catalog
- **`packages/shared`** — Tipos y utilidades compartidas
- **`docs/`** — Documentación del proyecto (ver [docs/README.md](./docs/README.md))

---

## Requisitos

| Tool     | Versión |
|----------|---------|
| Node.js  | 20+     |
| pnpm     | 10.33+  |
| Postgres | 15+ (Supabase) |

---

## Quick start

```bash
# 1. Clonar e instalar
pnpm install

# 2. Copiar el template de variables de entorno y rellenar
cp .env.example apps/web/.env.local
# (Supabase URL + keys, DATABASE_URL, etc.)

# 3. Ejecutar migraciones y sembrar datos
pnpm db:migrate
pnpm db:seed

# 4. Levantar dev servers (web + widget en paralelo)
pnpm dev
```

- Web: http://localhost:3000
- Widget Vite: http://localhost:5173

---

## Comandos

### Desarrollo

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Levanta todos los dev servers con Turbo (web + widget) |
| `pnpm dev:web` | Solo la app web (Next dev) |
| `pnpm --filter @aerolume/web dev` | Equivalente, scoped al paquete web |
| `pnpm --filter @aerolume/widget dev` | Solo el widget (Vite dev) |
| `pnpm build` | Build de todos los paquetes (Turbo) |
| `pnpm lint` | Lint de todos los paquetes |

### Base de datos

Todos bajo `packages/db`. Se pueden correr desde la raíz con `pnpm --filter @aerolume/db <cmd>` o entrando al paquete.

| Comando | Descripción |
|---------|-------------|
| `pnpm db:generate` | Generar migraciones Drizzle a partir de los schemas |
| `pnpm db:migrate` | Aplicar migraciones pendientes contra `DATABASE_URL` |
| `pnpm db:push` | Push directo del schema (solo dev — sin migración formal) |
| `pnpm db:studio` | Abre Drizzle Studio para inspeccionar la DB |
| `pnpm db:seed` | Siembra tenants de dev, catálogo base y admin (requiere `SEED_ADMIN_PASSWORD`) |

*Nota:* los aliases `db:*` desde la raíz funcionan vía `pnpm` workspace scripts si se añaden al `package.json` raíz. Actualmente hay que ejecutar:

```bash
pnpm --filter @aerolume/db generate   # equivale a db:generate
pnpm --filter @aerolume/db migrate    # equivale a db:migrate
pnpm --filter @aerolume/db seed       # equivale a db:seed
```

### Tests

Todos los comandos se ejecutan desde `apps/web/`.

#### Vitest (unit — rápidos, sin servidor)

| Comando | Qué hace |
|---------|----------|
| `pnpm test` | Corre todos los `tests/unit/**/*.test.ts` una vez |
| `pnpm test:watch` | Vitest en watch mode |

Archivos: `apps/web/tests/unit/`
- `pricing.test.ts` — cálculo de precios (tiers, modifiers, fallbacks)
- `validations.test.ts` — schemas Zod de `@/lib/validations`
- `clone-catalog.test.ts` — clone del catálogo base (requiere DB disponible)

#### Playwright (E2E — requieren dev server)

**Prerequisitos antes de correr E2E:**

- Supabase accesible con `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` configurados.
- DB Postgres con migraciones y seed ya aplicados: `pnpm db:migrate && pnpm db:seed`.
- Usuario admin cuyo email esté en `SUPER_ADMIN_EMAILS` y `SEED_ADMIN_PASSWORD` seteado — el `globalSetup.ts` lo provisiona automáticamente si existe.
- `LEMONSQUEEZY_WEBHOOK_SECRET` definido; si falta, los tests de webhooks hacen skip automático (no fallan).
- Browsers Playwright instalados: `pnpm --filter @aerolume/web exec playwright install chromium`.

| Comando | Qué hace |
|---------|----------|
| `pnpm test:e2e` | Corre toda la suite E2E (arranca web + widget si no están ya corriendo) |
| `pnpm test:e2e:ui` | UI mode (Playwright Inspector — recomendado para debugging local) |
| `pnpm test:e2e:debug` | Debug mode paso a paso |
| `pnpm test:e2e:codegen` | Abre Playwright codegen contra localhost:3000 |

Ejecutar un subset:

```bash
# Solo chromium (más rápido que chromium + webkit + mobile)
pnpm exec playwright test --project=chromium

# Un spec concreto
pnpm exec playwright test tests/e2e/configurator/full-happy-path.spec.ts

# Un directorio
pnpm exec playwright test tests/e2e/security/
```

Ver reporte HTML tras una corrida fallida: `pnpm exec playwright show-report`.

**Ejemplos prácticos:**

```bash
# Correr un solo archivo
pnpm exec playwright test tests/e2e/configurator/full-happy-path.spec.ts

# Correr un solo test por nombre
pnpm exec playwright test -g "tier 10-20"

# UI interactiva (recomendado para depurar localmente)
pnpm exec playwright test --ui

# Ver trace de un fallo
pnpm exec playwright show-trace test-results/<test-name>/trace.zip

# Debug paso a paso de un archivo concreto
pnpm exec playwright test tests/e2e/configurator/full-happy-path.spec.ts --debug

# Listar todos los tests sin ejecutarlos
pnpm exec playwright test --list
```

#### Troubleshooting E2E

- **"Web server timeout"** — si el dev server tarda más de 120 s en arrancar (primera compilación con Turbopack), aumentar `timeout` en la sección `webServer` de `apps/web/playwright.config.ts`, o arrancar el servidor manualmente con `pnpm dev` antes de lanzar `pnpm test:e2e`.
- **"Stale Turbopack cache"** — si los tests fallan con errores tipo `Could not parse module .../next@X.Y.Z_.../node_modules/next/...`, matar el dev server y borrar `apps/web/.next/`.
- **"Connection pool exhausted"** — al correr muchos workers en paralelo, reducir `workers` en `playwright.config.ts` de 4 a 2, o aumentar el `max` de la pool en `tests/e2e/fixtures/tenant.ts` (actualmente 3).
- **"Flaky auth fixture cleanup"** — los warnings `[auth fixture] cleanupTenant failed: ...` en stdout son informativos (la cascada de la DB ya elimina el tenant); no afectan el resultado del test.
- **"Webkit / Mobile projects fail"** — por defecto solo se corre chromium. Para los demás navegadores: `pnpm exec playwright install webkit` y quitar `--project=chromium` del comando.

#### Estructura de tests

```
apps/web/tests/
├── unit/                           # vitest — 72 tests
│   ├── pricing.test.ts
│   ├── validations.test.ts
│   └── clone-catalog.test.ts
└── e2e/                            # playwright — 82 tests
    ├── fixtures/                   # auth, api, tenant, admin-auth, selectors
    ├── globalSetup.ts / globalTeardown.ts
    ├── smoke/                      # rutas públicas
    ├── auth/                       # signup + catalog clone
    ├── configurator/               # flujo happy path, reefs, pricing, expert mode
    ├── dashboard/                  # list + CRUDs (products, quotes, boats, theme, settings, api-keys)
    ├── admin/                      # tenants, impersonation, boats globales, gate
    ├── api-public/                 # /api/v1/*
    ├── api-internal/               # /api/internal/* (tenant isolation, trial gate)
    ├── webhooks/                   # LemonSqueezy (HMAC, lifecycle, idempotencia)
    ├── security/                   # SSRF, CORS, spoofing, cross-tenant
    └── widget/                     # postMessage flow
```

#### Cobertura actual

| Área | Tipo | Tests |
|------|------|------:|
| Pricing, validations, clone-catalog | Unit (Vitest) | 72 |
| Smoke, auth, configurator | E2E (Playwright) | 18 |
| Dashboard (products, quotes, boats, settings, api-keys, theme) | E2E | 28 |
| Admin (tenants, impersonation, boats globales, gate) | E2E | 12 |
| API public + internal + webhooks + analytics ingest | E2E | 26 |
| Security (SSRF, CORS, spoofing, cross-tenant, cost) | E2E | 7 |
| Widget (postMessage flow) | E2E | 2 |
| Marketing / landing (home, about, contact, nav) | E2E | 24 |
| Analytics dashboard + aggregations | E2E | 8 |
| Visual snapshots (SailPreview) | E2E | 11 |
| **Total** | | **207** |

> **Skips:** 1 test — `analytics/dashboard-analytics-page.spec.ts` "date-range filter" (UI aún no lo implementa). Ver [docs/testing.md §8 Sprint 3](./docs/testing.md).

Hay 2 tests marcados como `skip` intencional (documentados en [docs/testing.md](./docs/testing.md) §8 Sprint 3).

Ver [docs/testing.md](./docs/testing.md) para el plan completo y el detalle de cada spec.

---

## Variables de entorno

Declaradas en `apps/web/.env.local`. Las más relevantes:

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Conexión Postgres de la app |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase público |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-only) |
| `SUPER_ADMIN_EMAILS` | Lista separada por comas de super-admins |
| `SEED_ADMIN_PASSWORD` | Password del admin durante el seed (fail-fast si falta) |
| `LEMONSQUEEZY_API_KEY` | API key de LemonSqueezy |
| `LEMONSQUEEZY_STORE_ID` | Store ID |
| `LEMONSQUEEZY_VARIANT_PRO` | Variant ID del plan pro |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Secret HMAC para el endpoint de webhooks |
| `NEXT_PUBLIC_DEMO_API_KEY` | API key del tenant demo para el configurador público |

**Solo para E2E** (opcional si no corres tests):

| Variable | Uso |
|----------|-----|
| `E2E_DATABASE_URL` | Postgres de test (puede ser la misma DB) |
| `E2E_SUPABASE_URL` / `E2E_SUPABASE_SERVICE_KEY` | Supabase admin API para provisionar usuarios de test |
| `E2E_BASE_URL` | Default `http://localhost:3000` |

El `globalSetup.ts` falla-rápido si alguna de las 4 vars E2E_* falta.

---

## Documentación del proyecto

- [docs/README.md](./docs/README.md) — Visión general
- [docs/architecture.md](./docs/architecture.md) — Multi-tenancy, auth, middleware, webhooks
- [docs/database.md](./docs/database.md) — Tablas, campos, enums, migraciones
- [docs/api.md](./docs/api.md) — Endpoints v1, internal, admin
- [docs/dashboard.md](./docs/dashboard.md) — Rutas, plan gates, impersonación
- [docs/widget.md](./docs/widget.md) — Integración, eventos, postMessage
- [docs/security.md](./docs/security.md) — API keys, SSRF, Zod, headers, CORS
- [docs/testing.md](./docs/testing.md) — Plan de pruebas E2E + estado Sprint 1/2/3
- [docs/development.md](./docs/development.md) — Convenciones de código y guías

---

## CI

GitHub Actions en `.github/workflows/e2e.yml` corre la suite E2E en cada push/PR a `master`. Secrets requeridos: `E2E_DATABASE_URL`, `E2E_SUPABASE_URL`, `E2E_SUPABASE_SERVICE_KEY`, `NEXT_PUBLIC_DEMO_API_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET`, `SEED_ADMIN_PASSWORD`.

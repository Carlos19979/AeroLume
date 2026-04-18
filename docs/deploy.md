# Deploy

Aerolume se despliega en **Vercel**. La plataforma detecta Next.js automáticamente y gestiona el build/preview/prod sin necesidad de `vercel.json`.

## Infraestructura

| Pieza | Plataforma |
|-------|-----------|
| App web (Next.js) | Vercel |
| Widget embebible | Vercel (mismo proyecto, build genera el IIFE) |
| Base de datos Postgres | Supabase |
| Autenticación | Supabase Auth |
| Billing | LemonSqueezy |
| Webhooks LS | Vercel (ruta `/api/webhooks/lemonsqueezy`) |

## Configuración de Vercel

Ajustes clave en el dashboard de Vercel → Settings:

- **Framework Preset:** Next.js
- **Root Directory:** `apps/web`
- **Install Command:** `pnpm install --frozen-lockfile` (Vercel ejecuta esto en el root del repo, no en `apps/web/`)
- **Build Command:** `cd ../.. && pnpm --filter @aerolume/web build` (o equivalente con `turbo build --filter=@aerolume/web`)
- **Output Directory:** `.next` (dentro de `apps/web/`)

### Variables de entorno en Vercel

Replicar todas las variables definidas en `apps/web/.env.local` (sin las `E2E_*`, que sólo son para tests):

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — **Server-only**. NO marcar como "exposed to browser".

**Base de datos:**
- `DATABASE_URL` — Postgres de producción (Supabase Postgres pooler URL preferido para serverless).

**Autenticación / admin:**
- `SUPER_ADMIN_EMAILS` — emails separados por coma (ej: `admin@aerolume.com`). Define quién ve `/admin`.

**LemonSqueezy:**
- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_VARIANT_PRO`
- `LEMONSQUEEZY_WEBHOOK_SECRET` — el secret HMAC con el que LS firma los webhooks.

**Demo / embed:**
- `NEXT_PUBLIC_DEMO_API_KEY` — API key del tenant demo para el configurador público de la landing.

**Vercel KV (rate limiting):**
- `KV_REST_API_URL` — URL REST del KV store. Vercel la inyecta automáticamente al conectar la DB.
- `KV_REST_API_TOKEN` — Token de autenticación. También inyectado automáticamente por Vercel.

**Seed (sólo si corres `pnpm db:seed` desde Vercel, que no es lo habitual):**
- `SEED_ADMIN_PASSWORD`

### Webhook de LemonSqueezy

En el dashboard de LemonSqueezy → Settings → Webhooks añadir:
- URL: `https://<tu-dominio>/api/webhooks/lemonsqueezy`
- Secret: el mismo valor que `LEMONSQUEEZY_WEBHOOK_SECRET` en Vercel.
- Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired` (los 4 tienen handler implementado y tests en `tests/e2e/webhooks/lemonsqueezy.spec.ts`).

## Migraciones de base de datos

Las migraciones Drizzle no se aplican automáticamente en cada deploy. Hay 3 opciones:

### Opción A (recomendada): manual antes del merge a `master`

Cuando añadas migraciones nuevas:
1. `pnpm --filter @aerolume/db generate` genera el SQL en `packages/db/drizzle/`.
2. Desde tu máquina local, con `DATABASE_URL` apuntando a prod: `pnpm --filter @aerolume/db migrate`.
3. Commitea la migración y mergea. Vercel hace el deploy.

Ventaja: control total, rollback trivial. Inconveniente: pasos manuales.

### Opción B: postinstall en CI (no en Vercel)

Añadir un step en `.github/workflows/ci.yml` (solo en push a `master`) que ejecute `pnpm --filter @aerolume/db migrate` contra `DATABASE_URL` antes de que Vercel termine el deploy. Requiere que el workflow tenga `DATABASE_URL` como secret.

Ventaja: automático. Inconveniente: si falla la migración, el deploy de Vercel puede quedar incoherente.

### Opción C: build command de Vercel

Hacer que el build command ejecute migrate antes de `next build`. **No recomendado**: las migraciones corren en cada deploy/preview, las previews no deberían tocar la DB de prod.

## Preview deploys

Vercel crea un preview por cada push a una branch y por cada PR. Los previews comparten `DATABASE_URL` con producción por defecto — usar con cuidado o configurar una DB separada para previews mediante variables de entorno scopeadas a `preview` en Vercel.

## CI (antes del deploy)

Hay 2 workflows en `.github/workflows/`:

- **`ci.yml`** — lint, typecheck, vitest unitarios. Rápido (~3-5 min). Bloquea PRs si falla.
- **`e2e.yml`** — suite E2E de Playwright. Más lento (~10-15 min). Bloquea PRs si falla.

Ambos corren en cada push a `master`/`main` y en cada PR. Vercel hace su deploy independientemente; si quieres que el deploy espere a CI verde, configura "Ignored Build Step" en Vercel con un comando que consulte el estado del commit.

## Domains

Configurar en Vercel → Domains. Supabase y LemonSqueezy no requieren nada adicional salvo actualizar el webhook URL en LS cuando cambies de dominio.

## Rollback

Vercel mantiene histórico de deploys. Para volver atrás:
1. Vercel dashboard → Deployments → selecciona el deploy anterior → "Promote to Production".
2. Si el rollback incluye una migración de DB destructiva, aplicar también el rollback de la migración (Drizzle no genera `down.sql` automáticamente — toca escribir el SQL inverso a mano).

## Vercel KV (rate limiting)

Aerolume usa Vercel KV (Upstash Redis) para rate limiting por API key. Sin KV, el rate limiting se desactiva gracefully (warn en logs, todos los requests pasan).

### Crear la base de datos KV

1. Vercel dashboard → Storage → **Create Database** → selecciona **KV**.
2. Ponle nombre (ej: `aerolume-kv`) y selecciona la región más cercana a tu DB de Postgres.
3. En "Connect to Project", selecciona tu proyecto Aerolume.
4. Vercel inyecta `KV_REST_API_URL` y `KV_REST_API_TOKEN` automáticamente en todos los entornos (production, preview, development).

### Verificar la conexión

Después de conectar, en Vercel → Settings → Environment Variables deberías ver `KV_REST_API_URL` y `KV_REST_API_TOKEN` marcadas como "Added by Integration".

Para testear localmente: ejecuta `vercel env pull` para traer las variables a `.env.local`, luego corre `pnpm test:e2e --grep "rate limiting"` en `apps/web`.

## Checklist pre-producción

Antes de hacer público el dominio:

- [ ] Todas las vars de entorno configuradas en Vercel (ver lista arriba).
- [ ] Webhook de LemonSqueezy configurado con el secret correcto.
- [ ] `SUPER_ADMIN_EMAILS` incluye al menos un email real con acceso a Supabase Auth.
- [ ] DB de producción sembrada: `pnpm db:migrate && pnpm db:seed` (o sólo migrate si ya hay datos).
- [ ] CORS del `/api/v1/*` verificado (los orígenes permitidos se gestionan por tenant en la tabla `allowed_origins`; añadir los de producción).
- [ ] CI verde (`ci.yml` + `e2e.yml`).
- [ ] Vercel KV creado y conectado al proyecto (ver seccion abajo).

---

## Supabase MFA (TOTP)

### Activar MFA en el proyecto Supabase

Para que el gate 2FA de super admins funcione, MFA debe estar habilitado en el proyecto Supabase:

1. Ir a [Supabase Dashboard](https://app.supabase.com) → seleccionar el proyecto.
2. Navegar a **Authentication → Sign In / Up** (o **Auth → Providers** segun version).
3. En la seccion **Multi-Factor Authentication**, activar **TOTP**.
4. Guardar cambios.

Sin este paso, `supabase.auth.mfa.*` devuelve errores y los tests MFA fallan.

### Variable de entorno

El gate MFA es opt-in via variable de entorno. Agrega a `.env.local` (desarrollo) y a Vercel (produccion):

```
ENFORCE_SUPER_ADMIN_MFA=1
```

Sin esta variable, los super admins pueden acceder a `/admin` sin 2FA (util para desarrollo y CI).

### Checklist MFA para produccion

- [ ] MFA habilitado en Supabase Dashboard (Authentication → MFA → TOTP).
- [ ] `ENFORCE_SUPER_ADMIN_MFA=1` configurado en Vercel → Environment Variables (solo Production).
- [ ] El super admin ha completado el enrollment en `/admin/mfa` antes de activar el gate.
- [ ] Recovery documentado: acceso a la DB para eliminar factores si se pierde el dispositivo (ver `docs/security.md`).

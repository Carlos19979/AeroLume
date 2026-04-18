# Plan de Pruebas E2E

Cobertura completa de flujos de usuario en Aerolume: landing pública, auth + onboarding, configurador embebido, dashboard del tenant, panel admin, APIs públicas y privadas, webhooks de LemonSqueezy y casos negativos de seguridad.

---

## 1. Elección de herramientas

### 1.1 Playwright (runner principal)

- **TS nativo**, encaja en el monorepo sin añadir otro lenguaje.
- **Multi-browser** (Chromium, WebKit, Firefox) en paralelo.
- **Iframe + cross-origin first-class** (`frameLocator`, `page.evaluate` para escuchar `postMessage`) — crítico para el widget.
- **`request.newContext()`** permite contract tests de `/api/v1/*` y `/api/internal/*` en el mismo runner.
- Tracing, video, screenshots en fallos; auto-wait; codegen.
- Ya hay rastro en el repo (`.playwright-mcp/` en `.gitignore`).

### 1.2 Vitest (unitarios)

Para lógica pura sin browser:
- `lib/pricing.ts` — tier lookup + flat + percent modifiers.
- `lib/validations.ts` — Zod schemas.
- `lib/api-keys.ts` — generación y hash de keys.
- `lib/url-validation.ts` — `isInternalUrl()` para SSRF.
- `packages/db/src/clone-catalog.ts` — con mock de `db`.

### 1.3 Descartadas

| Herramienta | Por qué no |
|-------------|-----------|
| Karate | Java/DSL — 80% del valor es UI |
| Cypress | Débil multi-origin/iframe (crítico para widget) |
| Puppeteer | Playwright es superset |
| WebdriverIO | Más overhead sin ventaja |

---

## 2. Arquitectura

### 2.1 Entornos

| Entorno | Propósito | DB |
|---------|-----------|-----|
| **local-dev** | Dev corre `pnpm test:e2e` contra dev server | mismo Supabase que `pnpm dev` |
| **ci-pr** | GH Actions contra preview deploy | Supabase branch efímera |
| **staging** | Smoke después de deploy | Supabase staging |

### 2.2 Datos de prueba — aislamiento

Supabase es compartido. Cada test crea sus recursos con prefijo único y los limpia.

- Usuario: `e2e-${workerId}-${ts}@aerolume.test`
- Tenant: creado vía signup real (ejercita `createTenantForUser` + `cloneBaseCatalogToTenant`)
- API key: generada al crear tenant
- Cleanup en `afterEach` + barrido en `globalTeardown` (borra `e2e-*@aerolume.test` users + sus tenants).

**Helpers clave** (en `tests/e2e/fixtures/`):
- `createTestTenant(opts: { plan: 'prueba'|'pro'|'enterprise', trialEndsAt?, withApiKey? })` — crea user en Supabase Auth + tenant + clones catalog + opcionalmente API key.
- `cleanupTenant(tenantId)` — borra cascade.
- `seedQuoteForTenant(tenantId, productId, opts)` — atajo para tests que necesitan un quote existente sin pasar por el flujo del configurador.
- `extendTrial(tenantId, days)` / `expireTrial(tenantId)` — manipula `trialEndsAt`.
- `setPlan(tenantId, 'pro')` — para testear gate transitions.

### 2.3 Estructura de archivos

```
tests/
  e2e/
    playwright.config.ts
    globalSetup.ts
    globalTeardown.ts
    fixtures/
      auth.ts
      tenant.ts
      api.ts
      selectors.ts
    smoke/
      routes.spec.ts
      health.spec.ts
    marketing/
      landing-cta.spec.ts
      contact-form.spec.ts
      inline-configurator-demo.spec.ts
    auth/
      signup-clones-catalog.spec.ts
      signup-email-confirmation.spec.ts
      login-success.spec.ts
      login-invalid.spec.ts
      logout.spec.ts
      tenantless-redirect.spec.ts
    configurator/
      boat-search.spec.ts
      product-grouping.spec.ts
      pricing-tiers-by-area.spec.ts
      expert-mode-toggle.spec.ts
      expert-mode-variant-isolation.spec.ts   # regresión bug customAreas
      third-reef-option.spec.ts
      preview-step-features.spec.ts
      preview-step-config-summary.spec.ts
      preview-step-reef-svg.spec.ts
      contact-validation.spec.ts
      submit-creates-quote.spec.ts
      full-happy-path.spec.ts
      out-of-range-area-fallback.spec.ts
      back-button-preserves-state.spec.ts
    dashboard/
      overview-metrics.spec.ts
      products-list.spec.ts
      products-create.spec.ts
      products-toggle-active.spec.ts
      products-update.spec.ts
      products-delete.spec.ts
      product-fields-crud.spec.ts
      quotes-list.spec.ts
      quote-detail-margin.spec.ts
      quote-status-transitions.spec.ts
      quote-edit-customer.spec.ts
      quote-delete.spec.ts
      boats-list-pagination.spec.ts
      boats-search.spec.ts
      boats-crud.spec.ts
      theme-color-picker.spec.ts
      theme-live-preview.spec.ts
      settings-update.spec.ts
      settings-webhook-ssrf.spec.ts
      settings-allowed-origins.spec.ts
      api-keys-create-shows-raw-once.spec.ts
      api-keys-revoke.spec.ts
      api-keys-plan-limit.spec.ts
      analytics-aggregations.spec.ts
      subscription-checkout-redirect.spec.ts
      subscription-trial-banner.spec.ts
    admin/
      access-gate.spec.ts
      overview-stats.spec.ts
      tenants-list-search-filter.spec.ts
      tenant-detail.spec.ts
      tenant-update-plan.spec.ts
      impersonate-start.spec.ts
      impersonate-stop.spec.ts
      impersonate-mutations-as-tenant.spec.ts
      boats-global-crud.spec.ts
      users-list.spec.ts
      logs-filter-by-tenant.spec.ts
    api-public/
      boats-search-auth.spec.ts
      products-list-includes-tiers.spec.ts
      products-list-strips-cost.spec.ts
      quotes-create-server-pricing.spec.ts
      quotes-create-stores-cost.spec.ts
      quotes-create-fires-webhook.spec.ts        # PENDING (no implementado)
      analytics-track.spec.ts
      cors-allowed-origins.spec.ts
      rate-limit.spec.ts                          # PENDING (no implementado)
      invalid-apikey.spec.ts
      expired-apikey.spec.ts
    api-internal/
      products-tenant-isolation.spec.ts
      quotes-tenant-isolation.spec.ts
      trial-gate-blocks-mutations.spec.ts
      trial-gate-allows-reads.spec.ts
      plan-limit-products.spec.ts
      plan-limit-api-keys.spec.ts
    api-admin/
      super-admin-gate.spec.ts
      tenant-update.spec.ts
      boats-global-crud.spec.ts
      impersonate-cookie.spec.ts
    widget/
      iframe-loads.spec.ts
      postmessage-resize.spec.ts
      postmessage-boat-selected.spec.ts
      postmessage-product-selected.spec.ts
      postmessage-quote-created.spec.ts
      callbacks-invoked.spec.ts
    webhooks/
      lemonsqueezy-signature-valid.spec.ts
      lemonsqueezy-signature-invalid.spec.ts
      lemonsqueezy-upgrades-tenant-plan.spec.ts
      lemonsqueezy-cancel-downgrades.spec.ts
    security/
      ssrf-webhook-url.spec.ts
      cors-rejects-unknown-origin.spec.ts
      tenant-cant-access-other-tenant.spec.ts
      revoked-key-fails-immediately.spec.ts
      super-admin-email-allowlist.spec.ts
  unit/
    pricing.test.ts
    validations.test.ts
    clone-catalog.test.ts
    api-keys.test.ts
    url-validation.test.ts
```

### 2.4 Config

`tests/e2e/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
    { name: 'mobile', use: devices['iPhone 13'] },
  ],
  webServer: {
    command: 'pnpm --filter @aerolume/web dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  globalSetup: require.resolve('./tests/e2e/globalSetup.ts'),
  globalTeardown: require.resolve('./tests/e2e/globalTeardown.ts'),
});
```

### 2.5 Scripts package.json

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:codegen": "playwright codegen http://localhost:3000"
}
```

### 2.6 Variables de entorno

```
E2E_BASE_URL=http://localhost:3000
E2E_SUPABASE_URL=...
E2E_SUPABASE_SERVICE_KEY=...        # admin para crear/borrar users
E2E_DATABASE_URL=...                 # para asserts directos en DB
E2E_LEMONSQUEEZY_WEBHOOK_SECRET=...  # para firmar payloads de test
E2E_SUPER_ADMIN_EMAIL=...            # email que el código reconoce como admin
```

---

## 3. Taxonomía

| Categoría | Verifica | Tiempo objetivo |
|-----------|----------|-----------------|
| **Smoke** | Rutas críticas 200, sin JS errors | <30s |
| **Marketing** | Landing, contact, demo inline | <30s |
| **Auth** | Signup → tenant clone → login → logout | <90s |
| **Configurador** | 5 pasos + expert + tiers + reef + preview + submit | <3min |
| **Dashboard** | 10 sub-rutas con CRUDs y gates | <4min |
| **Admin** | Tenants, impersonate, boats globales, logs | <2min |
| **API v1 (pública)** | Auth, CORS, contract, rate limit | <60s |
| **API internal** | Aislamiento, trial/plan gates | <60s |
| **API admin** | Super admin gate | <30s |
| **Widget** | Iframe + postMessage padre↔hijo | <60s |
| **Webhooks** | LemonSqueezy signature + plan updates | <30s |
| **Seguridad** | SSRF, CORS, isolation, key revocation | <60s |

---

## 4. Flujos detallados

### 4.1 Smoke

**Rutas devuelven 200 sin errores JS:**
- `/`, `/about`, `/contact` — landing pública.
- `/login`, `/signup` — formularios de auth.
- `/embed` (sin key) — muestra "API key inválida" pero responde 200.
- `/dashboard` (sin auth) — redirect a `/login`.
- `/admin` (sin auth) — redirect a `/login`.
- `/api/v1/products` (sin x-api-key) → 401 estructurado.

### 4.2 Marketing pública

| Test | Flujo |
|------|-------|
| `landing-cta.spec.ts` | landing → click "Comenzar" → llega a `/signup` |
| `contact-form.spec.ts` | `/contact` → rellenar → submit. **GAP**: documentar dónde va el form (no está claro si email, CRM, webhook); test placeholder con assert de redirect/mensaje. |
| `inline-configurator-demo.spec.ts` | landing tiene un `<ConfiguradorSection>` embebido; verifica que renderiza el step 1 |

### 4.3 Auth + onboarding

| Test | Pasos clave |
|------|-------------|
| `signup-clones-catalog.spec.ts` | `/signup` → email + password → confirmar email vía supabase admin → navega `/dashboard/products` → assert exactamente **23 productos** clonados con tier table no vacía |
| `signup-email-confirmation.spec.ts` | en producción signup muestra "Te enviamos email de confirmación"; sin confirmar no se crea tenant |
| `login-success.spec.ts` | tenant existente → login → `/dashboard` con nombre del tenant en sidebar |
| `login-invalid.spec.ts` | password incorrecto → mensaje de error inline, no redirect |
| `logout.spec.ts` | desde dashboard → click logout → redirect `/login` → `/dashboard` ahora redirige a login |
| `tenantless-redirect.spec.ts` | usuario válido sin tenant en producción → redirect a setup; en dev `getAuthenticatedTenant` lo crea automáticamente |

### 4.4 Configurador embed

Precondición común: tenant dev sembrado, API key conocida (`NEXT_PUBLIC_DEMO_API_KEY`).

| Test | Pasos / Aserciones clave |
|------|--------------------------|
| `boat-search.spec.ts` | input search "Bavaria 38" → resultados aparecen → click → step "Vela" activo, context pill muestra modelo |
| `product-grouping.spec.ts` | productos agrupados por main/head/spi; cada card muestra área + estimado |
| `pricing-tiers-by-area.spec.ts` | barco con `gvstd=15` → Mayor Clásica Cruising muestra `15 × 43.62 ≈ 654`; barco con `gvstd=55` → `55 × 44.94 ≈ 2472` (tier 46-60) |
| `expert-mode-toggle.spec.ts` | toggle visible arriba; OFF → áreas como texto; ON → inputs editables; cambio refleja precio en vivo |
| `expert-mode-variant-isolation.spec.ts` | **Regresión**: editar m² en Mayor Enrollable Cruising no debe cambiar Cruising Plus ni Racing |
| `third-reef-option.spec.ts` | aparece campo "Número de rizos" SOLO en gvstd y gvfull; elegir "3 rizos" suma 10% al subtotal |
| `preview-step-features.spec.ts` | step 4 muestra lista "Incluido de serie" con features del PDF (ollados, sables, etc.); cantidad coincide con `product.features.length` |
| `preview-step-config-summary.spec.ts` | si elegiste "3 rizos", aparece bloque "Tu configuración" con `Número de rizos: 3 rizos` |
| `preview-step-reef-svg.spec.ts` | con 2 rizos → 2 líneas dashed en SVG; con 3 rizos → 3 líneas; SVG con `viewBox="0 0 400 500"` presente |
| `contact-validation.spec.ts` | submit sin nombre/email → botón disabled o error inline; con email malformado → no submit |
| `submit-creates-quote.spec.ts` | flujo completo → al submit, `POST /api/v1/quotes` se llama con `sailArea` correcto; `step='done'` se activa |
| `full-happy-path.spec.ts` | end-to-end: barco → producto → opciones → preview → contact → submit → done → verifica DB con quote creado y `cost` calculado server-side |
| `out-of-range-area-fallback.spec.ts` | área 200 m² (fuera de tier max) → cae a `product.basePrice` (avg de tiers) |
| `back-button-preserves-state.spec.ts` | desde step 3 click ← → vuelve a step 2 con producto seleccionado destacado, query del barco en input |

### 4.5 Dashboard del tenant

#### 4.5.1 Overview (`/dashboard`)
| Test | Asserción |
|------|-----------|
| `overview-metrics.spec.ts` | tarjetas muestran counts correctos de productos (23), quotes, boats (incluyendo globales), eventos |

#### 4.5.2 Products (`/dashboard/products`)
| Test | Acción / Aserción |
|------|-------------------|
| `products-list.spec.ts` | tabla con 23 productos clonados + ordenados por sortOrder |
| `products-create.spec.ts` | inline form: name + sailType → POST `/api/internal/products` → fila nueva aparece |
| `products-toggle-active.spec.ts` | click toggle → `PUT { active: false }` → badge cambia |
| `products-update.spec.ts` | `/dashboard/products/[id]` → cambiar name, basePrice → guardar → `PUT` → reload muestra cambios |
| `products-delete.spec.ts` | confirm dialog → `DELETE` → fila desaparece |
| `product-fields-crud.spec.ts` | en detail view: agregar campo (key, label, options, priceModifiers) → editar → eliminar |

#### 4.5.3 Quotes (`/dashboard/quotes`)
| Test | Asserción |
|------|-----------|
| `quotes-list.spec.ts` | tabla ordenada por `createdAt DESC`; quote creado vía API aparece arriba |
| `quote-detail-margin.spec.ts` | quote con sailArea=25 en Mayor Clásica Cruising → tarjeta "Análisis de margen" muestra PVP=1523, Coste=1088, Margen=435 (28.6%) |
| `quote-status-transitions.spec.ts` | draft → click "Marcar enviado" → status=sent; → "Aceptar" → status=accepted; → "Volver a borrador" → status=draft |
| `quote-edit-customer.spec.ts` | editar nombre/email/teléfono/notas → `PUT` → reload muestra cambios |
| `quote-delete.spec.ts` | confirm → `DELETE` → redirect `/dashboard/quotes`, ya no aparece |

#### 4.5.4 Boats (`/dashboard/boats`)
| Test | Asserción |
|------|-----------|
| `boats-list-pagination.spec.ts` | `GET /api/internal/boats?page=2` cambia listado; total y totalPages presentes |
| `boats-search.spec.ts` | search ≥2 chars filtra ILIKE; <2 chars sin filtro |
| `boats-crud.spec.ts` | crear barco con eslora + multicasco → POST → aparece; editar; eliminar (con confirm) |

#### 4.5.5 Theme (`/dashboard/theme`)
| Test | Asserción |
|------|-----------|
| `theme-color-picker.spec.ts` | cambiar themeAccent → `PUT /api/internal/theme` → response.themeAccent matches |
| `theme-live-preview.spec.ts` | preview inline del configurador refleja nuevo accent sin reload |

#### 4.5.6 Settings (`/dashboard/settings`)
| Test | Asserción |
|------|-----------|
| `settings-update.spec.ts` | cambiar companyName, phone, locale, currency → PUT → assert respuesta y DB |
| `settings-webhook-ssrf.spec.ts` | poner webhookUrl=http://127.0.0.1:8080 → 400 "Invalid webhook URL"; URL pública válida → OK |
| `settings-allowed-origins.spec.ts` | añadir https://example.com → API requests desde otro origin reciben CORS error |

#### 4.5.7 API Keys (`/dashboard/api-keys`)
| Test | Asserción |
|------|-----------|
| `api-keys-create-shows-raw-once.spec.ts` | POST → response incluye `rawKey`; reload de página → la key ya no aparece raw, solo prefix |
| `api-keys-revoke.spec.ts` | DELETE key → request con esa key responde 401 inmediatamente |
| `api-keys-plan-limit.spec.ts` | tenant en `prueba` ya tiene 1 key → POST 2ª key → 403 "API key already exists" o "Plan limit reached" |

#### 4.5.8 Subscription (`/dashboard/subscription`)
| Test | Asserción |
|------|-----------|
| `subscription-trial-banner.spec.ts` | tenant prueba con 7 días restantes → muestra "Termina en 7 días"; expirado → "Tu prueba ha terminado" |
| `subscription-checkout-redirect.spec.ts` | click "Suscribirse" → `POST /api/internal/checkout` → response con `url` LemonSqueezy → asserción del redirect (no se completa el pago real) |

#### 4.5.9 Analytics (`/dashboard/analytics`)
| Test | Asserción |
|------|-----------|
| `analytics-aggregations.spec.ts` | sembrar 50 events de prueba → assert `total`, `byType`, `topBoats`, `topSailTypes`, `perDay` (30 días) en respuesta |

### 4.6 Admin panel

#### 4.6.1 Gate de acceso
| Test | Asserción |
|------|-----------|
| `access-gate.spec.ts` | usuario regular → `/admin` → 403 o redirect; super admin → 200 |

#### 4.6.2 Overview (`/admin`)
| Test | Asserción |
|------|-----------|
| `overview-stats.spec.ts` | KPIs: tenants, eventos, barcos globales; tablas: últimos 5 tenants, últimos 5 users, últimos 8 eventos |

#### 4.6.3 Tenants (`/admin/tenants`)
| Test | Asserción |
|------|-----------|
| `tenants-list-search-filter.spec.ts` | búsqueda por nombre/slug/companyName; filtros plan + status + ubicación; badge contador de filtros |
| `tenant-detail.spec.ts` | `/admin/tenants/[id]` muestra info, miembros, últimas 20 quotes, api keys |
| `tenant-update-plan.spec.ts` | super admin cambia plan a `pro` vía `PUT /api/admin/tenants/[id]` → tenant deja de tener trial gate |

#### 4.6.4 Impersonation
| Test | Asserción |
|------|-----------|
| `impersonate-start.spec.ts` | `GET /api/admin/impersonate?tenantId=X` → cookie `impersonate=X` (max-age 1h) → redirect `/dashboard` con tenant impersonado |
| `impersonate-stop.spec.ts` | `GET /api/admin/impersonate/stop` → cookie borrada → redirect `/admin/tenants` |
| `impersonate-mutations-as-tenant.spec.ts` | mientras impersonas, crear un producto → DB lo asigna al tenant impersonado, no al admin |

#### 4.6.5 Boats globales (`/admin/boats`)
| Test | Asserción |
|------|-----------|
| `boats-global-crud.spec.ts` | crear boat con `tenantId=NULL` → aparece en lista; visible para todos los tenants en `/dashboard/boats` |

#### 4.6.6 Users (`/admin/users`)
| Test | Asserción |
|------|-----------|
| `users-list.spec.ts` | tabla auth.users (id, email, full_name, created_at) ordenada DESC. **Nota**: no hay CRUD desde admin UI |

#### 4.6.7 Logs (`/admin/logs`)
| Test | Asserción |
|------|-----------|
| `logs-filter-by-tenant.spec.ts` | dropdown "Todos los tenants" → ve quotes/eventos de todos; seleccionar uno → solo de ese; badges por evento (quote_created=verde, etc.) |

### 4.7 API v1 (pública)

| Test | Asserción |
|------|-----------|
| `boats-search-auth.spec.ts` | sin x-api-key → 401; con key válida → resultados; query <2 chars → vacío |
| `products-list-includes-tiers.spec.ts` | response.data[0].pricingTiers tiene 5 items con minSqm/maxSqm/msrpPerSqm |
| `products-list-strips-cost.spec.ts` | response NUNCA contiene `costPerSqm` (ni en producto ni en tiers) — es info interna |
| `quotes-create-server-pricing.spec.ts` | POST con `unitPrice: "99999"` → DB guarda `unitPrice` recalculado, no 99999 |
| `quotes-create-stores-cost.spec.ts` | POST → `quote_items.cost` se computa server-side con `priceItem` helper |
| `quotes-create-fires-webhook.spec.ts` | **PENDING**: marcar `test.skip` hasta implementar dispatch real al `tenant.webhookUrl` |
| `analytics-track.spec.ts` | POST `/api/v1/analytics` con eventType → fila en `analytics_events` |
| `cors-allowed-origins.spec.ts` | request con Origin no permitido → response sin `Access-Control-Allow-Origin` o con error |
| `rate-limit.spec.ts` | **PENDING**: tenant.rateLimit=10 → 11ª request debería ser 429 (no implementado, marcar skip) |
| `invalid-apikey.spec.ts` | key malformada → 401; key inexistente → 401 |
| `expired-apikey.spec.ts` | key con `expiresAt < now` → 401 (verificar comportamiento real) |

### 4.8 API internal (sesión Supabase)

| Test | Asserción |
|------|-----------|
| `products-tenant-isolation.spec.ts` | tenant A logueado intenta `GET /api/internal/products/<id-de-B>` → 404 |
| `quotes-tenant-isolation.spec.ts` | igual con quotes |
| `trial-gate-blocks-mutations.spec.ts` | tenant `prueba` con `trialEndsAt < now` → POST/PUT/DELETE → 403 "Trial expired" |
| `trial-gate-allows-reads.spec.ts` | mismo tenant → GETs siguen funcionando |
| `plan-limit-products.spec.ts` | tenant prueba crea N productos hasta el límite del plan → siguiente POST → 403 "Plan limit reached" |
| `plan-limit-api-keys.spec.ts` | tenant prueba crea 1 API key → 2ª → 403 |

### 4.9 API admin

| Test | Asserción |
|------|-----------|
| `super-admin-gate.spec.ts` | usuario regular hace `PUT /api/admin/tenants/X` → 403 "Forbidden" |
| `tenant-update.spec.ts` | super admin actualiza plan/status/name vía PUT |
| `boats-global-crud.spec.ts` | super admin crea/edita/borra boats con `tenantId=null` |
| `impersonate-cookie.spec.ts` | cookie `impersonate` solo se respeta si emisor es super admin |

### 4.10 Widget embebido

Fixture HTML mínimo en `tests/e2e/fixtures/widget-host.html`:

```html
<script src="http://localhost:5173/widget.js"></script>
<div id="aerolume"></div>
<script>
  window.__events = [];
  Aerolume.init({
    apiKey: 'ak_...',
    container: '#aerolume',
    onBoatSelected: (b) => window.__events.push({ type: 'boat', b }),
    onProductSelected: (p) => window.__events.push({ type: 'product', p }),
    onQuoteCreated: (q) => window.__events.push({ type: 'quote', q }),
    onResize: (h) => window.__events.push({ type: 'resize', h }),
  });
</script>
```

| Test | Asserción |
|------|-----------|
| `iframe-loads.spec.ts` | iframe presente con `src` apuntando a `/embed?key=...` |
| `postmessage-resize.spec.ts` | cambiar de step → `__events` contiene evento `resize` con altura distinta |
| `postmessage-boat-selected.spec.ts` | seleccionar barco → evento `boat` con id correcto |
| `postmessage-product-selected.spec.ts` | seleccionar producto → evento `product` |
| `postmessage-quote-created.spec.ts` | completar flujo → evento `quote` con `quoteId`, `sailArea`, `customSurface` |
| `callbacks-invoked.spec.ts` | cada callback se invoca exactamente una vez por evento |

### 4.11 Webhooks (LemonSqueezy)

| Test | Asserción |
|------|-----------|
| `lemonsqueezy-signature-valid.spec.ts` | POST con header firma correcta → 200, tenant actualizado |
| `lemonsqueezy-signature-invalid.spec.ts` | firma inválida → 401, sin cambios en DB |
| `lemonsqueezy-upgrades-tenant-plan.spec.ts` | event `subscription_created` con `customData.tenantId` → tenant `plan='pro'`, `subscriptionStatus='active'`, `trialEndsAt=NULL` |
| `lemonsqueezy-cancel-downgrades.spec.ts` | event `subscription_cancelled` → `subscriptionStatus='canceled'` |

### 4.12 Seguridad negativa

| Test | Asserción |
|------|-----------|
| `ssrf-webhook-url.spec.ts` | webhook URL `http://169.254.169.254/...` (AWS metadata), `http://localhost`, `http://10.0.0.1` → todas rechazadas |
| `cors-rejects-unknown-origin.spec.ts` | request con `Origin: https://evil.com` → no recibe `Access-Control-Allow-Origin: *`, recibe el origen del tenant si está en allowed |
| `tenant-cant-access-other-tenant.spec.ts` | combinatorias: A intenta GET/PUT/DELETE de B en /api/v1 con su key → siempre 404 o 403 |
| `revoked-key-fails-immediately.spec.ts` | DELETE key vía dashboard → request con esa key → 401 dentro del mismo segundo |
| `super-admin-email-allowlist.spec.ts` | quitar email del env `SUPER_ADMIN_EMAILS` → mismo user pierde acceso a `/admin` |

---

## 5. Plan & Trial gates (sección dedicada)

Estos gates atraviesan casi todos los endpoints internals. Documento aquí la matriz para no repetir en cada test.

### 5.1 Trial gate (`withTenantAuth`)

```
if (tenant.plan === 'prueba'
    && (tenant.trialEndsAt === null || tenant.trialEndsAt <= now)
    && req.method !== 'GET') {
  return 403 'Trial expired'
}
```

**Tests obligatorios** (cada uno por endpoint mutativo):
- `POST /api/internal/products` con tenant trial-expired → 403
- `PUT /api/internal/products/[id]` → 403
- `DELETE /api/internal/products/[id]` → 403
- `POST /api/internal/quotes` → 403
- `PUT /api/internal/quotes/[id]` → 403
- `DELETE /api/internal/quotes/[id]` → 403
- `POST /api/internal/boats` → 403
- `PUT /api/internal/settings` → 403
- `PUT /api/internal/theme` → 403
- `POST /api/internal/api-keys` → 403
- `POST /api/internal/checkout` — depende: ¿se permite checkout incluso con trial expirado? (verificar y documentar)
- GETs — siempre 200

### 5.2 Plan limits

| Recurso | Free/Prueba | Pro | Enterprise |
|---------|-------------|-----|------------|
| Productos máx | 5 | 50 | ∞ |
| API keys | 1 | 5 | ∞ |

**Tests:**
- `plan-limit-products`: crear hasta el límite → OK; siguiente → 403.
- `plan-limit-api-keys`: igual.
- Subir plan vía admin → siguiente POST debe pasar.

### 5.3 Super admin gate (`withAdminAuth`)

```
if (!isSuperAdmin(user.email)) return 403 'Forbidden'
```

`SUPER_ADMIN_EMAILS` env var (comma-separated).

**Tests** ya cubiertos en 4.6.1 y 4.9.

---

## 6. Fixtures y helpers

### 6.1 `fixtures/auth.ts`

```typescript
import { test as base } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

type TestTenant = {
  tenantId: string;
  userId: string;
  email: string;
  password: string;
  apiKey: string;
};

export const test = base.extend<{ tenant: TestTenant }>({
  tenant: async ({}, use, testInfo) => {
    const id = `e2e-${testInfo.workerIndex}-${Date.now()}`;
    const email = `${id}@aerolume.test`;
    const password = 'TestPassword123!';

    const supabase = createClient(
      process.env.E2E_SUPABASE_URL!,
      process.env.E2E_SUPABASE_SERVICE_KEY!
    );

    const { data: u } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
    });

    // Provision tenant + clone catalog. Llama directamente al server
    // a un endpoint interno o ejecuta createTenantForUser via script.
    const tenantId = await provisionTenantForUser(u.user!.id);
    const apiKey = await createApiKey(tenantId, 'e2e-key');

    await use({ tenantId, userId: u.user!.id, email, password, apiKey });

    // Cleanup
    await cleanupTenant(tenantId);
    await supabase.auth.admin.deleteUser(u.user!.id);
  },
});
```

### 6.2 `fixtures/api.ts`

```typescript
export function apiClient(baseURL: string, apiKey: string) {
  const headers = { 'x-api-key': apiKey, 'Content-Type': 'application/json' };
  return {
    get: (path: string) => fetch(`${baseURL}${path}`, { headers }),
    post: (path: string, body: unknown) =>
      fetch(`${baseURL}${path}`, { method: 'POST', headers, body: JSON.stringify(body) }),
  };
}

export async function dbAssert<T>(query: string): Promise<T[]> {
  const sql = postgres(process.env.E2E_DATABASE_URL!);
  return sql.unsafe(query) as Promise<T[]>;
}
```

### 6.3 `data-testid` que añadir al código

Añadir como **prerequisito del día 1** — los tests no pueden ser robustos sin esto.

| Ubicación | `data-testid` |
|-----------|---------------|
| **Embed** | |
| Boat search input | `embed-boat-search` |
| Boat result fila | `embed-boat-result-${index}` |
| Toggle experto | `embed-expert-toggle` |
| Custom area input | `embed-custom-area-${productId}` |
| Card producto | `embed-product-card-${productId}` |
| Step pill | `embed-step-${stepKey}` |
| Continuar configure | `embed-continue-configure` |
| Continuar preview | `embed-continue-preview` |
| Submit quote | `embed-submit-quote` |
| Sail SVG | `embed-sail-svg` |
| Tu configuración bloque | `embed-config-summary` |
| Features list | `embed-features-list` |
| **Dashboard** | |
| Margen PVP | `quote-margin-pvp` |
| Margen Coste | `quote-margin-cost` |
| Margen total | `quote-margin-result` |
| Margen porcentaje | `quote-margin-percent` |
| Status badge | `quote-status-${id}` |
| Botón "Marcar enviado" | `quote-action-send` |
| API key raw modal | `apikey-raw-modal` |
| Webhook URL input | `settings-webhook-url` |
| Theme accent picker | `theme-accent-picker` |
| Plan badge | `subscription-plan-badge` |
| Trial countdown | `subscription-trial-days-left` |
| **Admin** | |
| Tenant fila | `admin-tenant-row-${id}` |
| Impersonate botón | `admin-impersonate-${tenantId}` |
| Impersonate banner | `admin-impersonate-banner` |
| Stop impersonate | `admin-stop-impersonate` |

### 6.4 Snapshots visuales

`expect(page).toHaveScreenshot()` solo en Chromium para:
- Cada combinación sailType × variant × reefs en `SailPreview`.
- Banner de margen del quote detail.
- Estado vacío de cada tabla (productos, quotes, boats).

Baseline regenerable con `pnpm test:e2e --update-snapshots`.

---

## 7. CI/CD

### 7.1 GitHub Actions

```yaml
name: E2E
on: [pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
        env:
          E2E_BASE_URL: http://localhost:3000
          E2E_SUPABASE_URL: ${{ secrets.E2E_SUPABASE_URL }}
          E2E_SUPABASE_SERVICE_KEY: ${{ secrets.E2E_SUPABASE_SERVICE_KEY }}
          E2E_DATABASE_URL: ${{ secrets.E2E_DATABASE_URL }}
          E2E_LEMONSQUEEZY_WEBHOOK_SECRET: ${{ secrets.E2E_LEMONSQUEEZY_WEBHOOK_SECRET }}
          E2E_SUPER_ADMIN_EMAIL: ${{ secrets.E2E_SUPER_ADMIN_EMAIL }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report/ }
```

### 7.2 Estrategia

- **PRs**: solo `smoke + configurador + api-internal/trial-gate + dashboard/quote-detail-margin` (≈3 min).
- **main**: full suite + visual snapshots (≈10 min).
- **Cron nightly**: full suite contra staging.

---

## 8. Priorización MVP

Orden recomendado para implementación incremental:

### Sprint 1 — Infra + flujos críticos ✅ Completado (2026-04-17/18)

**Resultado:** 17/17 E2E + 2/2 unit pasan en chromium. Fixes aplicados en ruta: `jsonb_array_length → cardinality` (features es `text[]`), `.nullable()` en `createQuoteSchema`, host del widget usa baseURL en vez de about:blank, probe Vite apunta a `/@vite/client`.

**Día 1 — Infra**
- [x] Instalar `@playwright/test`, `vitest`, init config.
- [x] `globalSetup`/`globalTeardown` con limpieza de `e2e-*` users.
- [x] `fixtures/auth.ts` + `fixtures/api.ts` + `fixtures/tenant.ts` + `fixtures/selectors.ts`.
- [x] Añadir `data-testid` en componentes clave (embed, dashboard, admin).

**Día 2 — Configurador**
- [x] `configurator/full-happy-path.spec.ts`
- [x] `configurator/expert-mode-variant-isolation.spec.ts` (regresión bug)
- [x] `configurator/pricing-tiers-by-area.spec.ts`
- [x] `configurator/third-reef-option.spec.ts`

**Día 3 — Dashboard + API**
- [x] `dashboard/quote-detail-margin.spec.ts`
- [x] `dashboard/products-list.spec.ts`
- [x] `api-public/quotes-create-server-pricing.spec.ts`
- [x] `api-internal/products-tenant-isolation.spec.ts`
- [x] `api-internal/trial-gate-blocks-mutations.spec.ts`

**Día 4 — Auth + Widget + CI**
- [x] `auth/signup-clones-catalog.spec.ts`
- [x] `widget/postmessage-quote-created.spec.ts`
- [x] `.github/workflows/e2e.yml`

**Extras:** `smoke/routes.spec.ts`, `unit/pricing.test.ts`.

### Sprint 2 — Cobertura completa ✅ Completado (2026-04-18)

**Resultado:** 82 E2E + 72 unit pasan (81+71 passed, 1+1 skipped). 6 patches de seguridad aplicados (cross-tenant leak + hardenings) y 3 bugs de producción encontrados por los CRUDs (`trialEndsAt` en plan gate de `internal/products` + `internal/api-keys`, `.nullable()` en `updateTenantSettingsSchema`).

- [x] **CRUDs dashboard** (14 tests): `products-crud`, `quotes-crud`, `boats-crud`, `theme-update`, `settings-update`, `api-keys-crud`.
- [x] **Admin panel** (18 tests): `tenants-list`, `tenants-edit`, `impersonation`, `boats-globales-crud`, `admin-gate`. Fixture `admin-auth.ts` con provisión del super-admin en globalSetup (evita race Supabase).
- [x] **Webhooks LemonSqueezy** (9 tests): firma HMAC (válida/ausente/incorrecta/payload tampered), subscription_created/updated/cancelled, idempotencia, event_name desconocido.
- [x] **Seguridad negativa** (20 tests): `ssrf-webhook-internal-ip`, `cors-public-api`, `api-key-spoofing`, `cross-tenant-quotes-leak` (regresión del bug del review), `webhook-payload-no-cost`.
- [x] **Vitest unitarios**: `validations.test.ts` (64 tests), `clone-catalog.test.ts` (5+1 skipped).

### Sprint 3 — Polish ✅ Completado (2026-04-18, commit `40a2db1`)

**Resultado:** 135 E2E + 72 unit = 207 tests (206 passed + 1 skipped).

- [x] **Snapshots visuales SailPreview** (11 tests): dev-harness en `/sail-preview-harness` con notFound() en prod. Baseline PNGs en `tests/e2e/visual/sail-preview.spec.ts-snapshots/` cubriendo gvstd/gvfull/gve/gn/gse/gen/furling/spisym × cruising/cruising_racing × reefs + accent custom.
- [x] **Marketing / landing** (24 tests): `home`, `about`, `contact`, `navigation`. Incluye carga sin errores JS, FAQ toggle, viewport mobile, contact form client-side, nav links a /login y /signup.
- [x] **Analytics aggregations** (17 passed + 1 skipped): ingest POST `/api/v1/analytics` (Zod + CORS + 401/400), agregados internos `total/byType/topBoats/topSailTypes/perDay` con tenant isolation, dashboard page con los 4 stat cards. **1 skip:** date-range filter — la UI aún no lo implementa (TODO).
- [x] **Skips resueltos:**
  - `unit/clone-catalog.test.ts` "empty base catalog returns 0" — transaction + sentinel rollback (delete productos base dentro de tx → clone → throw sentinel → rollback). Catálogo base nunca se altera.
  - `e2e/security/webhook-payload-no-cost.spec.ts` "webhook body has no cost" — fixture `webhook-mock.ts` (http.createServer en loopback random port) + URL reescrita como `127.0.0.1.nip.io:<port>` para bypassear `isInternalUrl` sin tocar código prod.

---

## 9. Tests pendientes (gaps doc-vs-impl)

Estos están en el código o roadmap pero no fully implementados. Marcar como `test.skip` con TODO y arrancarlos al implementar:

| Test | Implementar cuando | Status actual |
|------|--------------------|--------------|
| `quotes-create-fires-webhook.spec.ts` | Quote webhook dispatch al `tenant.webhookUrl` | Documentado, dispatch real no encontrado en código |
| `rate-limit.spec.ts` | Rate limit en `validateApiKey` | Campo `rateLimit` existe, lógica no implementada |
| `audit-logs.spec.ts` | Audit log de impersonation, plan changes | Página `/admin/logs` muestra eventos de configurador, no audit |
| `email-notifications.spec.ts` | Envío de presupuesto por email al cliente final | No implementado |
| `auth/email-confirmation-link.spec.ts` | Confirmación email en producción (link de Supabase) | Flujo manejado por Supabase, falta verificar callback en `/auth/callback` |
| `marketing/contact-form.spec.ts` | Submit del form `/contact` | Endpoint destino no claro |

---

## 10. Métricas de éxito

- **Cobertura de flujos**: 100% de las 12 categorías §3 con al menos un test passing.
- **Run time**: PR suite <5 min, full suite <12 min en CI.
- **Estabilidad**: <1% flaky. Test que flakea 3+ veces en una semana → `test.fixme` + ticket.
- **Bloqueos**: PR con E2E rojo no se mergea (override admin solo en emergencia).

---

## 11. Fuera de alcance (futuras iteraciones)

- **Load testing** (k6/Artillery) — separado del funcional.
- **Accessibility** (`@axe-core/playwright`) — añadir más tarde.
- **Mutation testing** (Stryker) sobre `lib/pricing.ts`.
- **Visual regression cross-browser** — solo Chromium por ahora.
- **LemonSqueezy sandbox real** — usamos mock con firma sintética hasta tener sandbox estable.
- **Multitenancy stress** — N tenants concurrentes haciendo CRUD.

---

## 12. Glosario rápido de gates

| Gate | Wrapper | Responde 403 cuando | Excepciones |
|------|---------|---------------------|-------------|
| Tenant auth | `withTenantAuth` | Sin sesión Supabase o sin membresía | — |
| Trial expired | `withTenantAuth` | `plan='prueba' AND trialEndsAt<=now AND method!=GET` | GETs siempre OK |
| Plan limit (productos) | `canCreateProducts` | Tenant en plan con cuota llena | Subir plan |
| Plan limit (api-keys) | `canCreateApiKeys` | Tenant ya tiene su cuota | Subir plan |
| Super admin | `withAdminAuth` | `email NOT IN SUPER_ADMIN_EMAILS` | — |
| API key | `validateApiKey` | Hash no encontrado, expirada, o tenant suspendido | — |
| CORS | `withCors` | Origin no en `tenant.allowedOrigins` | Sin allowedOrigins → permitir todos |
| SSRF | `isInternalUrl` | webhookUrl es localhost o private IP | — |

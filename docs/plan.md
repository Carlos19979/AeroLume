# Plan de desarrollo — Aerolume

Ultima actualizacion: 2026-04-18

---

## Fase 1: Verificar y reparar lo roto (urgente)

Los componentes `SailConfigurator.tsx` y `ProductDetailModal.tsx` hacian fetch a rutas legacy que fueron eliminadas en la auditoria:

- `/api/sail-products` — ya no existe
- `/api/sail-product-detail` — ya no existe

### Tareas

- [x] Verificar uso de `SailConfigurator.tsx` y `ProductDetailModal.tsx` — ningún import fuera de sus propios archivos (grep confirmó 0 referencias).
- [x] Eliminar dead code: ambos archivos + directorio vacío `components/configurator/` borrados (commit siguiente). El configurador activo vive en `apps/web/src/app/embed/configurator.tsx`.
- [x] Verificar que el embed (`/embed/configurator.tsx`) funciona correctamente con las rutas v1 — cubierto por E2E (Sprint 1, f19abde)
- [x] Test manual completo del flujo: buscar barco → ver productos → crear presupuesto — cubierto por E2E happy path + expert mode + tiers (Sprint 1, f19abde)

---

## Fase 2: Rate limiting (seguridad)

Upstash Redis ya esta configurado en `.env` (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) pero nunca se implemento. El campo `rateLimit` existe en `apiKeys` pero nadie lo comprueba.

### Tareas

- [ ] Instalar `@upstash/ratelimit` y `@upstash/redis`
- [ ] Crear `apps/web/src/lib/rate-limit.ts` con sliding window por API key
- [ ] Integrar en `validateApiKey()` — rechazar con 429 cuando se exceda el limite
- [ ] Configurar limites por defecto (ej: 100 req/hora para pro)
- [ ] Añadir header `X-RateLimit-Remaining` en las respuestas v1
- [ ] Documentar en `docs/security.md` y `docs/api.md`

---

## Fase 3: Billing (LemonSqueezy) ✅ Completado (2026-04-18, commits 1a3ec18 + 5380ecc)

~~Stripe~~ → migrado a **LemonSqueezy**. Webhook en `/api/webhooks/lemonsqueezy` implementado. La DB tiene campos para billing (`plan`, `subscriptionStatus`, `trialEndsAt`, `lsCustomerId`, `lsSubscriptionId`).

### Tareas

- [x] Webhook endpoint con firma HMAC (`/api/webhooks/lemonsqueezy`)
- [x] Página de subscription en dashboard con estado + CTA de checkout (commit 2df5fd1)
- [x] Trial expiration — campo `trialEndsAt` activo; plan gate corregido en internal/products e internal/api-keys (commit 525f921)
- [x] Portal de facturación — `createCustomerPortalUrl()` en lib + ruta `/api/internal/customer-portal` + botón en dashboard (commit 1a3ec18)
- [x] Eventos: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_expired` — todos con tests (commit 1a3ec18, tests en lemonsqueezy.spec.ts y trial-expired-ui.spec.ts)
- [x] Página pública `/pricing` con 2 tiers y CTA a /signup (commit 1a3ec18)
- [x] Refresh visual de `/dashboard/subscription` (hero gradient, progress bar trial, features checks, iconos lucide)
- [x] Tests E2E del flujo completo (15 tests): pricing, subscription-checkout, customer-portal, trial-expired-ui (commit 5380ecc)
- [ ] Documentar flujo de billing en `docs/` (no crítico — el código + commits ya lo documentan)

---

## Fase 4: Tests

### Estado actual — Sprint 1 + Sprint 2 completados (2026-04-17/18)

**Totales: 82 E2E + 72 unit = 154 tests. 152 passed, 2 skipped intencionales.**

Ver detalle completo en [`docs/testing.md`](./testing.md).

#### Sprint 1 (f19abde, 2026-04-17)
- [x] Configurar Playwright + Vitest con fixtures (auth, tenant, api, selectors, widget-host.html), globalSetup/Teardown
- [x] CI workflow `.github/workflows/e2e.yml`
- [x] 17 E2E specs: smoke, auth signup+clone, configurador happy path/expert mode/tiers/reefs, dashboard products list + quote detail margin, api-public pricing, api-internal tenant isolation + trial gate, widget postMessage
- [x] 1 spec vitest: pricing unitario

#### Sprint 2 (0a2202f, 2026-04-18)
- [x] 32 E2E specs nuevos: seguridad negativa (5) + LS webhooks (1) + CRUDs dashboard (6) + admin panel (5)
- [x] 2 specs vitest nuevos: validations (64 tests) + clone-catalog (5+1 tests)
- [x] Fixture `admin-auth.ts`; provision del super-admin movida a `globalSetup.ts`
- [x] Tests revelaron y corrigieron 3 bugs reales en prod (commit 525f921):
  - `trialEndsAt` faltaba en plan gate de `internal/products` e `internal/api-keys`
  - `updateTenantSettingsSchema` sin `.nullable()` para `companyName`, `Email`, `Phone`, `Address`

#### Sprint 3 (40a2db1, 2026-04-18) ✅

- [x] Visual snapshot tests del SailPreview — dev-harness `/sail-preview-harness` + 11 baseline PNGs
- [x] Landing/marketing E2E coverage — 24 tests (home, about, contact, navigation)
- [x] Analytics aggregations tests — 18 tests (1 skip: date-range filter, UI no lo tiene)
- [x] Promover 2 tests `skip` a full coverage:
  - Clone-catalog empty base catalog → transaction + sentinel rollback
  - Webhook body sin cost → fixture `webhook-mock.ts` + `127.0.0.1.nip.io` para bypassear `isInternalUrl`

**Totales:** 207 tests (206 passed + 1 skipped). Ver [docs/testing.md](./testing.md) §8.

#### Siguiente Sprint (sin planificar)

- [ ] Date-range filter en la UI de `/dashboard/analytics` + test del filtro
- [ ] Tests de webhook bajo concurrencia (múltiples quotes a la vez, el webhook no debería bloquear la respuesta al cliente)

---

## Fase 5: CI/CD y Deploy ✅ Completado (2026-04-18)

Vercel ya despliega la app (cuenta y setup preexistentes). CI de GitHub Actions cubre E2E desde Sprint 1; este sprint añade lint + typecheck + unit.

### Tareas

- [x] GitHub Actions workflow `e2e.yml` — Sprint 1 (f19abde)
- [x] Nuevo workflow `ci.yml` con lint (ESLint), typecheck (tsc --noEmit en web + widget + db) y unit (vitest). Script `typecheck` añadido a `apps/web/package.json`.
- [x] Variables de entorno y flujo de deploy Vercel documentados en `docs/deploy.md` (install/build commands monorepo, env vars Supabase/LS/super-admin, webhook LS, migraciones en 3 opciones, preview deploys, rollback, checklist pre-producción).
- [x] Migraciones Drizzle: opción A (manual antes del merge, recomendada) documentada en `docs/deploy.md`. Opciones B (CI step) y C (build command) descartadas con razones.

---

## Seguridad — Hallazgos resueltos (2026-04-18, commit 6495454)

Security review por 2 subagentes independientes. Todos los hallazgos aplicados:

- [x] **C1** — Cross-tenant leak en `POST /api/v1/quotes`: lookup de products sin filtro `tenantId` → corregido
- [x] **H1** — `cost` expuesto en webhook payload → eliminado del payload
- [x] **H2** — `tenantId` expuesto en respuesta publica de `/api/v1/products` → eliminado de la respuesta
- [x] **H3** — `postMessage` con fallback `targetOrigin='*'` → corregido a `document.referrer`
- [x] **M1** — SSRF por seguimiento de redirects en webhook fetch → `redirect: 'error'` aplicado
- [x] **W1** — Submit del configurador no chequeaba `res.ok` (exito silencioso en 4xx) → corregido

---

## Fase 6: Mejoras futuras (backlog)

- [ ] ~~i18n~~ **Aparcado (2026-04-18)** — intento con `next-intl` + `localePrefix: 'as-needed'` falló porque require restructurar rutas bajo `app/[locale]/` (rompe todos los E2E marketing). Decisión: **no implementar hasta que haya un prospect real en otro idioma**. Cuando toque, la opción B (cookie-based sin cambio de URLs) es ~4-6h de trabajo; la opción A (rutas `[locale]`) es 1-2 días con riesgo alto. Ambas documentadas en el cierre de esta sesión.
- [ ] Notificaciones email — enviar presupuestos por email al cliente
- [ ] Dashboard analytics mejorado — graficos con Recharts, filtros por fecha
- [ ] Exportar presupuestos a PDF
- [ ] Import masivo de productos desde CSV/Excel
- [ ] Modo oscuro en dashboard
- [ ] 2FA para super admins
- [ ] Audit log para acciones de admin (impersonacion, cambios de plan)
- [ ] Rate limiting real — `validateApiKey()` nunca comprueba el campo `rateLimit` (ver Fase 2)
- [ ] Quote webhooks — `POST` a `webhookUrl` del tenant al crear presupuesto (documentado en plan, no implementado en codigo)
- [ ] Contact form — destino de submission desconocido (no hay webhook, email ni CRM integrado)
- [ ] `SUPER_ADMIN_EMAILS` — añadir al `.env.example` (actualmente es un requisito operacional no documentado)

---

## Notas

- Cada fase deberia ser un PR independiente
- Prioridad actualizada: Fase 2 (rate limiting) > Fase 3 (billing completar) > Fase 4 Sprint 3 (tests) > Fase 5 (CI/CD completar) > Fase 6
- La Fase 1 original esta mayormente cubierta por los E2E — solo queda verificar/eliminar los componentes legacy

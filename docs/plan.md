# Plan de desarrollo — Aerolume

Ultima actualizacion: 2026-04-06

---

## Fase 1: Verificar y reparar lo roto (urgente)

Los componentes `SailConfigurator.tsx` y `ProductDetailModal.tsx` hacian fetch a rutas legacy que fueron eliminadas en la auditoria:

- `/api/sail-products` — ya no existe
- `/api/sail-product-detail` — ya no existe

### Tareas

- [ ] Verificar si `SailConfigurator.tsx` y `ProductDetailModal.tsx` estan en uso en alguna pagina activa
- [ ] Si estan en uso: migrar los fetch a `/api/v1/products` y datos de la DB propia del tenant
- [ ] Si no estan en uso (dead code del configurador legacy): eliminarlos
- [ ] Verificar que el embed (`/embed/configurator.tsx`) funciona correctamente con las rutas v1
- [ ] Test manual completo del flujo: buscar barco → ver productos → crear presupuesto

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

## Fase 3: Stripe / Billing

La DB tiene campos para billing (`stripeCustomerId`, `plan`, `subscriptionStatus`, `trialEndsAt`) pero no hay integracion real. Cambiar de plan requiere intervencion manual del super admin.

### Tareas

- [ ] Crear webhook endpoint `/api/webhooks/stripe` para eventos de Stripe
- [ ] Manejar eventos: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Crear flujo de checkout: boton en dashboard → Stripe Checkout → callback → actualizar plan
- [ ] Implementar portal de facturacion (Stripe Customer Portal)
- [ ] Manejar trial expiration (cron job o webhook)
- [ ] Pagina de pricing funcional con boton de compra real
- [ ] Documentar flujo de billing en `docs/`

---

## Fase 4: Tests

Cero tests en el proyecto. Priorizar tests de lo critico.

### Tareas

- [ ] Configurar Vitest para el monorepo
- [ ] Tests unitarios para utilidades criticas:
  - `lib/validations.ts` — schemas Zod con inputs validos e invalidos
  - `lib/api-keys.ts` — generacion y hash
  - `lib/url-validation.ts` — isInternalUrl con IPs internas y externas
  - `lib/plan-gates.ts` — cada combinacion plan/status
  - `packages/shared/utils/` — normalize, format, toNumber
- [ ] Tests de integracion para API routes:
  - v1/products — tenant isolation, sailType filter
  - v1/quotes — creacion con validacion, webhook dispatch
  - internal/api-keys — crear, listar, revocar
  - admin/impersonate — solo super admin
- [ ] Tests e2e con Playwright:
  - Flujo de login → dashboard
  - CRUD de productos
  - Flujo del configurador embed
- [ ] Configurar en CI (cuando exista pipeline)

---

## Fase 5: CI/CD y Deploy

No hay pipeline de integracion continua ni configuracion de deploy documentada.

### Tareas

- [ ] Crear GitHub Actions workflow:
  - Lint (`pnpm lint`)
  - Type check (`tsc --noEmit`)
  - Tests (`pnpm test`)
  - Build (`pnpm build`)
- [ ] Configurar deploy en Vercel (o plataforma elegida):
  - Variables de entorno en produccion
  - Dominio personalizado
  - Preview deployments por PR
- [ ] Configurar Drizzle migrations en deploy (migrate on build o manual)
- [ ] Documentar proceso de deploy en `docs/`

---

## Fase 6: Mejoras futuras (backlog)

- [ ] i18n — sistema de traducciones (el tenant tiene campo `locale` pero todo esta hardcoded en espanol)
- [ ] Notificaciones email — enviar presupuestos por email al cliente
- [ ] Dashboard analytics mejorado — graficos con Recharts, filtros por fecha
- [ ] Exportar presupuestos a PDF
- [ ] Import masivo de productos desde CSV/Excel
- [ ] Modo oscuro en dashboard
- [ ] 2FA para super admins
- [ ] Audit log para acciones de admin (impersonacion, cambios de plan)

---

## Notas

- Cada fase deberia ser un PR independiente
- Prioridad: Fase 1 > 2 > 3 > 4 > 5 > 6
- La fase 1 es critica porque puede haber funcionalidad rota en produccion
- La fase 2 es el ultimo paso para llegar a 10/10 en seguridad

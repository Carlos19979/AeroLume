# Arquitectura

## Diagrama de Flujo General

```
                    ┌─────────────────┐
                    │   Landing Page  │
                    │  (marketing)    │
                    └────────┬────────┘
                             │ Login
                             ▼
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Widget JS  │    │   Dashboard     │    │   Admin Panel   │
│  (embebido   │    │  /dashboard/*   │    │   /admin/*      │
│  en retailer)│    └────────┬────────┘    └────────┬────────┘
└──────┬───────┘             │                      │
       │                     │ Supabase Session      │ Supabase Session
       │ API Key             │                      │ + isSuperAdmin
       │ (x-api-key)        ▼                      ▼
       │            ┌─────────────────┐    ┌─────────────────┐
       │            │  API Internal   │    │   API Admin     │
       │            │  /api/internal/*│    │  /api/admin/*   │
       │            │  withTenantAuth │    │  withAdminAuth  │
       │            └────────┬────────┘    └────────┬────────┘
       │                     │                      │
       ▼                     ▼                      ▼
┌─────────────────┐  ┌─────────────────────────────────────┐
│   API v1        │  │                                     │
│  /api/v1/*      │──│         PostgreSQL (Supabase)       │
│  validateApiKey │  │                                     │
└─────────────────┘  └─────────────────────────────────────┘
```

## Flujos Detallados

### Widget (usuario final del retailer)

1. El retailer inserta el script `aerolume.js` en su web
2. El script crea un `<iframe>` apuntando a `/embed?key=ak_xxx`
3. El iframe carga la app de configuracion dentro de Next.js
4. Todas las llamadas API del iframe van a `/api/v1/*` con header `x-api-key`
5. La respuesta incluye headers CORS para permitir la comunicacion cross-origin
6. Eventos (seleccion de barco, producto, presupuesto) se envian via `postMessage` al host

### Dashboard (retailer)

1. El usuario se autentica via Supabase Auth (email/password)
2. El middleware refresca la sesion en cada request
3. Las pages server usan `getAuthenticatedTenant()` para obtener user + tenant
4. Las API routes internas usan `withTenantAuth()` que valida sesion + pertenencia a tenant
5. Todas las queries se filtran por `tenantId`

### Admin (super admin)

1. El super admin se autentica como usuario normal
2. `isSuperAdmin()` verifica que su email esta en `SUPER_ADMIN_EMAILS`
3. Las API routes admin usan `withAdminAuth()` que valida sesion + super admin
4. Puede impersonar a cualquier tenant via cookie `impersonate`

## Multi-tenancy

### Modelo de datos

Cada tabla principal (products, quotes, api_keys, analytics_events) tiene un campo `tenantId` que referencia a `tenants.id` con `ON DELETE CASCADE`.

**Excepcion: boats.** La tabla `boats` tiene `tenantId` nullable:
- `tenantId = NULL` -> Barco global, visible para todos los tenants (base de datos maestra de modelos)
- `tenantId = uuid` -> Barco custom de un tenant especifico

### Tenant Members

La relacion user-tenant se gestiona via la tabla `tenant_members`:
- Un usuario puede pertenecer a un tenant
- Cada miembro tiene un rol: `owner`, `admin`, o `viewer`
- Constraint unique en `(tenantId, userId)` para evitar duplicados

### Aislamiento de datos

- **API routes internas:** `withTenantAuth()` extrae el `tenantId` del usuario autenticado y lo pasa al handler. Cada query filtra por ese `tenantId`.
- **API v1 (publica):** `validateApiKey()` obtiene el `tenantId` de la API key. Cada query filtra por ese `tenantId`.
- **Server pages:** `getAuthenticatedTenant()` devuelve `{ user, tenant }` o `null`.

### Impersonacion (Super Admin)

Los super admins pueden ver el dashboard como si fueran otro tenant:

1. `GET /api/admin/impersonate?tenantId=xxx` -> establece cookie `impersonate`
2. `getTenantForUser()` revisa primero si hay cookie de impersonacion + el usuario es super admin
3. Si se cumple, devuelve el tenant impersonado en vez del real
4. `GET /api/admin/impersonate/stop` -> elimina la cookie

La cookie tiene estas propiedades de seguridad:
- `httpOnly: true` (no accesible via JavaScript)
- `secure: true` (solo HTTPS en produccion)
- `sameSite: 'strict'`
- `maxAge: 3600` (1 hora)

## Autenticacion

### Usuarios (Dashboard/Admin) - Supabase Auth

- Se usa `@supabase/ssr` para manejar sesiones con cookies
- El middleware (`middleware.ts`) refresca la sesion en cada request
- `createClient()` crea un cliente Supabase server-side
- `supabase.auth.getUser()` obtiene el usuario autenticado

### API Keys (Widget/API v1)

- Header: `x-api-key: ak_xxxxxxxxxx`
- La key se hashea con SHA-256 y se busca en la tabla `api_keys`
- Se valida: existencia, expiracion, estado del tenant, origen permitido
- Ver `docs/security.md` para detalles de generacion y almacenamiento

## Autorizacion

### Wrappers de API Routes

| Wrapper | Archivo | Valida | Uso |
|---|---|---|---|
| `withTenantAuth(handler)` | `lib/auth-helpers.ts` | Sesion Supabase + pertenencia a tenant | API internas del dashboard |
| `withAdminAuth(handler)` | `lib/auth-helpers.ts` | Sesion Supabase + `isSuperAdmin()` | API de administracion |
| `validateApiKey(request)` | `lib/api-auth.ts` | API key valida + tenant activo + origen | API v1 publica |

### Plan Gates

Archivo: `lib/plan-gates.ts`

| Funcion | Condicion | Controla |
|---|---|---|
| `canCreateProducts(ps)` | plan=pro, status=active | Crear/editar productos |
| `canCreateApiKeys(ps)` | plan=pro, status=active | Generar API keys |
| `canReceiveQuotes(ps)` | plan=pro, status=active | Recibir presupuestos |
| `canEditTheme(ps)` | plan=pro, status=active o past_due | Personalizar tema |
| `canEditSettings(ps)` | plan=pro, status=active o past_due | Editar configuracion |
| `isWidgetEnabled(ps)` | plan=pro, status=active | Widget funcional |
| `isSuspended(ps)` | status=canceled | Cuenta bloqueada |
| `isPastDue(ps)` | status=past_due | Pago pendiente |
| `isTrial(ps)` | plan=prueba | Modo prueba |

### Super Admin

- Se configura via la variable de entorno `SUPER_ADMIN_EMAILS` (lista separada por comas)
- `isSuperAdmin(email)` verifica si el email esta en la lista
- No requiere registro especial en DB, solo el env var

## Middleware

Archivo: `apps/web/src/middleware.ts`

El middleware de Next.js se ejecuta en cada request que coincida con el matcher y hace:

1. **Refresca la sesion Supabase** (`updateSession(request)`) para mantener las cookies de auth actualizadas
2. **Establece security headers:**
   - `X-Frame-Options: DENY` (previene clickjacking)
   - `X-Content-Type-Options: nosniff` (previene MIME sniffing)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `X-DNS-Prefetch-Control: on`

**Rutas excluidas del middleware** (no necesitan sesion):
- `_next/static`, `_next/image` (archivos estaticos)
- `favicon.ico`
- `api/v1/*` (usa API key auth, no sesion)
- Archivos estaticos (svg, png, jpg, etc.)

> **Nota:** Las rutas `/embed/*` ya **no** estan excluidas del middleware. Reciben security headers (excepto `X-Frame-Options`, que se omite para compatibilidad con iframes).

## Estructura de API

La API se organiza en tres grupos. No existen rutas legacy fuera de estos prefijos.

### `v1/` — API Publica

- Autenticada con API key (`x-api-key` header)
- Incluye headers CORS en las respuestas
- Tiene handlers OPTIONS para preflight requests
- Para uso del widget y integraciones externas

### `internal/` — API Interna (Dashboard)

- Autenticada con sesion Supabase (cookies)
- Usa `withTenantAuth()` wrapper
- Para uso exclusivo del dashboard
- No incluye CORS (same-origin)

### `admin/` — API Super Admin

- Autenticada con sesion Supabase + verificacion super admin
- Usa `withAdminAuth()` wrapper
- Para gestion de tenants, impersonacion, barcos globales

## Widget Embedding

### Flujo de carga

1. El retailer incluye `<script src="https://cdn.aerolume.com/widget/v1/aerolume.js"></script>`
2. El script expone `window.Aerolume` con el metodo `init()`
3. `Aerolume.init({ apiKey, container })` crea un `<iframe>` dentro del contenedor
4. El iframe apunta a `https://app.aerolume.com/embed?key=ak_xxx`
5. El embed dentro de Next.js usa la API key para cargar datos del tenant

### Comunicacion iframe <-> host

Via `window.postMessage` con verificacion de origen:

| Evento | Direccion | Payload |
|---|---|---|
| `aerolume:resize` | iframe -> host | `{ height: number }` |
| `aerolume:boat-selected` | iframe -> host | Datos del barco |
| `aerolume:product-selected` | iframe -> host | Datos del producto |
| `aerolume:quote-created` | iframe -> host | Datos del presupuesto |

## Sistema de Webhooks

Cuando se crea un presupuesto via API v1:

1. Se inserta el quote y sus items en la DB
2. Se consulta el `webhookUrl` del tenant
3. Si existe y pasa la validacion SSRF (`isInternalUrl()` devuelve `false`):
4. Se hace un `POST` al webhookUrl con el payload del presupuesto
5. La llamada es fire-and-forget (no bloquea la respuesta)

Payload del webhook:

```json
{
  "event": "quote.created",
  "data": {
    "id": "uuid",
    "status": "draft",
    "boatModel": "Beneteau Oceanis 38",
    "boatLength": "11.50",
    "customerName": "Juan Garcia",
    "customerEmail": "juan@example.com",
    "customerPhone": "+34600123456",
    "customerNotes": "Necesito entrega antes de junio",
    "currency": "EUR",
    "items": [
      {
        "sailType": "gvstd",
        "productName": "Mayor Crucero",
        "sailArea": "35.2",
        "unitPrice": "1200.00",
        "configuration": { "tejido": "Dacron", "rizos": "2" }
      }
    ],
    "createdAt": "2026-04-05T10:30:00.000Z"
  }
}
```

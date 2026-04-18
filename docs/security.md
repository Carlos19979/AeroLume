# Seguridad

## API Keys

### Generacion

Las API keys se generan en `apps/web/src/lib/api-keys.ts`:

```
Formato: ak_<40 caracteres hexadecimales>
Ejemplo: ak_3f8a1b2c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a
```

- **Prefijo:** `ak_` (3 caracteres fijos)
- **Parte aleatoria:** 20 bytes aleatorios (`crypto.randomBytes(20)`) convertidos a hexadecimal = 40 caracteres
- **Entropia:** 160 bits (20 bytes * 8 bits)
- **Longitud total:** 43 caracteres

### Almacenamiento

La API key raw **nunca se almacena** en la base de datos. Solo se guarda:

1. **`key_hash`**: SHA-256 del key completo (incluido el prefijo `ak_`). Es un hash hexadecimal de 64 caracteres.
2. **`key_prefix`**: Los primeros 11 caracteres (`ak_` + 8 hex chars) para que el usuario pueda identificar visualmente la key en el dashboard.

```typescript
// Generacion
const rawKey = generateApiKey();         // "ak_3f8a1b2c..."
const hash = hashApiKey(rawKey);         // SHA-256 hex
const prefix = getKeyPrefix(rawKey);     // "ak_3f8a1b2c"

// Se almacena en DB: { keyHash: hash, keyPrefix: prefix }
// Se muestra al usuario UNA VEZ: rawKey
```

### Validacion

Al recibir un request con `x-api-key`:

1. Se calcula `SHA-256(rawKey)` del header
2. Se busca en la tabla `api_keys` por `key_hash`
3. Se verifica expiracion, estado del tenant y origen

### Implicaciones

- Si la base de datos es comprometida, las keys no se pueden recuperar (solo hashes)
- Las keys se muestran al usuario **una unica vez** al crearlas
- No existe funcionalidad de "ver key" despues de la creacion
- Se puede revocar eliminando el registro de la tabla

## Validacion de Origen

### Configuracion

Cada tenant puede configurar una lista de `allowedOrigins` (URLs) en su configuracion. Esta lista define que dominios pueden usar su API key.

### Flujo de validacion

En `apps/web/src/lib/api-auth.ts`:

1. Se lee el header `origin` o `referer` del request
2. Si `allowedOrigins` esta vacio o no hay header de origen, se permite (para compatibilidad con requests server-side)
3. Si hay origenes configurados y hay header de origen:
   - Se compara el origen (sin trailing slash) contra cada URL permitida
   - Se aceptan subdominios: si `https://example.com` esta permitido, `https://shop.example.com` tambien
   - Si no coincide ninguno, se devuelve `403 Origin not allowed`

### Ejemplo

Si `allowedOrigins = ["https://mi-veleria.com"]`:

| Origen del request | Resultado |
|---|---|
| `https://mi-veleria.com` | Permitido |
| `https://www.mi-veleria.com` | Permitido (subdominio) |
| `https://shop.mi-veleria.com` | Permitido (subdominio) |
| `https://otra-web.com` | Rechazado (403) |
| Sin header origin | Permitido (server-side) |

## Proteccion SSRF

### Webhooks

Cuando un tenant configura un `webhookUrl`, se valida antes de enviar cualquier request para prevenir SSRF (Server-Side Request Forgery).

Archivo: `apps/web/src/lib/url-validation.ts`

La funcion `isInternalUrl(url)` bloquea URLs que apuntan a:

| Direccion | Ejemplo |
|---|---|
| localhost | `http://localhost:8080`, `http://127.0.0.1` |
| IPv6 loopback | `http://[::1]` |
| Red privada 10.x | `http://10.0.0.1` |
| Red privada 192.168.x | `http://192.168.1.1` |
| Red privada 172.16-31.x | `http://172.16.0.1` |
| Metadata AWS/cloud | `http://169.254.169.254` |
| Dominios .internal | `http://service.internal` |
| Dominios .local | `http://service.local` |
| URLs malformadas | Cualquier URL que no parsee correctamente |

Si `isInternalUrl()` devuelve `true`, el webhook **no se envia**.

## Seguridad de Cookies

### Cookie de impersonacion

La cookie `impersonate` (usada por super admins para ver el dashboard como otro tenant):

| Propiedad | Valor | Proposito |
|---|---|---|
| `path` | `/` | Accesible en todas las rutas |
| `maxAge` | 3600 (1 hora) | Expira automaticamente |
| `httpOnly` | `true` | No accesible via `document.cookie` (previene XSS) |
| `secure` | `true` en produccion | Solo se envia por HTTPS |
| `sameSite` | `strict` | No se envia en requests cross-site (previene CSRF) |

## Validacion de Input

### Zod Schemas

Todos los endpoints de mutacion (POST, PUT, PATCH) validan el body con schemas Zod definidos en `apps/web/src/lib/validations.ts` — sin excepciones. Nunca se lee directamente de `body.field`; siempre se usa `validation.data` del schema validado:

| Schema | Endpoint | Valida |
|---|---|---|
| `createProductSchema` | POST /api/internal/products | Nombre, sailType, basePrice |
| `updateProductSchema` | PUT /api/internal/products/[id] | Todos los campos del producto (opcionales) |
| `createQuoteSchema` | POST /api/v1/quotes | Barco, cliente, items con sailType/productName |
| `updateQuoteStatusSchema` | PATCH /api/internal/quotes/[id] | Solo el campo status |
| `updateBoatSchema` | PUT /api/internal/boats/[id] | Modelo, medidas |
| `updateTenantSettingsSchema` | PUT /api/internal/settings | Nombre, webhook, origenes, locale, moneda |
| `updateThemeSchema` | PUT /api/internal/theme | Colores (regex hex), fuentes, logo URL |

### Validaciones especificas

- **Colores hex:** Regex `/^#[0-9a-fA-F]{6}$/` para prevenir inyeccion
- **URLs:** `z.string().url()` para imagenes, webhooks y origenes
- **Emails:** `z.string().email()` para datos de contacto
- **Numeros:** Helper `numericString` que acepta number o string y valida que sea numerico valido
- **Longitudes maximas:** Limitadas en todos los campos de texto (200 para nombres, 2000 para notas, etc.)

### Funcion validateBody

```typescript
function validateBody<T>(schema: ZodSchema<T>, body: unknown): { data: T } | { error: string }
```

Si la validacion falla, devuelve un `{ error }` con los mensajes de Zod concatenados. El endpoint responde con `400 Bad Request`.

## Security Headers

Configurados en el middleware de Next.js (`apps/web/src/middleware.ts`):

| Header | Valor | Proposito |
|---|---|---|
| `X-Frame-Options` | `DENY` | Previene que la app se cargue en iframes (anti-clickjacking) |
| `X-Content-Type-Options` | `nosniff` | Previene MIME type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita informacion en el header Referer |
| `X-DNS-Prefetch-Control` | `on` | Habilita DNS prefetching para performance |

> **Nota:** Los security headers se aplican tambien a las rutas `/embed/*`, **excepto** `X-Frame-Options` que se omite en `/embed/*` para permitir la carga en iframes. Las rutas `/api/v1/*` siguen excluidas del middleware (usan API key auth).

## Super Admin

### Configuracion

El acceso de super admin se controla via la variable de entorno `SUPER_ADMIN_EMAILS`:

```env
SUPER_ADMIN_EMAILS=admin@aerolume.com,dev@aerolume.com
```

- Lista de emails separados por coma
- Se normaliza a minusculas automaticamente
- No requiere registro especial en la base de datos
- Si la variable no esta definida o esta vacia, nadie es super admin

### Verificacion

```typescript
// apps/web/src/lib/admin.ts
function isSuperAdmin(email?: string | null): boolean
```

Se usa en:
- `withAdminAuth()` para proteger API routes admin
- `getTenantForUser()` para verificar permisos de impersonacion

## CORS en API v1

Los headers CORS se aplican a todas las respuestas de `/api/v1/*`:

```
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
Access-Control-Allow-Origin: <origin del request>
```

Cada endpoint v1 tiene un handler `OPTIONS` que responde con status `204` y los mismos headers CORS para manejar preflight requests del navegador.

> **Nota:** `Access-Control-Allow-Origin` refleja el origen del request actual (no usa `*`). La validacion real de origenes se hace en `validateApiKey()` contra `allowedOrigins` del tenant.

## Rutas Autenticadas

Todas las rutas de mutacion requieren autenticacion. Las rutas legacy sin autenticacion han sido eliminadas — no existen endpoints publicos de mutacion fuera de `/api/v1/*` (que requiere API key).

## Embed postMessage

La comunicacion via `postMessage` desde el embed usa `document.referrer` como origen destino en lugar de wildcard `'*'`, limitando los mensajes al dominio que cargo el iframe.

Si `document.referrer` esta vacio (Referrer-Policy: no-referrer, navegacion directa, etc.) el configurador **no emite el mensaje** en lugar de caer a `'*'` — mejor perder una notificacion que filtrar PII (email, nombre, telefono, quoteId) a un parent no confiable. El submit handler tambien chequea `res.ok` antes de mostrar la pantalla de exito; un 4xx/5xx muestra un banner de error (`data-testid="embed-submit-error"`) en vez de fingir exito silencioso.

## Formularios de Auth

Los formularios de login y registro incluyen atributos `autocomplete` en los campos de email y password para facilitar la integracion con password managers (`autocomplete="email"`, `autocomplete="current-password"`, `autocomplete="new-password"`).

## Error Boundaries

Cada route group de Next.js (`(dashboard)`, `(admin)`) tiene error boundaries (`error.tsx`) que capturan errores no manejados y muestran una pagina de error amigable sin exponer detalles de implementacion.

Los wrappers `withTenantAuth` y `withAdminAuth` tambien capturan excepciones y devuelven `500 Internal server error` generico, registrando el error real solo en `console.error`.

---

## Review de seguridad — Abril 2026

Review ejecutado sobre el diff de Sprint 1 (dos subagentes independientes auditaron `git diff HEAD` + archivos untracked). Todos los parches estan aplicados en el commit `6495454`. Los tests de `tests/e2e/security/` (Sprint 2) son regresiones directas de cada hallazgo.

### C1 — Cross-tenant pricing leak en `POST /api/v1/quotes`

**Riesgo:** un tenant con API key valida podia enviar `productId` de otro tenant y recibir de vuelta su `cost` interno, tiers y MSRP (fuga de margen + informacion competitiva).

**Fix** (`apps/web/src/app/api/v1/quotes/route.ts`): el lookup de `products` se scopeo con `and(inArray(products.id, productIds), or(eq(tenantId, ctx.tenantId), isNull(tenantId)))`. El catalogo base (`tenantId IS NULL`) sigue siendo quotable; el del tenant propio tambien; productos ajenos no resuelven. Los items con `productId` no resuelto quedan con `productId: null`, `unitPrice: null`, `cost: null` (no se rechaza la request para no romper lineas custom).

**Regresion:** `tests/e2e/security/cross-tenant-quotes-leak.spec.ts`.

### H1 — Fuga de `cost` via webhook

El payload que se envia al webhook del tenant ya no incluye `cost` por item. Antes, si el tenant apuntaba el webhook a un CRM/Zapier externo, su coste interno de proveedor se exportaba fuera del perimetro. El `cost` sigue guardandose en DB (para el dashboard de margen) y en la respuesta HTTP de `POST /api/v1/quotes`, que requiere API key.

**Regresion:** `tests/e2e/security/webhook-payload-no-cost.spec.ts`.

### H2 — `tenantId` en respuesta publica de `/api/v1/products`

El endpoint publico ya no devuelve `tenantId` en la proyeccion. Era innecesario (el caller ya tiene su propio tenant via la API key) y facilitaba fingerprinting.

### H3 — `postMessage` con targetOrigin `'*'` como fallback

Ver seccion "Embed postMessage" arriba. Sin parent origin confiable, no se emite el mensaje en lugar de usar wildcard.

### M1 — SSRF por redireccion en webhooks

`fetch(webhookUrl, { redirect: 'manual', ... })`. Antes, aunque `isInternalUrl` validaba la URL original, un 30x a `http://169.254.169.254/` (metadata AWS) o `http://127.0.0.1:8080/` se seguia por defecto. Ahora las redirecciones se ignoran — el webhook o llega directo o no llega.

**Regresion:** `tests/e2e/security/ssrf-webhook-internal-ip.spec.ts`.

### W1 — Submit del configurador sin chequeo de `res.ok`

El handler de envio del embed ahora valida el status antes de avanzar a la pantalla de exito. Si el server responde 4xx/5xx, se muestra un banner de error en lugar de fingir exito silencioso (que ocurria cuando, por ejemplo, la validacion Zod rechazaba el payload).

---

## Rate limiting

### Algoritmo

Aerolume usa **sliding window** via [`@upstash/ratelimit`](https://github.com/upstash/ratelimit-js) respaldado por Vercel KV (Upstash Redis). Cada API key tiene su propio contador independiente, con la ventana y el limite configurados por tenant.

### Configuracion por tenant

El campo `rate_limit` en la tabla `api_keys` define el numero maximo de requests por hora (default: `1000`). Se puede cambiar desde el admin o directamente en la DB.

### Headers de respuesta

Todas las respuestas de `/api/v1/*` incluyen:

| Header | Descripcion |
|---|---|
| `X-RateLimit-Limit` | Limite total configurado para la key |
| `X-RateLimit-Remaining` | Requests restantes en la ventana actual |
| `X-RateLimit-Reset` | Unix timestamp (ms) cuando se resetea la ventana |

Cuando se supera el limite, la respuesta es `429 Too Many Requests` con `{ "error": "Rate limit exceeded" }`.

### Comportamiento sin KV

Si `KV_REST_API_URL` no esta configurado (desarrollo local sin KV), el rate limiting se desactiva gracefully: se permite todo el trafico y se emite un warning en los logs una sola vez. Los headers `X-RateLimit-*` devuelven `Infinity` / `0`.

### Testear localmente

Con KV configurado, ejecutar:

```bash
cd apps/web && pnpm test:e2e --grep "rate limiting"
```

Sin KV, el spec hace skip automaticamente (`test.skip(!process.env.KV_REST_API_URL, ...)`).

El spec esta en `tests/e2e/security/rate-limit.spec.ts`. Crea un tenant con `rateLimit=3`, hace 3 requests exitosas verificando que `X-RateLimit-Remaining` decrementa, y confirma que la 4a request devuelve `429`.

---

## MFA / 2FA (TOTP)

### Quien esta forzado

Los super admins (emails en `SUPER_ADMIN_EMAILS`) son los unico usuarios que pueden acceder a las rutas `/admin/*`. El gate MFA solo se activa cuando la variable de entorno `ENFORCE_SUPER_ADMIN_MFA=1` esta seteada. En desarrollo y tests sin esa var, el acceso admin funciona sin MFA (para no romper tests existentes).

### Enrollment flow

1. El super admin visita cualquier ruta `/admin/*`.
2. El layout server (`(admin)/layout.tsx`) detecta que `currentLevel=aal1 && nextLevel=aal1` (sin factor) → redirect a `/admin/mfa`.
3. En `/admin/mfa` el servidor crea un factor TOTP via `supabase.auth.mfa.enroll()` y muestra el QR code + secret.
4. El usuario escanea el QR con su app (Google Authenticator, Authy, 1Password, etc.).
5. Introduce el codigo de 6 digitos → el cliente llama `mfa.challenge()` + `mfa.verify()`.
6. Al verificar con exito, la sesion pasa a `aal2` y se redirige a `/admin`.

### Challenge flow (sesiones posteriores)

1. El super admin hace login normal (email + password) → sesion en `aal1`.
2. Al visitar `/admin/*`, el layout detecta `currentLevel=aal1 && nextLevel=aal2` (factor enrollado, no desafiado) → redirect a `/admin/mfa/challenge?redirectTo=...`.
3. El usuario introduce el codigo de 6 digitos → `supabase.auth.mfa.challengeAndVerify()`.
4. Sesion pasa a `aal2`, redirect al destino original.

### Gate en API routes

`withAdminAuth` en `auth-helpers.ts` tambien aplica el gate para llamadas directas a `/api/admin/*`:
- `mfa_enroll` (403): no hay factor enrollado.
- `mfa_challenge` (403): hay factor pero la sesion es `aal1`.

### Recovery (sin codigos nativos)

Supabase no provee recovery codes nativos para TOTP. Si un super admin pierde acceso a su app de autenticacion:

1. Conectarse a la DB de produccion con acceso de servicio.
2. Ejecutar:
   ```sql
   DELETE FROM auth.mfa_factors WHERE user_id = '<user-uuid>';
   ```
3. Esto elimina todos los factores TOTP del usuario.
4. El usuario puede hacer login normal y volver a enroll en `/admin/mfa`.

Alternativamente, usando la API de servicio de Supabase:
```bash
curl -X DELETE \
  'https://<project>.supabase.co/auth/v1/admin/users/<user-id>/factors/<factor-id>' \
  -H 'apikey: <service-role-key>' \
  -H 'Authorization: Bearer <service-role-key>'
```

### Troubleshooting

**Codigo incorrecto / expirado**: Los codigos TOTP son validos por 30 segundos. Si el reloj del dispositivo esta desfasado (>30s), los codigos seran invalidos. Sincronizar el reloj del dispositivo (NTP). La mayoria de apps de autenticacion avisan cuando el reloj esta desincronizado.

**Factor en estado `unverified`**: Si el usuario cerro el navegador durante el enrollment antes de verificar, el factor queda en estado `unverified`. Al volver a `/admin/mfa` el sistema cancela el factor pendiente y crea uno nuevo. Si hay multiples factores sin verificar (limite de Supabase), ir a `/admin/mfa/settings` para eliminarlos manualmente.

**`mfa.enroll()` falla con limite de factores**: Supabase limita el numero de factores por usuario. Ir a `/admin/mfa/settings` y eliminar los factores no usados.

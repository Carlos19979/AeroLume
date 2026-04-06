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

## Formularios de Auth

Los formularios de login y registro incluyen atributos `autocomplete` en los campos de email y password para facilitar la integracion con password managers (`autocomplete="email"`, `autocomplete="current-password"`, `autocomplete="new-password"`).

## Error Boundaries

Cada route group de Next.js (`(dashboard)`, `(admin)`) tiene error boundaries (`error.tsx`) que capturan errores no manejados y muestran una pagina de error amigable sin exponer detalles de implementacion.

Los wrappers `withTenantAuth` y `withAdminAuth` tambien capturan excepciones y devuelven `500 Internal server error` generico, registrando el error real solo en `console.error`.

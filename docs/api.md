# API Reference

## Autenticacion

Todas las llamadas a la API v1 requieren una API key en el header `x-api-key`:

```
x-api-key: ak_3f8a1b2c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a
```

Las API keys se generan desde el dashboard en `/dashboard/api-keys`. El formato es `ak_` seguido de 40 caracteres hexadecimales.

### Validacion

El proceso de validacion de la API key (`validateApiKey`) es:

1. Verifica que el header `x-api-key` existe
2. Verifica que empieza con `ak_`
3. Calcula el hash SHA-256 de la key y busca coincidencia en la tabla `api_keys`
4. Verifica que la key no ha expirado (`expires_at`)
5. Verifica que el tenant tiene acceso activo (ver abajo)
6. Si hay `allowedOrigins` configurados y el request tiene header `origin`, valida que el origen esta permitido
7. Actualiza `last_used_at` (fire and forget)

### Requisitos del tenant

La API v1 funciona cuando el tenant cumple una de estas condiciones:
- `plan = 'pro'` y `subscription_status = 'active'`
- `plan = 'prueba'` y `trial_ends_at > now` (trial activo de 7 dias)

Si no se cumplen, la API devuelve `403 Account inactive`.

## Rate Limiting

La tabla `api_keys` tiene un campo `rate_limit` (default: 1000 requests/hora), pero la implementacion con Upstash Redis esta **pendiente**. Actualmente no se aplica rate limiting.

## CORS

Todas las respuestas de la API v1 incluyen headers CORS:

```
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400
Access-Control-Allow-Origin: <origin del request>
```

Cada endpoint v1 exporta un handler `OPTIONS` para responder a preflight requests.

### Validacion de origen

Si el tenant tiene `allowedOrigins` configurados (lista de URLs), el header `origin` o `referer` del request se compara contra esa lista. Se aceptan coincidencias exactas y subdominios.

Si `allowedOrigins` esta vacio, se acepta cualquier origen.

## Formato de Respuesta

### Respuesta exitosa

```json
{
  "data": <T>
}
```

### Respuesta de error

```json
{
  "error": "Descripcion del error"
}
```

## Codigos de Error

| Codigo | Significado | Ejemplo |
|---|---|---|
| 400 | Bad Request | Parametros invalidos, body malformado |
| 401 | Unauthorized | API key ausente, invalida o expirada |
| 403 | Forbidden | Cuenta inactiva, origen no permitido |
| 500 | Internal Server Error | Error inesperado del servidor |

## Endpoints

### GET /api/v1/boats/search

Busca modelos de barcos por nombre. Incluye barcos globales (`tenant_id IS NULL`) y barcos custom del tenant.

**Query params:**

| Parametro | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `query` | string | Si | Texto de busqueda (minimo 2 caracteres) |
| `limit` | number | No | Maximo resultados (default: 20, max: 100) |

**Ejemplo:**

```bash
curl -H "x-api-key: ak_xxx" \
  "https://app.aerolume.com/api/v1/boats/search?query=beneteau&limit=10"
```

**Respuesta:**

```json
{
  "data": [
    {
      "id": "uuid",
      "model": "Beneteau Oceanis 38",
      "boatModel": null,
      "length": "11.50",
      "genoaArea": "32.00",
      "genoaFurlerArea": "28.50",
      "mainsailArea": "35.20",
      "mainsailFullArea": "38.00",
      "mainsailFurlerArea": "33.10",
      "spinnakerArea": "95.00",
      "spinnakerAsymArea": "85.00",
      "sgenArea": "45.00",
      "isMultihull": false,
      "gvstd": "35.20",
      "gvfull": "38.00",
      "gve": "33.10",
      "gse": "28.50",
      "gn": "32.00",
      "gen": "45.00",
      "spisym": "95.00",
      "spiasy": "85.00",
      "furling": "28.50"
    }
  ]
}
```

> **Nota:** Todos los valores numericos se devuelven como strings (ver notas sobre columnas numeric en `docs/database.md`).

**Errores:**
- `400` si `query` tiene menos de 2 caracteres

---

### GET /api/v1/products

Lista los productos del tenant, opcionalmente filtrados por tipo de vela. Incluye los campos de configuracion (`configFields`) de cada producto.

**Query params:**

| Parametro | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `sailType` | string | No | Filtrar por tipo de vela (gvstd, gvfull, gve, gse, gn, spiasy, spisym, furling, gen) |

**Ejemplo:**

```bash
curl -H "x-api-key: ak_xxx" \
  "https://app.aerolume.com/api/v1/products?sailType=gvstd"
```

**Respuesta:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Mayor Crucero Dacron",
      "slug": "mayor-crucero-dacron",
      "sailType": "gvstd",
      "basePrice": "1200.00",
      "currency": "EUR",
      "descriptionShort": "Vela mayor standard para crucero",
      "images": ["https://..."],
      "active": true,
      "sortOrder": 0,
      "configFields": [
        {
          "id": "uuid",
          "productId": "uuid",
          "key": "fabric",
          "label": "Tejido",
          "fieldType": "select",
          "options": ["Dacron", "Hydranet", "Pentex"],
          "sortOrder": 0,
          "required": true,
          "priceModifiers": {
            "Dacron": 0,
            "Hydranet": 150,
            "Pentex": 300
          }
        },
        {
          "id": "uuid",
          "productId": "uuid",
          "key": "reefs",
          "label": "Rizos",
          "fieldType": "select",
          "options": ["1", "2", "3"],
          "sortOrder": 1,
          "required": true,
          "priceModifiers": {
            "1": 0,
            "2": 50,
            "3": 100
          }
        }
      ]
    }
  ]
}
```

---

### POST /api/v1/quotes

Crea un nuevo presupuesto con sus items. Envia webhook al tenant si tiene `webhookUrl` configurado.

**Body (JSON):**

```json
{
  "boatId": "uuid (opcional)",
  "boatModel": "Beneteau Oceanis 38",
  "boatLength": "11.50",
  "customerName": "Juan Garcia",
  "customerEmail": "juan@example.com",
  "customerPhone": "+34600123456",
  "customerNotes": "Entrega antes de junio",
  "items": [
    {
      "productId": "uuid (opcional)",
      "sailType": "gvstd",
      "productName": "Mayor Crucero Dacron",
      "sailArea": "35.20",
      "quantity": 1,
      "unitPrice": "1350.00",
      "configuration": {
        "fabric": "Hydranet",
        "reefs": "2"
      }
    }
  ]
}
```

**Schema de validacion (Zod):**

| Campo | Tipo | Requerido | Validacion |
|---|---|---|---|
| `boatId` | string | No | UUID valido |
| `boatModel` | string | Si | 1-200 caracteres |
| `boatLength` | string/number | No | Numerico |
| `customerName` | string | No | 1-200 caracteres |
| `customerEmail` | string | No | Email valido |
| `customerPhone` | string | No | Max 30 caracteres |
| `customerNotes` | string | No | Max 2000 caracteres |
| `items` | array | Si | Minimo 1 item |
| `items[].productId` | string | No | UUID valido |
| `items[].sailType` | string | Si | |
| `items[].productName` | string | Si | |
| `items[].sailArea` | string/number | No | Numerico |
| `items[].quantity` | number | No | Entero >= 1, default 1 |
| `items[].unitPrice` | string/number | No | Numerico |
| `items[].configuration` | object | No | Record<string, unknown> |

**Respuesta exitosa (201 implicito via 200):**

```json
{
  "data": {
    "id": "uuid-del-presupuesto",
    "status": "draft"
  }
}
```

**Errores:**
- `400` si el body no pasa la validacion Zod

**Webhook:** Si el tenant tiene `webhookUrl`, se envia un POST asincrono con el evento `quote.created` (ver `docs/architecture.md` para el payload).

---

### POST /api/v1/analytics

Registra un evento de analitica desde el widget.

**Body (JSON):**

```json
{
  "eventType": "configurator_opened",
  "boatModel": "Beneteau Oceanis 38",
  "productId": "uuid (opcional)",
  "sailType": "gvstd (opcional)",
  "metadata": {},
  "sessionId": "session-uuid (opcional)"
}
```

| Campo | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `eventType` | string | Si | Tipo de evento (ver lista abajo) |
| `boatModel` | string | No | Modelo de barco |
| `productId` | string | No | UUID del producto |
| `sailType` | string | No | Tipo de vela |
| `metadata` | object | No | Datos adicionales arbitrarios |
| `sessionId` | string | No | ID de sesion del widget |

**Tipos de evento:**
- `configurator_opened` - Widget abierto
- `boat_search` - Busqueda realizada
- `product_view` - Producto visualizado
- `quote_created` - Presupuesto creado

**Headers automaticos capturados:**
- `x-forwarded-for` -> `ip_address`
- `user-agent` -> `user_agent`
- `referer` -> `referrer`

**Respuesta:**

```json
{
  "data": {
    "tracked": true
  }
}
```

**Errores:**
- `400` si falta `eventType`

## API Interna (Dashboard)

Estos endpoints NO son parte de la API publica. Usan autenticacion via sesion Supabase y el wrapper `withTenantAuth`. Estan documentados aqui como referencia interna.

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/internal/products` | Lista productos del tenant |
| POST | `/api/internal/products` | Crea producto |
| GET | `/api/internal/products/[id]` | Detalle producto |
| PUT | `/api/internal/products/[id]` | Actualiza producto |
| DELETE | `/api/internal/products/[id]` | Elimina producto |
| GET/POST | `/api/internal/products/[id]/fields` | Gestiona config fields |
| GET | `/api/internal/quotes` | Lista presupuestos |
| GET | `/api/internal/quotes/[id]` | Detalle presupuesto |
| PATCH | `/api/internal/quotes/[id]` | Actualiza estado |
| GET | `/api/internal/boats` | Lista barcos del tenant |
| GET | `/api/internal/boats/[id]` | Detalle barco |
| PUT | `/api/internal/boats/[id]` | Actualiza barco |
| GET | `/api/internal/api-keys` | Lista API keys |
| POST | `/api/internal/api-keys` | Crea API key |
| GET | `/api/internal/analytics` | Datos de analitica |
| GET | `/api/internal/settings` | Configuracion del tenant |
| PUT | `/api/internal/settings` | Actualiza configuracion |
| GET | `/api/internal/theme` | Tema del tenant |
| PUT | `/api/internal/theme` | Actualiza tema |
| GET | `/api/internal/tenants` | Info del tenant actual |

## API Admin (Super Admin)

Requieren autenticacion Supabase + email en `SUPER_ADMIN_EMAILS`.

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | `/api/admin/boats` | Lista todos los barcos (globales) |
| POST | `/api/admin/boats` | Crea barco global |
| GET | `/api/admin/boats/[id]` | Detalle barco |
| PUT | `/api/admin/boats/[id]` | Actualiza barco |
| DELETE | `/api/admin/boats/[id]` | Elimina barco |
| GET | `/api/admin/tenants/[id]` | Detalle tenant |
| PUT | `/api/admin/tenants/[id]` | Actualiza tenant |
| GET | `/api/admin/impersonate?tenantId=xxx` | Impersonar tenant |
| GET | `/api/admin/impersonate/stop` | Dejar de impersonar |

# Base de Datos

## ORM y Herramientas

- **ORM:** Drizzle ORM ^0.44.0
- **Driver:** postgres (pg driver) ^3.4.5
- **Migraciones:** drizzle-kit ^0.31.0
- **Base de datos:** PostgreSQL 15+ (alojado en Supabase)

## Diagrama de Relaciones

```
┌─────────────────┐
│    tenants      │
│─────────────────│
│ id (PK)         │◄──────────────────────────────────────────────┐
│ name            │                                                │
│ slug (unique)   │                                                │
│ plan            │                                                │
│ ...             │                                                │
└────────┬────────┘                                                │
         │                                                         │
         │ 1:N                                                     │
         │                                                         │
    ┌────┴───────────┬──────────────┬──────────────┬──────────────┤
    ▼                ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
│tenant_   │  │ boats    │  │products  │  │ quotes   │  │ api_keys     │
│members   │  │(nullable)│  │          │  │          │  │              │
│──────────│  │──────────│  │──────────│  │──────────│  │──────────────│
│tenantId  │  │tenantId? │  │tenantId  │  │tenantId  │  │tenantId      │
│userId    │  │model     │  │name      │  │boatId?───┼─►│keyHash       │
│role      │  │length    │  │sailType  │  │status    │  │name          │
│          │  │i,j,p,e.. │  │basePrice │  │customer* │  │scopes        │
└──────────┘  └──────────┘  │          │  │totalPrice│  │rateLimit     │
                            └─────┬────┘  └────┬─────┘  └──────────────┘
                                  │             │
                                  │ 1:N         │ 1:N
                                  ▼             ▼
                ┌─────────────┴──┐
                │                │
                ▼                ▼
      ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
      │product_      │  │product_  │  │quote_    │  │analytics_    │
      │pricing_tiers │  │config_   │  │items     │  │events        │
      │──────────────│  │fields    │  │──────────│  │──────────────│
      │productId     │  │──────────│  │quoteId   │  │tenantId      │
      │minSqm        │  │productId │  │productId?│  │eventType     │
      │maxSqm        │  │key       │  │sailType  │  │boatModel     │
      │costPerSqm    │  │label     │  │unitPrice │  │productId     │
      │msrpPerSqm    │  │options   │  │config    │  │sailType      │
      └──────────────┘  │priceMods │  └──────────┘  └──────────────┘
                        │percentMo │
                        └──────────┘
```

## Enums

### `tenant_plan`

| Valor | Descripcion |
|---|---|
| `prueba` | Plan de prueba gratuito (funcionalidad limitada) |
| `pro` | Plan de pago con acceso completo |
| `enterprise` | Plan enterprise (reservado para futuro uso) |

### `subscription_status`

| Valor | Descripcion |
|---|---|
| `trialing` | En periodo de prueba |
| `active` | Suscripcion activa |
| `past_due` | Pago pendiente (7 dias para regularizar) |
| `canceled` | Cancelada — conserva acceso mientras `cancelation_grace_ends_at > now()` (7 dias). Al expirar la gracia queda bloqueada |
| `expired` | Sin suscripcion activa (gracia agotada o `subscription_expired` de LemonSqueezy). Sin acceso |

### `member_role`

| Valor | Descripcion |
|---|---|
| `owner` | Propietario del tenant |
| `admin` | Administrador con acceso completo |
| `viewer` | Solo lectura |

### `quote_status`

| Valor | Descripcion |
|---|---|
| `draft` | Borrador (recien creado desde widget) |
| `sent` | Enviado al cliente |
| `accepted` | Aceptado por el cliente |
| `rejected` | Rechazado |
| `expired` | Expirado |

### `product_variant`

| Valor | Descripcion |
|---|---|
| `cruising` | Crucero (gama entrada) |
| `cruising_plus` | Crucero plus |
| `cruising_racing` | Crucero-regata |

### `sail_type`

| Valor | Descripcion |
|---|---|
| `gvstd` | Mayor standard |
| `gvfull` | Mayor full-batten |
| `gve` | Mayor enrollable |
| `gse` | Genoa enrollable |
| `gn` | Genoa |
| `gen` | Genaker |
| `spiasy` | Spinnaker asimetrico |
| `spisym` | Spinnaker simetrico |
| `furling` | Furling genoa |

### `field_type`

| Valor | Descripcion |
|---|---|
| `select` | Desplegable de opciones |
| `radio` | Botones de radio |
| `number` | Campo numerico |
| `text` | Campo de texto libre |

## Tablas

### `tenants`

Tabla principal de clientes (retailers).

| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | uuid | PK, default random | Identificador unico |
| `name` | text | NOT NULL | Nombre del tenant |
| `slug` | text | UNIQUE, NOT NULL | Slug para URLs |
| `custom_domain` | text | UNIQUE | Dominio personalizado |
| `logo_url` | text | | URL del logo |
| `theme_accent` | text | default '#0b5faa' | Color acento principal |
| `theme_accent_dim` | text | default '#1a7fd4' | Color acento secundario |
| `theme_navy` | text | default '#0a2540' | Color navy |
| `theme_text` | text | default '#0a1e3d' | Color de texto |
| `theme_font_display` | text | default 'Cormorant' | Fuente display |
| `theme_font_body` | text | default 'Manrope' | Fuente body |
| `theme_color_main` | text | default '#3b82f6' | Color grupo vela mayor |
| `theme_color_head` | text | default '#10b981' | Color grupo vela proa |
| `theme_color_spi` | text | default '#a855f7' | Color grupo spinnaker |
| `theme_cta_label` | text | default 'Solicitar presupuesto' | Label del boton CTA del configurador |
| `theme_contact_title` | text | default 'Datos de contacto' | Titulo del paso de contacto |
| `theme_contact_subtitle` | text | default 'Para enviarte el presupuesto detallado.' | Subtitulo del paso de contacto |
| `locale` | text | default 'es' | Idioma |
| `currency` | text | default 'EUR' | Moneda |
| `plan` | tenant_plan | default 'prueba' | Plan actual |
| `ls_customer_id` | text | | ID de cliente LemonSqueezy |
| `ls_subscription_id` | text | | ID de suscripcion LemonSqueezy |
| `subscription_status` | subscription_status | default 'trialing' | Estado de suscripcion |
| `trial_ends_at` | timestamptz | | Fin del periodo de prueba |
| `cancelation_grace_ends_at` | timestamptz | | Fin del periodo de gracia post-cancelacion (7 dias) |
| `allowed_origins` | text[] | default [] | Origenes permitidos para API |
| `webhook_url` | text | | URL para webhooks |
| `sailonet_import` | boolean | default false | Importacion Sailonet habilitada |
| `company_name` | text | | Nombre empresa |
| `phone` | text | | Telefono |
| `website` | text | | Web |
| `country` | text | | Pais |
| `city` | text | | Ciudad |
| `created_at` | timestamptz | default now() | Fecha creacion |
| `updated_at` | timestamptz | default now(), auto-update | Fecha actualizacion |

### `tenant_members`

Relacion usuario-tenant con roles.

| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | uuid | PK, default random | Identificador unico |
| `tenant_id` | uuid | FK -> tenants.id (CASCADE), NOT NULL | Tenant |
| `user_id` | uuid | NOT NULL | ID del usuario en Supabase auth.users |
| `role` | member_role | NOT NULL, default 'admin' | Rol del miembro |
| `created_at` | timestamptz | default now() | Fecha creacion |

**Restriccion unica:** `(tenant_id, user_id)` - un usuario solo puede pertenecer una vez a un tenant.

### `boats`

Base de datos de modelos de barcos con medidas.

| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | uuid | PK, default random | Identificador unico |
| `tenant_id` | uuid | FK -> tenants.id (CASCADE), nullable | NULL = barco global |
| `model` | text | NOT NULL | Nombre del modelo (ej: "Beneteau Oceanis 38") |
| `boat_model` | text | | Modelo alternativo |
| `length` | numeric | | Eslora en metros |
| `i` | numeric | | Medida I (altura del triangulo de proa) |
| `j` | numeric | | Medida J (base del triangulo de proa) |
| `p` | numeric | | Medida P (altura de la mayor) |
| `e` | numeric | | Medida E (pie de la mayor) |
| `gg` | numeric | | Medida GG (spinnaker) |
| `lp` | numeric | | LP (perpendicular mas larga del genoa) |
| `sl` | numeric | | SL (grátil del genoa) |
| `smw` | numeric | | SMW (ancho medio del spinnaker) |
| `genoa_area` | numeric | | Area genoa |
| `genoa_furler_area` | numeric | | Area genoa enrollable |
| `mainsail_area` | numeric | | Area mayor |
| `mainsail_full_area` | numeric | | Area mayor full-batten |
| `mainsail_furler_area` | numeric | | Area mayor enrollable |
| `spinnaker_area` | numeric | | Area spinnaker |
| `spinnaker_asym_area` | numeric | | Area spinnaker asimetrico |
| `sgen_area` | numeric | | Area genaker |
| `is_multihull` | boolean | default false | Es multicasco |
| `gvstd` | numeric | | Area calculada: mayor standard |
| `gvfull` | numeric | | Area calculada: mayor full-batten |
| `gve` | numeric | | Area calculada: mayor enrollable |
| `gse` | numeric | | Area calculada: genoa enrollable |
| `gn` | numeric | | Area calculada: genoa |
| `gen` | numeric | | Area calculada: genaker |
| `spisym` | numeric | | Area calculada: spi simetrico |
| `spiasy` | numeric | | Area calculada: spi asimetrico |
| `furling` | numeric | | Area calculada: furling genoa |
| `id_sail_boat_type` | text | | ID legacy de Sailonet |
| `created_at` | timestamptz | default now() | Fecha creacion |
| `updated_at` | timestamptz | default now(), auto-update | Fecha actualizacion |

**Indices:**
- `idx_boats_tenant` en `tenant_id`
- `idx_boats_model` en `model`

### `products`

Productos de velas configurables por tenant.

| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | uuid | PK, default random | Identificador unico |
| `tenant_id` | uuid | FK -> tenants.id (CASCADE), nullable | NULL = producto del catalogo base compartido (se clona al crear tenant) |
| `external_id` | text | | ID externo (importacion Sailonet) |
| `name` | text | NOT NULL | Nombre del producto |
| `slug` | text | NOT NULL | Slug unico por tenant |
| `sail_type` | sail_type | NOT NULL | Tipo de vela |
| `variant` | product_variant | | Variante (`cruising`, `cruising_plus`, `cruising_racing`) |
| `base_price` | numeric | | PVP base por m² — fallback cuando no hay tier que aplique |
| `cost_per_sqm` | numeric | | Coste base por m² (interno, nunca se expone en API v1) |
| `currency` | text | default 'EUR' | Moneda |
| `description_short` | text | | Descripcion corta |
| `images` | text[] | default [] | URLs de imagenes |
| `features` | text[] | default [] | Features / bullets descriptivos |
| `active` | boolean | default true | Producto activo |
| `sort_order` | integer | default 0 | Orden de visualizacion |
| `created_at` | timestamptz | default now() | Fecha creacion |
| `updated_at` | timestamptz | default now(), auto-update | Fecha actualizacion |

**Indices:**
- `uq_products_tenant_slug` UNIQUE en `(tenant_id, slug)` con `NULLS NOT DISTINCT`
- `idx_products_sail_type` en `(tenant_id, sail_type)`

### `product_pricing_tiers`

Tramos de precio por m² para un producto. Cuando el area de vela cae dentro de un tramo, se usa ese `costPerSqm` / `msrpPerSqm` en lugar del `basePrice` / `costPerSqm` del producto (ver `apps/web/src/lib/pricing.ts`).

| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | uuid | PK, default random | Identificador unico |
| `product_id` | uuid | FK -> products.id (CASCADE), NOT NULL | Producto padre |
| `min_sqm` | numeric | NOT NULL | Limite inferior del tramo (m², inclusivo) |
| `max_sqm` | numeric | NOT NULL | Limite superior del tramo (m², inclusivo) |
| `cost_per_sqm` | numeric | NOT NULL | Coste interno por m² en este tramo |
| `msrp_per_sqm` | numeric | NOT NULL | PVP por m² en este tramo |
| `sort_order` | integer | default 0 | Orden |

**Indices:**
- `idx_pricing_tiers_product` en `product_id`

**RLS:** habilitada (migracion `enable_rls_product_pricing_tiers`). Policies espejo de `product_config_fields` — acceso solo via el tenant dueño del producto.

**Validacion en bulk replace (`PUT /api/internal/products/[id]/tiers`):** `max_sqm > min_sqm`, precios ≥ 0, sin overlap entre tramos.

### `product_config_fields`

Campos de configuracion para cada producto (opciones como tejido, superficie, rizos, etc.).

| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | uuid | PK, default random | Identificador unico |
| `product_id` | uuid | FK -> products.id (CASCADE), NOT NULL | Producto padre |
| `key` | text | NOT NULL | Clave interna (ej: 'surface', 'fabric') |
| `label` | text | NOT NULL | Etiqueta visible (ej: 'Superficie (m2)') |
| `field_type` | field_type | default 'select' | Tipo de campo |
| `options` | jsonb | default [] | Opciones disponibles |
| `sort_order` | integer | default 0 | Orden |
| `required` | boolean | default true | Campo obligatorio |
| `price_modifiers` | jsonb | default {} | Modificadores **en EUR** por opcion (se suman al total) |
| `percent_modifiers` | jsonb | default {} | Modificadores **en %** por opcion (fraccion decimal, p.ej. `0.10` = +10%) |

**Indices:**
- `idx_config_product_key` UNIQUE en `(product_id, key)`

**Nota:** `price_modifiers` y `percent_modifiers` son **mutuamente excluyentes por opcion** — la UI del product editor usa un toggle EUR | % por opcion. A nivel de schema ambas columnas existen; el `pricing.ts` suma lo que encuentre en cada una.

Ejemplo de `price_modifiers` (EUR planos):
```json
{
  "Dacron": 0,
  "Hydranet": 150,
  "Pentex": 300
}
```

Ejemplo de `percent_modifiers` (fracciones):
```json
{
  "1 rizo": 0,
  "2 rizos": 0.05,
  "3 rizos": 0.10
}
```

### `quotes`

Presupuestos generados desde el widget o dashboard.

| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | uuid | PK, default random | Identificador unico |
| `tenant_id` | uuid | FK -> tenants.id (CASCADE), NOT NULL | Tenant |
| `boat_id` | uuid | FK -> boats.id (SET NULL) | Barco seleccionado |
| `boat_model` | text | | Modelo del barco (texto plano) |
| `boat_length` | numeric | | Eslora |
| `status` | quote_status | NOT NULL, default 'draft' | Estado del presupuesto |
| `customer_name` | text | | Nombre del cliente |
| `customer_email` | text | | Email del cliente |
| `customer_phone` | text | | Telefono del cliente |
| `customer_notes` | text | | Notas del cliente |
| `total_price` | numeric | | Precio total calculado |
| `currency` | text | default 'EUR' | Moneda |
| `expires_at` | timestamptz | | Fecha de expiracion |
| `created_at` | timestamptz | default now() | Fecha creacion |
| `updated_at` | timestamptz | default now(), auto-update | Fecha actualizacion |

**Indices:**
- `quotes_tenant_idx` en `tenant_id`
- `quotes_status_idx` en `status`
- `quotes_customer_email_idx` en `customer_email`

### `quote_items`

Lineas individuales de un presupuesto (cada vela configurada).

| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | uuid | PK, default random | Identificador unico |
| `quote_id` | uuid | FK -> quotes.id (CASCADE), NOT NULL | Presupuesto padre |
| `product_id` | uuid | FK -> products.id (SET NULL) | Producto referenciado |
| `sail_type` | text | NOT NULL | Tipo de vela |
| `product_name` | text | NOT NULL | Nombre del producto (snapshot) |
| `sail_area` | numeric | | Area de la vela (m2) |
| `quantity` | integer | default 1 | Cantidad |
| `unit_price` | numeric | | Precio unitario |
| `configuration` | jsonb | default {} | Opciones seleccionadas |
| `sort_order` | integer | default 0 | Orden |

**Indices:**
- `quote_items_quote_idx` en `quote_id`

Ejemplo de `configuration`:
```json
{
  "fabric": "Dacron",
  "reefs": "2",
  "battens": "Full"
}
```

### `api_keys`

Claves API para autenticar el widget y llamadas externas.

| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | uuid | PK, default random | Identificador unico |
| `tenant_id` | uuid | FK -> tenants.id (CASCADE), NOT NULL | Tenant propietario |
| `key_hash` | text | NOT NULL | Hash SHA-256 de la clave real |
| `key_prefix` | text | NOT NULL | Primeros 8 caracteres (para identificacion visual) |
| `name` | text | NOT NULL | Nombre descriptivo ("Production", "Staging") |
| `scopes` | text[] | default ['read'] | Permisos |
| `rate_limit` | integer | default 1000 | Limite de requests por hora |
| `last_used_at` | timestamptz | | Ultimo uso |
| `expires_at` | timestamptz | | Fecha de expiracion |
| `created_at` | timestamptz | default now() | Fecha creacion |

**Indices:**
- `api_keys_hash_idx` en `key_hash`
- `api_keys_tenant_idx` en `tenant_id`

### `analytics_events`

Eventos de analitica del widget.

| Campo | Tipo | Restricciones | Descripcion |
|---|---|---|---|
| `id` | uuid | PK, default random | Identificador unico |
| `tenant_id` | uuid | FK -> tenants.id (CASCADE), NOT NULL | Tenant |
| `event_type` | text | NOT NULL | Tipo de evento |
| `boat_model` | text | | Modelo de barco |
| `product_id` | uuid | | ID del producto |
| `sail_type` | text | | Tipo de vela |
| `ip_address` | inet | | Direccion IP |
| `user_agent` | text | | User agent del navegador |
| `referrer` | text | | Pagina de referencia |
| `created_at` | timestamptz | default now() | Fecha del evento |

**Indices:**
- `idx_analytics_tenant_date` en `(tenant_id, created_at)`

**Tipos de evento (enum Zod validado en `POST /api/v1/analytics`):**
- `configurator_opened` — El widget se abrio
- `boat_search` — Busqueda de barco (el widget emite este evento tambien cuando el usuario selecciona un barco de la lista)
- `product_view` — Vista de producto
- `quote_created` — Presupuesto creado

**Importante:** No existen eventos `quote_sent` / `quote_accepted` / `quote_rejected`. El ciclo de vida del presupuesto (draft → sent → accepted/rejected/expired) se trackea via la columna `quotes.status`, **no** via analytics. Las columnas legacy `metadata` y `session_id` fueron eliminadas (migracion `drop_analytics_events_unused_columns`).

## Migraciones

### Generar una migracion

Despues de modificar los schemas en `packages/db/src/schema/`:

```bash
cd packages/db
pnpm generate
```

Esto usa `drizzle-kit generate` para crear un archivo de migracion SQL basado en las diferencias entre el schema de Drizzle y las migraciones existentes.

### Aplicar migraciones

```bash
cd packages/db
pnpm migrate
```

Esto ejecuta `drizzle-kit migrate` para aplicar las migraciones pendientes a la base de datos.

### Push directo (desarrollo)

Para aplicar cambios directamente sin crear migracion (solo en desarrollo):

```bash
cd packages/db
pnpm push
```

### Drizzle Studio

Para explorar la base de datos con una interfaz grafica:

```bash
cd packages/db
pnpm studio
```

## Script de Seed

El script de seed (`packages/db/src/seed.ts`) limpia la BD y crea un entorno de desarrollo completo. Ejecutar con:

```bash
pnpm --filter @aerolume/db seed
```

El seed hace lo siguiente:

1. **Trunca todas las tablas** (cascade) y limpia usuarios de Supabase Auth
2. **Seed barcos** — 4.839 barcos globales desde `boats.json`
3. **Crea usuario admin** — via Supabase Auth admin API
4. **Crea tenant** "Aerolume" con plan `pro`/`active`
5. **Asigna usuario** como `owner` del tenant
6. **Seed productos** — 14 productos de vela con config fields
7. **Genera API key** — almacena hash en BD, escribe raw key en `.env`
8. **Escribe env vars** — `NEXT_PUBLIC_DEMO_API_KEY` y `SUPER_ADMIN_EMAILS` en ambos `.env`

**Requiere:** `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` en `.env`

Despues de ejecutar el seed, reiniciar el dev server para que lea las nuevas env vars.

## Notas Importantes

### Columnas numeric devuelven string

Las columnas de tipo `numeric` en PostgreSQL (usadas para medidas, precios, areas) devuelven **strings** en Drizzle ORM, no numeros. Esto es por precision decimal.

Para convertir a numero, usar la funcion `toNumber()` del paquete shared:

```typescript
import { toNumber } from '@aerolume/shared';

// valor de DB: "35.50" (string)
const area = toNumber(boat.genoaArea); // 35.5 (number | null)
```

La funcion maneja `null`, strings vacios y valores no numericos de forma segura, devolviendo `null` en esos casos.

### Borrado en cascada

- Borrar un **tenant** elimina en cascada: members, boats del tenant, products, quotes, api_keys, analytics_events
- Borrar un **product** elimina en cascada sus config_fields
- Borrar un **quote** elimina en cascada sus items
- Borrar un **boat** pone `NULL` en quotes.boat_id y no afecta a quote_items (SET NULL)
- Borrar un **product** pone `NULL` en quote_items.product_id (SET NULL, porque el item guarda un snapshot del nombre)

# Dashboard y Admin

## Dashboard (Retailers)

El dashboard es la interfaz principal para que los retailers gestionen su configurador de velas. Se accede via `/dashboard` tras autenticarse con Supabase Auth.

### Rutas del Dashboard

Todas las rutas estan bajo el route group `(dashboard)` de Next.js, que comparte un layout con sidebar.

| Ruta | Pagina | Descripcion |
|---|---|---|
| `/dashboard` | Home | Vista general: stats rapidas, ultimos presupuestos, estado del plan |
| `/dashboard/boats` | Barcos | Lista de barcos del tenant (custom). Buscar y ver barcos globales |
| `/dashboard/products` | Productos | CRUD de productos de velas con campos de configuracion |
| `/dashboard/products/[id]` | Detalle producto | Editar producto, gestionar config fields y price modifiers |
| `/dashboard/quotes` | Presupuestos | Lista de presupuestos recibidos con filtros por estado |
| `/dashboard/quotes/[id]` | Detalle presupuesto | Ver detalle, cambiar estado (draft -> sent -> accepted/rejected) |
| `/dashboard/api-keys` | API Keys | Generar, ver y revocar claves API para el widget |
| `/dashboard/analytics` | Analiticas | Metricas de uso del widget: aperturas, busquedas, presupuestos |
| `/dashboard/theme` | Tema | Personalizar colores, fuentes y logo del configurador |
| `/dashboard/settings` | Configuracion | Datos de empresa, webhook URL, origenes permitidos, locale, moneda |

### Autenticacion en Server Pages

Cada server page del dashboard usa `getAuthenticatedTenant()` para obtener el usuario y tenant:

```typescript
import { getAuthenticatedTenant } from '@/lib/auth-page';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const auth = await getAuthenticatedTenant();
  if (!auth) redirect('/login');

  const { user, tenant } = auth;
  // ... render con datos del tenant
}
```

### Autenticacion en API Routes Internas

Las API routes del dashboard usan `withTenantAuth()`:

```typescript
import { withTenantAuth } from '@/lib/auth-helpers';

export const GET = withTenantAuth(async (req, { user, tenant }) => {
  // tenant.id disponible para filtrar queries
  // ...
});
```

## Panel de Administracion (Super Admin)

El panel admin es accesible solo para super admins (emails listados en `SUPER_ADMIN_EMAILS`). Se accede via `/admin`.

### Rutas del Admin

Todas bajo el route group `(admin)`.

| Ruta | Pagina | Descripcion |
|---|---|---|
| `/admin` | Dashboard | Vista general de la plataforma: total tenants, users, quotes |
| `/admin/boats` | Barcos globales | CRUD de la base de datos maestra de barcos (tenant_id = NULL) |
| `/admin/tenants` | Tenants | Lista de todos los tenants con plan, estado, fecha de creacion |
| `/admin/users` | Usuarios | Lista de usuarios registrados en la plataforma |
| `/admin/logs` | Logs | Registros de actividad |

### Impersonacion

Los super admins pueden "ver como" cualquier tenant:

1. En `/admin/tenants`, hacer clic en "Impersonar" junto al tenant deseado
2. Esto llama a `GET /api/admin/impersonate?tenantId=xxx`
3. Se establece una cookie `impersonate` con el `tenantId`
4. Se redirige a `/dashboard` que ahora muestra datos del tenant impersonado
5. Para volver al modo normal: `GET /api/admin/impersonate/stop`

La cookie de impersonacion:
- Dura 1 hora (`maxAge: 3600`)
- Es `httpOnly` (no accesible desde JavaScript del cliente)
- Es `secure` en produccion (solo HTTPS)
- Es `sameSite: 'strict'`

## Flujo de Trabajo del Retailer

### Setup inicial

1. **Crear cuenta:** El retailer se registra via Supabase Auth
2. **Crear tenant:** Se crea un tenant (internamente o por un super admin)
3. **Asociar miembro:** Se vincula el usuario al tenant como `owner` en `tenant_members`
4. **Configurar empresa:** En `/dashboard/settings`, completar datos de empresa
5. **Personalizar tema:** En `/dashboard/theme`, ajustar colores y fuentes

### Configurar productos

1. Ir a `/dashboard/products`
2. Crear producto: nombre, tipo de vela, precio base, descripcion
3. Anadir campos de configuracion (tejido, rizos, superficie) con opciones y modificadores de precio
4. Activar/desactivar productos
5. Ordenar productos con sort order

### Publicar widget

1. Ir a `/dashboard/api-keys`
2. Generar una nueva API key (se muestra una sola vez)
3. En `/dashboard/settings`, configurar `allowedOrigins` con los dominios donde se embebera el widget
4. Opcionalmente configurar `webhookUrl` para recibir notificaciones de presupuestos
5. Embeber el widget en la web del retailer (ver `docs/widget.md`)

### Gestionar presupuestos

1. Los presupuestos llegan automaticamente cuando un cliente usa el widget
2. En `/dashboard/quotes`, ver lista con filtros por estado
3. En el detalle, ver barco seleccionado, items con configuracion, datos del cliente
4. Cambiar estado: draft -> sent -> accepted/rejected/expired

## Plan Gates

### Permisos por plan

| Accion | prueba (trial) | pro + active | pro + past_due | canceled |
|---|---|---|---|---|
| Ver dashboard | Si | Si | Si (con banner) | No (pantalla bloqueada) |
| Crear productos | No | Si | No | No |
| Generar API keys | No | Si | No | No |
| Recibir presupuestos | No | Si | No | No |
| Editar tema | No | Si | Si | No |
| Editar configuracion | No | Si | Si | No |
| Widget funcional | No | Si | No | No |

### Banners en dashboard

| Estado | Banner |
|---|---|
| `prueba` | "Estas en modo prueba. Contacta con nosotros para activar tu configurador." |
| `pro + past_due` | "Tu pago esta pendiente. Tienes 7 dias para regularizar o tu cuenta sera suspendida." |
| `canceled` | Pantalla completa de bloqueo (no solo banner) |
| `pro + active` | Sin banner |

## Componentes Compartidos

El dashboard utiliza varios componentes reutilizables:

| Componente | Ubicacion | Descripcion |
|---|---|---|
| `Logo` | `components/` | Logo de Aerolume con variantes de tamano |
| `PageHeader` | `components/` | Cabecera de pagina con titulo, descripcion y acciones |
| `DataTable` | `components/` | Tabla de datos con ordenacion y paginacion |
| `SaveButton` | `components/` | Boton de guardar con estado de loading |
| `AppSidebar` | `components/` | Sidebar de navegacion del dashboard |
| UI components | `components/ui/` | Botones, inputs, selects, modales, etc. (Tailwind) |

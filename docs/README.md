# Aerolume - Vision General

## Que es Aerolume

Aerolume es una plataforma SaaS B2B de configuracion de velas para retailers nauticos. Permite a los distribuidores de velas ofrecer a sus clientes un configurador web embebible donde pueden:

1. Buscar su modelo de barco en una base de datos global
2. Ver los productos de velas compatibles con sus medidas
3. Configurar opciones (tejido, superficie, rizos, etc.)
4. Solicitar un presupuesto personalizado

Los retailers acceden a un dashboard donde gestionan sus productos, presupuestos, claves API, tema visual y analiticas.

## Tech Stack

| Tecnologia | Version | Uso |
|---|---|---|
| Node.js | 20+ | Runtime |
| pnpm | 10.33.0 | Package manager |
| Turborepo | ^2 | Monorepo build system |
| Next.js | 16.2.2 | Framework web (apps/web) |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Lenguaje |
| Tailwind CSS | ^4 | Estilos |
| Drizzle ORM | ^0.44.0 | ORM para PostgreSQL |
| PostgreSQL | 15+ | Base de datos (via Supabase) |
| Supabase | ^2.101.1 | Auth + DB hosting |
| Vite | ^6 | Build tool para widget |
| Zod | ^4.3.6 | Validacion de esquemas |
| React Three Fiber | ^9.5.0 | Visualizacion 3D |
| Three.js | ^0.183.2 | Motor 3D |
| Framer Motion | ^12.38.0 | Animaciones |
| Zustand | ^5.0.12 | State management |
| Lucide React | ^1.7.0 | Iconos |
| React Hook Form | ^7.72.0 | Formularios |

## Estructura del Monorepo

```
aerolume/
├── apps/
│   ├── web/                 # App principal Next.js (dashboard + API + landing + embed)
│   │   ├── src/
│   │   │   ├── app/         # App Router (pages, layouts, API routes)
│   │   │   │   ├── (dashboard)/  # Route group: dashboard con sidebar
│   │   │   │   ├── (admin)/      # Route group: panel super admin
│   │   │   │   ├── api/
│   │   │   │   │   ├── v1/       # API publica (autenticada con API key)
│   │   │   │   │   ├── internal/ # API interna (autenticada con Supabase session)
│   │   │   │   │   └── admin/    # API admin (solo super admins)
│   │   │   │   └── embed/        # Widget embebido (iframe)
│   │   │   ├── components/       # Componentes React
│   │   │   ├── hooks/            # Custom hooks
│   │   │   └── lib/              # Utilidades, auth, validaciones
│   │   └── package.json
│   │
│   └── widget/              # Widget JS embebible (Vite IIFE)
│       ├── src/
│       │   └── index.ts     # Loader que crea iframe + postMessage
│       ├── vite.config.ts
│       └── package.json
│
├── packages/
│   ├── db/                  # Esquema Drizzle + migraciones + seed
│   │   ├── src/
│   │   │   ├── schema/      # Definiciones de tablas
│   │   │   ├── client.ts    # Conexion a PostgreSQL
│   │   │   ├── index.ts     # Re-exports
│   │   │   └── seed.ts      # Script de datos iniciales
│   │   └── package.json
│   │
│   └── shared/              # Tipos y utilidades compartidas
│       ├── src/
│       │   ├── types/       # Interfaces TypeScript (api, boat, product, tenant)
│       │   ├── utils/       # Helpers (format, normalize, tenant)
│       │   └── index.ts
│       └── package.json
│
├── docs/                    # Documentacion
├── turbo.json               # Configuracion Turborepo
├── pnpm-workspace.yaml      # Workspace config
├── package.json             # Root scripts
└── .env.example             # Variables de entorno de ejemplo
```

## Requisitos Previos

- **Node.js** >= 20
- **pnpm** 10.33.0 (`corepack enable && corepack prepare pnpm@10.33.0 --activate`)
- **PostgreSQL** 15+ (proporcionado por Supabase)
- **Cuenta Supabase** con proyecto creado (para auth + DB)

## Setup Local Paso a Paso

```bash
# 1. Clonar el repositorio
git clone <repo-url> aerolume
cd aerolume

# 2. Instalar dependencias
pnpm install

# 3. Copiar variables de entorno
cp .env.example apps/web/.env.local

# 4. Configurar variables de entorno en apps/web/.env.local
#    (ver seccion "Variables de Entorno" mas abajo)

# 5. Generar y aplicar migraciones de base de datos
cd packages/db
pnpm generate
pnpm migrate

# 6. (Opcional) Ejecutar seed para datos de prueba
pnpm seed

# 7. Volver a la raiz e iniciar en modo desarrollo
cd ../..
pnpm dev
```

La app web estara disponible en `http://localhost:3000`.

## Scripts Disponibles

### Root (monorepo)

| Script | Comando | Descripcion |
|---|---|---|
| `dev` | `pnpm dev` | Arranca todas las apps en modo desarrollo |
| `dev:web` | `pnpm dev:web` | Arranca solo la app web |
| `build` | `pnpm build` | Build de produccion de todas las apps |
| `lint` | `pnpm lint` | Ejecuta linter en todas las apps/packages |

### packages/db

| Script | Comando | Descripcion |
|---|---|---|
| `generate` | `pnpm generate` | Genera migraciones a partir del schema |
| `migrate` | `pnpm migrate` | Aplica migraciones pendientes |
| `push` | `pnpm push` | Push directo del schema (sin migracion) |
| `studio` | `pnpm studio` | Abre Drizzle Studio (GUI para DB) |
| `seed` | `pnpm seed` | Ejecuta script de seed |

### apps/web

| Script | Comando | Descripcion |
|---|---|---|
| `dev` | `pnpm dev` | Next.js dev server |
| `build` | `pnpm build` | Build de produccion |
| `start` | `pnpm start` | Inicia server de produccion |
| `lint` | `pnpm lint` | ESLint |

### apps/widget

| Script | Comando | Descripcion |
|---|---|---|
| `dev` | `pnpm dev` | Vite dev server |
| `build` | `pnpm build` | Build IIFE para produccion |
| `lint` | `pnpm lint` | TypeScript check |

## Variables de Entorno

Todas las variables se configuran en `apps/web/.env.local`:

| Variable | Descripcion | Donde Obtenerla |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL | Supabase > Settings > Database > Connection string (URI) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Supabase > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anonima publica | Supabase > Settings > API > anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (server-side) | Supabase > Settings > API > service_role secret |
| `UPSTASH_REDIS_REST_URL` | URL REST de Upstash Redis | Upstash Console > REST API URL (para rate limiting, pendiente) |
| `UPSTASH_REDIS_REST_TOKEN` | Token REST de Upstash Redis | Upstash Console > REST API Token |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | Stripe Dashboard > API Keys |
| `STRIPE_WEBHOOK_SECRET` | Secreto del webhook de Stripe | Stripe Dashboard > Webhooks > Signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave publica de Stripe | Stripe Dashboard > API Keys > Publishable key |
| `NEXT_PUBLIC_APP_URL` | URL base de la app | `http://localhost:3000` en local, dominio en produccion |
| `SUPER_ADMIN_EMAILS` | Emails de super admins separados por coma | Definir manualmente (ej: `admin@aerolume.com,otro@aerolume.com`) |

> **Nota:** `SUPER_ADMIN_EMAILS` no aparece en `.env.example` pero es necesaria para acceder al panel de administracion. Se lee como una lista separada por comas.

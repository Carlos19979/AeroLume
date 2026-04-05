# Widget de Integracion

## Que es

El widget de Aerolume es un script JavaScript embebible que permite a los retailers nauticos integrar el configurador de velas directamente en su pagina web. Funciona creando un `<iframe>` que carga la aplicacion del configurador alojada en Aerolume.

## Arquitectura

```
Pagina del retailer              Aerolume
┌──────────────────────┐         ┌──────────────────────┐
│ <script aerolume.js> │         │ /embed?key=ak_xxx    │
│                      │         │                      │
│ ┌──────────────────┐ │  iframe │ ┌──────────────────┐ │
│ │ #aerolume-config │◄├─────────┤►│ Configurador     │ │
│ │    (iframe)      │ │  post   │ │ React App        │ │
│ │                  │◄├─Message─┤►│                  │ │
│ └──────────────────┘ │         │ └──────────────────┘ │
└──────────────────────┘         └──────────────────────┘
                                          │
                                    API v1 (x-api-key)
                                          │
                                    ┌─────▼─────┐
                                    │ PostgreSQL │
                                    └───────────┘
```

## Instalacion

### 1. Incluir el script

```html
<script src="https://cdn.aerolume.com/widget/v1/aerolume.js"></script>
```

### 2. Crear contenedor

```html
<div id="aerolume-configurator"></div>
```

### 3. Inicializar

```html
<script>
  Aerolume.init({
    apiKey: 'ak_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    container: '#aerolume-configurator',
  });
</script>
```

## Ejemplo Completo

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Configurador de Velas - Mi Veleria</title>
</head>
<body>
  <h1>Configura tus velas</h1>

  <div id="aerolume-configurator" style="max-width: 1200px; margin: 0 auto;"></div>

  <script src="https://cdn.aerolume.com/widget/v1/aerolume.js"></script>
  <script>
    Aerolume.init({
      apiKey: 'ak_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      container: '#aerolume-configurator',
      locale: 'es',
      theme: {
        primaryColor: '#0b5faa',
        logo: 'https://mi-veleria.com/logo.png',
      },
      onBoatSelected: function(boat) {
        console.log('Barco seleccionado:', boat);
      },
      onProductSelected: function(product) {
        console.log('Producto seleccionado:', product);
      },
      onQuoteCreated: function(quote) {
        console.log('Presupuesto creado:', quote);
        // Redirigir a pagina de agradecimiento, mostrar modal, etc.
        alert('Presupuesto enviado correctamente. Te contactaremos pronto.');
      },
    });
  </script>
</body>
</html>
```

## Opciones de Configuracion

La funcion `Aerolume.init()` acepta un objeto de configuracion:

| Opcion | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `apiKey` | string | Si | API key del tenant (formato `ak_xxx`) |
| `container` | string o HTMLElement | Si | Selector CSS o referencia al elemento contenedor |
| `theme` | object | No | Personalizacion visual |
| `theme.primaryColor` | string | No | Color primario (hex) |
| `theme.logo` | string | No | URL del logo |
| `locale` | string | No | Idioma del configurador (ej: 'es', 'en', 'fr') |
| `onBoatSelected` | function | No | Callback cuando el usuario selecciona un barco |
| `onProductSelected` | function | No | Callback cuando el usuario selecciona un producto |
| `onQuoteCreated` | function | No | Callback cuando se crea un presupuesto |

## Eventos

El widget emite eventos via callbacks que se pasan en la configuracion:

### `onBoatSelected(boat)`

Se dispara cuando el usuario selecciona un modelo de barco en la busqueda. El parametro `boat` contiene los datos del barco (modelo, medidas, areas).

### `onProductSelected(product)`

Se dispara cuando el usuario selecciona un producto de vela. El parametro `product` contiene los datos del producto (nombre, tipo, precio, opciones).

### `onQuoteCreated(quote)`

Se dispara cuando el usuario completa el formulario y se crea un presupuesto. El parametro `quote` contiene los datos basicos del presupuesto creado (id, estado).

## Comunicacion iframe <-> Host

El widget usa `window.postMessage` para comunicarse entre el iframe y la pagina del retailer.

### Seguridad

- El listener de mensajes verifica que `event.origin` coincida con el origen del embed (`app.aerolume.com` o `localhost:3000` en desarrollo)
- Se verifica que `event.source === iframe.contentWindow` para asegurar que el mensaje viene del iframe correcto

### Tipos de mensaje

| Tipo | Direccion | Payload | Descripcion |
|---|---|---|---|
| `aerolume:resize` | iframe -> host | `{ height: number }` | Ajusta la altura del iframe al contenido |
| `aerolume:boat-selected` | iframe -> host | Datos del barco | Dispara callback `onBoatSelected` |
| `aerolume:product-selected` | iframe -> host | Datos del producto | Dispara callback `onProductSelected` |
| `aerolume:quote-created` | iframe -> host | Datos del presupuesto | Dispara callback `onQuoteCreated` |

### Auto-resize

El iframe se auto-redimensiona enviando mensajes `aerolume:resize` con la altura del contenido. Esto evita que el iframe tenga barras de scroll innecesarias. La altura minima del iframe es de 600px.

## Build

El widget se construye con Vite en formato IIFE (Immediately Invoked Function Expression) para ser incluido como un solo script sin dependencias.

### Configuracion de build

Archivo: `apps/widget/vite.config.ts`

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Aerolume',
      fileName: 'aerolume',
      formats: ['iife'],
    },
    outDir: 'dist',
    minify: 'terser',
  },
});
```

### Comandos

```bash
# Desarrollo
cd apps/widget
pnpm dev

# Build de produccion
pnpm build
# Output: apps/widget/dist/aerolume.iife.js
```

### Output

El build produce un archivo `aerolume.iife.js` minificado con Terser que expone el objeto global `window.Aerolume` con el metodo `init()`.

## Deteccion de entorno

El widget detecta automaticamente si esta en desarrollo o produccion:

- Si `window.location.hostname === 'localhost'`, el iframe apunta a `http://localhost:3000/embed`
- En cualquier otro caso, apunta a `https://app.aerolume.com/embed`

## Requisitos del tenant

Para que el widget funcione, el tenant debe:

1. Tener plan `pro` con estado `active`
2. Tener al menos una API key valida (no expirada)
3. Tener productos activos configurados
4. (Recomendado) Configurar `allowedOrigins` en settings para mayor seguridad

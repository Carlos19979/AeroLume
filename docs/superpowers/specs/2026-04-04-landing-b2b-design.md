# Landing B2B Redesign — Design Spec

**Goal:** Transform the Aerolume marketing site from a consumer-facing sail configurator into a B2B SaaS landing page that sells the embeddable configurator to sail providers, chandleries, and boatyards.

**Pricing:** 2.500€ setup + 490€/month

**Aesthetic:** Premium and aspirational (Apple/Vercel inspired). Dark navy hero, elegant typography (Cormorant display + Manrope body), generous spacing, confidence in every element.

---

## Route structure

- `/` — B2B landing page (new)
- `/demo` — Public demo of the configurator using the demo tenant (new)
- `/about` — Keep as is (minor style updates later)
- `/contact` — Keep as is (minor style updates later)
- `/login`, `/signup` — Keep as is
- `/configurator` — Remove (replaced by `/demo`)

## Navigation changes

- Links: Inicio, Producto, Demo, Pricing, Contacto
- CTA: "Solicitar demo" (replaces "Configurar velas")
- Anchors: Producto → #producto, Demo → /demo, Pricing → #pricing

---

## Sections

### 1. Hero
- **Background:** Navy gradient (#0a2540 → #0f3460) with subtle radial glow
- **Title (Cormorant):** "El configurador de velas que vende por ti"
- **Subtitle (Manrope):** "Embebe un configurador premium en tu web. Tus clientes eligen barco, configuran la vela y solicitan presupuesto. Tu solo cierras la venta."
- **CTA primary:** "Solicitar demo" button (accent, large, links to /contact or signup)
- **CTA secondary:** "Ver demo en vivo →" text link (links to /demo)
- **Right side:** Mockup of the widget inside a browser chrome frame, showing Step 2 (products) with real data
- **Trust bar below:** "4.839 barcos · 9 tipos de vela · Integracion en minutos"

### 2. Social proof logos
- Light gray background
- Text: "Utilizado por proveedores de velas en toda Europa"
- 6 fictitious brand names as styled text: "Veleria Sur", "NordSails BCN", "Atlantic Voiles", "Mediterranean Sails", "Velature Ligure", "Porto Velas"
- Subtle, grayscale

### 3. Product pillars (id="producto")
- **Title:** "Todo lo que necesitas para vender velas online"
- **Subtitle:** "Tres herramientas. Un objetivo: que vendas mas."
- 3 large cards side by side:
  1. **Widget embebible** — Code icon — "Un configurador white-label que se integra en tu web con 3 lineas de codigo. Busqueda de barcos, seleccion de velas, precios en tiempo real."
  2. **Dashboard de gestion** — LayoutDashboard icon — "Productos, presupuestos, analytics y personalizacion desde un solo panel. Todo lo que necesitas para gestionar tus ventas."
  3. **API REST** — Plug icon — "Integra los datos de barcos y productos en tu sistema existente. Documentacion completa, API keys, webhooks."
- Each card: white bg, subtle border, icon in accent-tinted circle, hover lift

### 4. Demo section
- **Title:** "Pruebalo ahora"
- **Subtitle:** "Asi es como tus clientes configuraran sus velas"
- Browser chrome mockup (fake URL bar showing "tuveleria.com/configurador")
- Inside: the actual EmbedConfigurator component, live and functional, connected to demo tenant
- Below the demo: "¿Quieres verlo a pantalla completa?" link to /demo

### 5. Pricing section (id="pricing")
- Subtle gradient background
- **Title:** "Un precio. Sin sorpresas."
- Single centered card:
  - Setup: "2.500 €" with label "Configuracion inicial"
  - Monthly: "490 €/mes" with label "Todo incluido"
  - Feature list with checkmarks: Widget white-label, Dashboard completo, 4.839 barcos verificados, API REST, Analytics en tiempo real, Webhooks, Soporte tecnico, Actualizaciones continuas
  - CTA: "Empezar ahora" button
  - Below: "¿Mas de una tienda? Contacta para plan Enterprise →"

### 6. FAQ
- **Title:** "Preguntas frecuentes"
- Accordion style (click to expand)
- Questions:
  1. "¿Como se integra el widget?" — "Copia 3 lineas de codigo HTML en tu web. El widget se adapta automaticamente al estilo de tu sitio."
  2. "¿Puedo personalizar los colores y el logo?" — "Si. Desde el dashboard puedes cambiar colores, fuentes y añadir tu logo."
  3. "¿Que barcos incluye?" — "Nuestra base de datos tiene 4.839 modelos con medidas de aparejo verificadas. Si falta alguno, lo añadimos."
  4. "¿Hay compromiso de permanencia?" — "No. Puedes cancelar en cualquier momento. Sin penalizaciones."
  5. "¿Como funciona el soporte?" — "Email y chat. Respondemos en menos de 24 horas en dias laborables."
  6. "¿Puedo añadir mis propios barcos?" — "Si. Desde el dashboard puedes gestionar barcos personalizados que solo veran tus clientes."

### 7. Final CTA
- Navy background
- **Title (Cormorant):** "¿Listo para vender mas velas?"
- **Subtitle:** "Empieza hoy. Tu configurador estara listo en 48 horas."
- CTA: "Solicitar demo" button (white on navy)
- Trust: "Sin compromiso · Setup en 48h · Soporte incluido"

---

## Demo page (`/demo`)

- Minimal page, no marketing sections
- Header: "Demo del configurador — Aerolume" with link back to home
- Full-width EmbedConfigurator component (not in iframe, rendered directly)
- Connected to the demo tenant (Aerolume Demo) via a hardcoded demo API key
- Footer: "¿Te gusta lo que ves? Solicita tu propio configurador →" CTA

---

## Files to create/modify

### Create:
- `apps/web/src/app/(marketing)/page.tsx` — New B2B home (replace current)
- `apps/web/src/app/(marketing)/demo/page.tsx` — Demo page
- `apps/web/src/components/landing/Hero.tsx`
- `apps/web/src/components/landing/LogoBar.tsx`
- `apps/web/src/components/landing/ProductPillars.tsx`
- `apps/web/src/components/landing/DemoSection.tsx`
- `apps/web/src/components/landing/Pricing.tsx`
- `apps/web/src/components/landing/FAQ.tsx`
- `apps/web/src/components/landing/FinalCTA.tsx`

### Modify:
- `apps/web/src/components/layout/Navigation.tsx` — Update links and CTA
- `apps/web/src/components/layout/Footer.tsx` — Update copy for B2B

### Keep (no changes now):
- `apps/web/src/app/(marketing)/about/page.tsx`
- `apps/web/src/app/(marketing)/contact/page.tsx`

### Remove (or keep as archive):
- `apps/web/src/app/(marketing)/configurator/` — Replaced by /demo
- `apps/web/src/components/home/` — Old landing components (can delete after new ones work)

---

## Out of scope
- About page redesign
- Contact page redesign
- Auth pages redesign
- SEO/meta optimization
- Real client logos (use fictitious for now)

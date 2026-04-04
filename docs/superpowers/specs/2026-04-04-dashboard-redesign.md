# Dashboard Redesign — Design Spec

**Goal:** Elevate the Aerolume dashboard from functional-basic to premium SaaS that justifies 300 EUR/month. Warm, visual style with gradients, icons, and smooth animations.

**Style direction:** Warm and visual (Notion/Lemon Squeezy inspired), with light sidebar, gradient cards, and moderate Framer Motion animations.

---

## Design System Updates

### Colors (existing, no changes)
- Accent: `#0b5faa` (ocean blue)
- Accent dim: `#1a7fd4`
- Navy: `#0a2540`
- Text: `#0a1e3d`
- Text secondary: `#4a6382`
- Text muted: `#8899aa`
- Surface: `#f4f8fc`
- Warm CTA: `#ff6b35` (used sparingly)

### Typography (existing, no changes)
- Display: Cormorant (serif, headings)
- Body: Manrope (sans-serif, everything else)

### New design tokens
- Card radius: `rounded-2xl`
- Card shadow: `shadow-sm`, hover `shadow-md`
- Card gradient: `bg-gradient-to-br from-white to-blue-50/50` (varies by context)
- Focus ring: `ring-2 ring-accent/20`
- Active link bg: `bg-accent/10`
- Table row hover: `bg-accent/5`
- Transition default: `transition-all duration-200`

---

## Sidebar (Light)

**File:** `apps/web/src/app/(dashboard)/layout.tsx`

- Background: white, `border-r border-gray-200`
- Logo: "Aerolume" in Cormorant, navy color, top section with `h-16`
- Navigation links, each with:
  - Lucide icon (20px) on the left
  - Text label in Manrope
  - Icons: Home, Package, Ship, FileText, Palette, Key, BarChart3, Settings
- Active link: `bg-accent/10 text-accent font-medium` with 3px left border in accent
- Inactive link: `text-gray-500 hover:bg-gray-50 hover:text-gray-700`
- Bottom: user card with circular avatar (initial letter, accent bg), name, email truncated
- Mobile: same hamburger slide-out but with white bg instead of navy

---

## Header

**File:** `apps/web/src/app/(dashboard)/layout.tsx`

- White bg, `border-b border-gray-100`
- Left: page title (dynamic based on route) in `text-lg font-semibold text-gray-900`
- Right section:
  - Search input: `w-64` with Search icon, `placeholder="Buscar..."`, rounded-full, gray-100 bg
  - User avatar: circular, initial letter, accent bg, white text
  - Click avatar: dropdown with "Configuracion" link + "Cerrar sesion" button
- Mobile: hamburger button replaces search (search hidden on mobile)

---

## Dashboard Home (`/dashboard`)

**File:** `apps/web/src/app/(dashboard)/dashboard/page.tsx`

- Greeting: "Buenos dias, {name}" with current date below
- 4 metric cards in a row:
  - Products count (Package icon, blue gradient)
  - Quotes count (FileText icon, green gradient)
  - Boats count (Ship icon, purple gradient)
  - API calls / analytics events (BarChart3 icon, amber gradient)
- Each card: `rounded-2xl`, gradient bg (white to tinted), large Lucide icon in semi-transparent circle, number animates from 0 with Framer Motion
- Below: embed code snippet card (same as now but styled better)
- Below: quick actions row — "Nuevo producto", "Ver presupuestos", "Crear API key"

---

## Metric Cards Component

**File:** `apps/web/src/app/(dashboard)/components/metric-card.tsx`

```
Props: { title, value, icon, gradient, href }
```
- `rounded-2xl p-6`
- Background: `bg-gradient-to-br from-white to-{color}-50/50`
- Icon: Lucide component in a `w-12 h-12 rounded-xl bg-{color}-100/50` container
- Value: `text-3xl font-bold` animated with Framer Motion `useSpring`
- Title: `text-sm text-gray-500 mt-1`
- Hover: `scale-[1.02] shadow-md` transition
- Clickable: links to the relevant page

---

## Tables

All table pages (products, quotes, boats, api-keys) follow this pattern:

- No bg on thead, just `text-xs uppercase tracking-wider text-gray-400 border-b`
- Rows: `hover:bg-accent/5 transition-colors`
- Dividers: `divide-y divide-gray-100`
- Status badges: pill shape `rounded-full px-2.5 py-0.5 text-xs font-medium`
  - Draft/inactive: `bg-gray-100 text-gray-600`
  - Active/sent: `bg-blue-50 text-blue-700`
  - Accepted: `bg-green-50 text-green-700`
  - Rejected: `bg-red-50 text-red-600`
- Row actions: visible on hover only (opacity 0 → 1 transition)
- Pagination: rounded buttons, current page highlighted with accent bg

---

## Forms

All form pages (product edit, settings, theme, api-keys create):

- Labels: `text-sm font-medium text-gray-600 mb-1.5`
- Inputs: `border-gray-200 rounded-xl px-4 py-2.5` with `focus:ring-2 focus:ring-accent/20 focus:border-accent`
- Primary button: `bg-gradient-to-r from-accent to-accent-dim text-white rounded-xl px-6 py-2.5 shadow-sm hover:shadow-md`
- Secondary button: `border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50`
- Success feedback: toast notification (top-right, slide-in from right, auto-dismiss 3s)

---

## Animations (Framer Motion)

**File:** `apps/web/src/app/(dashboard)/components/animations.tsx`

Shared animation wrapper components:

- `FadeInUp`: fade + 20px slide up, staggered with `delay` prop
- `ScaleOnHover`: wraps children with `whileHover={{ scale: 1.02 }}`
- `AnimatedNumber`: counts from 0 to target value over 800ms
- `SlidePanel`: right-side panel entrance (translateX 100% → 0)
- `Toast`: slide-in from right + auto-dismiss

Page load: wrap sections in `FadeInUp` with stagger (index * 50ms).

---

## Specific Page Changes

### Products list
- Add Package icon in header
- Product cards in table show sail type as colored pill badge
- Active/inactive toggle is a styled switch instead of text button

### Product edit
- Two-column layout stays
- Config fields section: each field is a card with subtle border, expand animation on edit
- Price inputs show EUR symbol inline

### Quotes list
- Status filter pills with count badges
- Summary cards at top with gradients (same as dashboard metrics)
- Empty state: illustration-like icon + helpful text

### Quote detail
- Status badge large at top
- Timeline/flow indicator showing: Draft → Sent → Accepted
- Customer info in a clean card with avatar initial

### API Keys
- Key display in monospace with copy button that shows checkmark animation
- Created key banner with gradient green bg

### Boats
- Search input rounded-full with icon
- Detail panel slides in with animation
- Sail areas shown as horizontal bar indicators (proportional widths)

### Theme
- Preview updates live (already does)
- Color pickers in a grid with larger touch targets
- Font preview shows actual text in that font

### Analytics
- Bar chart with gradient bars (accent color fading to transparent at bottom)
- Hover tooltips styled with rounded corners and shadow
- Metric cards same as dashboard home

### Settings
- Sections as separate cards with subtle headers
- Subscription card with plan badge and upgrade CTA

---

## Files to create/modify

### Create (new shared components):
- `apps/web/src/app/(dashboard)/components/metric-card.tsx`
- `apps/web/src/app/(dashboard)/components/animations.tsx`
- `apps/web/src/app/(dashboard)/components/toast.tsx`
- `apps/web/src/app/(dashboard)/components/user-menu.tsx`

### Modify (all dashboard pages):
- `apps/web/src/app/(dashboard)/layout.tsx` — sidebar + header redesign
- `apps/web/src/app/(dashboard)/mobile-nav.tsx` — white theme
- `apps/web/src/app/(dashboard)/dashboard/page.tsx` — metric cards + quick actions
- `apps/web/src/app/(dashboard)/dashboard/products/client.tsx` — table + form styling
- `apps/web/src/app/(dashboard)/dashboard/products/[id]/client.tsx` — form styling
- `apps/web/src/app/(dashboard)/dashboard/quotes/client.tsx` — table + filters styling
- `apps/web/src/app/(dashboard)/dashboard/quotes/[id]/client.tsx` — detail styling
- `apps/web/src/app/(dashboard)/dashboard/api-keys/client.tsx` — key display styling
- `apps/web/src/app/(dashboard)/dashboard/boats/client.tsx` — table + panel styling
- `apps/web/src/app/(dashboard)/dashboard/theme/client.tsx` — editor styling
- `apps/web/src/app/(dashboard)/dashboard/analytics/client.tsx` — chart + cards styling
- `apps/web/src/app/(dashboard)/dashboard/settings/client.tsx` — sections styling

---

## Out of scope
- No new pages or features
- No backend changes
- No new dependencies (everything needed is already installed)
- Custom domain UI (Fase 2)

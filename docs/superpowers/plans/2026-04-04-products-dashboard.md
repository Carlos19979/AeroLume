# Products Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dashboard for tenants to list, create, edit, and toggle products, including managing configuration fields per product.

**Architecture:** Server components fetch data, client components handle interactivity. API routes at `/api/internal/products/` handle CRUD. Product edit page at `/dashboard/products/[id]` includes inline config field management. Follows the same patterns established by the API keys dashboard.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Drizzle ORM, Supabase Auth, Tailwind CSS 4

---

## File Structure

| File | Responsibility |
|---|---|
| `apps/web/src/app/api/internal/products/route.ts` | GET (list) + POST (create) products |
| `apps/web/src/app/api/internal/products/[id]/route.ts` | GET (single) + PUT (update) + DELETE product |
| `apps/web/src/app/api/internal/products/[id]/fields/route.ts` | POST (create) + PUT (update) + DELETE config fields |
| `apps/web/src/app/(dashboard)/dashboard/products/page.tsx` | Products list — server component |
| `apps/web/src/app/(dashboard)/dashboard/products/client.tsx` | Products list — client interactivity |
| `apps/web/src/app/(dashboard)/dashboard/products/[id]/page.tsx` | Product edit — server component |
| `apps/web/src/app/(dashboard)/dashboard/products/[id]/client.tsx` | Product edit form + config fields — client component |

---

### Task 1: Products API routes (list + create)

**Files:**
- Create: `apps/web/src/app/api/internal/products/route.ts`

- [ ] **Step 1: Create the products API route**

```ts
// apps/web/src/app/api/internal/products/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, products, eq } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';

// GET: list products for current tenant
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const list = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sailType: products.sailType,
      basePrice: products.basePrice,
      currency: products.currency,
      active: products.active,
      sortOrder: products.sortOrder,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(eq(products.tenantId, tenant.id));

  return NextResponse.json({ data: list });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// POST: create a new product
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const body = await request.json();
  if (!body.name || !body.sailType) {
    return NextResponse.json({ error: 'name and sailType are required' }, { status: 400 });
  }

  const [created] = await db
    .insert(products)
    .values({
      tenantId: tenant.id,
      name: body.name,
      slug: slugify(body.name),
      sailType: body.sailType,
      basePrice: body.basePrice || null,
      descriptionShort: body.descriptionShort || null,
      active: true,
    })
    .returning();

  return NextResponse.json({ data: created });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/api/internal/products/route.ts
git commit -m "feat: add products list and create API endpoints"
```

---

### Task 2: Single product API routes (get + update + delete)

**Files:**
- Create: `apps/web/src/app/api/internal/products/[id]/route.ts`

- [ ] **Step 1: Create the single product API route**

```ts
// apps/web/src/app/api/internal/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, products, productConfigFields, eq, and } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';

type RouteParams = { params: Promise<{ id: string }> };

// GET: single product with config fields
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.tenantId, tenant.id)))
    .limit(1);

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const fields = await db
    .select()
    .from(productConfigFields)
    .where(eq(productConfigFields.productId, id));

  return NextResponse.json({ data: { ...product, configFields: fields } });
}

// PUT: update product
export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  const body = await request.json();

  const [updated] = await db
    .update(products)
    .set({
      name: body.name,
      sailType: body.sailType,
      basePrice: body.basePrice,
      currency: body.currency,
      descriptionShort: body.descriptionShort,
      descriptionFull: body.descriptionFull,
      active: body.active,
      sortOrder: body.sortOrder,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, id), eq(products.tenantId, tenant.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ data: updated });
}

// DELETE: delete product
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return NextResponse.json({ error: 'No tenant' }, { status: 403 });

  await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.tenantId, tenant.id)));

  return NextResponse.json({ data: { deleted: true } });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/api/internal/products/[id]/route.ts
git commit -m "feat: add single product get, update, delete API endpoints"
```

---

### Task 3: Config fields API route

**Files:**
- Create: `apps/web/src/app/api/internal/products/[id]/fields/route.ts`

- [ ] **Step 1: Create the config fields API route**

```ts
// apps/web/src/app/api/internal/products/[id]/fields/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db, products, productConfigFields, eq, and } from '@aerolume/db';
import { getTenantForUser } from '@/lib/tenant';

type RouteParams = { params: Promise<{ id: string }> };

async function verifyProductOwnership(productId: string, userId: string) {
  const tenant = await getTenantForUser(userId);
  if (!tenant) return null;

  const [product] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.tenantId, tenant.id)))
    .limit(1);

  return product ? tenant : null;
}

// POST: create a new config field
export async function POST(request: Request, { params }: RouteParams) {
  const { id: productId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await verifyProductOwnership(productId, user.id);
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  if (!body.key || !body.label) {
    return NextResponse.json({ error: 'key and label are required' }, { status: 400 });
  }

  const [field] = await db
    .insert(productConfigFields)
    .values({
      productId,
      key: body.key,
      label: body.label,
      fieldType: body.fieldType || 'select',
      options: body.options || [],
      sortOrder: body.sortOrder || 0,
      required: body.required ?? true,
      priceModifiers: body.priceModifiers || {},
    })
    .returning();

  return NextResponse.json({ data: field });
}

// PUT: update a config field
export async function PUT(request: Request, { params }: RouteParams) {
  const { id: productId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await verifyProductOwnership(productId, user.id);
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Field id required' }, { status: 400 });

  const [updated] = await db
    .update(productConfigFields)
    .set({
      key: body.key,
      label: body.label,
      fieldType: body.fieldType,
      options: body.options,
      sortOrder: body.sortOrder,
      required: body.required,
      priceModifiers: body.priceModifiers,
    })
    .where(and(
      eq(productConfigFields.id, body.id),
      eq(productConfigFields.productId, productId),
    ))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Field not found' }, { status: 404 });

  return NextResponse.json({ data: updated });
}

// DELETE: delete a config field
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id: productId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await verifyProductOwnership(productId, user.id);
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const fieldId = searchParams.get('fieldId');
  if (!fieldId) return NextResponse.json({ error: 'fieldId required' }, { status: 400 });

  await db
    .delete(productConfigFields)
    .where(and(
      eq(productConfigFields.id, fieldId),
      eq(productConfigFields.productId, productId),
    ));

  return NextResponse.json({ data: { deleted: true } });
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/api/internal/products/[id]/fields/route.ts
git commit -m "feat: add config fields CRUD API for products"
```

---

### Task 4: Products list page

**Files:**
- Create: `apps/web/src/app/(dashboard)/dashboard/products/page.tsx`
- Create: `apps/web/src/app/(dashboard)/dashboard/products/client.tsx`

- [ ] **Step 1: Create the server component**

```tsx
// apps/web/src/app/(dashboard)/dashboard/products/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { db, products, eq } from '@aerolume/db';
import { ProductsClient } from './client';

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const tenant = await getTenantForUser(user.id);
  if (!tenant) {
    return (
      <div className="text-center py-12 text-gray-500">
        No tienes un workspace configurado.
      </div>
    );
  }

  const list = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sailType: products.sailType,
      basePrice: products.basePrice,
      currency: products.currency,
      active: products.active,
      sortOrder: products.sortOrder,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(eq(products.tenantId, tenant.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Productos</h2>
        <p className="text-gray-500 mt-1">
          Gestiona tu catálogo de velas y configuraciones.
        </p>
      </div>
      <ProductsClient initialProducts={list} />
    </div>
  );
}
```

- [ ] **Step 2: Create the client component**

```tsx
// apps/web/src/app/(dashboard)/dashboard/products/client.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SAIL_TYPE_LABELS: Record<string, string> = {
  gvstd: 'Mayor Clásica',
  gvfull: 'Mayor Full Batten',
  gve: 'Mayor Enrollable',
  gse: 'Génova Enrollable',
  gn: 'Génova Mosquetones',
  gen: 'Gennaker / Code 0',
  spisym: 'Spinnaker Simétrico',
  spiasy: 'Spinnaker Asimétrico',
  furling: 'Code S / Furling',
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sailType: string;
  basePrice: string | null;
  currency: string | null;
  active: boolean | null;
  sortOrder: number | null;
  createdAt: Date | null;
};

export function ProductsClient({ initialProducts }: { initialProducts: ProductRow[] }) {
  const [productsList, setProductsList] = useState(initialProducts);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSailType, setNewSailType] = useState('gvstd');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    if (!newName.trim()) return;
    setLoading(true);

    const res = await fetch('/api/internal/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, sailType: newSailType }),
    });
    const { data } = await res.json();

    setProductsList((prev) => [...prev, data]);
    setNewName('');
    setShowCreate(false);
    setLoading(false);
  }

  async function handleToggleActive(id: string, currentActive: boolean | null) {
    const newActive = !currentActive;
    await fetch(`/api/internal/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: newActive }),
    });
    setProductsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: newActive } : p))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    await fetch(`/api/internal/products/${id}`, { method: 'DELETE' });
    setProductsList((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      {/* Create form */}
      {showCreate ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Nuevo producto</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nombre del producto"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <select
              value={newSailType}
              onChange={(e) => setNewSailType(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {Object.entries(SAIL_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              disabled={loading || !newName.trim()}
              className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewName(''); }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg hover:opacity-90"
        >
          + Nuevo producto
        </button>
      )}

      {/* Products table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {productsList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No tienes productos. Crea uno para empezar.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tipo de vela</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Precio base</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productsList.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/dashboard/products/${product.id}`)}
                      className="text-gray-900 hover:text-[var(--accent)] font-medium"
                    >
                      {product.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                      {SAIL_TYPE_LABELS[product.sailType] || product.sailType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {product.basePrice
                      ? `${Number(product.basePrice).toFixed(2)} ${product.currency || 'EUR'}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(product.id, product.active)}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {product.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard/products/${product.id}`)}
                      className="text-[var(--accent)] hover:underline text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm --filter @aerolume/web build
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/(dashboard)/dashboard/products/
git commit -m "feat: add products list dashboard page with create/toggle/delete"
```

---

### Task 5: Product edit page with config fields

**Files:**
- Create: `apps/web/src/app/(dashboard)/dashboard/products/[id]/page.tsx`
- Create: `apps/web/src/app/(dashboard)/dashboard/products/[id]/client.tsx`

- [ ] **Step 1: Create the server component**

```tsx
// apps/web/src/app/(dashboard)/dashboard/products/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { getTenantForUser } from '@/lib/tenant';
import { db, products, productConfigFields, eq, and } from '@aerolume/db';
import { notFound } from 'next/navigation';
import { ProductEditClient } from './client';

type PageProps = { params: Promise<{ id: string }> };

export default async function ProductEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const tenant = await getTenantForUser(user.id);
  if (!tenant) return notFound();

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.tenantId, tenant.id)))
    .limit(1);

  if (!product) return notFound();

  const fields = await db
    .select()
    .from(productConfigFields)
    .where(eq(productConfigFields.productId, id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <a href="/dashboard/products" className="text-gray-400 hover:text-gray-600">
          &larr; Productos
        </a>
        <h2 className="text-2xl font-semibold text-gray-900">{product.name}</h2>
      </div>
      <ProductEditClient product={product} initialFields={fields} />
    </div>
  );
}
```

- [ ] **Step 2: Create the client component**

```tsx
// apps/web/src/app/(dashboard)/dashboard/products/[id]/client.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SAIL_TYPE_LABELS: Record<string, string> = {
  gvstd: 'Mayor Clásica',
  gvfull: 'Mayor Full Batten',
  gve: 'Mayor Enrollable',
  gse: 'Génova Enrollable',
  gn: 'Génova Mosquetones',
  gen: 'Gennaker / Code 0',
  spisym: 'Spinnaker Simétrico',
  spiasy: 'Spinnaker Asimétrico',
  furling: 'Code S / Furling',
};

type Product = {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  sailType: string;
  basePrice: string | null;
  currency: string | null;
  descriptionShort: string | null;
  descriptionFull: string | null;
  active: boolean | null;
  sortOrder: number | null;
  [key: string]: any;
};

type ConfigField = {
  id: string;
  productId: string;
  key: string;
  label: string;
  fieldType: string | null;
  options: any;
  sortOrder: number | null;
  required: boolean | null;
  priceModifiers: any;
};

export function ProductEditClient({
  product: initialProduct,
  initialFields,
}: {
  product: Product;
  initialFields: ConfigField[];
}) {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [fields, setFields] = useState(initialFields);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Product form state
  const [name, setName] = useState(product.name);
  const [sailType, setSailType] = useState(product.sailType);
  const [basePrice, setBasePrice] = useState(product.basePrice || '');
  const [descriptionShort, setDescriptionShort] = useState(product.descriptionShort || '');
  const [active, setActive] = useState(product.active ?? true);

  // New field form
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldOptions, setNewFieldOptions] = useState('');

  async function handleSaveProduct() {
    setSaving(true);
    const res = await fetch(`/api/internal/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        sailType,
        basePrice: basePrice || null,
        descriptionShort: descriptionShort || null,
        active,
      }),
    });
    const { data } = await res.json();
    if (data) setProduct(data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleAddField() {
    if (!newFieldKey.trim() || !newFieldLabel.trim()) return;

    const options = newFieldOptions
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    const res = await fetch(`/api/internal/products/${product.id}/fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: newFieldKey,
        label: newFieldLabel,
        fieldType: 'select',
        options,
        sortOrder: fields.length,
      }),
    });
    const { data } = await res.json();

    setFields((prev) => [...prev, data]);
    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldOptions('');
    setShowAddField(false);
  }

  async function handleDeleteField(fieldId: string) {
    if (!confirm('¿Eliminar este campo de configuración?')) return;

    await fetch(`/api/internal/products/${product.id}/fields?fieldId=${fieldId}`, {
      method: 'DELETE',
    });
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: product form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Información del producto</h3>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo de vela</label>
              <select
                value={sailType}
                onChange={(e) => setSailType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {Object.entries(SAIL_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Precio base (EUR)</label>
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Descripción corta</label>
            <textarea
              value={descriptionShort}
              onChange={(e) => setDescriptionShort(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Estado:</label>
            <button
              onClick={() => setActive(!active)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {active ? 'Activo' : 'Inactivo'}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSaveProduct}
              disabled={saving}
              className="px-4 py-2 bg-[var(--accent)] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saved && (
              <span className="text-sm text-green-600 self-center">Guardado</span>
            )}
          </div>
        </div>

        {/* Config fields */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Campos de configuración</h3>
            <button
              onClick={() => setShowAddField(true)}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              + Añadir campo
            </button>
          </div>

          {showAddField && (
            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Clave (key)</label>
                  <input
                    type="text"
                    placeholder="ej: surface, fabric"
                    value={newFieldKey}
                    onChange={(e) => setNewFieldKey(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Etiqueta</label>
                  <input
                    type="text"
                    placeholder="ej: Superficie (m²)"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Opciones (separadas por coma)
                </label>
                <input
                  type="text"
                  placeholder="ej: 6.10, 7.50, 9.14, 12.20"
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddField}
                  className="px-3 py-1.5 bg-[var(--accent)] text-white text-sm rounded-lg hover:opacity-90"
                >
                  Añadir
                </button>
                <button
                  onClick={() => setShowAddField(false)}
                  className="px-3 py-1.5 text-sm text-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {fields.length === 0 ? (
            <p className="text-sm text-gray-400">No hay campos de configuración.</p>
          ) : (
            <div className="space-y-2">
              {fields
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between border rounded-lg px-4 py-3"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {field.label}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">({field.key})</span>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {Array.isArray(field.options) && field.options.length > 0
                          ? `${field.options.length} opciones: ${(field.options as string[]).slice(0, 3).join(', ')}${(field.options as string[]).length > 3 ? '...' : ''}`
                          : 'Sin opciones'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: sidebar info */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-3">Detalles</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Slug</dt>
              <dd className="font-mono text-gray-900">{product.slug}</dd>
            </div>
            <div>
              <dt className="text-gray-500">ID externo</dt>
              <dd className="font-mono text-gray-900">{product.externalId || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Campos configurables</dt>
              <dd className="text-gray-900">{fields.length}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Creado</dt>
              <dd className="text-gray-900">
                {product.createdAt
                  ? new Date(product.createdAt).toLocaleDateString('es')
                  : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm --filter @aerolume/web build
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/(dashboard)/dashboard/products/[id]/
git commit -m "feat: add product edit page with config fields management"
```

---

### Task 6: Build verification and final commit

- [ ] **Step 1: Full build**

```bash
pnpm --filter @aerolume/web build
```

Expected routes in output:
- `/dashboard/products`
- `/dashboard/products/[id]`
- `/api/internal/products`
- `/api/internal/products/[id]`
- `/api/internal/products/[id]/fields`

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete products dashboard with CRUD, config fields, and edit page"
```

---

## Summary

| Task | What it builds | Files |
|---|---|---|
| 1 | Products list + create API | `api/internal/products/route.ts` |
| 2 | Single product get/update/delete API | `api/internal/products/[id]/route.ts` |
| 3 | Config fields CRUD API | `api/internal/products/[id]/fields/route.ts` |
| 4 | Products list dashboard page | `products/page.tsx` + `client.tsx` |
| 5 | Product edit page + config fields UI | `products/[id]/page.tsx` + `client.tsx` |
| 6 | Build verification | — |

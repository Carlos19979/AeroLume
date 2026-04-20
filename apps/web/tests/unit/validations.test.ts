import { describe, it, expect } from 'vitest';
import {
  numericString,
  createProductSchema,
  updateProductSchema,
  createQuoteSchema,
  updateQuoteSchema,
  updateBoatSchema,
  updateTenantSettingsSchema,
  updateThemeSchema,
  createConfigFieldSchema,
  updateConfigFieldSchema,
  createTenantSchema,
  createAnalyticsEventSchema,
} from '@/lib/validations';

// ---------------------------------------------------------------------------
// numericString
// ---------------------------------------------------------------------------
describe('numericString', () => {
  it('accepts a plain number', () => {
    expect(numericString.safeParse(42).success).toBe(true);
  });

  it('accepts a numeric string', () => {
    expect(numericString.safeParse('3.14').success).toBe(true);
  });

  it('rejects a non-numeric string', () => {
    const r = numericString.safeParse('abc');
    expect(r.success).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(numericString.safeParse('').success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createProductSchema
// ---------------------------------------------------------------------------
describe('createProductSchema', () => {
  const valid = { name: 'Mayor Clásica', sailType: 'gvstd' };

  it('accepts a minimal valid product', () => {
    expect(createProductSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts optional basePrice as number', () => {
    expect(createProductSchema.safeParse({ ...valid, basePrice: 120 }).success).toBe(true);
  });

  it('rejects empty name (min 1)', () => {
    const r = createProductSchema.safeParse({ ...valid, name: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toContain('name');
  });

  it('rejects an unknown sailType', () => {
    const r = createProductSchema.safeParse({ ...valid, sailType: 'unknown' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toContain('sailType');
  });

  it('rejects missing name', () => {
    const r = createProductSchema.safeParse({ sailType: 'gvstd' });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateProductSchema
// ---------------------------------------------------------------------------
describe('updateProductSchema', () => {
  it('accepts all fields optional (empty object)', () => {
    expect(updateProductSchema.safeParse({}).success).toBe(true);
  });

  it('accepts valid partial update', () => {
    expect(updateProductSchema.safeParse({ name: 'Updated', active: false }).success).toBe(true);
  });

  it('rejects invalid url in images array', () => {
    const r = updateProductSchema.safeParse({ images: ['not-a-url'] });
    expect(r.success).toBe(false);
  });

  it('rejects empty name string (min 1)', () => {
    const r = updateProductSchema.safeParse({ name: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toContain('name');
  });
});

// ---------------------------------------------------------------------------
// createQuoteSchema
// ---------------------------------------------------------------------------
describe('createQuoteSchema', () => {
  const validItem = {
    sailType: 'gvstd',
    productName: 'Mayor',
    quantity: 1,
  };
  const valid = {
    boatModel: 'Bavaria 38',
    items: [validItem],
  };

  it('accepts a minimal valid quote', () => {
    expect(createQuoteSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty boatModel (min 1)', () => {
    const r = createQuoteSchema.safeParse({ ...valid, boatModel: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toContain('boatModel');
  });

  it('rejects empty items array (min 1)', () => {
    const r = createQuoteSchema.safeParse({ ...valid, items: [] });
    expect(r.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const r = createQuoteSchema.safeParse({ ...valid, customerEmail: 'not-an-email' });
    expect(r.success).toBe(false);
  });

  it('accepts null customerPhone (nullable)', () => {
    expect(createQuoteSchema.safeParse({ ...valid, customerPhone: null }).success).toBe(true);
  });

  it('accepts null customerNotes (nullable)', () => {
    expect(createQuoteSchema.safeParse({ ...valid, customerNotes: null }).success).toBe(true);
  });

  it('accepts null customerEmail (nullable)', () => {
    expect(createQuoteSchema.safeParse({ ...valid, customerEmail: null }).success).toBe(true);
  });

  it('accepts null customerName (nullable)', () => {
    expect(createQuoteSchema.safeParse({ ...valid, customerName: null }).success).toBe(true);
  });

  it('accepts null productId in items (nullable)', () => {
    const r = createQuoteSchema.safeParse({
      ...valid,
      items: [{ ...validItem, productId: null }],
    });
    expect(r.success).toBe(true);
  });

  it('accepts null sailArea in items (nullable)', () => {
    const r = createQuoteSchema.safeParse({
      ...valid,
      items: [{ ...validItem, sailArea: null }],
    });
    expect(r.success).toBe(true);
  });

  it('accepts null unitPrice in items (nullable)', () => {
    const r = createQuoteSchema.safeParse({
      ...valid,
      items: [{ ...validItem, unitPrice: null }],
    });
    expect(r.success).toBe(true);
  });

  it('rejects invalid uuid productId', () => {
    const r = createQuoteSchema.safeParse({
      ...valid,
      items: [{ ...validItem, productId: 'not-a-uuid' }],
    });
    expect(r.success).toBe(false);
  });

  it('defaults currency to EUR', () => {
    const r = createQuoteSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.currency).toBe('EUR');
  });
});

// ---------------------------------------------------------------------------
// updateQuoteSchema
// ---------------------------------------------------------------------------
describe('updateQuoteSchema', () => {
  it('accepts empty object', () => {
    expect(updateQuoteSchema.safeParse({}).success).toBe(true);
  });

  it('accepts valid status values', () => {
    for (const status of ['draft', 'sent', 'accepted', 'rejected', 'expired']) {
      expect(updateQuoteSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    const r = updateQuoteSchema.safeParse({ status: 'unknown' });
    expect(r.success).toBe(false);
  });

  it('accepts empty string for customerEmail (literal empty allowed)', () => {
    expect(updateQuoteSchema.safeParse({ customerEmail: '' }).success).toBe(true);
  });

  it('rejects malformed customerEmail', () => {
    const r = updateQuoteSchema.safeParse({ customerEmail: 'bad@' });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateBoatSchema
// ---------------------------------------------------------------------------
describe('updateBoatSchema', () => {
  it('accepts empty object', () => {
    expect(updateBoatSchema.safeParse({}).success).toBe(true);
  });

  it('accepts null for nullable numeric fields', () => {
    expect(updateBoatSchema.safeParse({ length: null, i: null, j: null }).success).toBe(true);
  });

  it('accepts numeric boat dimensions', () => {
    expect(updateBoatSchema.safeParse({ length: '12.5', i: '14', j: '4.5', p: '13', e: '4' }).success).toBe(true);
  });

  it('rejects empty model (min 1)', () => {
    const r = updateBoatSchema.safeParse({ model: '' });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateTenantSettingsSchema
// ---------------------------------------------------------------------------
describe('updateTenantSettingsSchema', () => {
  it('accepts empty object', () => {
    expect(updateTenantSettingsSchema.safeParse({}).success).toBe(true);
  });

  it('accepts null webhookUrl (nullable)', () => {
    expect(updateTenantSettingsSchema.safeParse({ webhookUrl: null }).success).toBe(true);
  });

  it('rejects malformed webhookUrl', () => {
    const r = updateTenantSettingsSchema.safeParse({ webhookUrl: 'not-a-url' });
    expect(r.success).toBe(false);
  });

  it('rejects malformed companyEmail', () => {
    const r = updateTenantSettingsSchema.safeParse({ companyEmail: 'bad-email' });
    expect(r.success).toBe(false);
  });

  it('accepts valid website url', () => {
    expect(updateTenantSettingsSchema.safeParse({ website: 'https://example.com' }).success).toBe(true);
  });

  it('accepts empty string for website', () => {
    expect(updateTenantSettingsSchema.safeParse({ website: '' }).success).toBe(true);
  });

  it('accepts array of valid allowedOrigins', () => {
    expect(updateTenantSettingsSchema.safeParse({ allowedOrigins: ['https://example.com'] }).success).toBe(true);
  });

  it('rejects invalid url in allowedOrigins', () => {
    const r = updateTenantSettingsSchema.safeParse({ allowedOrigins: ['not-a-url'] });
    expect(r.success).toBe(false);
  });

  it('rejects empty name (min 1)', () => {
    const r = updateTenantSettingsSchema.safeParse({ name: '' });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateThemeSchema
// ---------------------------------------------------------------------------
describe('updateThemeSchema', () => {
  it('accepts empty object', () => {
    expect(updateThemeSchema.safeParse({}).success).toBe(true);
  });

  it('accepts valid hex colors', () => {
    expect(updateThemeSchema.safeParse({ themeAccent: '#ff0000', themeNavy: '#0a2540' }).success).toBe(true);
  });

  it('rejects invalid hex color (missing #)', () => {
    const r = updateThemeSchema.safeParse({ themeAccent: 'ff0000' });
    expect(r.success).toBe(false);
  });

  it('rejects short hex color', () => {
    const r = updateThemeSchema.safeParse({ themeAccent: '#fff' });
    expect(r.success).toBe(false);
  });

  it('accepts null logoUrl (nullable)', () => {
    expect(updateThemeSchema.safeParse({ logoUrl: null }).success).toBe(true);
  });

  it('accepts empty string for logoUrl', () => {
    expect(updateThemeSchema.safeParse({ logoUrl: '' }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// createConfigFieldSchema
// ---------------------------------------------------------------------------
describe('createConfigFieldSchema', () => {
  const valid = {
    key: 'color',
    label: 'Color de la vela',
    fieldType: 'select' as const,
    options: ['blanco', 'azul'],
  };

  it('accepts a valid config field', () => {
    expect(createConfigFieldSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty key (min 1)', () => {
    const r = createConfigFieldSchema.safeParse({ ...valid, key: '' });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toContain('key');
  });

  it('rejects invalid fieldType', () => {
    const r = createConfigFieldSchema.safeParse({ ...valid, fieldType: 'checkbox' });
    expect(r.success).toBe(false);
  });

  it('defaults fieldType to select', () => {
    const r = createConfigFieldSchema.safeParse({ key: 'x', label: 'X' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.fieldType).toBe('select');
  });

  it('defaults required to false', () => {
    const r = createConfigFieldSchema.safeParse({ key: 'x', label: 'X' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.required).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateConfigFieldSchema
// ---------------------------------------------------------------------------
describe('updateConfigFieldSchema', () => {
  it('accepts valid update with uuid id', () => {
    expect(updateConfigFieldSchema.safeParse({ id: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(true);
  });

  it('rejects missing id', () => {
    const r = updateConfigFieldSchema.safeParse({ key: 'color' });
    expect(r.success).toBe(false);
  });

  it('rejects non-uuid id', () => {
    const r = updateConfigFieldSchema.safeParse({ id: 'not-a-uuid' });
    expect(r.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createAnalyticsEventSchema
// ---------------------------------------------------------------------------
describe('createAnalyticsEventSchema', () => {
  it('accepts a valid event', () => {
    expect(createAnalyticsEventSchema.safeParse({ eventType: 'configurator_opened' }).success).toBe(true);
  });

  it('accepts all known eventType values', () => {
    const types = ['configurator_opened', 'boat_search', 'product_view', 'quote_created'];
    for (const eventType of types) {
      expect(createAnalyticsEventSchema.safeParse({ eventType }).success).toBe(true);
    }
  });

  it('rejects unknown eventType', () => {
    const r = createAnalyticsEventSchema.safeParse({ eventType: 'unknown_event' });
    expect(r.success).toBe(false);
  });

  it('rejects missing eventType', () => {
    const r = createAnalyticsEventSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it('accepts optional uuid productId', () => {
    expect(createAnalyticsEventSchema.safeParse({ eventType: 'product_view', productId: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(true);
  });

  it('rejects invalid uuid productId', () => {
    const r = createAnalyticsEventSchema.safeParse({ eventType: 'product_view', productId: 'not-uuid' });
    expect(r.success).toBe(false);
  });
});

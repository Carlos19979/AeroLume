import { z } from 'zod';

/** Accepts a number or numeric string and outputs a string (for Drizzle `numeric()` columns). */
export const numericString = z.union([z.number(), z.string()])
  .transform((v) => String(v))
  .pipe(z.string().regex(/^-?\d+(\.\d+)?$/));

/** sortOrder is an integer column, not numeric — keep as number. */
const intNumber = z.coerce.number().int();

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  sailType: z.enum(['gvstd', 'gvfull', 'gve', 'gse', 'gn', 'spiasy', 'spisym', 'furling', 'gen']),
  basePrice: numericString.optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  sailType: z.enum(['gvstd', 'gvfull', 'gve', 'gse', 'gn', 'spiasy', 'spisym', 'furling', 'gen']).optional(),
  basePrice: numericString.optional(),
  currency: z.string().max(3).optional(),
  descriptionShort: z.string().max(500).optional(),
  active: z.boolean().optional(),
  images: z.array(z.string().url()).optional(),
  sortOrder: intNumber.optional(),
});

export const createQuoteSchema = z.object({
  boatId: z.string().uuid().optional(),
  boatModel: z.string().min(1).max(200),
  boatLength: numericString.optional(),
  customerName: z.string().min(1).max(200).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().max(30).optional(),
  customerNotes: z.string().max(2000).optional(),
  currency: z.string().max(3).default('EUR'),
  items: z.array(z.object({
    productId: z.string().uuid().optional(),
    sailType: z.string(),
    productName: z.string(),
    sailArea: numericString.optional(),
    quantity: intNumber.min(1).default(1),
    unitPrice: numericString.optional(),
    configuration: z.record(z.string(), z.unknown()).optional(),
  })).min(1),
});

export const updateQuoteSchema = z.object({
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).optional(),
  totalPrice: numericString.optional(),
  customerName: z.string().max(200).optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().max(30).optional(),
  customerNotes: z.string().max(2000).optional(),
});

export const updateBoatSchema = z.object({
  model: z.string().min(1).max(200).optional(),
  boatModel: z.string().max(200).optional(),
  length: numericString.optional().nullable(),
  isMultihull: z.boolean().optional(),
  i: numericString.optional().nullable(),
  j: numericString.optional().nullable(),
  p: numericString.optional().nullable(),
  e: numericString.optional().nullable(),
});

export const updateTenantSettingsSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  webhookUrl: z.string().url().optional().nullable(),
  allowedOrigins: z.array(z.string().url()).optional(),
  locale: z.string().max(10).optional(),
  currency: z.string().max(3).optional(),
  companyName: z.string().max(200).optional(),
  companyEmail: z.string().email().optional(),
  companyPhone: z.string().max(30).optional(),
  companyAddress: z.string().max(500).optional(),
  phone: z.string().max(30).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  country: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  customDomain: z.string().max(253).optional().nullable(),
});

export const updateThemeSchema = z.object({
  themeAccent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  themeAccentDim: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  themeNavy: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  themeSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  themeBackground: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  themeText: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  themeFontDisplay: z.string().max(100).optional(),
  themeFontBody: z.string().max(100).optional(),
  themeColorMain: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  themeColorHead: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  themeColorSpi: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  logoUrl: z.string().url().optional().nullable().or(z.literal('')),
  fontHeading: z.string().max(100).optional(),
  fontBody: z.string().max(100).optional(),
});

export const createConfigFieldSchema = z.object({
  key: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  fieldType: z.enum(['select', 'radio', 'number', 'text']).default('select'),
  options: z.array(z.string()).optional(),
  sortOrder: z.coerce.number().int().optional(),
  required: z.boolean().default(false),
  priceModifiers: z.record(z.number()).optional(),
});

export const updateConfigFieldSchema = createConfigFieldSchema.partial().extend({
  id: z.string().uuid(),
});

export const createTenantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  companyName: z.string().max(200).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),
  country: z.string().max(100).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
});

export const createAnalyticsEventSchema = z.object({
  eventType: z.enum(['configurator_opened', 'boat_search', 'product_view', 'quote_created', 'quote_sent', 'quote_accepted', 'quote_rejected']),
  boatModel: z.string().max(200).optional(),
  productId: z.string().uuid().optional(),
  sailType: z.string().max(20).optional(),
  metadata: z.record(z.unknown()).optional(),
  sessionId: z.string().max(100).optional(),
});

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return { error: result.error.issues.map(i => i.message).join(', ') };
  }
  return { data: result.data };
}

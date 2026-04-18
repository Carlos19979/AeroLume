/**
 * Server-authoritative pricing for a quote line.
 *
 * Given a product + its pricing tiers + config fields, looks up the tier that
 * matches the sail area and applies flat / percent option modifiers to produce
 * both the customer-facing MSRP and the internal cost.
 *
 * Design notes:
 *  - Flat modifiers add to both cost and MSRP by the same amount (preserves margin).
 *  - Percent modifiers (e.g. "3 rizos": 0.10) multiply both cost and MSRP equally.
 *  - If no tier matches, falls back to product-level basePrice / costPerSqm.
 */

type Product = {
  id: string;
  basePrice: string | null;
  costPerSqm: string | null;
};

type Tier = {
  productId: string;
  minSqm: string;
  maxSqm: string;
  costPerSqm: string;
  msrpPerSqm: string;
};

type ConfigField = {
  productId: string;
  key: string;
  priceModifiers: unknown;
  percentModifiers: unknown;
};

export type PricedLine = { cost: number; msrp: number };

function num(value: string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  return isFinite(n) ? n : 0;
}

function findTier(tiers: Tier[], area: number): Tier | null {
  for (const t of tiers) {
    const min = num(t.minSqm);
    const max = num(t.maxSqm);
    if (area >= min && area <= max) return t;
  }
  return null;
}

export function priceItem(input: {
  product: Product | null | undefined;
  tiers: Tier[];
  fields: ConfigField[];
  sailArea: number | null;
  configuration: Record<string, string>;
}): PricedLine | null {
  const { product, tiers, fields, sailArea, configuration } = input;
  if (!product || !sailArea || sailArea <= 0) return null;

  const tier = findTier(tiers, sailArea);
  const costPerSqm = tier ? num(tier.costPerSqm) : num(product.costPerSqm);
  const msrpPerSqm = tier ? num(tier.msrpPerSqm) : num(product.basePrice);
  if (!costPerSqm && !msrpPerSqm) return null;

  let flatAdd = 0;
  let percentAdd = 0;
  for (const field of fields) {
    const selected = configuration[field.key];
    if (!selected) continue;
    const flat = field.priceModifiers as Record<string, number> | null;
    const pct = field.percentModifiers as Record<string, number> | null;
    if (flat && typeof flat[selected] === 'number') flatAdd += flat[selected];
    if (pct && typeof pct[selected] === 'number') percentAdd += pct[selected];
  }

  const baseCost = sailArea * costPerSqm + flatAdd;
  const baseMsrp = sailArea * msrpPerSqm + flatAdd;
  const multiplier = 1 + percentAdd;

  return {
    cost: baseCost * multiplier,
    msrp: baseMsrp * multiplier,
  };
}

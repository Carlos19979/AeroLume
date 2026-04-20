import { describe, it, expect } from 'vitest';
import { priceItem } from '@/lib/pricing';

const product = { id: 'p1', basePrice: '170', costPerSqm: '120' };

const tier20to40 = {
  productId: 'p1',
  minSqm: '20',
  maxSqm: '40',
  costPerSqm: '120',
  msrpPerSqm: '170',
};

function field(key: string, extras: {
  cost?: Record<string, number>;
  msrp?: Record<string, number>;
  pct?: Record<string, number>;
}) {
  return {
    productId: 'p1',
    key,
    costModifiers: extras.cost ?? null,
    msrpModifiers: extras.msrp ?? null,
    percentModifiers: extras.pct ?? null,
  };
}

describe('priceItem — guards', () => {
  it('returns null when product is null', () => {
    expect(priceItem({ product: null, tiers: [], fields: [], sailArea: 25, configuration: {} })).toBeNull();
  });

  it('returns null when sailArea is non-positive', () => {
    expect(priceItem({ product, tiers: [], fields: [], sailArea: 0, configuration: {} })).toBeNull();
  });

  it('returns null when both perSqm values resolve to zero', () => {
    const blank = { id: 'p2', basePrice: null, costPerSqm: null };
    expect(priceItem({ product: blank, tiers: [], fields: [], sailArea: 10, configuration: {} })).toBeNull();
  });
});

describe('priceItem — base + tier selection', () => {
  it('uses product basePrice / costPerSqm when no tier matches', () => {
    const r = priceItem({ product, tiers: [], fields: [], sailArea: 30, configuration: {} });
    expect(r).toEqual({ cost: 30 * 120, msrp: 30 * 170 });
  });

  it('uses tier perSqm values when sailArea falls inside a tier', () => {
    const altTier = { ...tier20to40, costPerSqm: '100', msrpPerSqm: '150' };
    const r = priceItem({ product, tiers: [altTier], fields: [], sailArea: 30, configuration: {} });
    expect(r).toEqual({ cost: 30 * 100, msrp: 30 * 150 });
  });

  it('falls back to base when sailArea is outside all tiers', () => {
    const r = priceItem({ product, tiers: [tier20to40], fields: [], sailArea: 50, configuration: {} });
    expect(r).toEqual({ cost: 50 * 120, msrp: 50 * 170 });
  });
});

describe('priceItem — flat modifiers (cost vs msrp split)', () => {
  it('applies costModifiers only to cost subtotal', () => {
    const f = field('color', { cost: { premium: 80 } });
    const r = priceItem({ product, tiers: [], fields: [f], sailArea: 30, configuration: { color: 'premium' } });
    expect(r).toEqual({ cost: 30 * 120 + 80, msrp: 30 * 170 });
  });

  it('applies msrpModifiers only to msrp subtotal', () => {
    const f = field('color', { msrp: { premium: 120 } });
    const r = priceItem({ product, tiers: [], fields: [f], sailArea: 30, configuration: { color: 'premium' } });
    expect(r).toEqual({ cost: 30 * 120, msrp: 30 * 170 + 120 });
  });

  it('books margin when msrpModifier > costModifier on the same option', () => {
    const f = field('color', { cost: { premium: 80 }, msrp: { premium: 120 } });
    const r = priceItem({ product, tiers: [], fields: [f], sailArea: 30, configuration: { color: 'premium' } });
    expect(r).toEqual({ cost: 30 * 120 + 80, msrp: 30 * 170 + 120 });
    // 40 € extra margin from this option
    expect(r!.msrp - r!.cost).toBe(30 * 170 + 120 - (30 * 120 + 80));
  });

  it('preserves legacy same-amount behaviour when cost === msrp', () => {
    const f = field('color', { cost: { premium: 80 }, msrp: { premium: 80 } });
    const r = priceItem({ product, tiers: [], fields: [f], sailArea: 30, configuration: { color: 'premium' } });
    expect(r).toEqual({ cost: 30 * 120 + 80, msrp: 30 * 170 + 80 });
  });

  it('ignores modifiers for options not selected', () => {
    const f = field('color', { cost: { premium: 80 }, msrp: { premium: 120 } });
    const r = priceItem({ product, tiers: [], fields: [f], sailArea: 30, configuration: {} });
    expect(r).toEqual({ cost: 30 * 120, msrp: 30 * 170 });
  });

  it('sums multiple fields independently', () => {
    const a = field('color', { cost: { premium: 80 }, msrp: { premium: 120 } });
    const b = field('stitch', { cost: { reinforced: 20 }, msrp: { reinforced: 30 } });
    const r = priceItem({
      product,
      tiers: [],
      fields: [a, b],
      sailArea: 30,
      configuration: { color: 'premium', stitch: 'reinforced' },
    });
    expect(r).toEqual({ cost: 30 * 120 + 80 + 20, msrp: 30 * 170 + 120 + 30 });
  });
});

describe('priceItem — percent modifiers', () => {
  it('multiplies both subtotals by the same factor (margin ratio preserved)', () => {
    const f = field('reefs', { pct: { '3': 0.10 } });
    const r = priceItem({ product, tiers: [], fields: [f], sailArea: 30, configuration: { reefs: '3' } });
    expect(r).toEqual({ cost: 30 * 120 * 1.10, msrp: 30 * 170 * 1.10 });
    // Ratio pre/post-percent is the same
    const baseRatio = (30 * 170) / (30 * 120);
    const pctRatio = r!.msrp / r!.cost;
    expect(pctRatio).toBeCloseTo(baseRatio, 10);
  });

  it('applies percent AFTER flat (flat is in the base, percent multiplies)', () => {
    const f = field('extra', {
      cost: { on: 80 },
      msrp: { on: 120 },
      pct: { on: 0.10 },
    });
    const r = priceItem({ product, tiers: [], fields: [f], sailArea: 30, configuration: { extra: 'on' } });
    expect(r).toEqual({
      cost: (30 * 120 + 80) * 1.10,
      msrp: (30 * 170 + 120) * 1.10,
    });
  });

  it('sums percents across fields', () => {
    const a = field('a', { pct: { on: 0.10 } });
    const b = field('b', { pct: { on: 0.05 } });
    const r = priceItem({
      product,
      tiers: [],
      fields: [a, b],
      sailArea: 30,
      configuration: { a: 'on', b: 'on' },
    });
    expect(r).toEqual({ cost: 30 * 120 * 1.15, msrp: 30 * 170 * 1.15 });
  });
});

describe('priceItem — robustness', () => {
  it('ignores null modifier maps', () => {
    const f = field('anything', {});
    const r = priceItem({ product, tiers: [], fields: [f], sailArea: 30, configuration: { anything: 'x' } });
    expect(r).toEqual({ cost: 30 * 120, msrp: 30 * 170 });
  });

  it('handles empty configuration', () => {
    const f = field('color', { cost: { premium: 80 }, msrp: { premium: 120 } });
    const r = priceItem({ product, tiers: [], fields: [f], sailArea: 30, configuration: {} });
    expect(r).toEqual({ cost: 30 * 120, msrp: 30 * 170 });
  });

  it('skips non-numeric modifier entries silently', () => {
    const broken = {
      productId: 'p1',
      key: 'color',
      costModifiers: { premium: 'abc' as unknown as number },
      msrpModifiers: { premium: 120 },
      percentModifiers: null,
    };
    const r = priceItem({ product, tiers: [], fields: [broken], sailArea: 30, configuration: { color: 'premium' } });
    expect(r).toEqual({ cost: 30 * 120, msrp: 30 * 170 + 120 });
  });
});

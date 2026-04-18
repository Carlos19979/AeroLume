import { describe, it, expect } from 'vitest';
import { priceItem } from '@/lib/pricing';

describe('priceItem (smoke)', () => {
  it('returns null when product is null', () => {
    const result = priceItem({
      product: null,
      tiers: [],
      fields: [],
      sailArea: 25,
      configuration: {},
    });
    expect(result).toBeNull();
  });

  it('returns null when sailArea is non-positive', () => {
    const result = priceItem({
      product: null,
      tiers: [],
      fields: [],
      sailArea: 0,
      configuration: {},
    });
    expect(result).toBeNull();
  });
});

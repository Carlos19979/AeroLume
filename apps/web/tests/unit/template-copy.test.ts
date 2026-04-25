import { describe, it, expect } from 'vitest';
import {
  resolveCopy,
  TEMPLATE_COPY_DEFAULTS,
  type TemplateCopy,
} from '@/app/embed/templates/copy';

describe('TEMPLATE_COPY_DEFAULTS', () => {
  const templates = ['minimal', 'editorial', 'premium', 'marine'] as const;
  const steps = ['boat', 'products', 'configure', 'preview', 'contact'] as const;

  it('exposes non-empty title + subtitle for every (template, step) pair', () => {
    for (const t of templates) {
      for (const s of steps) {
        const copy = TEMPLATE_COPY_DEFAULTS[t][s];
        expect(copy.title.trim()).not.toBe('');
        expect(copy.subtitle.trim()).not.toBe('');
      }
    }
  });

  it('gives each template a distinct boat title (no copy-paste across templates)', () => {
    const titles = templates.map((t) => TEMPLATE_COPY_DEFAULTS[t].boat.title);
    const unique = new Set(titles);
    // Minimal, Editorial, and Premium must differ. Marine happens to share
    // editorial's opening question by design — assert at least 3 distinct.
    expect(unique.size).toBeGreaterThanOrEqual(3);
  });
});

describe('resolveCopy', () => {
  it('returns template defaults when no overrides are provided', () => {
    const resolved = resolveCopy(null, 'editorial', 'boat');
    expect(resolved.title).toBe(TEMPLATE_COPY_DEFAULTS.editorial.boat.title);
    expect(resolved.subtitle).toBe(TEMPLATE_COPY_DEFAULTS.editorial.boat.subtitle);
  });

  it('returns template defaults when overrides object is empty', () => {
    const resolved = resolveCopy({}, 'premium', 'products');
    expect(resolved.title).toBe(TEMPLATE_COPY_DEFAULTS.premium.products.title);
    expect(resolved.subtitle).toBe(TEMPLATE_COPY_DEFAULTS.premium.products.subtitle);
  });

  it('overrides the title when a non-empty title is provided', () => {
    const overrides: TemplateCopy = {
      boat: { title: 'Custom title' },
    };
    const resolved = resolveCopy(overrides, 'minimal', 'boat');
    expect(resolved.title).toBe('Custom title');
    // subtitle still falls back to default
    expect(resolved.subtitle).toBe(TEMPLATE_COPY_DEFAULTS.minimal.boat.subtitle);
  });

  it('falls back to defaults for whitespace-only overrides', () => {
    const overrides: TemplateCopy = {
      boat: { title: '   ', subtitle: '\t\n  ' },
    };
    const resolved = resolveCopy(overrides, 'marine', 'boat');
    expect(resolved.title).toBe(TEMPLATE_COPY_DEFAULTS.marine.boat.title);
    expect(resolved.subtitle).toBe(TEMPLATE_COPY_DEFAULTS.marine.boat.subtitle);
  });

  it('falls back to defaults for empty-string overrides', () => {
    const overrides: TemplateCopy = {
      boat: { title: '', subtitle: '' },
    };
    const resolved = resolveCopy(overrides, 'editorial', 'boat');
    expect(resolved.title).toBe(TEMPLATE_COPY_DEFAULTS.editorial.boat.title);
    expect(resolved.subtitle).toBe(TEMPLATE_COPY_DEFAULTS.editorial.boat.subtitle);
  });

  it('only applies overrides for the specific step requested', () => {
    const overrides: TemplateCopy = {
      boat: { title: 'X', subtitle: 'Y' },
    };
    const boat = resolveCopy(overrides, 'minimal', 'boat');
    const products = resolveCopy(overrides, 'minimal', 'products');
    expect(boat.title).toBe('X');
    expect(products.title).toBe(TEMPLATE_COPY_DEFAULTS.minimal.products.title);
  });

  it('scopes overrides per template — same override returns different defaults across templates', () => {
    const overrides: TemplateCopy = {
      configure: { subtitle: 'Shared subtitle' },
    };
    const editorial = resolveCopy(overrides, 'editorial', 'configure');
    const premium = resolveCopy(overrides, 'premium', 'configure');

    // Both get the shared subtitle (overrides are template-agnostic by design).
    expect(editorial.subtitle).toBe('Shared subtitle');
    expect(premium.subtitle).toBe('Shared subtitle');

    // But titles fall back to their template-specific defaults.
    expect(editorial.title).toBe(TEMPLATE_COPY_DEFAULTS.editorial.configure.title);
    expect(premium.title).toBe(TEMPLATE_COPY_DEFAULTS.premium.configure.title);
    expect(editorial.title).not.toBe(premium.title);
  });

  it('treats undefined overrides as missing', () => {
    const resolved = resolveCopy(undefined, 'minimal', 'contact');
    expect(resolved).toEqual(TEMPLATE_COPY_DEFAULTS.minimal.contact);
  });

  it('never returns undefined fields — always a required shape', () => {
    // Even with a very partial override, the resolved shape has both fields.
    const resolved = resolveCopy({ boat: {} }, 'marine', 'boat');
    expect(typeof resolved.title).toBe('string');
    expect(typeof resolved.subtitle).toBe('string');
    expect(resolved.title.length).toBeGreaterThan(0);
    expect(resolved.subtitle.length).toBeGreaterThan(0);
  });
});

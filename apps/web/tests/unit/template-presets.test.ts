import { describe, it, expect } from 'vitest';
import { TEMPLATE_PRESETS } from '@/app/embed/templates/presets';
import { TEMPLATE_FIELD_LABELS } from '@/app/embed/templates/field-labels';
import type { ThemeTemplate } from '@/app/embed/templates/types';

const TEMPLATES: ThemeTemplate[] = ['minimal', 'editorial', 'premium', 'marine'];
const HEX = /^#[0-9a-fA-F]{6}$/;

describe('TEMPLATE_PRESETS', () => {
  it('declares a preset for every template', () => {
    for (const t of TEMPLATES) {
      expect(TEMPLATE_PRESETS[t]).toBeDefined();
    }
  });

  it('every color field is a valid 6-digit hex', () => {
    const colorKeys = [
      'themeAccent',
      'themeAccentDim',
      'themeNavy',
      'themeText',
      'themeColorMain',
      'themeColorHead',
      'themeColorSpi',
    ] as const;
    for (const t of TEMPLATES) {
      for (const k of colorKeys) {
        expect(TEMPLATE_PRESETS[t][k]).toMatch(HEX);
      }
    }
  });

  it('every template has non-empty font names', () => {
    for (const t of TEMPLATES) {
      expect(TEMPLATE_PRESETS[t].themeFontDisplay.trim()).not.toBe('');
      expect(TEMPLATE_PRESETS[t].themeFontBody.trim()).not.toBe('');
    }
  });

  it('templates have distinguishable accent colors (no silent copy-paste)', () => {
    const accents = TEMPLATES.map((t) => TEMPLATE_PRESETS[t].themeAccent);
    // All four presets must have unique accent colors — this is the main
    // identity axis. If two match, switching templates won't feel different.
    expect(new Set(accents).size).toBe(TEMPLATES.length);
  });
});

describe('TEMPLATE_FIELD_LABELS', () => {
  it('declares labels for every template', () => {
    for (const t of TEMPLATES) {
      expect(TEMPLATE_FIELD_LABELS[t]).toBeDefined();
    }
  });

  it('every template covers the 4 main color fields', () => {
    const expectedKeys = new Set(['themeAccent', 'themeAccentDim', 'themeNavy', 'themeText']);
    for (const t of TEMPLATES) {
      const keys = new Set(TEMPLATE_FIELD_LABELS[t].mainColors.map((f) => f.key));
      expect(keys).toEqual(expectedKeys);
    }
  });

  it('every template covers the 3 group colors', () => {
    const expectedKeys = new Set(['themeColorMain', 'themeColorHead', 'themeColorSpi']);
    for (const t of TEMPLATES) {
      const keys = new Set(TEMPLATE_FIELD_LABELS[t].groupColors.map((f) => f.key));
      expect(keys).toEqual(expectedKeys);
    }
  });

  it('every template covers both font slots', () => {
    const expectedKeys = new Set(['themeFontDisplay', 'themeFontBody']);
    for (const t of TEMPLATES) {
      const keys = new Set(TEMPLATE_FIELD_LABELS[t].fonts.map((f) => f.key));
      expect(keys).toEqual(expectedKeys);
    }
  });

  it('every field has a non-empty human label', () => {
    for (const t of TEMPLATES) {
      const all = [
        ...TEMPLATE_FIELD_LABELS[t].mainColors,
        ...TEMPLATE_FIELD_LABELS[t].groupColors,
        ...TEMPLATE_FIELD_LABELS[t].fonts,
      ];
      for (const f of all) {
        expect(f.label.trim()).not.toBe('');
      }
    }
  });

  it('main color labels differ across templates for themeNavy (the most ambiguous field)', () => {
    // themeNavy plays very different roles across templates — its label must
    // reflect that, not reuse a generic "Navy (fondo)" copy everywhere.
    const labels = TEMPLATES.map(
      (t) => TEMPLATE_FIELD_LABELS[t].mainColors.find((f) => f.key === 'themeNavy')!.label,
    );
    // At least 3 of the 4 labels must be unique (minimal+premium can share
    // "Color de fondo"-flavored copy, but editorial/marine must stand out).
    expect(new Set(labels).size).toBeGreaterThanOrEqual(3);
  });
});

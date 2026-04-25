import type { ThemeTemplate } from './types';

/**
 * Default color palette + typography for each template.
 *
 * Used in two places:
 *   1. When a tenant picks a template in the theme editor, these values are
 *      applied to the local form state so the tenant sees the template's
 *      native palette immediately (they can then tweak).
 *   2. As a visual reference for what each template "looks like" out of the
 *      box (e.g., the template picker thumbnail colors live here too).
 *
 * These are NOT enforced at render time — if a tenant saves custom colors
 * for Premium, those persist and override the preset on next load.
 */

export type TemplatePreset = {
  themeAccent: string;
  themeAccentDim: string;
  themeNavy: string;
  themeText: string;
  themeFontDisplay: string;
  themeFontBody: string;
  themeColorMain: string;
  themeColorHead: string;
  themeColorSpi: string;
};

export const TEMPLATE_PRESETS: Record<ThemeTemplate, TemplatePreset> = {
  minimal: {
    themeAccent: '#0b5faa',
    themeAccentDim: '#1a7fd4',
    themeNavy: '#0a2540',
    themeText: '#0a1e3d',
    themeFontDisplay: 'Cormorant',
    themeFontBody: 'Manrope',
    themeColorMain: '#3b82f6',
    themeColorHead: '#10b981',
    themeColorSpi: '#a855f7',
  },
  editorial: {
    themeAccent: '#c4452d',
    themeAccentDim: '#a83a26',
    themeNavy: '#0d1f2d',
    themeText: '#1c2f40',
    themeFontDisplay: 'Fraunces',
    themeFontBody: 'Inter',
    themeColorMain: '#1d4a6b',
    themeColorHead: '#3a8a5a',
    themeColorSpi: '#b08a3c',
  },
  premium: {
    themeAccent: '#d4b168',
    themeAccentDim: '#b5935a',
    themeNavy: '#0a1e3d',
    themeText: '#e7ecf3',
    themeFontDisplay: 'Inter',
    themeFontBody: 'Inter',
    themeColorMain: '#d4b168',
    themeColorHead: '#a7c1d9',
    themeColorSpi: '#e8a87c',
  },
  marine: {
    themeAccent: '#ff6a00',
    themeAccentDim: '#e85d00',
    themeNavy: '#0b5faa',
    themeText: '#0a2540',
    themeFontDisplay: 'Manrope',
    themeFontBody: 'Manrope',
    themeColorMain: '#0b5faa',
    themeColorHead: '#0ea5e9',
    themeColorSpi: '#ff6a00',
  },
};

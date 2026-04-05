import type { TenantTheme } from '../types/tenant';

/** Map flat DB tenant row to nested TenantTheme object */
export function mapTenantTheme(row: {
  themeAccent?: string | null;
  themeAccentDim?: string | null;
  themeNavy?: string | null;
  themeText?: string | null;
  themeFontDisplay?: string | null;
  themeFontBody?: string | null;
}): TenantTheme {
  return {
    accent: row.themeAccent ?? '#0b5faa',
    accentDim: row.themeAccentDim ?? '#1a7fd4',
    navy: row.themeNavy ?? '#0a2540',
    text: row.themeText ?? '#0a1e3d',
    fontDisplay: row.themeFontDisplay ?? 'Cormorant',
    fontBody: row.themeFontBody ?? 'Manrope',
  };
}

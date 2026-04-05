/**
 * Format a number as a price string.
 */
export function formatPrice(
  value: number | null | undefined,
  currency = 'EUR',
  locale = 'es-ES',
): string {
  if (value == null) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a dimension value with unit.
 */
export function formatDimension(value: string | number | null, unit = 'm'): string {
  if (value == null || value === '') return '—';
  return `${value} ${unit}`;
}

/**
 * Format a number with locale-appropriate separators.
 */
export function formatNumber(value: number, locale = 'es-ES'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Convert Drizzle numeric string to number, handling null */
export function toNumber(value: string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

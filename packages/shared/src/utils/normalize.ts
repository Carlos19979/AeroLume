/**
 * Remove diacritics and lowercase for fuzzy matching.
 */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Remove all whitespace for compact comparison.
 */
export function compactText(text: string): string {
  return normalizeText(text).replace(/\s+/g, '');
}

/**
 * Strip HTML tags from a string.
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Decode HTML entities like &amp; &lt; etc.
 */
export function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  };
  return text.replace(
    /&(?:amp|lt|gt|quot|#039|apos|nbsp);/g,
    (match) => entities[match] ?? match,
  );
}

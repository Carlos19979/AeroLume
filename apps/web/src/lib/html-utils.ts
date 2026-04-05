/**
 * Upgrade PrestaShop image URLs to use large_default size.
 * Consolidates the duplicated upgradeImageUrl / upgradeToLarge from
 * sail-products and sail-product-detail routes.
 */
export function upgradeImageUrl(url: string): string {
  if (!url) return url;
  return url.replace(/-(?:small|medium|home|cart|thickbox)_default\//i, '-large_default/');
}

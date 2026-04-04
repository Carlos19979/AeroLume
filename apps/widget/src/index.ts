/**
 * Aerolume Widget Loader
 * Embeds the sail configurator via iframe into client websites.
 *
 * Usage:
 *   <div id="aerolume-configurator"></div>
 *   <script src="https://cdn.aerolume.com/widget/v1/aerolume.js"></script>
 *   <script>
 *     Aerolume.init({
 *       apiKey: 'ak_live_xxxxxxxxx',
 *       container: '#aerolume-configurator',
 *     });
 *   </script>
 */

interface AerolumeConfig {
  apiKey: string;
  container: string | HTMLElement;
  theme?: {
    primaryColor?: string;
    logo?: string;
  };
  locale?: string;
  onBoatSelected?: (boat: unknown) => void;
  onProductSelected?: (product: unknown) => void;
  onQuoteCreated?: (quote: unknown) => void;
}

const EMBED_BASE_URL = 'https://app.aerolume.com/embed';

function init(config: AerolumeConfig) {
  const { apiKey, container } = config;

  if (!apiKey) {
    console.error('[Aerolume] apiKey is required');
    return;
  }

  const el =
    typeof container === 'string'
      ? document.querySelector<HTMLElement>(container)
      : container;

  if (!el) {
    console.error(`[Aerolume] Container not found: ${container}`);
    return;
  }

  const iframe = document.createElement('iframe');
  const params = new URLSearchParams({ key: apiKey });
  if (config.locale) params.set('locale', config.locale);

  iframe.src = `${EMBED_BASE_URL}?${params}`;
  iframe.style.width = '100%';
  iframe.style.border = 'none';
  iframe.style.minHeight = '600px';
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('title', 'Aerolume Sail Configurator');

  el.innerHTML = '';
  el.appendChild(iframe);

  // Listen for messages from the embed
  window.addEventListener('message', (event) => {
    if (event.source !== iframe.contentWindow) return;

    const { type, payload } = event.data ?? {};

    switch (type) {
      case 'aerolume:resize':
        iframe.style.height = `${payload.height}px`;
        break;
      case 'aerolume:boat-selected':
        config.onBoatSelected?.(payload);
        break;
      case 'aerolume:product-selected':
        config.onProductSelected?.(payload);
        break;
      case 'aerolume:quote-created':
        config.onQuoteCreated?.(payload);
        break;
    }
  });
}

// Expose globally
(window as unknown as Record<string, unknown>).Aerolume = { init };

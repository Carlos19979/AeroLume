/**
 * Centralized `data-testid` registry for E2E tests.
 *
 * Source of truth for all testid strings referenced from specs so UI changes
 * only require touching one file. Also serves as the contract the UI agents
 * must implement.
 */
export const TID = {
  embed: {
    boatSearch: 'embed-boat-search',
    expertToggle: 'embed-expert-toggle',
    productCard: (id: string) => `embed-product-card-${id}`,
    customArea: (id: string) => `embed-custom-area-${id}`,
    stepPill: (step: string) => `embed-step-${step}`,
    continueConfigure: 'embed-continue-configure',
    continuePreview: 'embed-continue-preview',
    submitQuote: 'embed-submit-quote',
    sailSvg: 'embed-sail-svg',
    configSummary: 'embed-config-summary',
    featuresList: 'embed-features-list',
  },
  quote: {
    marginPvp: 'quote-margin-pvp',
    marginCost: 'quote-margin-cost',
    marginResult: 'quote-margin-result',
    marginPercent: 'quote-margin-percent',
    actionSend: 'quote-action-send',
    statusBadge: (id: string) => `quote-status-${id}`,
  },
  dashboard: {
    apiKeyRawModal: 'apikey-raw-modal',
    webhookUrl: 'settings-webhook-url',
    themeAccent: 'theme-accent-picker',
    planBadge: 'subscription-plan-badge',
    trialCountdown: 'subscription-trial-days-left',
    trialExpiredBanner: 'dashboard-trial-expired-banner',
    accessExpiredBanner: 'dashboard-access-expired-banner',
    canceledGraceBanner: 'dashboard-canceled-grace-banner',
    subscriptionCanceledGraceBanner: 'subscription-canceled-grace-banner',
    subscriptionAccessExpiredBanner: 'subscription-access-expired-banner',
    upgradeCta: 'subscription-upgrade-cta',
    portalCta: 'subscription-portal-cta',
    cancelCta: 'subscription-cancel-cta',
    cancelConfirm: 'subscription-cancel-confirm',
    analytics: {
      summary: 'analytics-summary',
      total: 'analytics-total',
      boatSearch: 'analytics-boat-search',
      quoteCreated: 'analytics-quote-created',
      productView: 'analytics-product-view',
      byType: 'analytics-by-type',
      topBoats: 'analytics-top-boats',
      topSailTypes: 'analytics-top-sail-types',
      perDay: 'analytics-per-day',
      emptyState: 'analytics-empty-state',
    },
  },
  admin: {
    tenantRow: (id: string) => `admin-tenant-row-${id}`,
    tenantPlan: 'admin-tenant-plan',
    tenantStatus: 'admin-tenant-status',
    impersonate: (id: string) => `admin-impersonate-${id}`,
    impersonateBanner: 'admin-impersonate-banner',
    stopImpersonate: 'admin-stop-impersonate',
    boatRow: (id: string) => `admin-boat-row-${id}`,
    boatCreateBtn: 'admin-boat-create-btn',
    boatCreateForm: 'admin-boat-create-form',
    boatModelInput: 'admin-boat-model-input',
    boatSaveBtn: 'admin-boat-save-btn',
  },
} as const;

export type Tid = typeof TID;

export const CRUD = {
  product: {
    createButton: 'product-create-button',
    createName: 'product-create-name',
    createSailType: 'product-create-saltype',
    createSubmit: 'product-create-submit',
    row: (id: string) => `product-row-${id}`,
    toggleActive: (id: string) => `product-toggle-active-${id}`,
    deleteBtn: (id: string) => `product-delete-${id}`,
    tiers: {
      section: 'product-tiers-section',
      addBtn: 'product-tiers-add',
      row: (index: number) => `product-tier-row-${index}`,
      minSqm: (index: number) => `product-tier-min-${index}`,
      maxSqm: (index: number) => `product-tier-max-${index}`,
      costPerSqm: (index: number) => `product-tier-cost-${index}`,
      msrpPerSqm: (index: number) => `product-tier-msrp-${index}`,
      deleteBtn: (index: number) => `product-tier-delete-${index}`,
      saveWrapper: 'product-tiers-save',
    },
  },
  quote: {
    row: (id: string) => `quote-row-${id}`,
    sendBtn: (id: string) => `quote-send-${id}`,
    acceptBtn: (id: string) => `quote-accept-${id}`,
    rejectBtn: (id: string) => `quote-reject-${id}`,
    deleteBtn: (id: string) => `quote-delete-${id}`,
  },
  theme: {
    accentPicker: 'theme-accent-picker',
    accentHex: 'theme-accent-hex',
    saveWrapper: 'theme-save',
    ctaLabel: 'theme-cta-label',
    contactTitle: 'theme-contact-title',
    contactSubtitle: 'theme-contact-subtitle',
    stepTab: (n: 1 | 2 | 3 | 4 | 5) => `theme-preview-step-${n}`,
    template: (key: 'minimal' | 'editorial' | 'premium' | 'marine') => `theme-template-${key}`,
    copyTitle: (step: 'boat' | 'products' | 'configure' | 'preview' | 'contact') =>
      `theme-copy-${step}-title`,
    copySubtitle: (step: 'boat' | 'products' | 'configure' | 'preview' | 'contact') =>
      `theme-copy-${step}-subtitle`,
  },
  settings: {
    locale: 'settings-locale',
    currency: 'settings-currency',
    allowedOrigins: 'settings-allowed-origins',
    webhookUrl: 'settings-webhook-url',
    saveWrapper: 'settings-save',
  },
  apiKey: {
    createBtn: 'apikey-create-btn',
    rawModal: 'apikey-raw-modal',
    copyRaw: 'apikey-copy-raw',
    row: (id: string) => `apikey-row-${id}`,
    revokeBtn: (id: string) => `apikey-revoke-${id}`,
  },
} as const;


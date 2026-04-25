/**
 * Template system contract for the embedded configurator.
 *
 * Each template exports a Configurator component with the same public shape as
 * the legacy EmbedConfigurator. Templates own their 4-step UX end-to-end
 * (boat → products → configure → preview + contact) and respect tenant
 * personalization (colors, logo, copy) passed through the tenant prop.
 *
 * Adding a new template:
 *   1. Create apps/web/src/app/embed/templates/<name>/Configurator.tsx
 *      that default-exports a component with the TemplateConfiguratorProps shape.
 *   2. Register it in registry.tsx.
 *   3. Add its enum value to theme_template in the DB + updateThemeSchema.
 */

export type ThemeTemplate = 'minimal' | 'editorial' | 'premium' | 'marine';

import type { TemplateCopy } from './copy';

export type TemplateTenant = {
  id: string;
  name: string;
  slug: string;
  themeTemplate?: ThemeTemplate | null;
  themeAccent: string | null;
  themeAccentDim: string | null;
  themeNavy: string | null;
  themeText: string | null;
  themeFontDisplay: string | null;
  themeFontBody: string | null;
  themeColorMain: string | null;
  themeColorHead: string | null;
  themeColorSpi: string | null;
  logoUrl: string | null;
  locale: string | null;
  currency: string | null;
  themeCtaLabel: string | null;
  themeContactTitle: string | null;
  themeContactSubtitle: string | null;
  themeCopy?: TemplateCopy | null;
};

export type TemplateStep = 'boat' | 'products' | 'configure' | 'preview' | 'contact' | 'done';

export type TemplateConfiguratorProps = {
  apiKey: string;
  tenant: TemplateTenant;
  previewMode?: { step: TemplateStep };
};

/**
 * Minimal template — the baseline widget design.
 *
 * This is the implementation every tenant has used since day one. Until the
 * other templates (editorial, premium, marine) are built, it's what every
 * tenant renders regardless of themeTemplate.
 *
 * The actual component lives in apps/web/src/app/embed/configurator.tsx
 * (it predates the template system). We re-export it here so new templates
 * can follow the same file convention.
 */

export { EmbedConfigurator as Configurator } from '../../configurator';

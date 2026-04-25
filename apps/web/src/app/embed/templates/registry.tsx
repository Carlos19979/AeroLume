import type { ComponentType } from 'react';
import type { ThemeTemplate, TemplateConfiguratorProps } from './types';
import { Configurator as MinimalConfigurator } from './minimal/Configurator';

/**
 * Template registry.
 *
 * Maps a template key to the component that renders the full configurator
 * in that style. Unknown or unimplemented templates fall back to `minimal`
 * so a tenant never sees a broken widget even if the DB value drifts ahead
 * of the code (or a template is temporarily retired).
 */
const REGISTRY: Partial<Record<ThemeTemplate, ComponentType<TemplateConfiguratorProps>>> = {
  minimal: MinimalConfigurator,
};

export function getTemplateConfigurator(
  template: ThemeTemplate | null | undefined,
): ComponentType<TemplateConfiguratorProps> {
  if (template && REGISTRY[template]) {
    return REGISTRY[template]!;
  }
  return MinimalConfigurator;
}

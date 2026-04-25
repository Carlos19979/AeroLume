import type { ThemeTemplate } from './types';

/**
 * Per-template copy for the theme editor fields.
 *
 * The same DB column (e.g. theme_navy) plays a different role in each
 * template — in Minimal it's a secondary gradient, in Premium it's the
 * entire page background, in Editorial it's the CTA + title ink. Showing
 * a fixed label like "Navy (fondo)" would lie to the tenant on 3 of 4
 * templates, so each template gets its own labels + descriptions.
 */

type MainColorField = {
  key: 'themeAccent' | 'themeAccentDim' | 'themeNavy' | 'themeText';
  label: string;
  hint?: string;
};

type GroupColorField = {
  key: 'themeColorMain' | 'themeColorHead' | 'themeColorSpi';
  label: string;
  hint?: string;
};

type FontField = {
  key: 'themeFontDisplay' | 'themeFontBody';
  label: string;
  hint?: string;
};

export type TemplateFieldLabels = {
  mainColors: MainColorField[];
  groupColors: GroupColorField[];
  fonts: FontField[];
};

export const TEMPLATE_FIELD_LABELS: Record<ThemeTemplate, TemplateFieldLabels> = {
  minimal: {
    mainColors: [
      { key: 'themeAccent', label: 'Color principal', hint: 'Botones, links, acentos' },
      { key: 'themeAccentDim', label: 'Color secundario', hint: 'Gradientes y estados hover' },
      { key: 'themeNavy', label: 'Color oscuro', hint: 'Fondo del resumen de precio' },
      { key: 'themeText', label: 'Texto', hint: 'Color del texto principal' },
    ],
    groupColors: [
      { key: 'themeColorMain', label: 'Vela mayor', hint: 'Icono y tinte de las cards' },
      { key: 'themeColorHead', label: 'Vela de proa', hint: 'Icono y tinte de las cards' },
      { key: 'themeColorSpi', label: 'Portantes', hint: 'Icono y tinte de las cards' },
    ],
    fonts: [
      { key: 'themeFontDisplay', label: 'Titulares', hint: 'Cabecera del widget' },
      { key: 'themeFontBody', label: 'Cuerpo', hint: 'Texto general y formularios' },
    ],
  },

  editorial: {
    mainColors: [
      { key: 'themeAccent', label: 'Color signal', hint: 'Paso activo del stepper, subrayado, errores y asteriscos' },
      { key: 'themeAccentDim', label: 'Numeral del paso', hint: 'Color del número romano grande (esquina superior derecha)' },
      { key: 'themeNavy', label: 'Tinta principal', hint: 'Color de títulos, CTAs y hairlines' },
      { key: 'themeText', label: 'Tinta del cuerpo', hint: 'Texto corriente y labels' },
    ],
    groupColors: [
      { key: 'themeColorMain', label: 'Grupo I · Mayor', hint: 'Numeral romano del grupo' },
      { key: 'themeColorHead', label: 'Grupo II · Proa', hint: 'Numeral romano del grupo' },
      { key: 'themeColorSpi', label: 'Grupo III · Empopada', hint: 'Numeral romano del grupo' },
    ],
    fonts: [
      { key: 'themeFontDisplay', label: 'Serif editorial', hint: 'Títulos, numerales, precios y nombres de vela' },
      { key: 'themeFontBody', label: 'Sans de cuerpo', hint: 'Texto general, labels y formularios' },
    ],
  },

  premium: {
    mainColors: [
      { key: 'themeAccent', label: 'Acento', hint: 'Sustituye el dorado: CTAs, labels, iconos y barra de progreso' },
      { key: 'themeAccentDim', label: 'Acento secundario', hint: 'Degradado del botón CTA y del total' },
      { key: 'themeNavy', label: 'Color de fondo', hint: 'Base del gradiente radial del widget' },
      { key: 'themeText', label: 'Texto', hint: 'Texto sobre el fondo oscuro' },
    ],
    groupColors: [
      { key: 'themeColorMain', label: 'Vela mayor', hint: 'Badge del grupo y icono de las cards' },
      { key: 'themeColorHead', label: 'Vela de proa', hint: 'Badge del grupo y icono de las cards' },
      { key: 'themeColorSpi', label: 'Portantes', hint: 'Badge del grupo y icono de las cards' },
    ],
    fonts: [
      { key: 'themeFontDisplay', label: 'Titulares', hint: 'Inicial del logo y titulares cortos' },
      { key: 'themeFontBody', label: 'Cuerpo', hint: 'Texto general y formularios' },
    ],
  },

  marine: {
    mainColors: [
      { key: 'themeAccent', label: 'Color llamada', hint: 'CTA naranja, tags y bordes activos' },
      { key: 'themeAccentDim', label: 'Acento secundario', hint: 'Degradado del CTA y del header' },
      { key: 'themeNavy', label: 'Azul mar', hint: 'Degradado azul del header superior' },
      { key: 'themeText', label: 'Texto', hint: 'Color del texto principal del widget' },
    ],
    groupColors: [
      { key: 'themeColorMain', label: 'Vela mayor', hint: 'Badge redondo + borde 3px de la card' },
      { key: 'themeColorHead', label: 'Vela de proa', hint: 'Badge redondo + borde 3px de la card' },
      { key: 'themeColorSpi', label: 'Portantes', hint: 'Badge redondo + borde 3px de la card' },
    ],
    fonts: [
      { key: 'themeFontDisplay', label: 'Titulares display', hint: 'Títulos grandes "¿Qué barco?" y cabecera' },
      { key: 'themeFontBody', label: 'Cuerpo', hint: 'Texto general y formularios' },
    ],
  },
};

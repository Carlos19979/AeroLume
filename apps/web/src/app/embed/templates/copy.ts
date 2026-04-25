import type { ThemeTemplate } from './types';

/**
 * Per-step title/subtitle overrides. Stored on tenant.themeCopy as a JSONB
 * object keyed by step name. Templates read these via:
 *   const { title, subtitle } = resolveCopy(tenant.themeCopy, template, step);
 * which falls back to the template's default copy when nothing is set.
 */

export type StepKey = 'boat' | 'products' | 'configure' | 'preview' | 'contact';

export type StepCopy = { title?: string; subtitle?: string };

export type TemplateCopy = Partial<Record<StepKey, StepCopy>>;

/**
 * Default copy per template. Each template has its own voice — editorial
 * uses serif-era phrasing, marine is exclamatory, premium is formal.
 */
export const TEMPLATE_COPY_DEFAULTS: Record<ThemeTemplate, Record<StepKey, Required<StepCopy>>> = {
  minimal: {
    boat: {
      title: 'Busca tu barco',
      subtitle: 'Escribe el modelo para cargar las medidas.',
    },
    products: {
      title: 'Elige el tipo de vela',
      subtitle: 'Mostramos solo las compatibles con tu barco.',
    },
    configure: {
      title: 'Configura la vela',
      subtitle: 'Ajusta las opciones y ve el precio al momento.',
    },
    preview: {
      title: 'Revisa tu configuración',
      subtitle: 'Así quedará tu vela con las opciones elegidas.',
    },
    contact: {
      title: 'Datos de contacto',
      subtitle: 'Para enviarte el presupuesto detallado.',
    },
  },

  editorial: {
    boat: {
      title: '¿Qué barco tienes?',
      subtitle: 'Busca el modelo y leeremos sus medidas para calcular la superficie exacta de cada vela.',
    },
    products: {
      title: 'Elige la vela',
      subtitle: 'Cada superficie se calcula a partir de las medidas de tu barco. Puedes sobreescribirlas activando el modo experto.',
    },
    configure: {
      title: 'Pliego de especificaciones',
      subtitle: 'Elige la tela y las opciones; el precio se actualiza al momento.',
    },
    preview: {
      title: 'Plano vélico',
      subtitle: 'Revisa la configuración antes de solicitar el presupuesto.',
    },
    contact: {
      title: 'Datos de contacto',
      subtitle: 'Para enviarte el presupuesto detallado.',
    },
  },

  premium: {
    boat: {
      title: 'Identifica tu embarcación',
      subtitle: 'Busca tu modelo — leeremos sus medidas para dimensionar las velas a medida.',
    },
    products: {
      title: 'Configura tu plan vélico',
      subtitle: 'Cada superficie parte de las medidas de tu aparejo.',
    },
    configure: {
      title: 'Especificaciones',
      subtitle: 'Ajusta cada detalle y el precio final.',
    },
    preview: {
      title: 'Previsualización',
      subtitle: 'Confirma la configuración antes de enviar.',
    },
    contact: {
      title: 'Datos de contacto',
      subtitle: 'Para enviarte el presupuesto detallado.',
    },
  },

  marine: {
    boat: {
      title: '¿Qué barco tienes?',
      subtitle: 'Busca tu modelo y sacaremos sus medidas. Es rápido.',
    },
    products: {
      title: '¿Qué vela necesitas?',
      subtitle: 'Te enseñamos solo las que encajan con tu barco.',
    },
    configure: {
      title: 'Configura tu vela',
      subtitle: 'Elige tela, opciones y mira cómo sube el precio.',
    },
    preview: {
      title: 'Así queda tu vela',
      subtitle: 'Revisa todo antes de enviar la solicitud.',
    },
    contact: {
      title: 'Últimos datos',
      subtitle: 'Para enviarte el presupuesto detallado.',
    },
  },
};

/**
 * Resolve a single step's copy for the active template.
 * Priority: tenant override → template default.
 */
export function resolveCopy(
  overrides: TemplateCopy | null | undefined,
  template: ThemeTemplate,
  step: StepKey,
): Required<StepCopy> {
  const defaults = TEMPLATE_COPY_DEFAULTS[template][step];
  const override = overrides?.[step];
  return {
    title: override?.title?.trim() || defaults.title,
    subtitle: override?.subtitle?.trim() || defaults.subtitle,
  };
}

import type { Boat, Product, SailGroup, Step } from './types';

export const SAIL_GROUPS: Record<SailGroup, { label: string; types: string[]; defaultColor: string }> = {
  main: { label: 'Vela mayor', types: ['gvstd', 'gvfull', 'gve'], defaultColor: '#3b82f6' },
  head: { label: 'Vela de proa', types: ['gse', 'gn'], defaultColor: '#10b981' },
  spi: { label: 'Portantes', types: ['spiasy', 'spisym', 'furling', 'gen'], defaultColor: '#a855f7' },
};

export const STEPS: { key: Step; label: string }[] = [
  { key: 'boat', label: 'Barco' },
  { key: 'products', label: 'Vela' },
  { key: 'configure', label: 'Opciones' },
  { key: 'preview', label: 'Vista previa' },
  { key: 'contact', label: 'Contacto' },
];

export function stepIndex(s: Step): number {
  if (s === 'done') return STEPS.length;
  return STEPS.findIndex((st) => st.key === s);
}

export function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

export function SailIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 20h16L12 2z" opacity="0.15" fill={color} />
      <path d="M12 2v18" /><path d="M4 20c0 0 4-10 8-18c4 8 8 18 8 18" /><path d="M3 20h18" />
    </svg>
  );
}

export const PREVIEW_MOCK_BOAT: Boat = {
  id: 'preview-boat',
  model: 'Bavaria 40',
  boatModel: 'Bavaria 40',
  length: '12.2',
  gvstd: '46.5',
  gse: '31.8',
  spiasy: '69.1',
};

export const PREVIEW_MOCK_PRODUCTS: Product[] = [
  {
    id: 'preview-prod-1',
    name: 'Mayor Clásica',
    slug: 'mayor-clasica',
    sailType: 'gvstd',
    variant: 'cruising',
    basePrice: '28',
    currency: 'EUR',
    descriptionShort: 'Vela mayor de crucero en laminado dacron',
    features: ['Grátil reforzado', 'Bolsillo de palo'],
    configFields: [
      {
        id: 'cf-1', key: 'tela', label: 'Tela', fieldType: 'select',
        options: ['Dacron 170g', 'Dacron 200g', 'Laminado'],
        sortOrder: 0, required: true,
        msrpModifiers: { 'Dacron 200g': 80, 'Laminado': 320 },
        percentModifiers: null,
      },
      {
        id: 'cf-2', key: 'rizos', label: 'Rizos', fieldType: 'select',
        options: ['1 rizo', '2 rizos', '3 rizos'],
        sortOrder: 1, required: false,
        msrpModifiers: { '2 rizos': 45, '3 rizos': 90 },
        percentModifiers: null,
      },
    ],
    pricingTiers: [
      { id: 'pt-1', minSqm: '0', maxSqm: '60', msrpPerSqm: '28', sortOrder: 0 },
      { id: 'pt-2', minSqm: '60', maxSqm: '999', msrpPerSqm: '26', sortOrder: 1 },
    ],
  },
  {
    id: 'preview-prod-2',
    name: 'Génova Enrollable',
    slug: 'genova-enrollable',
    sailType: 'gse',
    variant: 'cruising',
    basePrice: '32',
    currency: 'EUR',
    descriptionShort: 'Génova para enrollador de proa',
    features: ['Baluma reforzada', 'Parche de escota'],
    configFields: [
      {
        id: 'cf-3', key: 'tela', label: 'Tela', fieldType: 'select',
        options: ['Dacron 150g', 'Dacron 180g'],
        sortOrder: 0, required: true,
        msrpModifiers: { 'Dacron 180g': 60 },
        percentModifiers: null,
      },
    ],
    pricingTiers: [
      { id: 'pt-3', minSqm: '0', maxSqm: '999', msrpPerSqm: '32', sortOrder: 0 },
    ],
  },
];

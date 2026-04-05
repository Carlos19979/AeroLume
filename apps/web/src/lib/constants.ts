export const SAIL_TYPE_LABELS: Record<string, string> = {
  gvstd: 'Mayor Clásica',
  gvfull: 'Mayor Full-batten',
  gve: 'Mayor Enrollable',
  gse: 'Génova Enrollable',
  gn: 'Génova Clásica',
  spiasy: 'Spinnaker Asimétrico',
  spisym: 'Spinnaker Simétrico',
  furling: 'Code S / Furling',
  gen: 'Génaker',
};

export const QUOTE_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Borrador', color: 'text-gray-600', bg: 'bg-gray-100' },
  sent: { label: 'Enviado', color: 'text-blue-600', bg: 'bg-blue-100' },
  accepted: { label: 'Aceptado', color: 'text-green-600', bg: 'bg-green-100' },
  rejected: { label: 'Rechazado', color: 'text-red-600', bg: 'bg-red-100' },
  expired: { label: 'Expirado', color: 'text-amber-600', bg: 'bg-amber-100' },
};

export const SUBSCRIPTION_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Activo', color: 'text-green-600', bg: 'bg-green-100' },
  trialing: { label: 'Prueba', color: 'text-blue-600', bg: 'bg-blue-100' },
  past_due: { label: 'Pago pendiente', color: 'text-amber-600', bg: 'bg-amber-100' },
  canceled: { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-100' },
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  configurator_opened: 'Configurador abierto',
  boat_search: 'Búsqueda de barco',
  product_view: 'Vista de producto',
  quote_created: 'Presupuesto creado',
  quote_sent: 'Presupuesto enviado',
  quote_accepted: 'Presupuesto aceptado',
  quote_rejected: 'Presupuesto rechazado',
};

export const EVENT_COLORS: Record<string, string> = {
  configurator_opened: 'bg-purple-100 text-purple-700',
  boat_search: 'bg-blue-100 text-blue-700',
  product_view: 'bg-amber-100 text-amber-700',
  quote_created: 'bg-green-100 text-green-700',
  quote_sent: 'bg-cyan-100 text-cyan-700',
  quote_accepted: 'bg-emerald-100 text-emerald-700',
  quote_rejected: 'bg-red-100 text-red-700',
};

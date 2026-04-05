/**
 * Plan & subscription gating logic.
 *
 * Plans: 'prueba' (free trial), 'pro' (paid)
 * Statuses: 'active', 'past_due', 'canceled'
 *
 * Rules:
 * - prueba + active: can view dashboard, cannot create products/keys/quotes
 * - pro + active: full access
 * - pro + past_due: dashboard accessible with warning, widget disabled, 7 days to pay
 * - canceled: everything blocked, show suspended screen
 */

export type PlanStatus = {
  plan: string | null;
  subscriptionStatus: string | null;
};

function requirePro(ps: PlanStatus): boolean {
  return ps.plan === 'pro' && ps.subscriptionStatus === 'active';
}

function requireProOrPastDue(ps: PlanStatus): boolean {
  return ps.plan === 'pro' && (ps.subscriptionStatus === 'active' || ps.subscriptionStatus === 'past_due');
}

export const canCreateProducts = requirePro;
export const canCreateApiKeys = requirePro;
export const canReceiveQuotes = requirePro;
export const canEditTheme = requireProOrPastDue;
export const canEditSettings = requireProOrPastDue;

export function isWidgetEnabled(ps: PlanStatus): boolean {
  return ps.plan === 'pro' && ps.subscriptionStatus === 'active';
}

export function isSuspended(ps: PlanStatus): boolean {
  return ps.subscriptionStatus === 'canceled';
}

export function isPastDue(ps: PlanStatus): boolean {
  return ps.subscriptionStatus === 'past_due';
}

export function isTrial(ps: PlanStatus): boolean {
  return ps.plan === 'prueba';
}

export function getDashboardBanner(ps: PlanStatus): { type: 'trial' | 'past_due' | 'none'; message: string } {
  if (isSuspended(ps)) {
    return { type: 'none', message: '' }; // Handled by full-screen block
  }
  if (isPastDue(ps)) {
    return {
      type: 'past_due',
      message: 'Tu pago está pendiente. Tienes 7 días para regularizar o tu cuenta será suspendida.',
    };
  }
  if (isTrial(ps)) {
    return {
      type: 'trial',
      message: 'Estás en modo prueba. Contacta con nosotros para activar tu configurador.',
    };
  }
  return { type: 'none', message: '' };
}

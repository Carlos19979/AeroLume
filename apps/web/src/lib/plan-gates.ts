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

export function canCreateProducts(ps: PlanStatus): boolean {
  return ps.plan === 'pro' && ps.subscriptionStatus === 'active';
}

export function canCreateApiKeys(ps: PlanStatus): boolean {
  return ps.plan === 'pro' && ps.subscriptionStatus === 'active';
}

export function canReceiveQuotes(ps: PlanStatus): boolean {
  return ps.plan === 'pro' && ps.subscriptionStatus === 'active';
}

export function canEditTheme(ps: PlanStatus): boolean {
  return ps.plan === 'pro' && (ps.subscriptionStatus === 'active' || ps.subscriptionStatus === 'past_due');
}

export function canEditSettings(ps: PlanStatus): boolean {
  return ps.plan === 'pro' && (ps.subscriptionStatus === 'active' || ps.subscriptionStatus === 'past_due');
}

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
      message: 'Tu pago esta pendiente. Tienes 7 dias para regularizar o tu cuenta sera suspendida.',
    };
  }
  if (isTrial(ps)) {
    return {
      type: 'trial',
      message: 'Estas en modo prueba. Contacta con nosotros para activar tu configurador.',
    };
  }
  return { type: 'none', message: '' };
}

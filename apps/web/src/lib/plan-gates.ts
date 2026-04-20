/**
 * Plan & subscription gating logic.
 *
 * Plans: 'prueba' (free trial), 'pro' (paid)
 * Statuses: 'active', 'past_due', 'canceled'
 *
 * Rules:
 * - prueba + active trial (trial_ends_at > now): full access (same as pro)
 * - prueba + expired trial: read-only dashboard, API keys disabled
 * - pro + active: full access
 * - pro + past_due: dashboard accessible with warning, widget disabled, 7 days to pay
 * - canceled: everything blocked, show suspended screen
 */

export type PlanStatus = {
  plan: string | null;
  subscriptionStatus: string | null;
  trialEndsAt?: Date | null;
  cancelationGraceEndsAt?: Date | null;
};

function isActiveTrial(ps: PlanStatus): boolean {
  return ps.plan === 'prueba' && !!ps.trialEndsAt && new Date(ps.trialEndsAt) > new Date();
}

export function isTrialExpired(ps: PlanStatus): boolean {
  return ps.plan === 'prueba' && (!ps.trialEndsAt || new Date(ps.trialEndsAt) <= new Date());
}

function isProActive(ps: PlanStatus): boolean {
  return ps.plan === 'pro' && ps.subscriptionStatus === 'active';
}

function hasFullAccess(ps: PlanStatus): boolean {
  return isProActive(ps) || isActiveTrial(ps) || isCanceledInGrace(ps);
}

function hasReadAccess(ps: PlanStatus): boolean {
  return hasFullAccess(ps) || ps.plan === 'pro' && ps.subscriptionStatus === 'past_due';
}

export const canCreateProducts = hasFullAccess;
export const canCreateApiKeys = hasFullAccess;
export const canReceiveQuotes = hasFullAccess;
export const canEditTheme = hasReadAccess;
export const canEditSettings = hasReadAccess;

export function isWidgetEnabled(ps: PlanStatus): boolean {
  return hasFullAccess(ps);
}

export function isCanceled(ps: PlanStatus): boolean {
  return ps.subscriptionStatus === 'canceled';
}

/** Grace period active: canceled but still within the 7-day window */
export function isCanceledInGrace(ps: PlanStatus): boolean {
  return (
    ps.subscriptionStatus === 'canceled' &&
    !!ps.cancelationGraceEndsAt &&
    new Date(ps.cancelationGraceEndsAt) > new Date()
  );
}

/** Grace period elapsed: canceled and 7-day window has passed */
export function isCanceledExpired(ps: PlanStatus): boolean {
  return (
    ps.subscriptionStatus === 'canceled' &&
    (!ps.cancelationGraceEndsAt || new Date(ps.cancelationGraceEndsAt) <= new Date())
  );
}

/** Suspended = fully blocked (canceled with no active grace) */
export function isSuspended(ps: PlanStatus): boolean {
  return isCanceledExpired(ps);
}

export function isPastDue(ps: PlanStatus): boolean {
  return ps.subscriptionStatus === 'past_due';
}

export function isTrial(ps: PlanStatus): boolean {
  return ps.plan === 'prueba';
}

export function getTrialDaysLeft(ps: PlanStatus): number | null {
  if (ps.plan !== 'prueba' || !ps.trialEndsAt) return null;
  return Math.max(0, Math.ceil((new Date(ps.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function getDashboardBanner(ps: PlanStatus): { type: 'trial' | 'trial_expired' | 'past_due' | 'canceled_grace' | 'access_expired' | 'none'; message: string } {
  if (isCanceledExpired(ps)) {
    return { type: 'access_expired', message: 'Tu suscripcion ha terminado. Suscribete para recuperar acceso.' };
  }
  if (isCanceledInGrace(ps)) {
    const graceDate = new Date(ps.cancelationGraceEndsAt!).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    return {
      type: 'canceled_grace',
      message: `Tu suscripcion se cancelara el ${graceDate}. Mantendras acceso hasta entonces.`,
    };
  }
  if (isPastDue(ps)) {
    return {
      type: 'past_due',
      message: 'Tu pago esta pendiente. Tienes 7 dias para regularizar o tu cuenta sera suspendida.',
    };
  }
  if (isTrialExpired(ps)) {
    return {
      type: 'trial_expired',
      message: 'Tu periodo de prueba ha expirado. Contacta con nosotros para activar tu cuenta.',
    };
  }
  if (isTrial(ps)) {
    const days = getTrialDaysLeft(ps);
    return {
      type: 'trial',
      message: `Periodo de prueba — ${days} ${days === 1 ? 'dia' : 'dias'} restantes.`,
    };
  }
  return { type: 'none', message: '' };
}

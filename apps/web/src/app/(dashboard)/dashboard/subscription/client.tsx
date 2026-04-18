'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Sparkles,
  Crown,
  AlertTriangle,
  XCircle,
  Check,
  ExternalLink,
} from 'lucide-react';

const PLAN_INFO = {
  prueba: { label: 'Prueba', description: 'Acceso completo durante 7 dias' },
  pro: { label: 'Pro', description: '300 EUR/mes — acceso completo a todas las funcionalidades' },
};

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: {
    label: 'Activo',
    color: 'text-green-700 bg-green-50 ring-1 ring-green-200',
    icon: <Crown className="w-3.5 h-3.5" />,
  },
  trialing: {
    label: 'Prueba',
    color: 'text-blue-700 bg-blue-50 ring-1 ring-blue-200',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  past_due: {
    label: 'Pago pendiente',
    color: 'text-amber-700 bg-amber-50 ring-1 ring-amber-200',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  canceled: {
    label: 'Cancelado',
    color: 'text-red-700 bg-red-50 ring-1 ring-red-200',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const PRO_FEATURES = [
  'Widget personalizable white-label',
  'Dashboard completo de gestion',
  'API REST + Webhooks',
  'Analytics en tiempo real',
  'Soporte por email prioritario',
];

export function SubscriptionClient({
  plan,
  status,
  trialEndsAt,
  hasSubscription,
  lsCustomerId,
}: {
  plan: string;
  status: string;
  trialEndsAt: string | null;
  hasSubscription: boolean;
  lsCustomerId: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const planInfo = PLAN_INFO[plan as keyof typeof PLAN_INFO] ?? PLAN_INFO.prueba;
  const statusInfo = STATUS_META[status] ?? STATUS_META.trialing;

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isTrialActive = plan === 'prueba' && trialDaysLeft !== null && trialDaysLeft > 0;
  const isTrialExpired = plan === 'prueba' && (trialDaysLeft === null || trialDaysLeft <= 0);
  const isPro = plan === 'pro' && status === 'active';

  const trialProgress =
    trialDaysLeft !== null ? Math.round(((7 - trialDaysLeft) / 7) * 100) : 0;

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch('/api/internal/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert('Error al crear el checkout. Intentalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCustomerPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/internal/customer-portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('No se pudo acceder al portal. Intentalo de nuevo.');
      }
    } catch {
      alert('Error al acceder al portal de facturacion. Intentalo de nuevo.');
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Suscripcion"
        description="Gestiona tu plan y facturacion"
      />

      <div className="max-w-2xl space-y-5">
        {/* Hero plan card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-navy)] via-[var(--color-navy)] to-[var(--color-accent)] p-6 text-white shadow-lg">
          {/* Subtle decorative circle */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-12 -left-4 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-white/50">Plan actual</p>
              <p
                data-testid="subscription-plan-badge"
                className="mt-1 text-3xl font-bold tracking-tight"
              >
                {planInfo.label}
              </p>
              <p className="mt-1 text-sm text-white/60">{planInfo.description}</p>
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.color}`}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </span>
          </div>

          {/* Trial progress bar */}
          {isTrialActive && trialDaysLeft !== null && (
            <div className="relative mt-5">
              <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
                <span>Periodo de prueba</span>
                <span>
                  <strong
                    data-testid="subscription-trial-days-left"
                    className="text-white"
                  >
                    {trialDaysLeft}
                  </strong>{' '}
                  dias restantes
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/80 transition-all duration-500"
                  style={{ width: `${trialProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Trial expired warning */}
          {isTrialExpired && (
            <div className="relative mt-4 rounded-xl bg-white/10 px-4 py-3">
              <p className="text-sm text-white/80">
                <AlertTriangle className="inline w-4 h-4 mr-1.5 text-amber-300 align-text-bottom" />
                Tu periodo de prueba ha expirado. Suscribete para recuperar el acceso completo.
              </p>
            </div>
          )}

          {/* Pro active features list */}
          {isPro && (
            <ul className="relative mt-5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {PRO_FEATURES.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm text-white/75">
                  <Check className="h-3.5 w-3.5 shrink-0 text-green-400" />
                  {feat}
                </li>
              ))}
            </ul>
          )}

          {/* Customer portal button for pro */}
          {isPro && lsCustomerId && (
            <div className="relative mt-5">
              <button
                data-testid="subscription-portal-cta"
                onClick={handleCustomerPortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <ExternalLink className="h-4 w-4" />
                {portalLoading ? 'Cargando...' : 'Gestionar suscripcion'}
              </button>
            </div>
          )}
        </div>

        {/* Upgrade CTA — shown when not pro */}
        {!isPro && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-5 w-5 text-[var(--color-accent)]" />
              <h2 className="text-lg font-bold text-gray-900">Plan Pro</h2>
            </div>
            <p className="text-sm text-gray-500">Todo lo que necesitas para tu negocio nautico</p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">300 EUR</span>
              <span className="text-gray-400 text-sm">/mes</span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">+ 1.500 EUR alta inicial (pago unico)</p>

            <ul className="mt-4 space-y-2">
              {PRO_FEATURES.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 shrink-0 text-green-500" />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              data-testid="subscription-upgrade-cta"
              onClick={handleCheckout}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-accent)] py-3.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Redirigiendo...' : 'Suscribirse por 300 EUR/mes'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

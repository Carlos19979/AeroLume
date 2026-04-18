'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';

const PLAN_INFO = {
  prueba: { label: 'Prueba', description: 'Acceso completo durante 7 dias' },
  pro: { label: 'Pro', description: '300 EUR/mes — acceso completo a todas las funcionalidades' },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'text-green-600 bg-green-50' },
  trialing: { label: 'Prueba', color: 'text-blue-600 bg-blue-50' },
  past_due: { label: 'Pago pendiente', color: 'text-amber-600 bg-amber-50' },
  canceled: { label: 'Cancelado', color: 'text-red-600 bg-red-50' },
};

export function SubscriptionClient({
  plan,
  status,
  trialEndsAt,
  hasSubscription,
}: {
  plan: string;
  status: string;
  trialEndsAt: string | null;
  hasSubscription: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const planInfo = PLAN_INFO[plan as keyof typeof PLAN_INFO] ?? PLAN_INFO.prueba;
  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS.trialing;

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isTrialActive = plan === 'prueba' && trialDaysLeft !== null && trialDaysLeft > 0;
  const isTrialExpired = plan === 'prueba' && (trialDaysLeft === null || trialDaysLeft <= 0);
  const isPro = plan === 'pro' && status === 'active';

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

  return (
    <>
      <PageHeader
        title="Suscripcion"
        description="Gestiona tu plan y facturacion"
      />

      <div className="max-w-2xl space-y-6">
        {/* Current Plan */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Plan actual</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p data-testid="subscription-plan-badge" className="text-2xl font-bold text-gray-900">{planInfo.label}</p>
              <p className="text-sm text-gray-500 mt-1">{planInfo.description}</p>
            </div>

            {isTrialActive && (
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  Te quedan <strong data-testid="subscription-trial-days-left">{trialDaysLeft} dias</strong> de prueba.
                  Suscribete para mantener el acceso.
                </p>
              </div>
            )}

            {isTrialExpired && (
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-sm text-amber-700">
                  Tu periodo de prueba ha expirado. Suscribete para recuperar el acceso completo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upgrade CTA */}
        {!isPro && (
          <div className="bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-accent)] rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold">Plan Pro</h2>
            <p className="text-white/70 mt-1 text-sm">Todo lo que necesitas para tu negocio nautico</p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold">300 EUR</span>
              <span className="text-white/60 text-sm">/mes</span>
            </div>
            <p className="text-white/50 text-xs mt-1">+ 1.500 EUR alta inicial (pago unico)</p>

            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>Widget personalizable white-label</li>
              <li>Dashboard completo de gestion</li>
              <li>API REST + Webhooks</li>
              <li>Analytics en tiempo real</li>
              <li>Soporte por email</li>
            </ul>

            <button
              data-testid="subscription-checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
              className="mt-6 w-full py-3 bg-white text-[var(--color-navy)] font-semibold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Redirigiendo...' : 'Suscribirse ahora'}
            </button>
          </div>
        )}

        {/* Active Pro */}
        {isPro && (
          <div className="bg-green-50 rounded-2xl border border-green-100 p-6">
            <p className="text-green-700 font-semibold">Tu suscripcion Pro esta activa.</p>
            <p className="text-sm text-green-600 mt-1">
              Para gestionar tu suscripcion (cancelar, actualizar metodo de pago), accede a tu portal de facturacion.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

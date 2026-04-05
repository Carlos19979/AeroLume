'use client';

import { useState } from 'react';

type Settings = {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  locale: string | null;
  currency: string | null;
  allowedOrigins: string[] | null;
  webhookUrl: string | null;
  plan: string | null;
  subscriptionStatus: string | null;
  trialEndsAt: Date | null;
};

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  trialing: { label: 'Periodo de prueba', color: 'bg-yellow-50 text-yellow-700' },
  active: { label: 'Activa', color: 'bg-green-50 text-green-700' },
  past_due: { label: 'Pago pendiente', color: 'bg-red-50 text-red-600' },
  canceled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500' },
};

export function SettingsClient({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(settings.name);
  const [customDomain, setCustomDomain] = useState(settings.customDomain || '');
  const [locale, setLocale] = useState(settings.locale || 'es');
  const [currency, setCurrency] = useState(settings.currency || 'EUR');
  const [originsText, setOriginsText] = useState(
    (settings.allowedOrigins || []).join('\n')
  );
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl || '');

  async function handleSave() {
    setSaving(true);
    const allowedOrigins = originsText
      .split('\n')
      .map((o) => o.trim())
      .filter(Boolean);

    const res = await fetch('/api/internal/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        customDomain: customDomain || null,
        locale,
        currency,
        allowedOrigins,
        webhookUrl: webhookUrl || null,
      }),
    });
    const { data } = await res.json();
    if (data) setSettings(data);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const status = STATUS_LABELS[settings.subscriptionStatus || ''] || STATUS_LABELS.trialing;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* General */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">General</h3>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre del workspace</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Dominio personalizado</label>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="configurador.tu-web.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Configura un CNAME apuntando a app.aerolume.com
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Idioma</label>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Seguridad</h3>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Orígenes permitidos</label>
            <textarea
              value={originsText}
              onChange={(e) => setOriginsText(e.target.value)}
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder={"https://tu-web.com\nhttps://staging.tu-web.com"}
            />
            <p className="text-xs text-gray-500 mt-1">
              Un dominio por línea. El widget solo funcionará desde estos orígenes.
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="https://tu-web.com/api/aerolume-webhook"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recibirás notificaciones POST cuando se creen presupuestos.
            </p>
          </div>
        </div>

        {/* Save */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[var(--color-accent)] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {saved && <span className="text-sm text-green-600 self-center">Guardado</span>}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-3">Suscripción</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Plan</dt>
              <dd className="text-gray-900 font-medium">
                {PLAN_LABELS[settings.plan || ''] || settings.plan}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Estado</dt>
              <dd>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
              </dd>
            </div>
            {settings.trialEndsAt && (
              <div>
                <dt className="text-gray-500">Prueba termina</dt>
                <dd className="text-gray-900">
                  {new Date(settings.trialEndsAt).toLocaleDateString('es')}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-3">Detalles técnicos</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Slug</dt>
              <dd className="font-mono text-gray-900">{settings.slug}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Tenant ID</dt>
              <dd className="font-mono text-xs text-gray-500">{settings.id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { SUBSCRIPTION_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { SaveButton, useSaveState } from '@/components/ui/SaveButton';

type Settings = {
  id: string;
  name: string;
  slug: string;
  companyName: string | null;
  phone: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
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
  prueba: 'Prueba',
  pro: 'Pro',
};


export function SettingsClient({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState(initialSettings);
  const { saving, saved, save } = useSaveState();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(settings.name);
  const [companyName, setCompanyName] = useState(settings.companyName || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [siteUrl, setSiteUrl] = useState(settings.website || '');
  const [country, setCountry] = useState(settings.country || '');
  const [city, setCity] = useState(settings.city || '');
  const [customDomain, setCustomDomain] = useState(settings.customDomain || '');
  const [locale, setLocale] = useState(settings.locale || 'es');
  const [currency, setCurrency] = useState(settings.currency || 'EUR');
  const [originsText, setOriginsText] = useState(
    (settings.allowedOrigins || []).join('\n')
  );
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl || '');

  async function handleSave() {
    await save(async () => {
      setError(null);
      const allowedOrigins = originsText
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean);

      const res = await fetch('/api/internal/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          companyName: companyName || null,
          phone: phone || null,
          website: siteUrl || null,
          country: country || null,
          city: city || null,
          customDomain: customDomain || null,
          locale,
          currency,
          allowedOrigins,
          webhookUrl: webhookUrl || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error inesperado');
      }
      const { data } = await res.json();
      if (data) setSettings(data);
    }).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : 'Error inesperado');
    });
  }

  const status = SUBSCRIPTION_STATUS_LABELS[settings.subscriptionStatus || ''] || SUBSCRIPTION_STATUS_LABELS.trialing;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* General */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">General</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre del workspace</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre de empresa</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="Tu veleria" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Telefono</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="+34 611 234 567" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Web</label>
              <input type="url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="tuveleria.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Pais</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="España" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ciudad</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="Valencia" />
            </div>
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
        <SaveButton
          saving={saving}
          saved={saved}
          onClick={handleSave}
          className="px-6 py-2 bg-[var(--color-accent)] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
        />
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
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </dd>
            </div>
            {settings.trialEndsAt && (
              <div>
                <dt className="text-gray-500">Prueba termina</dt>
                <dd className="text-gray-900">
                  {formatDate(settings.trialEndsAt)}
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

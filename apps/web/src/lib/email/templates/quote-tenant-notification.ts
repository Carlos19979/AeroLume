import type { EmailTemplate } from './contact-submission';
import type { QuoteItemRow } from './quote-customer';

function formatPrice(value: string | number | null | undefined, currency: string): string {
  if (value == null || value === '') return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(num);
}

export interface QuoteTenantNotificationPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerNotes?: string | null;
  boatModel: string;
  items: QuoteItemRow[];
  totalPrice?: string | number | null;
  currency: string;
}

export function quoteTenantNotificationTemplate(payload: QuoteTenantNotificationPayload): EmailTemplate {
  const { customerName, customerEmail, customerPhone, customerNotes, boatModel, items, totalPrice, currency } = payload;

  const subject = `Nuevo presupuesto — ${customerName} (${boatModel})`;

  const phoneLine = customerPhone ? `Teléfono: ${customerPhone}` : null;
  const notesLine = customerNotes ? `\nNotas: ${customerNotes}` : '';

  const itemLines = items.map((item) => {
    const area = item.sailArea ? ` · ${item.sailArea} m²` : '';
    const price = item.unitPrice ? ` · ${formatPrice(item.unitPrice, currency)}` : '';
    const qty = item.quantity && item.quantity > 1 ? ` x${item.quantity}` : '';
    return `  - ${item.productName} (${item.sailType}${area}${qty})${price}`;
  });

  const totalLine = totalPrice ? `\nTotal: ${formatPrice(totalPrice, currency)}` : '';

  const text = [
    `Se ha generado un nuevo presupuesto.`,
    ``,
    `Cliente: ${customerName}`,
    `Email: ${customerEmail}`,
    phoneLine,
    `Barco: ${boatModel}`,
    notesLine,
    ``,
    `Artículos:`,
    ...itemLines,
    totalLine,
  ]
    .filter((line) => line !== null)
    .join('\n');

  const phoneHtml = customerPhone
    ? `<tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Teléfono</td><td style="padding:4px 0 4px 16px;font-size:14px;">${customerPhone}</td></tr>`
    : '';

  const notesHtml = customerNotes
    ? `<div style="margin-top:16px;"><p style="margin:0 0 6px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Notas del cliente</p>
       <div style="background:#f3f4f6;border-radius:6px;padding:12px;color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap;">${customerNotes}</div></div>`
    : '';

  const itemRows = items
    .map((item) => {
      const area = item.sailArea ? `${item.sailArea} m²` : '—';
      const price = formatPrice(item.unitPrice, currency);
      const qty = item.quantity ?? 1;
      return `<tr>
        <td style="padding:10px 12px;font-size:14px;color:#374151;">${item.productName}</td>
        <td style="padding:10px 12px;font-size:14px;color:#6b7280;">${item.sailType}</td>
        <td style="padding:10px 12px;font-size:14px;color:#6b7280;text-align:right;">${area}</td>
        <td style="padding:10px 12px;font-size:14px;color:#6b7280;text-align:right;">${qty}</td>
        <td style="padding:10px 12px;font-size:14px;color:#374151;text-align:right;">${price}</td>
      </tr>`;
    })
    .join('');

  const totalRow = totalPrice
    ? `<tr style="border-top:2px solid #e5e7eb;">
        <td colspan="4" style="padding:12px;font-size:14px;font-weight:600;color:#374151;text-align:right;">Total</td>
        <td style="padding:12px;font-size:14px;font-weight:600;color:#0b5faa;text-align:right;">${formatPrice(totalPrice, currency)}</td>
      </tr>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr><td style="background:#0a2540;padding:24px 32px;">
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">Nuevo presupuesto generado</p>
          <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">${customerName} · ${boatModel}</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 20px;color:#374151;font-size:15px;">Se ha generado un nuevo presupuesto en tu plataforma.</p>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Cliente</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:500;">${customerName}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:4px 0 4px 16px;font-size:14px;"><a href="mailto:${customerEmail}" style="color:#0b5faa;">${customerEmail}</a></td></tr>
            ${phoneHtml}
            <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Barco</td><td style="padding:4px 0 4px 16px;font-size:14px;">${boatModel}</td></tr>
          </table>
          ${notesHtml}
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-top:24px;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;text-align:left;">Producto</th>
                <th style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;text-align:left;">Tipo</th>
                <th style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;text-align:right;">Área</th>
                <th style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;text-align:right;">Cant.</th>
                <th style="padding:10px 12px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;text-align:right;">Precio</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            ${totalRow}
          </table>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          Aerolume · Plataforma de configuración de velas
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

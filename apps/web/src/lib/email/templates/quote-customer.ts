import type { EmailTemplate } from './contact-submission';

export interface QuoteItemRow {
  productName: string;
  sailType: string;
  sailArea?: string | number | null;
  unitPrice?: string | number | null;
  quantity?: number | null;
}

export interface QuoteCustomerPayload {
  customerName: string;
  boatModel: string;
  items: QuoteItemRow[];
  totalPrice?: string | number | null;
  currency: string;
  tenantName: string;
}

function formatPrice(value: string | number | null | undefined, currency: string): string {
  if (value == null || value === '') return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(num);
}

export function quoteCustomerTemplate(payload: QuoteCustomerPayload): EmailTemplate {
  const { customerName, boatModel, items, totalPrice, currency, tenantName } = payload;

  const subject = `Tu presupuesto para ${boatModel} está listo`;

  const itemLines = items.map((item) => {
    const area = item.sailArea ? ` · ${item.sailArea} m²` : '';
    const price = item.unitPrice ? ` · ${formatPrice(item.unitPrice, currency)}` : '';
    const qty = item.quantity && item.quantity > 1 ? ` x${item.quantity}` : '';
    return `  - ${item.productName} (${item.sailType}${area}${qty})${price}`;
  });

  const totalLine = totalPrice
    ? `\nTotal: ${formatPrice(totalPrice, currency)}`
    : '';

  const text = [
    `Hola ${customerName},`,
    ``,
    `Tu presupuesto para ${boatModel} está listo.`,
    ``,
    `Artículos:`,
    ...itemLines,
    totalLine,
    ``,
    `Un saludo,`,
    tenantName,
  ].join('\n');

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
        <tr><td style="background:#0b5faa;padding:24px 32px;">
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">${tenantName}</p>
          <p style="margin:4px 0 0;color:#bfd9f5;font-size:13px;">Presupuesto para ${boatModel}</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 24px;color:#374151;font-size:15px;">Hola <strong>${customerName}</strong>, tu presupuesto está listo.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:24px;">
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
          <p style="margin:0;color:#6b7280;font-size:13px;">Para cualquier consulta, no dudes en contactarnos.</p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
          ${tenantName} · Aerolume
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export function contactSubmissionTemplate(payload: ContactSubmissionPayload): EmailTemplate {
  const { name, email, phone, message } = payload;

  const subject = `Nuevo contacto: ${name}`;

  const phoneLine = phone ? `Teléfono: ${phone}` : null;

  const text = [
    `Has recibido un nuevo mensaje de contacto.`,
    ``,
    `Nombre: ${name}`,
    `Email: ${email}`,
    phoneLine,
    ``,
    `Mensaje:`,
    message,
  ]
    .filter((line) => line !== null)
    .join('\n');

  const phoneHtml = phone
    ? `<tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Teléfono</td><td style="padding:4px 0 4px 16px;font-size:14px;">${phone}</td></tr>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr><td style="background:#0b5faa;padding:24px 32px;">
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">Nuevo contacto</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 24px;color:#374151;font-size:15px;">Has recibido un nuevo mensaje desde el formulario de contacto.</p>
          <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
            <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Nombre</td><td style="padding:4px 0 4px 16px;font-size:14px;">${name}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:4px 0 4px 16px;font-size:14px;"><a href="mailto:${email}" style="color:#0b5faa;">${email}</a></td></tr>
            ${phoneHtml}
          </table>
          <p style="margin:0 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">Mensaje</p>
          <div style="background:#f3f4f6;border-radius:6px;padding:16px;color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</div>
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

import { Resend } from 'resend';

let client: Resend | null = null;
let warned = false;

function getClient(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (!warned) {
      console.warn('[email] RESEND_API_KEY not set — email sending disabled');
      warned = true;
    }
    return null;
  }
  client = new Resend(key);
  return client;
}

export interface SendEmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface SendEmailResult {
  sent: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  const resend = getClient();
  if (!resend) return { sent: false, error: 'RESEND_API_KEY not configured' };

  const from =
    opts.from ??
    (process.env.QUOTES_FROM_EMAIL ?? 'presupuestos@aerolume.com');

  try {
    // Resend's type union requires at least one of text/html/react. Our callers
    // always provide at least one; cast to sidestep the strict discriminated union.
    const payload = {
      from,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    } as Parameters<typeof resend.emails.send>[0];
    const { data, error } = await resend.emails.send(payload);

    if (error) return { sent: false, error: error.message };
    return { sent: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { sent: false, error: message };
  }
}

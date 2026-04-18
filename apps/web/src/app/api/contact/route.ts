import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/resend';
import { contactSubmissionTemplate } from '@/lib/email/templates/contact-submission';

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  message: z.string().min(10).max(5000),
});

// Naive in-memory rate limiter: max 5 requests per 5 minutes per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count += 1;
  return true;
}

function getIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(request: Request) {
  const ip = getIp(request);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a few minutes.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }

  const data = result.data;

  // Sanitize
  const name = data.name.trim();
  const email = data.email.trim();
  const phone = data.phone?.trim() ?? null;
  const message = data.message.trim();

  const to = process.env.CONTACT_EMAIL;
  if (!to) {
    console.warn('[contact] CONTACT_EMAIL not set — skipping email send');
    return NextResponse.json({ ok: true });
  }

  const template = contactSubmissionTemplate({ name, email, phone, message });

  const { sent, error } = await sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  if (!sent) {
    console.error('[contact] sendEmail failed:', error);
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

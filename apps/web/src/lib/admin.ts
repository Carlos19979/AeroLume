const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

export function isSuperAdmin(email?: string | null): boolean {
  if (!email || SUPER_ADMIN_EMAILS.length === 0) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}

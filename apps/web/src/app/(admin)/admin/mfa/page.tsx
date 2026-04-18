import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { MfaEnrollClient } from './client';

export default async function MfaEnrollPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isSuperAdmin(user.email)) {
    redirect('/dashboard');
  }

  // Check if already enrolled and verified
  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const verifiedFactor = factorsData?.totp?.find((f) => f.status === 'verified');
  if (verifiedFactor) {
    redirect('/admin');
  }

  // Enroll a new TOTP factor
  const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'Aerolume Admin',
  });

  if (enrollError || !enrollData) {
    // If enrollment fails (e.g. factor limit), redirect to admin with error
    redirect('/admin?mfa_error=enroll_failed');
  }

  return (
    <MfaEnrollClient
      factorId={enrollData.id}
      qrCode={enrollData.totp.qr_code}
      secret={enrollData.totp.secret}
    />
  );
}

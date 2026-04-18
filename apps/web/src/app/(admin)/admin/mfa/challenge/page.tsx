import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { MfaChallengeClient } from './client';

interface Props {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function MfaChallengePage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isSuperAdmin(user.email)) {
    redirect('/dashboard');
  }

  // If already at aal2, skip challenge
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalData?.currentLevel === 'aal2') {
    const { redirectTo } = await searchParams;
    redirect(redirectTo ?? '/admin');
  }

  // Find the verified TOTP factor
  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const verifiedFactor = factorsData?.totp?.find((f) => f.status === 'verified');

  if (!verifiedFactor) {
    // No verified factor — send to enrollment
    redirect('/admin/mfa');
  }

  const { redirectTo } = await searchParams;
  const safeDest = redirectTo?.startsWith('/') ? redirectTo : '/admin';

  return (
    <MfaChallengeClient
      factorId={verifiedFactor.id}
      redirectTo={safeDest}
    />
  );
}

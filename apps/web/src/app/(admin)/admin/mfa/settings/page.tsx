import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/admin';
import { MfaSettingsClient } from './client';

export default async function MfaSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isSuperAdmin(user.email)) {
    redirect('/dashboard');
  }

  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const factors = factorsData?.totp ?? [];

  return <MfaSettingsClient factors={factors} />;
}

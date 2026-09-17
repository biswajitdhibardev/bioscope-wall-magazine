import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Server-side admin check. The configured ADMIN_EMAIL is a bootstrap fallback
 * for the owner account; the profile role remains the normal source of truth.
 */
export async function getAuthenticatedAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) return { user: null, isAdmin: false };

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const emailMatches = Boolean(configuredEmail && user.email?.toLowerCase() === configuredEmail);
  const isAdmin = profile?.role === 'admin' || emailMatches;

  // Keep the database in sync for the configured owner account.
  if (emailMatches && profile?.role !== 'admin') {
    await adminClient.from('profiles').upsert(
      { id: user.id, email: user.email ?? configuredEmail, role: 'admin' },
      { onConflict: 'id' }
    );
  }

  return { user, isAdmin };
}

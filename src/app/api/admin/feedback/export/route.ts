import { createAdminClient } from '@/lib/supabase/admin';

import { getAuthenticatedAdmin } from '@/lib/auth/admin';
export async function GET() {
  try {
    const { user, isAdmin } = await getAuthenticatedAdmin();
    if (!user) return new Response('Unauthorized', { status: 401 });
    if (!isAdmin) return new Response('Forbidden', { status: 403 });

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('ratings')
      .select('created_at, rating, feedback, reactions, artworks(title)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const headers = ['Date', 'Artwork', 'Rating', 'Feedback', 'Reactions'];
    const rows = data.map(r => [
      new Date(r.created_at).toISOString(),
      `"${(r.artworks?.[0]?.title || '').replace(/"/g, '""')}"`,
      r.rating,
      `"${(r.feedback || '').replace(/"/g, '""')}"`,
      `"${(r.reactions || []).join(', ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="feedback_export.csv"'
      }
    });
  } catch (error) {
    console.error('Feedback export error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

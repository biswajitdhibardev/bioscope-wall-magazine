import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

import { getAuthenticatedAdmin } from '@/lib/auth/admin';
export async function GET(req: Request) {
  try {
    const { user, isAdmin } = await getAuthenticatedAdmin();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const adminClient = createAdminClient();

    const { searchParams } = new URL(req.url);
    const artworkId = searchParams.get('artwork_id');
    const minRating = searchParams.get('min_rating');
    const maxRating = searchParams.get('max_rating');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    let query = adminClient
      .from('ratings')
      .select('*, artworks(title)', { count: 'exact' });

    if (artworkId) query = query.eq('artwork_id', artworkId);
    if (minRating) query = query.gte('rating', parseInt(minRating, 10));
    if (maxRating) query = query.lte('rating', parseInt(maxRating, 10));

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data.map(r => ({ ...r, artwork_title: r.artworks?.title })),
      total: count,
      page,
      limit
    });
  } catch (error) {
    console.error('Admin feedback GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, isAdmin } = await getAuthenticatedAdmin();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const adminClient = createAdminClient();

    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Missing rating ID' }, { status: 400 });

    const { error } = await adminClient.from('ratings').delete().eq('id', body.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin feedback DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

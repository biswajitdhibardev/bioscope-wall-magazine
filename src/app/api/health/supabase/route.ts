import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('artworks')
      .select('id')
      .eq('is_published', true)
      .limit(1);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 });
    }

    return NextResponse.json({ ok: true, supabase: true, publishedArtworkExists: Boolean(data?.length) });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

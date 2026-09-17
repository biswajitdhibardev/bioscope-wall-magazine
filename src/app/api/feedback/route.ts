import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { feedbackSchema } from '@/lib/validators';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour
const MAX_REQUESTS = 20;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    const { artwork_id, rating, feedback, reactions, anonymous_session_id } = parsed.data;

    // Rate Limiting
    const now = Date.now();
    const rateLimitData = rateLimitMap.get(anonymous_session_id);

    if (rateLimitData) {
      if (now > rateLimitData.resetTime) {
        rateLimitMap.set(anonymous_session_id, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      } else if (rateLimitData.count >= MAX_REQUESTS) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
      } else {
        rateLimitData.count++;
      }
    } else {
      rateLimitMap.set(anonymous_session_id, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    // Use the server-only service-role client so public feedback is not blocked by RLS.
    const adminClient = createAdminClient();

    // Validate that the artwork exists and is published before accepting feedback.
    const { data: artwork, error: artworkError } = await adminClient
      .from('artworks')
      .select('id, is_published')
      .eq('id', artwork_id)
      .maybeSingle();

    if (artworkError) {
      console.error('Error checking artwork before feedback:', artworkError);
      return NextResponse.json({
        error: 'Supabase artwork lookup failed',
        details: artworkError.message,
        code: artworkError.code,
      }, { status: 500 });
    }

    if (!artwork || !artwork.is_published) {
      return NextResponse.json({ error: 'Artwork not found or not published' }, { status: 404 });
    }

    // Check duplicate using Admin Client
    const { data: existingRating, error: checkError } = await adminClient
      .from('ratings')
      .select('id')
      .eq('artwork_id', artwork_id)
      .eq('anonymous_session_id', anonymous_session_id)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is not found
      console.error('Error checking duplicate rating:', checkError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (existingRating) {
      return NextResponse.json({ error: 'already_rated' }, { status: 409 });
    }

    // Insert with the server-only service-role client. This keeps public feedback
    // submission independent of client authentication/RLS configuration.
    const { error: insertError } = await adminClient
      .from('ratings')
      .insert({
        artwork_id,
        rating,
        feedback: feedback ?? null,
        reactions: reactions ?? [],
        anonymous_session_id
      });

    if (insertError) {
      console.error('Error inserting rating:', insertError);
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'already_rated' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to submit feedback', details: insertError.message }, { status: 500 });
    }

    // NEVER return any rating data, averages, or statistics
    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error('Feedback POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

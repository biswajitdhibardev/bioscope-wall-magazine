import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { DashboardOverview } from '@/lib/types';

import { getAuthenticatedAdmin } from '@/lib/auth/admin';
export async function GET() {
  try {
    // Verify admin
    const { user, isAdmin } = await getAuthenticatedAdmin();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const adminClient = createAdminClient();

    // Analytics queries
    const [
      { count: totalArtworks },
      { count: totalArtists },
      { count: totalRatings },
      { data: allRatings },
      { data: topArtworks },
      { data: recentFeedback }
    ] = await Promise.all([
      adminClient.from('artworks').select('*', { count: 'exact', head: true }),
      adminClient.from('artists').select('*', { count: 'exact', head: true }),
      adminClient.from('ratings').select('*', { count: 'exact', head: true }),
      adminClient.from('ratings').select('rating, reactions, created_at'),
      adminClient.from('artworks').select('id, title'),
      adminClient.from('ratings').select('id, artwork_id, rating, feedback, reactions, anonymous_session_id, created_at, artworks(title)').order('created_at', { ascending: false }).limit(20)
    ]);

    let avgRating = 0;
    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const reactionCounts: Record<string, number> = {};
    const artworkStats: Record<string, { count: number; total: number; title: string }> = {};

    if (topArtworks) {
      topArtworks.forEach(aw => {
        artworkStats[aw.id] = { count: 0, total: 0, title: aw.title };
      });
    }

    if (allRatings) {
      let totalScore = 0;
      allRatings.forEach(r => {
        totalScore += r.rating;
        ratingDist[r.rating as keyof typeof ratingDist]++;
        
        r.reactions?.forEach((reaction: string) => {
          reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
        });
      });
      if (allRatings.length > 0) avgRating = totalScore / allRatings.length;
    }

    // Now need to fetch all ratings to aggregate artwork stats properly for top 5 / most rated.
    // In a real app we'd use an RPC, but doing it in memory for now based on full fetch or multiple queries.
    // To save memory, let's fetch artwork rating aggregates.
    const { data: ratingAgg } = await adminClient.from('ratings').select('artwork_id, rating');
    
    if (ratingAgg) {
      ratingAgg.forEach(r => {
        if (artworkStats[r.artwork_id]) {
          artworkStats[r.artwork_id].count++;
          artworkStats[r.artwork_id].total += r.rating;
        }
      });
    }

    const artworkList = Object.values(artworkStats).filter(a => a.count > 0).map(a => ({
      title: a.title,
      count: a.count,
      avg: a.total / a.count
    }));

    const top5Rated = [...artworkList].sort((a, b) => b.avg - a.avg).slice(0, 5);
    const mostRated = [...artworkList].sort((a, b) => b.count - a.count).slice(0, 5);

    const mostRatedArtwork = mostRated.length > 0
      ? { title: mostRated[0].title, count: mostRated[0].count }
      : null;

    const highestRatedArtwork = top5Rated.length > 0
      ? { title: top5Rated[0].title, rating: Number(top5Rated[0].avg.toFixed(2)) }
      : null;

    const response: DashboardOverview = {
      total_artworks: totalArtworks || 0,
      total_artists: totalArtists || 0,
      total_feedback: totalRatings || 0,
      average_rating: Number(avgRating.toFixed(2)),
      most_rated_artwork: mostRatedArtwork,
      highest_rated_artwork: highestRatedArtwork,
      recent_feedback: (recentFeedback || []).map(f => ({
        id: f.id,
        artwork_id: f.artwork_id,
        rating: f.rating,
        feedback: f.feedback,
        reactions: f.reactions,
        anonymous_session_id: f.anonymous_session_id,
        created_at: f.created_at,
        artwork_title: f.artworks?.title || 'Untitled',
      })),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

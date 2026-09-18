import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { DashboardOverview } from '@/lib/types';
import { getAuthenticatedAdmin } from '@/lib/auth/admin';

export async function GET() {
  try {
    // Verify admin
    const { user, isAdmin } = await getAuthenticatedAdmin();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    // Fetch dashboard data
    const [
      { count: totalArtworks },
      { count: totalArtists },
      { count: totalRatings },
      { data: allRatings },
      { data: topArtworks },
      { data: recentFeedback },
    ] = await Promise.all([
      // Total artworks
      adminClient
        .from('artworks')
        .select('*', { count: 'exact', head: true }),

      // Total artists
      adminClient
        .from('artists')
        .select('*', { count: 'exact', head: true }),

      // Total feedback
      adminClient
        .from('ratings')
        .select('*', { count: 'exact', head: true }),

      // All ratings for average/rating distribution
      adminClient
        .from('ratings')
        .select('rating, reactions, created_at'),

      // All artworks for artwork statistics
      adminClient
        .from('artworks')
        .select('id, title'),

      // Recent feedback + related artwork title
      adminClient
        .from('ratings')
        .select(`
          id,
          artwork_id,
          rating,
          feedback,
          reactions,
          anonymous_session_id,
          created_at,
          artworks (
            title
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    // Average rating
    let avgRating = 0;

    const ratingDist = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    // Reaction counts
    const reactionCounts: Record<string, number> = {};

    // Artwork statistics
    const artworkStats: Record<
      string,
      {
        count: number;
        total: number;
        title: string;
      }
    > = {};

    // Initialize artwork statistics
    if (topArtworks) {
      topArtworks.forEach((artwork) => {
        artworkStats[artwork.id] = {
          count: 0,
          total: 0,
          title: artwork.title,
        };
      });
    }

    // Calculate rating statistics
    if (allRatings) {
      let totalScore = 0;

      allRatings.forEach((rating) => {
        totalScore += rating.rating;

        if (
          rating.rating >= 1 &&
          rating.rating <= 5
        ) {
          ratingDist[
            rating.rating as keyof typeof ratingDist
          ]++;
        }

        rating.reactions?.forEach(
          (reaction: string) => {
            reactionCounts[reaction] =
              (reactionCounts[reaction] || 0) + 1;
          }
        );
      });

      if (allRatings.length > 0) {
        avgRating =
          totalScore / allRatings.length;
      }
    }

    // Fetch artwork/rating relationship for statistics
    const { data: ratingAgg } =
      await adminClient
        .from('ratings')
        .select('artwork_id, rating');

    if (ratingAgg) {
      ratingAgg.forEach((rating) => {
        if (artworkStats[rating.artwork_id]) {
          artworkStats[rating.artwork_id].count++;
          artworkStats[rating.artwork_id].total +=
            rating.rating;
        }
      });
    }

    // Build artwork statistics
    const artworkList = Object.values(
      artworkStats
    )
      .filter((artwork) => artwork.count > 0)
      .map((artwork) => ({
        title: artwork.title,
        count: artwork.count,
        avg:
          artwork.total / artwork.count,
      }));

    // Most rated artworks
    const mostRated = [...artworkList]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Highest rated artworks
    const top5Rated = [...artworkList]
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);

    const mostRatedArtwork =
      mostRated.length > 0
        ? {
            title: mostRated[0].title,
            count: mostRated[0].count,
          }
        : null;

    const highestRatedArtwork =
      top5Rated.length > 0
        ? {
            title: top5Rated[0].title,
            rating: Number(
              top5Rated[0].avg.toFixed(2)
            ),
          }
        : null;

    // Format recent feedback

    const formattedRecentFeedback =
      (recentFeedback || []).map((feedback) => ({
        id: feedback.id,
        artwork_id: feedback.artwork_id,
        rating: feedback.rating,
        feedback: feedback.feedback,
        reactions: feedback.reactions,
        anonymous_session_id:
          feedback.anonymous_session_id,
        created_at: feedback.created_at,
        artwork_title:
          feedback.artworks?.title ||
          'Untitled',
      }));

    const response: DashboardOverview = {
      total_artworks:
        totalArtworks || 0,

      total_artists:
        totalArtists || 0,

      total_feedback:
        totalRatings || 0,

      average_rating:
        Number(avgRating.toFixed(2)),

      most_rated_artwork:
        mostRatedArtwork,

      highest_rated_artwork:
        highestRatedArtwork,

      recent_feedback:
        formattedRecentFeedback,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      'Analytics GET error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}
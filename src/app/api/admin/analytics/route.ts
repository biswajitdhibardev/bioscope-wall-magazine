import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { DashboardOverview } from '@/lib/types';
import { getAuthenticatedAdmin } from '@/lib/auth/admin';

export async function GET() {
  try {
    // Check admin authentication
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

    // DASHBOARD OVERVIEW

    const [
      { count: totalArtworks },
      { count: totalArtists },
      { count: totalRatings },
      { data: allRatings },
      { data: topArtworks },
      { data: recentRatings },
    ] = await Promise.all([
      // Total artworks
      adminClient
        .from('artworks')
        .select('*', {
          count: 'exact',
          head: true,
        }),

      // Total artists
      adminClient
        .from('artists')
        .select('*', {
          count: 'exact',
          head: true,
        }),

      // Total feedback
      adminClient
        .from('ratings')
        .select('*', {
          count: 'exact',
          head: true,
        }),

      // All ratings
      adminClient
        .from('ratings')
        .select(
          'rating, reactions, created_at'
        ),

      // All artworks
      adminClient
        .from('artworks')
        .select('id, title'),

      
      adminClient
        .from('ratings')
        .select(
          `
          id,
          artwork_id,
          rating,
          feedback,
          reactions,
          anonymous_session_id,
          created_at
          `
        )
        .order('created_at', {
          ascending: false,
        })
        .limit(20),
    ]);

    // AVERAGE RATING AND DISTRIBUTION

    let avgRating = 0;

    const ratingDist = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    const reactionCounts: Record<
      string,
      number
    > = {};

    if (allRatings) {
      let totalScore = 0;

      allRatings.forEach((rating) => {
        const value = Number(rating.rating) || 0;

        totalScore += value;

        if (
          value >= 1 &&
          value <= 5
        ) {
          ratingDist[
            value as keyof typeof ratingDist
          ]++;
        }

        if (rating.reactions) {
          rating.reactions.forEach(
            (reaction: string) => {
              reactionCounts[reaction] =
                (reactionCounts[reaction] || 0) + 1;
            }
          );
        }
      });

      if (allRatings.length > 0) {
        avgRating =
          totalScore / allRatings.length;
      }
    }

  // ARTWORK STATISTICS

    const artworkStats: Record<
      string,
      {
        count: number;
        total: number;
        title: string;
      }
    > = {};

    if (topArtworks) {
      topArtworks.forEach((artwork) => {
        artworkStats[artwork.id] = {
          count: 0,
          total: 0,
          title: artwork.title,
        };
      });
    }

    /*
     * Get all ratings for artwork statistics
     */
    const {
      data: ratingAgg,
    } = await adminClient
      .from('ratings')
      .select(
        'artwork_id, rating'
      );

    if (ratingAgg) {
      ratingAgg.forEach((rating) => {
        const artwork =
          artworkStats[
            rating.artwork_id
          ];

        if (artwork) {
          artwork.count++;
          artwork.total +=
            Number(rating.rating) || 0;
        }
      });
    }

    const artworkList =
      Object.values(artworkStats)
        .filter(
          (artwork) =>
            artwork.count > 0
        )
        .map((artwork) => ({
          title: artwork.title,
          count: artwork.count,
          avg:
            artwork.total /
            artwork.count,
        }));

    const mostRated =
      [...artworkList]
        .sort(
          (a, b) =>
            b.count - a.count
        )
        .slice(0, 5);

    const top5Rated =
      [...artworkList]
        .sort(
          (a, b) =>
            b.avg - a.avg
        )
        .slice(0, 5);

    const mostRatedArtwork =
      mostRated.length > 0
        ? {
            title:
              mostRated[0].title,
            count:
              mostRated[0].count,
          }
        : null;

    const highestRatedArtwork =
      top5Rated.length > 0
        ? {
            title:
              top5Rated[0].title,
            rating: Number(
              top5Rated[0].avg.toFixed(2)
            ),
          }
        : null;

    // Recent ratings

    const recentArtworkIds =
      Array.from(
        new Set(
          (recentRatings || [])
            .map(
              (rating) =>
                rating.artwork_id
            )
            .filter(Boolean)
        )
      );

    let artworkTitleMap: Record<
      string,
      string
    > = {};

    if (recentArtworkIds.length > 0) {
      const {
        data: recentArtworks,
        error: artworkError,
      } = await adminClient
        .from('artworks')
        .select('id, title')
        .in(
          'id',
          recentArtworkIds
        );

      if (artworkError) {
        console.error(
          'Failed to fetch artwork titles:',
          artworkError
        );
      }

      if (recentArtworks) {
        artworkTitleMap =
          recentArtworks.reduce(
            (
              map,
              artwork
            ) => {
              map[artwork.id] =
                artwork.title;

              return map;
            },
            {} as Record<
              string,
              string
            >
          );
      }
    }

    /*
     * Format recent feedback
     */
    const formattedRecentFeedback =
      (recentRatings || []).map(
        (feedback) => ({
          id: feedback.id,

          artwork_id:
            feedback.artwork_id,

          rating:
            feedback.rating,

          feedback:
            feedback.feedback,

          reactions:
            feedback.reactions,

          anonymous_session_id:
            feedback.anonymous_session_id,

          created_at:
            feedback.created_at,

          // Add the title
          artwork_title:
            feedback.artwork_id
              ? artworkTitleMap[
                  feedback.artwork_id
                ] || 'Untitled'
              : 'Untitled',
        })
      );


    const response: DashboardOverview = {
      total_artworks:
        totalArtworks || 0,

      total_artists:
        totalArtists || 0,

      total_feedback:
        totalRatings || 0,

      average_rating:
        Number(
          avgRating.toFixed(2)
        ),

      most_rated_artwork:
        mostRatedArtwork,

      highest_rated_artwork:
        highestRatedArtwork,

      recent_feedback:
        formattedRecentFeedback,
    };

    return NextResponse.json(
      response
    );
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
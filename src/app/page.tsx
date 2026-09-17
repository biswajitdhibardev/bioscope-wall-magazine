import { createClient } from '@/lib/supabase/server';
import HomeContent, { type HomeFeaturedExhibition } from './HomeContent';

export default async function HomePage() {
  let featuredExhibitions: HomeFeaturedExhibition[] = [];

  try {
    const supabase = await createClient();
    const { data: exhibitions, error } = await supabase
      .from('exhibitions')
      .select('id, name, description, cover_image, start_date, end_date, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (!error && exhibitions?.length) {
      const ids = exhibitions.map((exhibition) => exhibition.id);
      const { data: artworks } = await supabase
        .from('artworks')
        .select('id, title, image_path, image_url, exhibition_id')
        .in('exhibition_id', ids)
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      featuredExhibitions = exhibitions.map((exhibition) => ({
        ...exhibition,
        artworks: (artworks ?? []).filter((artwork) => artwork.exhibition_id === exhibition.id).slice(0, 3),
      }));
    }
  } catch (error) {
    console.error('Failed to load featured exhibitions:', error);
  }

  return <HomeContent featuredExhibitions={featuredExhibitions} />;
}

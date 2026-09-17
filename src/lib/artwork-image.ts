const DEFAULT_ARTWORK_IMAGE =
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop';

/**
 * Returns the image URL that should be used for an artwork.
 * Supabase Storage is preferred when image_path is present, while image_url
 * remains supported for older records that have not been migrated yet.
 */
export function getArtworkImageUrl(artwork: {
  image_path?: string | null;
  image_url?: string | null;
}): string {
  const imagePath = artwork.image_path?.trim();

  if (imagePath) {
    if (/^https?:\/\//i.test(imagePath)) return imagePath;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/artworks/${encodeURI(imagePath.replace(/^\/+/, ''))}`;
    }
  }

  return artwork.image_url?.trim() || DEFAULT_ARTWORK_IMAGE;
}

export { DEFAULT_ARTWORK_IMAGE };

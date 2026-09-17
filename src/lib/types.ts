/* ──────────────────────────────────────────────
   Bioscope Wall Magazine – TypeScript Types
   ────────────────────────────────────────────── */

// ─── Database Row Types ────────────────────────

export interface Exhibition {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Artist {
  id: string;
  name: string;
  biography: string | null;
  profile_image: string | null;
  artistic_style: string | null;
  education: string | null;
  social_links: SocialLinks | null;
  created_at: string;
  updated_at: string;
}

export interface Artwork {
  id: string;
  exhibition_id: string | null;
  artist_id: string | null;
  title: string;
  description: string | null;
  medium: string | null;
  dimensions: string | null;
  year: number | null;
  category: string | null;
  image_url: string | null;
  image_path?: string | null;
  video_url: string | null;
  audio_url: string | null;
  additional_info: Record<string, string> | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: string;
  artwork_id: string;
  rating: number;
  feedback: string | null;
  reactions: string[] | null;
  anonymous_session_id: string | null;
  created_at: string;
}

export interface QRCode {
  id: string;
  exhibition_id: string | null;
  artwork_id: string | null;
  label: string | null;
  qr_url: string | null;
  target_url: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
}

// ─── Joined / Extended Types ───────────────────

export interface ArtworkWithArtist extends Artwork {
  artist: Artist | null;
}

export interface ArtworkWithDetails extends Artwork {
  artist: Artist | null;
  exhibition: Exhibition | null;
}

export interface ArtistWithArtworks extends Artist {
  artworks: Artwork[];
}

export interface ExhibitionWithArtworks extends Exhibition {
  artworks: ArtworkWithArtist[];
}

// ─── Social Links ──────────────────────────────

export interface SocialLinks {
  website?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  behance?: string;
  [key: string]: string | undefined;
}

// ─── Feedback / Rating Types ───────────────────

export const REACTION_OPTIONS = [
  "Inspiring",
  "Beautiful",
  "Thought-provoking",
  "Creative",
  "Emotional",
  "Unique",
] as const;

export type ReactionType = (typeof REACTION_OPTIONS)[number];

export interface FeedbackSubmission {
  artwork_id: string;
  rating: number;
  feedback?: string;
  reactions?: ReactionType[];
  anonymous_session_id: string;
}

// ─── Admin Analytics Types ─────────────────────

export interface RatingStats {
  artwork_id: string;
  artwork_title: string;
  average_rating: number;
  total_ratings: number;
  distribution: Record<number, number>;
}

export interface ArtistStats {
  artist_id: string;
  artist_name: string;
  average_rating: number;
  total_ratings: number;
  artwork_count: number;
}

export interface DashboardOverview {
  total_artworks: number;
  total_artists: number;
  total_feedback: number;
  average_rating: number;
  most_rated_artwork: { title: string; count: number } | null;
  highest_rated_artwork: { title: string; rating: number } | null;
  recent_feedback: (Rating & { artwork_title: string })[];
}

export interface FeedbackTrend {
  date: string;
  count: number;
  average_rating: number;
}

// ─── Form Types ────────────────────────────────

export interface ArtworkFormData {
  title: string;
  description: string;
  medium: string;
  dimensions: string;
  year: number | null;
  category: string;
  artist_id: string;
  exhibition_id: string;
  is_published: boolean;
  image_url: string;
  image_path?: string;
  video_url: string;
  audio_url: string;
}

export interface ArtistFormData {
  name: string;
  biography: string;
  artistic_style: string;
  education: string;
  profile_image: string;
  social_links: SocialLinks;
}

export interface ExhibitionFormData {
  name: string;
  description: string;
  cover_image: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// ─── Category / Filter Types ───────────────────

export const ARTWORK_CATEGORIES = [
  "Painting",
  "Sculpture",
  "Digital Art",
  "Photography",
  "Mixed Media",
  "Installation",
  "Print",
  "Drawing",
  "Textile",
  "Ceramics",
] as const;

export type ArtworkCategory = (typeof ARTWORK_CATEGORIES)[number];

export interface GalleryFilters {
  category: string | null;
  artist_id: string | null;
  search: string;
}

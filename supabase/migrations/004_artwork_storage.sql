-- Add a Supabase Storage path for artwork files.
-- Safe to run after the existing Bioscope migrations.
ALTER TABLE public.artworks
ADD COLUMN IF NOT EXISTS image_path TEXT;

CREATE INDEX IF NOT EXISTS idx_artworks_image_path ON public.artworks(image_path);

-- Repair migration for public artwork browsing + feedback.
-- Safe to run after 001_initial_schema.sql and 002_fix_admin_rls.sql.

CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  reactions TEXT[] DEFAULT '{}',
  anonymous_session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(artwork_id, anonymous_session_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ratings_artwork_id ON public.ratings(artwork_id);
CREATE INDEX IF NOT EXISTS idx_ratings_session_id ON public.ratings(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON public.ratings(created_at);

DROP POLICY IF EXISTS "Public can insert ratings" ON public.ratings;
CREATE POLICY "Public can insert ratings"
  ON public.ratings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view ratings" ON public.ratings;
CREATE POLICY "Admins can view ratings"
  ON public.ratings FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete ratings" ON public.ratings;
CREATE POLICY "Admins can delete ratings"
  ON public.ratings FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Public gallery reads. The application also performs these reads server-side
-- with the service-role client, but these policies keep direct public reads safe.
DROP POLICY IF EXISTS "Public can view published artworks" ON public.artworks;
CREATE POLICY "Public can view published artworks"
  ON public.artworks FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS "Public can view artists" ON public.artists;
CREATE POLICY "Public can view artists"
  ON public.artists FOR SELECT
  TO anon, authenticated
  USING (true);

-- Make sure the ratings table is part of Supabase Realtime if it is not already.
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ratings;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

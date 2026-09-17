-- Fix admin authorization without recursive profiles RLS checks.
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

DROP POLICY IF EXISTS "Admins can do everything on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can do everything on exhibitions" ON public.exhibitions;
DROP POLICY IF EXISTS "Admins can do everything on artists" ON public.artists;
DROP POLICY IF EXISTS "Admins can do everything on artworks" ON public.artworks;
DROP POLICY IF EXISTS "Admins can view ratings" ON public.ratings;
DROP POLICY IF EXISTS "Admins can delete ratings" ON public.ratings;
DROP POLICY IF EXISTS "Admins can do everything on qr codes" ON public.qr_codes;

CREATE POLICY "Admins can do everything on profiles" ON public.profiles
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can do everything on exhibitions" ON public.exhibitions
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can do everything on artists" ON public.artists
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can do everything on artworks" ON public.artworks
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can view ratings" ON public.ratings
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete ratings" ON public.ratings
  FOR DELETE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can do everything on qr codes" ON public.qr_codes
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

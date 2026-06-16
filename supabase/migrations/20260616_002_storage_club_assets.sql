-- ═══════════════════════════════════════════════════════════════
-- Migration 20260616_002 — Supabase Storage bucket "club-assets"
-- Stocke logos, photos stades, photos joueurs, images produits.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'club-assets',
  'club-assets',
  true,                          -- accès public en lecture (CDN)
  10485760,                      -- 10 MB max par fichier
  ARRAY[
    'image/jpeg','image/jpg','image/png','image/webp','image/avif','image/gif','image/svg+xml'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique (tout le monde peut voir logos/photos)
DROP POLICY IF EXISTS "club-assets public read" ON storage.objects;
CREATE POLICY "club-assets public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'club-assets');

-- Écriture : super_admin uniquement
DROP POLICY IF EXISTS "club-assets super_admin write" ON storage.objects;
CREATE POLICY "club-assets super_admin write"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'club-assets'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );

DROP POLICY IF EXISTS "club-assets super_admin update" ON storage.objects;
CREATE POLICY "club-assets super_admin update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'club-assets'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );

DROP POLICY IF EXISTS "club-assets super_admin delete" ON storage.objects;
CREATE POLICY "club-assets super_admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'club-assets'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
  );

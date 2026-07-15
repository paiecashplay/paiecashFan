-- ═══════════════════════════════════════════════════════════════
-- chat-moderation-content.sql — Étend la modération au FIL (posts + commentaires).
--
-- Problème corrigé : les lots 1→5 ne couvraient que `fan_messages`. Un post ou
-- un commentaire ne pouvait être ni signalé, ni masqué, ni analysé par l'IA —
-- il suffisait de passer par le fil pour contourner toute la modération.
--
-- Choix : signalements et dossiers deviennent POLYMORPHES
-- (content_type + content_id) plutôt que d'empiler message_id/post_id/comment_id.
-- Les tables chat_reports et chat_moderation_cases sont vides : migration propre.
--
-- À exécuter dans Supabase SQL Editor (projet npmenstkeahngrzemmna).
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. Colonnes de modération sur les POSTS (mêmes que fan_messages)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.fan_posts
  ADD COLUMN IF NOT EXISTS moderation_status  text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS moderation_case_id uuid,
  ADD COLUMN IF NOT EXISTS deleted_at         timestamptz,
  ADD COLUMN IF NOT EXISTS edited_at          timestamptz;

ALTER TABLE public.fan_posts DROP CONSTRAINT IF EXISTS fan_posts_moderation_status_check;
ALTER TABLE public.fan_posts ADD CONSTRAINT fan_posts_moderation_status_check
  CHECK (moderation_status IN ('pending', 'published', 'hidden', 'removed', 'blocked'));

CREATE INDEX IF NOT EXISTS fan_posts_moderation_idx
  ON public.fan_posts (tenant_id, moderation_status, deleted_at);

-- ─────────────────────────────────────────────────────────────
-- 2. Colonnes de modération sur les COMMENTAIRES
--    ⚠️ fan_comments n'a PAS de tenant_id : il est rattaché via post_id.
--    Le cloisonnement club_admin résout donc le tenant par le post parent
--    (et le dossier stocke tenant_id de façon dénormalisée).
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.fan_comments
  ADD COLUMN IF NOT EXISTS moderation_status  text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS moderation_case_id uuid,
  ADD COLUMN IF NOT EXISTS deleted_at         timestamptz,
  ADD COLUMN IF NOT EXISTS edited_at          timestamptz;

ALTER TABLE public.fan_comments DROP CONSTRAINT IF EXISTS fan_comments_moderation_status_check;
ALTER TABLE public.fan_comments ADD CONSTRAINT fan_comments_moderation_status_check
  CHECK (moderation_status IN ('pending', 'published', 'hidden', 'removed', 'blocked'));

CREATE INDEX IF NOT EXISTS fan_comments_moderation_idx
  ON public.fan_comments (post_id, moderation_status, deleted_at);

-- ─────────────────────────────────────────────────────────────
-- 3. SIGNALEMENTS polymorphes
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.chat_reports
  ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'message',
  ADD COLUMN IF NOT EXISTS content_id   uuid;

-- Reprise de l'existant (tables vides en pratique, mais l'ordre reste correct).
UPDATE public.chat_reports SET content_id = message_id
  WHERE content_id IS NULL AND message_id IS NOT NULL;
DELETE FROM public.chat_reports WHERE content_id IS NULL;

ALTER TABLE public.chat_reports ALTER COLUMN content_id SET NOT NULL;

ALTER TABLE public.chat_reports DROP CONSTRAINT IF EXISTS chat_reports_content_type_check;
ALTER TABLE public.chat_reports ADD CONSTRAINT chat_reports_content_type_check
  CHECK (content_type IN ('message', 'post', 'comment'));

-- DROP COLUMN retire aussi la FK, l'unicité (message_id, reporter_user_id)
-- et l'index qui en dépendaient.
ALTER TABLE public.chat_reports DROP COLUMN IF EXISTS message_id;

-- Un supporter ne signale qu'UNE fois le même contenu (remplace l'ancienne unicité).
CREATE UNIQUE INDEX IF NOT EXISTS chat_reports_one_per_user_per_content
  ON public.chat_reports (content_type, content_id, reporter_user_id);
CREATE INDEX IF NOT EXISTS chat_reports_content_idx
  ON public.chat_reports (content_type, content_id);

-- ─────────────────────────────────────────────────────────────
-- 4. DOSSIERS polymorphes
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.chat_moderation_cases
  ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'message',
  ADD COLUMN IF NOT EXISTS content_id   uuid;

UPDATE public.chat_moderation_cases SET content_id = message_id
  WHERE content_id IS NULL AND message_id IS NOT NULL;

ALTER TABLE public.chat_moderation_cases DROP CONSTRAINT IF EXISTS chat_cases_content_type_check;
ALTER TABLE public.chat_moderation_cases ADD CONSTRAINT chat_cases_content_type_check
  CHECK (content_type IN ('message', 'post', 'comment'));

DROP INDEX IF EXISTS public.chat_cases_one_open_per_message;
ALTER TABLE public.chat_moderation_cases DROP COLUMN IF EXISTS message_id;

-- Un seul dossier ouvert par contenu (remplace chat_cases_one_open_per_message).
CREATE UNIQUE INDEX IF NOT EXISTS chat_cases_one_open_per_content
  ON public.chat_moderation_cases (content_type, content_id)
  WHERE status IN ('open', 'in_review');
CREATE INDEX IF NOT EXISTS chat_cases_content_idx
  ON public.chat_moderation_cases (content_type, content_id);

-- ─────────────────────────────────────────────────────────────
-- 5. Vérification
-- ─────────────────────────────────────────────────────────────
-- SELECT content_type, count(*) FROM public.chat_moderation_cases GROUP BY 1;
-- SELECT moderation_status, count(*) FROM public.fan_posts GROUP BY 1;
-- SELECT moderation_status, count(*) FROM public.fan_comments GROUP BY 1;

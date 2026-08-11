-- ═══════════════════════════════════════════════════════════════
-- shop-live-chat.sql — Chat en direct du Live Boutique (façon Whatnot).
--
-- Les acheteurs posent des questions au vendeur du club, réagissent par
-- emoji sur les messages, et « likent » le live (cœurs flottants). Le
-- streaming vidéo reste MediaLive (RTMP→HLS) ; ceci ne concerne que le chat.
--
-- Miroir du chat Fan Club (fan_messages / fan_message_reactions) mais scopé
-- à une salle de live (live_room_id) au lieu d'un club (tenant_id).
--
-- À exécuter dans Supabase SQL Editor (projet npmenstkeahngrzemmna).
-- ═══════════════════════════════════════════════════════════════

-- ── Messages du chat d'une salle de live ─────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_live_messages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_room_id      uuid NOT NULL REFERENCES public.shop_live_rooms(id) ON DELETE CASCADE,
  author_id         uuid NOT NULL,                    -- profiles.id (= session Supabase Auth)
  content           text NOT NULL,
  moderation_status text NOT NULL DEFAULT 'published',
  deleted_at        timestamptz,                      -- suppression douce
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shop_live_messages_moderation_check
    CHECK (moderation_status IN ('pending', 'published', 'hidden', 'removed', 'blocked'))
);

-- Requête chaude : les messages publiés d'une salle, par ordre chronologique.
CREATE INDEX IF NOT EXISTS shop_live_messages_room_idx
  ON public.shop_live_messages (live_room_id, created_at);

-- ── Réactions emoji sur les messages ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.shop_live_message_reactions (
  message_id uuid NOT NULL REFERENCES public.shop_live_messages(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL,
  emoji      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS shop_live_message_reactions_message_idx
  ON public.shop_live_message_reactions (message_id);

-- Liste blanche d'emojis (même jeu que le chat Fan Club).
ALTER TABLE public.shop_live_message_reactions DROP CONSTRAINT IF EXISTS shop_live_message_reactions_emoji_check;
ALTER TABLE public.shop_live_message_reactions ADD CONSTRAINT shop_live_message_reactions_emoji_check
  CHECK (emoji IN ('👍', '👎', '❤️', '😂', '😮', '🔥'));

-- ── Compteur de « likes » (cœurs flottants) par salle ────────────
-- Un simple compteur cumulé sur la salle : chaque tap ❤️ l'incrémente.
-- Les cœurs flottants côté client sont éphémères ; seul le total persiste.
ALTER TABLE public.shop_live_rooms
  ADD COLUMN IF NOT EXISTS like_count integer NOT NULL DEFAULT 0;

-- Incrément atomique du compteur de likes (évite les races de lecture/écriture).
CREATE OR REPLACE FUNCTION public.shop_live_increment_like(p_room_id uuid, p_by integer DEFAULT 1)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_total integer;
BEGIN
  UPDATE public.shop_live_rooms
     SET like_count = like_count + GREATEST(1, p_by)
   WHERE id = p_room_id
  RETURNING like_count INTO v_total;
  RETURN v_total;
END;
$$;

-- RLS deny-all : tout passe par le backend (service-role). Convention projet.
ALTER TABLE public.shop_live_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_live_message_reactions ENABLE ROW LEVEL SECURITY;

-- Rafraîchit le cache de schéma PostgREST (sinon la colonne / fonction toute
-- neuve peut apparaître « introuvable » via l'API REST pendant ~1 min).
NOTIFY pgrst, 'reload schema';

-- Vérification :
-- SELECT count(*) FROM public.shop_live_messages;
-- SELECT id, title, like_count FROM public.shop_live_rooms ORDER BY created_at DESC LIMIT 5;

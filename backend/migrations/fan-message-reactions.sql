-- ═══════════════════════════════════════════════════════════════
-- fan-message-reactions.sql — Réactions emoji sur les messages du chat.
--
-- Un supporter peut poser plusieurs emojis DIFFÉRENTS sur un même message,
-- mais une seule fois chacun (clic = bascule). D'où la clé primaire composite.
--
-- À exécuter dans Supabase SQL Editor (projet npmenstkeahngrzemmna).
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.fan_message_reactions (
  message_id uuid NOT NULL REFERENCES public.fan_messages(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL,
  emoji      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id, emoji)
);

-- Requête chaude : toutes les réactions des messages affichés.
CREATE INDEX IF NOT EXISTS fan_message_reactions_message_idx
  ON public.fan_message_reactions (message_id);

-- Liste blanche : on n'accepte que le jeu d'emojis de l'interface (le backend
-- valide aussi, mais la base reste la dernière barrière).
ALTER TABLE public.fan_message_reactions DROP CONSTRAINT IF EXISTS fan_message_reactions_emoji_check;
ALTER TABLE public.fan_message_reactions ADD CONSTRAINT fan_message_reactions_emoji_check
  CHECK (emoji IN ('👍', '👎', '❤️', '😂', '😮', '🔥'));

-- RLS deny-all : l'accès passe exclusivement par le backend (service-role).
ALTER TABLE public.fan_message_reactions ENABLE ROW LEVEL SECURITY;

-- Vérification :
-- SELECT emoji, count(*) FROM public.fan_message_reactions GROUP BY 1 ORDER BY 2 DESC;

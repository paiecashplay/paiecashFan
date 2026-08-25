-- ═══════════════════════════════════════════════════════════════
-- shop-live-chat-moderation.sql — Modération du chat Live Boutique.
--
-- Ajoute de quoi qu'un MODÉRATEUR (le club) réponde aux questions façon
-- Whatnot : un badge « Club » sur ses messages (is_host) et la possibilité
-- de RÉPONDRE en citant une question précise (reply_to).
--
-- Suite de shop-live-chat.sql. Idempotent (ADD COLUMN IF NOT EXISTS).
-- ⚠️ À exécuter sur le BON projet : celui de l'app = npmenstkeahngrzemmna
--    (dashboard : app.supabase.com/project/npmenstkeahngrzemmna → SQL Editor).
-- ═══════════════════════════════════════════════════════════════

-- Message émis par le club / un modérateur (badge côté interface).
ALTER TABLE public.shop_live_messages
  ADD COLUMN IF NOT EXISTS is_host boolean NOT NULL DEFAULT false;

-- Réponse à une question précise (citation façon Whatnot). ON DELETE SET NULL :
-- si la question citée est supprimée, la réponse reste (sans citation).
ALTER TABLE public.shop_live_messages
  ADD COLUMN IF NOT EXISTS reply_to uuid REFERENCES public.shop_live_messages(id) ON DELETE SET NULL;

-- Rafraîchit le cache de schéma PostgREST (colonnes neuves visibles tout de suite).
NOTIFY pgrst, 'reload schema';

-- Vérification :
-- SELECT id, is_host, reply_to, content FROM public.shop_live_messages ORDER BY created_at DESC LIMIT 10;

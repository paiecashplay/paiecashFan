-- ═══════════════════════════════════════════════════════════════
-- chat-presence.sql — Chantier 2 : présence en ligne PAR SALON.
--
-- Un « battement de cœur » (heartbeat) met à jour last_seen_at. Un supporter
-- est « en ligne » dans un salon si son last_seen < ~75 s. C'est volontairement
-- simple (pas de websocket) : le front pingue toutes les 30 s tant que la page
-- est ouverte et l'onglet visible.
--
-- À exécuter dans Supabase SQL Editor (projet npmenstkeahngrzemmna).
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.chat_presence (
  tenant_id    uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);

-- Requête chaude : « qui est en ligne dans ce salon » (filtre sur last_seen).
CREATE INDEX IF NOT EXISTS chat_presence_tenant_seen_idx
  ON public.chat_presence (tenant_id, last_seen_at DESC);

-- RLS deny-all : l'accès passe exclusivement par le backend (service-role).
ALTER TABLE public.chat_presence ENABLE ROW LEVEL SECURITY;

-- Vérification :
-- SELECT tenant_id, count(*) FROM public.chat_presence
--   WHERE last_seen_at > now() - interval '75 seconds' GROUP BY 1;

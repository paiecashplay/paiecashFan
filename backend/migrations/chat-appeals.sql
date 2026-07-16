-- ═══════════════════════════════════════════════════════════════
-- chat-appeals.sql — Lot 7 : appels (contestation d'une décision).
--
-- Un fan peut contester UN contenu modéré (dossier) OU une sanction. D'où une
-- cible POLYMORPHE : les suspensions conservatoires (Lot 6) n'ont pas de dossier,
-- et ce sont justement celles qu'un fan voudra le plus contester.
--
-- À exécuter dans Supabase SQL Editor (projet npmenstkeahngrzemmna).
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.chat_appeals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- NULLABLE : une sanction GLOBALE (ban de tous les salons) n'a pas de salon.
  -- Ces appels-là sont traités par le super_admin uniquement.
  tenant_id       uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL,                 -- le fan qui conteste
  target_type     text NOT NULL,                 -- 'case' | 'sanction'
  target_id       uuid NOT NULL,                 -- id du dossier ou de la sanction
  reason          text,                          -- l'explication du fan
  status          text NOT NULL DEFAULT 'open',  -- open | accepted | rejected
  resolution_note text,                          -- mot du modérateur
  resolved_by     uuid,
  resolved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_appeals_target_type_check CHECK (target_type IN ('case', 'sanction')),
  CONSTRAINT chat_appeals_status_check      CHECK (status IN ('open', 'accepted', 'rejected'))
);

-- Un seul appel par cible et par fan (empêche le spam et le ré-appel après rejet).
CREATE UNIQUE INDEX IF NOT EXISTS chat_appeals_one_per_user_target
  ON public.chat_appeals (target_type, target_id, user_id);

CREATE INDEX IF NOT EXISTS chat_appeals_tenant_idx
  ON public.chat_appeals (tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS chat_appeals_user_idx
  ON public.chat_appeals (user_id);

-- RLS deny-all : l'accès passe exclusivement par le backend (service-role).
ALTER TABLE public.chat_appeals ENABLE ROW LEVEL SECURITY;

-- Vérification :
-- SELECT status, count(*) FROM public.chat_appeals GROUP BY 1;

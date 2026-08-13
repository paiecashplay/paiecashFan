-- ═══════════════════════════════════════════════════════════════
-- revshare-pending.sql — Reversement (revshare) des produits plateforme
--
-- Option A (recommandée par PaieCashCoin) : l'acheteur paie UNE fois → PaieCash
-- Store encaisse le montant plein, puis le backend reverse la commission (10%)
-- au club en PCC pur (paiecashstore → club), de façon ASYNCHRONE et fiable.
--   • webhook_events   : idempotence des webhooks PaieCashCoin (event.id unique)
--   • revshare_pending : file d'attente des reversements + retries
--
-- À exécuter sur le projet npmenstkeahngrzemmna. Idempotent.
-- ═══════════════════════════════════════════════════════════════

-- Idempotence des webhooks : on ne traite chaque event PaieCashCoin qu'une fois.
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id           text PRIMARY KEY,               -- event.id PaieCashCoin (evt_…)
  type         text,
  received_at  timestamptz NOT NULL DEFAULT now(),
  payload      jsonb
);

-- File de reversement : une ligne par commission à verser au club.
CREATE TABLE IF NOT EXISTS public.revshare_pending (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  commission_id  uuid REFERENCES public.platform_commissions(id) ON DELETE SET NULL,
  club_slug      text NOT NULL,                 -- recipientSlug du club (public_slug PCC)
  club_tenant_id uuid,
  amount_eur     numeric(12,2) NOT NULL,        -- montant à reverser (= commission)
  sale_reference text,                          -- référence PaieCashCoin de la vente
  idempotency_key text UNIQUE,                  -- ex. revshare-<orderId> (anti double-versement)
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','processing','done','failed')),
  attempts       integer NOT NULL DEFAULT 0,
  last_error     text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  processed_at   timestamptz
);

CREATE INDEX IF NOT EXISTS idx_revshare_pending_status
  ON public.revshare_pending (status, created_at);

-- RLS deny-all : accès exclusivement via le backend (service-role).
ALTER TABLE public.webhook_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revshare_pending ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';

-- Vérification :
-- SELECT status, count(*) FROM public.revshare_pending GROUP BY 1;

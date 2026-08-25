-- ═══════════════════════════════════════════════════════════════
-- platform-products.sql — Produits « plateforme » (ex. lunettes Aivora)
--
-- Un produit plateforme (is_global=true) est possédé par le tenant caché
-- « PaieCash Store » et s'affiche dans TOUTES les boutiques de clubs.
-- À la vente, le paiement est réparti : (100 - taux)% → PaieCash Store,
-- taux% → le club de la boutique (défaut 10%, porté par products.metadata.commissionPct).
-- Chaque reversement est tracé dans platform_commissions (vue BO « Reversements »).
--
-- ⚠️ À exécuter sur le BON projet : celui de l'app = npmenstkeahngrzemmna
--    (dashboard : app.supabase.com/project/npmenstkeahngrzemmna → SQL Editor).
-- Idempotent.
-- ═══════════════════════════════════════════════════════════════

-- 1) Flag « produit global » (affiché dans toutes les boutiques).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_global boolean NOT NULL DEFAULT false;

-- Requête chaude : les produits globaux actifs, joints à chaque boutique.
CREATE INDEX IF NOT EXISTS idx_products_is_global
  ON public.products (is_global) WHERE is_global = true;

-- 2) Tenant caché « PaieCash Store » : propriétaire des produits plateforme
--    + marchand qui encaisse la part plateforme. metadata.platformStore=true
--    permet de l'exclure du listing public des clubs.
INSERT INTO public.tenants (slug, name, type, status, primary_color, metadata)
VALUES ('paiecash-store', 'PaieCash Store', 'club', 'active', '#10b981', '{"platformStore": true}'::jsonb)
ON CONFLICT (slug) DO UPDATE
  SET metadata = public.tenants.metadata || '{"platformStore": true}'::jsonb;

-- 3) Registre des commissions reversées aux clubs sur les ventes plateforme.
CREATE TABLE IF NOT EXISTS public.platform_commissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  club_tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,  -- club de la boutique (bénéficiaire)
  product_id     uuid REFERENCES public.products(id) ON DELETE SET NULL,
  buyer_user_id  uuid,                                                   -- acheteur (auth.users.id)
  gross_pcc      numeric(20,8) NOT NULL DEFAULT 0,                       -- base de calcul (PCC)
  gross_eur      numeric(12,2) NOT NULL DEFAULT 0,
  rate           numeric(5,2)  NOT NULL DEFAULT 10,                      -- taux appliqué (%)
  commission_pcc numeric(20,8) NOT NULL DEFAULT 0,                       -- montant reversé (PCC)
  commission_eur numeric(12,2) NOT NULL DEFAULT 0,
  pcc_reference  text,                                                   -- référence du paiement PaieCashCoin
  status         text NOT NULL DEFAULT 'paid'
                 CHECK (status IN ('paid','pending','failed')),          -- paid = versé au club au paiement
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_commissions_club
  ON public.platform_commissions (club_tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_commissions_status
  ON public.platform_commissions (status);

-- RLS deny-all : accès exclusivement via le backend (service-role). Convention projet.
ALTER TABLE public.platform_commissions ENABLE ROW LEVEL SECURITY;

-- Rafraîchit le cache de schéma PostgREST (colonne + table neuves).
NOTIFY pgrst, 'reload schema';

-- Vérification :
-- SELECT id, name, is_global FROM public.products WHERE is_global;
-- SELECT slug, name, metadata FROM public.tenants WHERE slug = 'paiecash-store';
-- SELECT club_tenant_id, count(*), sum(commission_pcc) FROM public.platform_commissions GROUP BY 1;

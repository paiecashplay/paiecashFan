-- ═══════════════════════════════════════════════════════════════
-- Migration 20260618_001 — RLS panier (orders + order_items)
-- Le panier = une ligne `orders` au statut 'cart' + ses `order_items`.
-- Géré directement depuis le front (client anon) : chaque utilisateur
-- ne peut voir/modifier QUE ses propres commandes via auth.uid().
-- Le backend (service_role) bypasse ces policies pour la gestion admin.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ─── orders : propriétaire uniquement ────────────────────────────
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "orders_update_own" ON public.orders;
CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "orders_delete_own" ON public.orders;
CREATE POLICY "orders_delete_own" ON public.orders
  FOR DELETE USING (user_id = auth.uid());

-- ─── order_items : via la commande parente ───────────────────────
DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "order_items_insert_own" ON public.order_items;
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "order_items_update_own" ON public.order_items;
CREATE POLICY "order_items_update_own" ON public.order_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "order_items_delete_own" ON public.order_items;
CREATE POLICY "order_items_delete_own" ON public.order_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

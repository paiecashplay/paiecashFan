-- ═══════════════════════════════════════════════════════════════
-- orders-tenant-nullable.sql
-- Rend orders.tenant_id NULLABLE.
--
-- Pourquoi : les tombolas sont « plateforme » (sans club → tenant_id NULL).
-- Pour offrir le paiement CARTE sur la tombola, l'achat passe désormais par le
-- moteur de checkout générique (settleCheckout) qui crée une ligne `orders` et
-- permet la réconciliation Stripe. Un achat de tombola plateforme n'a pas de
-- club → tenant_id doit pouvoir être NULL.
--
-- Impact : aucun pour les commandes existantes (billetterie/boutique renseignent
-- toujours tenant_id). La contrainte de clé étrangère reste (NULL est autorisé
-- par une FK). Réversible.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE orders ALTER COLUMN tenant_id DROP NOT NULL;

-- Rollback éventuel (ne pas exécuter si des commandes tombola existent déjà) :
--   ALTER TABLE orders ALTER COLUMN tenant_id SET NOT NULL;

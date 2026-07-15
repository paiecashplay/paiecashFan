-- ═══════════════════════════════════════════════════════════════
-- Clubs favoris du fan (⭐ depuis la fiche club) → notifications ciblées.
--
-- NB : on n'utilise PAS profiles.club_id, qui sert au rôle club_admin
-- (scoping des droits). Un favori de fan ne doit donner AUCUN droit.
--
-- RLS : deny-all (aucune policy) — accès uniquement via le backend service-role.
-- À exécuter dans le SQL Editor Supabase. Idempotent.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS fan_favorite_clubs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  is_primary  boolean NOT NULL DEFAULT false,   -- LE club principal du fan
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant_id)
);

-- Index : « mes favoris » (par fan) et fan-out des notifs (par club).
CREATE INDEX IF NOT EXISTS idx_fan_fav_user   ON fan_favorite_clubs (user_id);
CREATE INDEX IF NOT EXISTS idx_fan_fav_tenant ON fan_favorite_clubs (tenant_id);
-- Un seul club principal par fan.
CREATE UNIQUE INDEX IF NOT EXISTS idx_fan_fav_one_primary
  ON fan_favorite_clubs (user_id) WHERE is_primary;

ALTER TABLE fan_favorite_clubs ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- prize-claims.sql — Gains & remise des lots (générique tombola / loto / bingo)
-- ---------------------------------------------------------------
-- Un « claim » = un lot gagné par un fan. Il porte le statut de remise et, pour
-- un lot physique, les coordonnées de livraison (collectées AU 1er GAIN, pas à
-- l'inscription → minimisation RGPD) et le suivi postal.
--
-- Accès : backend service-role uniquement (RLS deny-all, comme le reste).
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS prize_claims (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Jeu d'origine (polymorphe) : game_ref = campaign_id / room_id / edition_id.
  game_type         TEXT NOT NULL CHECK (game_type IN ('tombola', 'loto', 'bingo')),
  game_ref          UUID NOT NULL,
  tenant_id         UUID REFERENCES tenants(id) ON DELETE SET NULL,  -- club organisateur (NULL = plateforme)

  winner_user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prize_label       TEXT,
  prize_type        TEXT NOT NULL DEFAULT 'physical' CHECK (prize_type IN ('physical', 'digital')),

  -- Cycle de vie de la remise.
  status            TEXT NOT NULL DEFAULT 'pending_address'
                    CHECK (status IN ('pending_address', 'preparing', 'shipped', 'delivered', 'cancelled')),

  -- Coordonnées de livraison (lot physique) — remplies par le gagnant.
  ship_name         TEXT,
  ship_phone        TEXT,
  ship_address1     TEXT,
  ship_address2     TEXT,
  ship_postal_code  TEXT,
  ship_city         TEXT,
  ship_country      TEXT,

  -- Expédition (saisie par le BO club / super admin).
  carrier           TEXT,
  tracking_number   TEXT,
  tracking_url      TEXT,
  notes             TEXT,

  won_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  address_filled_at TIMESTAMPTZ,
  shipped_at        TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Un seul claim par (jeu, référence, gagnant) → tirage idempotent.
CREATE UNIQUE INDEX IF NOT EXISTS uq_prize_claims_game
  ON prize_claims (game_type, game_ref, winner_user_id);

CREATE INDEX IF NOT EXISTS idx_prize_claims_winner ON prize_claims (winner_user_id);
CREATE INDEX IF NOT EXISTS idx_prize_claims_tenant ON prize_claims (tenant_id);
CREATE INDEX IF NOT EXISTS idx_prize_claims_status ON prize_claims (status);

-- RLS deny-all : aucune policy → seul le service-role (backend) accède.
ALTER TABLE prize_claims ENABLE ROW LEVEL SECURITY;

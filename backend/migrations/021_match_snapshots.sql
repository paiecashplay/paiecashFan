-- ═══════════════════════════════════════════════════════════════
-- 021_match_snapshots.sql — Cache permanent des matchs TERMINÉS (API-Football)
-- ---------------------------------------------------------------
-- Une fois un match fini (statut FT/AET/PEN), on fige son détail (score +
-- événements + statistiques) pour que les fans puissent le revoir POUR TOUJOURS,
-- sans re-consommer le quota API-Football et même si l'API ne le sert plus.
-- Alimenté et lu UNIQUEMENT par le backend (service-role) → RLS deny-all.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS match_snapshots (
  fixture_id    text PRIMARY KEY,          -- id du match API-Football
  status        text,                      -- statut court au moment du snapshot (FT, AET, PEN…)
  home_team_id  integer,
  away_team_id  integer,
  data          jsonb NOT NULL,            -- { match, events, statistics } (données brutes)
  captured_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_match_snapshots_home ON match_snapshots(home_team_id);
CREATE INDEX IF NOT EXISTS idx_match_snapshots_away ON match_snapshots(away_team_id);
CREATE INDEX IF NOT EXISTS idx_match_snapshots_captured ON match_snapshots(captured_at DESC);

-- RLS deny-all : on active RLS SANS aucune policy → seul le service-role (backend)
-- peut lire/écrire. Aucun accès direct depuis le client (cohérent avec l'archi).
ALTER TABLE match_snapshots ENABLE ROW LEVEL SECURITY;

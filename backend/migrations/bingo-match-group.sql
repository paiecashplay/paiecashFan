-- ═══════════════════════════════════════════════════════════════
-- Sport Bingo — Colonne « groupe / journée » sur les matchs (calendrier).
-- home_logo / away_logo existent déjà (drapeaux ou logos club, URL image).
-- À exécuter dans le SQL Editor Supabase. Idempotent.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE bingo_matches ADD COLUMN IF NOT EXISTS group_label text;

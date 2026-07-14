-- ═══════════════════════════════════════════════════════════════
-- Sport Bingo — Index pour le filtrage par statut/dates et « Mes grilles ».
-- À exécuter dans le SQL Editor Supabase (projet npmenstkeahngrzemmna).
-- Idempotent (IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════

-- Filtrage des éditions par statut + fenêtres de dates (page principale, sync job).
CREATE INDEX IF NOT EXISTS idx_bingo_editions_status        ON bingo_editions (status);
CREATE INDEX IF NOT EXISTS idx_bingo_editions_starts_at     ON bingo_editions (starts_at);
CREATE INDEX IF NOT EXISTS idx_bingo_editions_locks_at      ON bingo_editions (locks_at);
CREATE INDEX IF NOT EXISTS idx_bingo_editions_ends_at       ON bingo_editions (ends_at);
-- Combiné très utilisé par le job de sync (open→locked, scheduled→open).
CREATE INDEX IF NOT EXISTS idx_bingo_editions_status_locks  ON bingo_editions (status, locks_at);
CREATE INDEX IF NOT EXISTS idx_bingo_editions_status_starts ON bingo_editions (status, starts_at);

-- Cartes : « Mes grilles », comptage par édition, résultats.
CREATE INDEX IF NOT EXISTS idx_bingo_cards_user             ON bingo_cards (user_id);
CREATE INDEX IF NOT EXISTS idx_bingo_cards_edition          ON bingo_cards (edition_id);
CREATE INDEX IF NOT EXISTS idx_bingo_cards_edition_status   ON bingo_cards (edition_id, status);

-- Notifications : liste par utilisateur + non-lus (pastille cloche).
CREATE INDEX IF NOT EXISTS idx_notifications_user_created   ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread    ON notifications (user_id, is_read);

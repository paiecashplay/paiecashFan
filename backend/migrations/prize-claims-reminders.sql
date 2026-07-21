-- ═══════════════════════════════════════════════════════════════
-- prize-claims-reminders.sql — Suivi des relances automatiques (Lot C)
-- Ajoute de quoi cadencer les rappels au gagnant sans adresse (CRON) :
--   · last_reminded_at : date du dernier rappel envoyé
--   · reminder_count   : nombre de rappels déjà envoyés (plafonné côté job)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE prize_claims ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMPTZ;
ALTER TABLE prize_claims ADD COLUMN IF NOT EXISTS reminder_count   INT NOT NULL DEFAULT 0;

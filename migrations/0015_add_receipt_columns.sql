-- Migration 0015 : Ajouter colonnes pour reçus/factures
-- Date : 2026-03-08

-- Ajouter colonnes email et reçu dans game_transactions
ALTER TABLE game_transactions ADD COLUMN user_email TEXT;
ALTER TABLE game_transactions ADD COLUMN receipt_sent INTEGER DEFAULT 0;
ALTER TABLE game_transactions ADD COLUMN receipt_sent_at DATETIME;
ALTER TABLE game_transactions ADD COLUMN invoice_number TEXT;
ALTER TABLE game_transactions ADD COLUMN prize_won TEXT;

-- Générer des numéros de facture pour les transactions existantes
UPDATE game_transactions 
SET invoice_number = 'INV-' || strftime('%Y%m%d', created_at) || '-' || SUBSTR(id, -6)
WHERE invoice_number IS NULL;

-- Index pour recherche rapide par email et numéro de facture
CREATE INDEX IF NOT EXISTS idx_game_transactions_user_email ON game_transactions(user_email);
CREATE INDEX IF NOT EXISTS idx_game_transactions_invoice_number ON game_transactions(invoice_number);

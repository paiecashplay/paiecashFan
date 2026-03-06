-- ============================================
-- MIGRATION 0006: LOTS (Catalogue tombola)
-- Date: 2026-03-06
-- Description: Catalogue complet des lots pour tombola quotidienne
-- ============================================

CREATE TABLE IF NOT EXISTS lots (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('merchandise', 'billetterie', 'hospitalite', 'boutique', 'voyage', 'automobile', 'digital', 'cash', 'experience', 'superbonus')),
    lot_type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cost_to_club REAL NOT NULL,
    perceived_value REAL NOT NULL,
    frequency TEXT, -- 'daily', '4x_weekly', 'weekly', 'monthly'
    source TEXT NOT NULL CHECK (source IN ('club_stock', 'unsold_tickets', 'sponsor_partnership', 'club_experience', 'club_store', 'club_discount', 'digital_creation', 'cash_prize')),
    stock_required INTEGER,
    stock_unlimited INTEGER DEFAULT 0, -- 0=false, 1=true
    min_participants INTEGER DEFAULT 100,
    image_url TEXT,
    active INTEGER DEFAULT 1, -- 0=false, 1=true
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_lots_category ON lots(category);
CREATE INDEX IF NOT EXISTS idx_lots_active ON lots(active);
CREATE INDEX IF NOT EXISTS idx_lots_frequency ON lots(frequency);

-- ============================================
-- CATALOGUE DE LOTS PAR CATÉGORIE
-- ============================================

-- MERCHANDISING (Coût faible, valeur perçue élevée)
INSERT OR IGNORE INTO lots (id, category, lot_type, name, description, cost_to_club, perceived_value, frequency, source, min_participants, image_url, active) VALUES
('lot-merch-001', 'merchandise', 'maillot', 'Maillot Domicile Officiel 2025', 'Maillot officiel de l''équipe, taille au choix', 40.0, 95.0, 'daily', 'club_stock', 100, '/static/images/lots/maillot-home.jpg', 1),
('lot-merch-002', 'merchandise', 'maillot_signe', 'Maillot Signé par Joueur Vedette', 'Maillot authentique signé par un joueur de l''équipe première', 50.0, 250.0, '4x_weekly', 'club_stock', 250, '/static/images/lots/maillot-signed.jpg', 1),
('lot-merch-003', 'merchandise', 'echarpe', 'Écharpe Officielle Collector', 'Écharpe premium aux couleurs du club', 8.0, 25.0, 'daily', 'club_stock', 50, '/static/images/lots/scarf.jpg', 1),
('lot-merch-004', 'merchandise', 'casquette', 'Casquette New Era Officielle', 'Casquette New Era édition limitée', 12.0, 35.0, 'daily', 'club_stock', 70, '/static/images/lots/cap.jpg', 1);

-- BILLETTERIE (Invendus transformés en lots)
INSERT OR IGNORE INTO lots (id, category, lot_type, name, description, cost_to_club, perceived_value, frequency, source, min_participants, image_url, active) VALUES
('lot-ticket-001', 'billetterie', 'billet_tribune', '1 Billet Tribune Latérale', 'Place assise tribune latérale, match au choix', 0.0, 45.0, '4x_weekly', 'unsold_tickets', 100, '/static/images/lots/ticket-side.jpg', 1),
('lot-ticket-002', 'billetterie', 'billet_vip', '2 Billets Catégorie Premium', '2 places premium pour un match de championnat', 0.0, 180.0, 'weekly', 'unsold_tickets', 300, '/static/images/lots/ticket-premium.jpg', 1);

-- HOSPITALITÉ VIP (Expériences club)
INSERT OR IGNORE INTO lots (id, category, lot_type, name, description, cost_to_club, perceived_value, frequency, source, min_participants, image_url, active) VALUES
('lot-hosp-001', 'hospitalite', 'visite_stade', 'Visite VIP du Stade + Vestiaires', 'Visite guidée exclusive du stade et des vestiaires', 25.0, 150.0, '4x_weekly', 'club_experience', 200, '/static/images/lots/stadium-tour.jpg', 1),
('lot-hosp-002', 'hospitalite', 'rencontre_joueur', 'Rencontre avec 1 Joueur + Photo', 'Rencontre privée avec un joueur de l''équipe', 50.0, 500.0, 'weekly', 'club_experience', 500, '/static/images/lots/meet-player.jpg', 1),
('lot-hosp-003', 'hospitalite', 'loge_vip', 'Soirée en Loge VIP (4 places)', 'Soirée match en loge VIP avec buffet et boissons pour 4 personnes', 200.0, 800.0, 'weekly', 'club_experience', 800, '/static/images/lots/vip-box.jpg', 1);

-- BOUTIQUE CLUB (Produits dérivés)
INSERT OR IGNORE INTO lots (id, category, lot_type, name, description, cost_to_club, perceived_value, frequency, source, min_participants, image_url, active) VALUES
('lot-shop-001', 'boutique', 'bon_achat', 'Bon d''Achat 50€ Boutique Officielle', 'Bon valable dans toutes les boutiques officielles', 40.0, 50.0, 'daily', 'club_discount', 100, '/static/images/lots/voucher-50.jpg', 1),
('lot-shop-002', 'boutique', 'pack_supporter', 'Pack Supporter Premium', 'Écharpe + Casquette + Porte-clés + Stickers', 25.0, 75.0, 'daily', 'club_stock', 120, '/static/images/lots/fan-pack.jpg', 1);

-- VOYAGE (Partenariats sponsors)
INSERT OR IGNORE INTO lots (id, category, lot_type, name, description, cost_to_club, perceived_value, frequency, source, min_participants, image_url, active) VALUES
('lot-voyage-001', 'voyage', 'weekend_deplace', 'Week-end Déplacement avec le Club', 'Transport + Hébergement + Billet pour un match à l''extérieur', 150.0, 600.0, 'monthly', 'sponsor_partnership', 1000, '/static/images/lots/away-trip.jpg', 1),
('lot-voyage-002', 'voyage', 'sejour_tournoi', 'Séjour Tournoi Pré-saison', 'Séjour 3 jours avec le club lors de la préparation', 300.0, 1200.0, 'monthly', 'sponsor_partnership', 2000, '/static/images/lots/preseason-trip.jpg', 1);

-- AUTOMOBILE (Sponsors constructeurs)
INSERT OR IGNORE INTO lots (id, category, lot_type, name, description, cost_to_club, perceived_value, frequency, source, min_participants, image_url, active) VALUES
('lot-auto-001', 'automobile', 'voiture_sponsor', 'Voiture Citadine 1 An (Sponsor)', 'Mise à disposition d''un véhicule citadin pendant 1 an par le sponsor', 0.0, 12000.0, 'monthly', 'sponsor_partnership', 5000, '/static/images/lots/car-sponsor.jpg', 1);

-- DIGITAL (Créations numériques)
INSERT OR IGNORE INTO lots (id, category, lot_type, name, description, cost_to_club, perceived_value, frequency, source, min_participants, image_url, active) VALUES
('lot-digital-001', 'digital', 'nft_badge', 'NFT Badge Supporter Collector', 'Badge numérique unique sur blockchain', 5.0, 50.0, 'daily', 'digital_creation', 50, '/static/images/lots/nft-badge.jpg', 1),
('lot-digital-002', 'digital', 'abonnement_tv', 'Abonnement Streaming 6 Mois', 'Accès premium à tous les matchs en streaming', 30.0, 120.0, '4x_weekly', 'sponsor_partnership', 200, '/static/images/lots/streaming.jpg', 1);

-- CASH (Lots en espèces)
INSERT OR IGNORE INTO lots (id, category, lot_type, name, description, cost_to_club, perceived_value, frequency, source, min_participants, image_url, active) VALUES
('lot-cash-001', 'cash', 'cash_100', '100€ en Espèces', 'Virement bancaire direct de 100€', 100.0, 100.0, 'daily', 'cash_prize', 200, '/static/images/lots/cash-100.jpg', 1),
('lot-cash-002', 'cash', 'cash_500', '500€ en Espèces', 'Virement bancaire direct de 500€', 500.0, 500.0, '4x_weekly', 'cash_prize', 1000, '/static/images/lots/cash-500.jpg', 1),
('lot-cash-003', 'cash', 'cash_1000', '1 000€ en Espèces', 'Virement bancaire direct de 1 000€', 1000.0, 1000.0, 'weekly', 'cash_prize', 2000, '/static/images/lots/cash-1000.jpg', 1);

-- EXPÉRIENCE (Moments uniques)
INSERT OR IGNORE INTO lots (id, category, lot_type, name, description, cost_to_club, perceived_value, frequency, source, min_participants, image_url, active) VALUES
('lot-exp-001', 'experience', 'entrainement', 'Participation Entraînement Équipe', 'Session d''entraînement avec l''équipe professionnelle', 100.0, 800.0, 'monthly', 'club_experience', 1500, '/static/images/lots/training.jpg', 1),
('lot-exp-002', 'experience', 'mascotte', 'Entrée sur Terrain comme Mascotte', 'Accompagnez les joueurs lors de l''entrée sur le terrain', 50.0, 400.0, 'monthly', 'club_experience', 800, '/static/images/lots/mascot.jpg', 1);

-- SUPERBONUS (Lots mensuels exceptionnels)
INSERT OR IGNORE INTO lots (id, category, lot_type, name, description, cost_to_club, perceived_value, frequency, source, min_participants, image_url, active) VALUES
('lot-super-001', 'superbonus', 'moto_sponsor', 'Moto 125cc (Sponsor)', 'Scooter 125cc neuf offert par le sponsor', 0.0, 4000.0, 'monthly', 'sponsor_partnership', 10000, '/static/images/lots/moto.jpg', 1),
('lot-super-002', 'superbonus', 'cash_5000', '5 000€ + Maillot Signé Équipe', 'Jackpot exceptionnel avec maillot collector', 5200.0, 5500.0, 'monthly', 'cash_prize', 15000, '/static/images/lots/jackpot.jpg', 1),
('lot-super-003', 'superbonus', 'voyage_final', 'Voyage Finale Coupe (2 personnes)', 'Voyage tout compris pour assister à la finale (transport + hôtel + billets)', 2000.0, 8000.0, 'monthly', 'sponsor_partnership', 20000, '/static/images/lots/final-trip.jpg', 1);

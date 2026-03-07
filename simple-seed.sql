-- Organisations
INSERT OR IGNORE INTO organizations (id, name, short_name, country) VALUES
('om-001', 'Olympique de Marseille', 'OM', 'FR'),
('psg-001', 'Paris Saint-Germain', 'PSG', 'FR'),
('ol-001', 'Olympique Lyonnais', 'OL', 'FR');

-- Lots (avec toutes les colonnes requises)
INSERT OR IGNORE INTO lots (id, category, lot_type, name, description, cost_to_club, perceived_value, source) VALUES
('lot-cash-001', 'cash', 'cash_100', '100€ en Cash', 'Gagnez 100€', 100, 100, 'cash_prize'),
('lot-cash-002', 'cash', 'cash_500', '500€ en Cash', 'Gagnez 500€', 500, 500, 'cash_prize'),
('lot-merch-001', 'merchandise', 'jersey', 'Maillot Officiel', 'Maillot domicile', 25, 80, 'club_store'),
('lot-merch-002', 'merchandise', 'signed_jersey', 'Maillot Signé', 'Maillot dédicacé', 50, 250, 'club_store'),
('lot-ticket-001', 'billetterie', 'standard', '1 Billet Match', 'Billet tribune', 0, 45, 'unsold_tickets'),
('lot-ticket-002', 'billetterie', 'premium', '2 Billets VIP', 'Places premium', 0, 180, 'unsold_tickets'),
('lot-exp-001', 'experience', 'meet_player', 'Rencontre Joueur', 'Rencontrez un joueur', 100, 500, 'club_experience'),
('lot-exp-002', 'experience', 'vip_access', 'Accès VIP', 'Loge VIP pour un match', 50, 300, 'club_experience'),
('lot-merch-003', 'merchandise', 'scarf', 'Écharpe Collector', 'Écharpe collector', 8, 25, 'club_store'),
('lot-cash-003', 'cash', 'cash_1000', '1000€ en Cash', 'Gagnez 1000€', 1000, 1000, 'cash_prize');

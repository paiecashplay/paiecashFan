-- Charger les organisations
INSERT OR IGNORE INTO organizations (id, name, short_name, country) VALUES
('om-001', 'Olympique de Marseille', 'OM', 'FR'),
('psg-001', 'Paris Saint-Germain', 'PSG', 'FR'),
('ol-001', 'Olympique Lyonnais', 'OL', 'FR');

-- Charger les lots (10 exemples variés)
INSERT OR IGNORE INTO lots (id, name, category, perceived_value, cost_to_club) VALUES
-- Cash
('lot-cash-001', '100€ en Cash', 'cash', 100, 100),
('lot-cash-002', '500€ en Cash', 'cash', 500, 500),
('lot-cash-003', '1000€ en Cash', 'cash', 1000, 1000),

-- Merchandising
('lot-merch-001', 'Maillot Officiel Domicile', 'merchandise', 80, 25),
('lot-merch-002', 'Maillot Signé par l''équipe', 'merchandise', 250, 50),
('lot-merch-003', 'Écharpe Officielle Collector', 'merchandise', 25, 8),

-- Billetterie
('lot-ticket-001', '1 Billet Tribune Latérale', 'billetterie', 45, 0),
('lot-ticket-002', '2 Billets Catégorie Premium', 'billetterie', 180, 0),

-- Expériences
('lot-exp-001', 'Rencontre avec un joueur', 'experience', 500, 100),
('lot-exp-002', 'Accès VIP Match', 'experience', 300, 50);

-- Créer des allocations pour les lots
INSERT OR IGNORE INTO lot_allocations (id, lot_id, organization_id, allocation_date, is_available) VALUES
('alloc-001', 'lot-cash-001', 'om-001', date('now'), 1),
('alloc-002', 'lot-cash-002', 'psg-001', date('now'), 1),
('alloc-003', 'lot-cash-003', 'ol-001', date('now'), 1),
('alloc-004', 'lot-merch-001', 'om-001', date('now'), 1),
('alloc-005', 'lot-merch-002', 'psg-001', date('now'), 1),
('alloc-006', 'lot-merch-003', 'om-001', date('now'), 1),
('alloc-007', 'lot-ticket-001', 'om-001', date('now'), 1),
('alloc-008', 'lot-ticket-002', 'psg-001', date('now'), 1),
('alloc-009', 'lot-exp-001', 'om-001', date('now'), 1),
('alloc-010', 'lot-exp-002', 'psg-001', date('now'), 1);

-- Créer 5 campagnes actives
INSERT OR IGNORE INTO campaigns (
    id, organization_id, lot_allocation_id, name, 
    prize_type, prize_name, prize_value, entry_fee,
    target_participants, min_participants,
    start_datetime, draw_datetime, status
) VALUES
-- Campagne 1: Cash 100€ OM
('campaign-001', 'om-001', 'alloc-001', 'Tirage 100€ Cash OM - Mars 2026',
 'cash', '100€ en Cash', 100, 1.0, 150, 60,
 datetime('now'), datetime('now', '+7 days'), 'active'),

-- Campagne 2: Maillot Signé PSG
('campaign-002', 'psg-001', 'alloc-005', 'Maillot Signé PSG - Mars 2026',
 'merchandise', 'Maillot Signé par l''équipe', 250, 2.0, 200, 80,
 datetime('now'), datetime('now', '+10 days'), 'active'),

-- Campagne 3: Cash 500€ OL
('campaign-003', 'ol-001', 'alloc-003', 'Jackpot 500€ OL - Mars 2026',
 'cash', '500€ en Cash', 500, 1.5, 500, 200,
 datetime('now'), datetime('now', '+14 days'), 'active'),

-- Campagne 4: Écharpe OM
('campaign-004', 'om-001', 'alloc-006', 'Écharpe Collector OM - Mars 2026',
 'merchandise', 'Écharpe Officielle Collector', 25, 1.0, 50, 20,
 datetime('now'), datetime('now', '+5 days'), 'active'),

-- Campagne 5: VIP PSG
('campaign-005', 'psg-001', 'alloc-010', 'Accès VIP Match PSG - Mars 2026',
 'experience', 'Accès VIP Match', 300, 3.0, 150, 60,
 datetime('now'), datetime('now', '+12 days'), 'active');


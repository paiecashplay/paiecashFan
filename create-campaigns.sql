-- Créer des allocations de lots (nécessaires pour les campagnes)
INSERT OR IGNORE INTO lot_allocations (
    id, lot_id, organization_id, allocation_date, auto_renew
) VALUES
('alloc-001', 'lot-cash-003', 'om-001', date('now'), 1),
('alloc-002', 'lot-merch-002', 'psg-001', date('now'), 1),
('alloc-003', 'lot-cash-002', 'ol-001', date('now'), 1),
('alloc-004', 'lot-merch-004', 'om-001', date('now'), 1),
('alloc-005', 'lot-exp-001', 'psg-001', date('now'), 1);

-- Créer 5 campagnes actives
INSERT OR IGNORE INTO campaigns (
    id, organization_id, lot_allocation_id, name,
    prize_type, prize_name, prize_value, entry_fee,
    target_participants, min_participants,
    start_datetime, draw_datetime, status
) VALUES
-- Campagne 1: Cash 1000€ OM
('camp-001', 'om-001', 'alloc-001', 'Jackpot 1000€ OM - Mars 2026',
 'cash', '1 000€ en Espèces', 1000, 1.5, 1000, 400,
 datetime('now'), datetime('now', '+7 days'), 'active'),

-- Campagne 2: Maillot Signé PSG
('camp-002', 'psg-001', 'alloc-002', 'Maillot Signé Joueur Vedette PSG',
 'merchandise', 'Maillot Signé par Joueur Vedette', 250, 2.0, 200, 80,
 datetime('now'), datetime('now', '+10 days'), 'active'),

-- Campagne 3: Cash 500€ OL
('camp-003', 'ol-001', 'alloc-003', 'Tirage 500€ Cash OL - Mars 2026',
 'cash', '500€ en Espèces', 500, 1.5, 500, 200,
 datetime('now'), datetime('now', '+14 days'), 'active'),

-- Campagne 4: Écharpe OM
('camp-004', 'om-001', 'alloc-004', 'Écharpe Collector OM - Mars 2026',
 'merchandise', 'Écharpe Officielle Collector', 25, 1.0, 50, 20,
 datetime('now'), datetime('now', '+5 days'), 'active'),

-- Campagne 5: Entraînement PSG
('camp-005', 'psg-001', 'alloc-005', 'Participation Entraînement PSG',
 'experience', 'Participation Entraînement Équipe', 800, 3.0, 150, 60,
 datetime('now'), datetime('now', '+12 days'), 'active');

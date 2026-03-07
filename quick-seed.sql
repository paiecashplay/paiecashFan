-- Insérer 1 organisation
INSERT OR IGNORE INTO organizations (id, name, short_name, country) VALUES ('om-001', 'Olympique de Marseille', 'OM', 'FR');

-- Insérer 1 lot
INSERT OR IGNORE INTO lots (id, name, category, perceived_value, cost_to_club, organization_id) 
VALUES ('lot-merch-003', 'Écharpe Officielle Collector', 'merchandise', 25, 8, 'om-001');

-- Insérer 1 campagne
INSERT OR IGNORE INTO campaigns (id, organization_id, lot_allocation_id, name, prize_type, prize_name, prize_value, entry_fee, target_participants, min_participants, start_datetime, draw_datetime, status) 
VALUES ('campaign-test-001', 'om-001', 'alloc-test-001', 'Tirage Test OM', 'merchandise', 'Écharpe Collector', 25, 1.0, 50, 20, datetime('now'), datetime('now', '+7 days'), 'active');

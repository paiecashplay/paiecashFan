-- Migration: Création tables boutiques clubs
-- Date: 2026-03-08
-- Description: Tables pour produits, commandes et paiements Lyra

-- Table des produits clubs
CREATE TABLE IF NOT EXISTS club_products (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  category TEXT, -- jersey, accessories, equipment, etc.
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des commandes clubs
CREATE TABLE IF NOT EXISTS club_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  club_id TEXT NOT NULL,
  products JSON NOT NULL, -- [{product_id, name, price, quantity}]
  total_amount REAL NOT NULL,
  payment_method TEXT DEFAULT 'lyra',
  payment_id TEXT, -- Order ID Lyra
  lyra_transaction_uuid TEXT, -- UUID transaction Lyra
  status TEXT DEFAULT 'pending', -- pending, paid, cancelled, refunded
  customer_email TEXT,
  customer_name TEXT,
  shipping_address JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  invoice_number TEXT
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_club_products_club ON club_products(club_id);
CREATE INDEX IF NOT EXISTS idx_club_products_active ON club_products(is_active);
CREATE INDEX IF NOT EXISTS idx_club_orders_user ON club_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_club_orders_club ON club_orders(club_id);
CREATE INDEX IF NOT EXISTS idx_club_orders_payment ON club_orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_club_orders_status ON club_orders(status);

-- Insertion de produits exemple pour OM
INSERT OR IGNORE INTO club_products (id, club_id, name, description, price, stock, image_url, category) VALUES
  ('prod-om-001', 'om-001', 'Maillot Domicile OM 2025', 'Maillot officiel Olympique de Marseille saison 2025-2026. Matière respirante, séchage rapide.', 89.99, 150, '/static/images/om-home.jpg', 'jersey'),
  ('prod-om-002', 'om-001', 'Maillot Extérieur OM 2025', 'Maillot extérieur Olympique de Marseille. Design unique et moderne.', 89.99, 120, '/static/images/om-away.jpg', 'jersey'),
  ('prod-om-003', 'om-001', 'Écharpe OM Officielle', 'Écharpe officielle aux couleurs de l''OM. 100% acrylique, très douce.', 24.99, 300, '/static/images/om-scarf.jpg', 'accessories'),
  ('prod-om-004', 'om-001', 'Casquette OM', 'Casquette officielle avec logo brodé. Taille ajustable.', 19.99, 200, '/static/images/om-cap.jpg', 'accessories'),
  ('prod-om-005', 'om-001', 'Ballon OM Officiel', 'Ballon de football officiel OM. Taille 5, couture thermocollée.', 34.99, 80, '/static/images/om-ball.jpg', 'equipment'),
  ('prod-om-006', 'om-001', 'Survêtement OM', 'Survêtement officiel training. Veste + pantalon.', 119.99, 60, '/static/images/om-tracksuit.jpg', 'equipment');

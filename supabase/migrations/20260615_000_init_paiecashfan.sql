-- ═══════════════════════════════════════════════════════════════════════
-- PaieCashFan - Schéma initial unifié
-- Cible    : Supabase (PostgreSQL 15+ avec auth schema)
-- Stratégie: Supabase Auth natif (auth.users) + RLS partout
-- Idempotent: peut être rejoué sans casse (CREATE IF NOT EXISTS / DROP IF)
-- ═══════════════════════════════════════════════════════════════════════
--
-- À exécuter dans le SQL Editor de Supabase (projet PaieCashFan) en une
-- seule fois. Si déjà des tables `profiles` / `subscriptions` existent,
-- ce script les enrichit sans perdre de données (ALTER ADD COLUMN IF
-- NOT EXISTS).
--

-- ─── EXTENSIONS ──────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ═══════════════════════════════════════════════════════════════════════
-- 1. IDENTITY (Supabase Auth natif)
-- ═══════════════════════════════════════════════════════════════════════
-- auth.users est géré par Supabase. On ne le touche pas.
-- On crée/enrichit `profiles` qui est la table publique liée à auth.users
-- par un FK sur auth.users.id.

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT,
  username        TEXT UNIQUE,
  avatar_url      TEXT,
  locale          TEXT DEFAULT 'fr',
  country         TEXT DEFAULT 'FR',
  club_id         UUID,
  role            TEXT NOT NULL DEFAULT 'fan'
                  CHECK (role IN ('fan','club_admin','super_admin')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Si la table existait déjà (créée manuellement par le user), on ajoute
-- les colonnes manquantes sans toucher aux données existantes.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'fan'
    CHECK (role IN ('fan','club_admin','super_admin'));
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr';
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'FR';
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS club_id UUID;
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Si la colonne `club_id` existe déjà mais en TEXT (création manuelle
-- antérieure où le club_id était un slug 'tanzanie' / 'simba-sc'), on
-- la convertit en UUID. Les valeurs text actuelles seront mises à NULL
-- car non convertibles en UUID — l'admin pourra re-affecter via le BO.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
      AND column_name = 'club_id' AND data_type <> 'uuid'
  ) THEN
    -- On drop l'éventuel FK existant pour pouvoir changer le type
    EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS fk_profiles_club_tenant';
    -- Backup éventuel des valeurs text dans metadata avant cast (au cas où)
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS legacy_club_slug TEXT;
    UPDATE public.profiles
      SET legacy_club_slug = club_id::TEXT
      WHERE club_id IS NOT NULL AND legacy_club_slug IS NULL;
    -- Drop puis recrée en UUID
    ALTER TABLE public.profiles DROP COLUMN club_id;
    ALTER TABLE public.profiles ADD COLUMN club_id UUID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role     ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_club     ON public.profiles(club_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);


-- Abonnements (Stripe / autre) — garde l'existant si déjà là.
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                    TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','past_due','cancelled','expired','trialing')),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,
  external_id             TEXT,
  external_provider       TEXT DEFAULT 'stripe',
  metadata                JSONB DEFAULT '{}',
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user   ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);


-- ═══════════════════════════════════════════════════════════════════════
-- 2. STRUCTURE FOOTBALL (Confédérations / Fédérations / Clubs)
-- ═══════════════════════════════════════════════════════════════════════

-- Confédérations : champ string simple sur federations (pas de table dédiée).
-- Valeurs attendues : 'CAF', 'UEFA', 'CONMEBOL', 'CONCACAF', 'AFC', 'OFC'

-- Fédérations nationales (Tanzania Football Federation, FFF, RFEF…).
CREATE TABLE IF NOT EXISTS public.federations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 TEXT UNIQUE NOT NULL,
  name                 TEXT NOT NULL,
  name_en              TEXT,
  short_code           TEXT,                              -- TFF, FFF, RFEF…
  country              TEXT NOT NULL,
  country_code         TEXT NOT NULL,                     -- ISO 3166-1 alpha-2 : TZ, FR, ES…
  flag_emoji           TEXT,
  confederation_code   TEXT NOT NULL
                       CHECK (confederation_code IN ('CAF','UEFA','CONMEBOL','CONCACAF','AFC','OFC')),
  region               TEXT,                              -- Afrique de l'Est, Europe Méridionale…
  founded_year         INTEGER,
  fifa_member_since    INTEGER,
  president            TEXT,
  motto                TEXT,
  motto_color          TEXT,
  primary_color        TEXT,
  accent_color         TEXT,
  logo_url             TEXT,
  stadium              TEXT,                              -- Stade principal de la sélection
  stadium_image_url    TEXT,
  card_image_url       TEXT,                              -- Photo pour cards grille fédération
  website              TEXT,
  email                TEXT,
  -- Sélection nationale (Taifa Stars, Les Bleus, La Furia Roja…)
  national_team_name   TEXT,
  national_team_coach  TEXT,
  metadata             JSONB DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_federations_slug         ON public.federations(slug);
CREATE INDEX IF NOT EXISTS idx_federations_country      ON public.federations(country_code);
CREATE INDEX IF NOT EXISTS idx_federations_confed       ON public.federations(confederation_code);


-- Clubs (tenants multi-tenant). Un club peut être affilié à une fédération.
-- is_federation_hub = TRUE quand le « club » est en réalité la page d'une
-- sélection nationale (ex: /clubs/tanzanie = Taifa Stars). Dans ce cas le
-- tenant est lié à une federation_id et affichera ses clubs membres.
CREATE TABLE IF NOT EXISTS public.tenants (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                     TEXT UNIQUE NOT NULL,
  name                     TEXT NOT NULL,
  short_code               TEXT,                          -- OM, PSG, SIMBA…
  type                     TEXT NOT NULL DEFAULT 'club'
                           CHECK (type IN ('club','national_team')),
  sport                    TEXT DEFAULT 'football',
  federation_id            UUID REFERENCES public.federations(id) ON DELETE SET NULL,
  -- Confédération copiée pour query rapide sans join
  confederation_code       TEXT
                           CHECK (confederation_code IN ('CAF','UEFA','CONMEBOL','CONCACAF','AFC','OFC')),
  country                  TEXT,
  country_code             TEXT,
  city                     TEXT,
  league_name              TEXT,                          -- Ligue 1, Premier League, NBC Premier League…
  founded_year             INTEGER,
  stadium                  TEXT,
  stadium_image_url        TEXT,
  card_image_url           TEXT,                          -- Pour cards grille fédération
  motto                    TEXT,
  motto_color              TEXT,
  primary_color            TEXT DEFAULT '#1B7E7E',
  accent_color             TEXT,
  logo_url                 TEXT,
  coach                    TEXT,
  president                TEXT,
  -- Si TRUE : la page /clubs/:slug affiche la grille des clubs membres
  -- de sa fédération au lieu de la boutique (ex: /clubs/tanzanie).
  is_federation_hub        BOOLEAN DEFAULT FALSE,
  -- Onboarding club (multi-tenant)
  admin_user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status                   TEXT DEFAULT 'active'
                           CHECK (status IN ('pending','approved','active','suspended','rejected')),
  approved_at              TIMESTAMPTZ,
  approved_by              UUID REFERENCES auth.users(id),
  -- Treasury (wallet du club côté Crossmint)
  treasury_wallet_id       TEXT,                              -- Crossmint wallet id du club
  treasury_address         TEXT,                              -- 0x... du smart wallet club
  -- Stats agrégées
  total_fans               INTEGER DEFAULT 0,
  total_trophies           INTEGER DEFAULT 0,
  -- Lien Stripe/exchange si le club a son propre tarif
  exchange_rate            REAL DEFAULT 1,
  -- Méta libre (social_links, banner_url, secondary_colors, etc.)
  metadata                 JSONB DEFAULT '{}',
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenants_slug         ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_federation   ON public.tenants(federation_id);
CREATE INDEX IF NOT EXISTS idx_tenants_confed       ON public.tenants(confederation_code);
CREATE INDEX IF NOT EXISTS idx_tenants_status       ON public.tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_type         ON public.tenants(type);

-- FK profiles.club_id → tenants.id (créée après tenants pour éviter une
-- dépendance circulaire au CREATE).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_profiles_club_tenant'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT fk_profiles_club_tenant
      FOREIGN KEY (club_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════════
-- 3. JOUEURS & PALMARÈS
-- ═══════════════════════════════════════════════════════════════════════

-- Joueurs : un joueur appartient soit à un tenant (Simba SC), soit à une
-- fédération (Taifa Stars). Une seule des deux FK est non-null.
CREATE TABLE IF NOT EXISTS public.players (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  federation_id       UUID REFERENCES public.federations(id) ON DELETE CASCADE,
  shirt_number        INTEGER,
  first_name          TEXT,
  last_name           TEXT,
  full_name           TEXT NOT NULL,
  position            TEXT
                      CHECK (position IN ('Gardien de but','Défenseur','Milieu de terrain','Attaquant','Autre')),
  birth_date          DATE,
  nationality_code    TEXT,                              -- ISO 3166-1 alpha-2
  height_cm           INTEGER,
  weight_kg           INTEGER,
  image_url           TEXT,
  is_star_player      BOOLEAN DEFAULT FALSE,
  is_active           BOOLEAN DEFAULT TRUE,
  stats               JSONB DEFAULT '{}',                -- { goals: 25, assists: 7, ... }
  metadata            JSONB DEFAULT '{}',
  display_order       INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  -- Un joueur a UN seul propriétaire (club OU fédération, pas les deux)
  CONSTRAINT chk_player_owner CHECK (
    (tenant_id IS NOT NULL AND federation_id IS NULL) OR
    (tenant_id IS NULL AND federation_id IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_players_tenant      ON public.players(tenant_id);
CREATE INDEX IF NOT EXISTS idx_players_federation  ON public.players(federation_id);
CREATE INDEX IF NOT EXISTS idx_players_star        ON public.players(is_star_player) WHERE is_star_player = TRUE;
CREATE INDEX IF NOT EXISTS idx_players_position    ON public.players(position);


-- Palmarès : une ligne par trophée par club/fédération.
-- scope : european / world / domestic / continental / regional
CREATE TABLE IF NOT EXISTS public.trophies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  federation_id   UUID REFERENCES public.federations(id) ON DELETE CASCADE,
  label           TEXT NOT NULL,                          -- "NBC Premier League"
  count           INTEGER NOT NULL DEFAULT 1 CHECK (count > 0),
  years_text      TEXT,                                   -- "1965, 1971, 1972…"
  scope           TEXT NOT NULL DEFAULT 'domestic'
                  CHECK (scope IN ('domestic','continental','european','world','regional','other')),
  display_order   INTEGER DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_trophy_owner CHECK (
    (tenant_id IS NOT NULL AND federation_id IS NULL) OR
    (tenant_id IS NULL AND federation_id IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_trophies_tenant     ON public.trophies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trophies_federation ON public.trophies(federation_id);
CREATE INDEX IF NOT EXISTS idx_trophies_scope      ON public.trophies(scope);


-- ═══════════════════════════════════════════════════════════════════════
-- 4. BOUTIQUE
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,                   -- 'jersey', 'hoodie', 'tshirt', 'cap'…
  name            TEXT NOT NULL,
  emoji           TEXT,
  display_order   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  -- Slug du category (jersey/hoodie/tshirt/accessory…) doublé pour query rapide
  category_slug   TEXT,
  name            TEXT NOT NULL,
  description     TEXT,
  pcc_price       NUMERIC(20,8) NOT NULL CHECK (pcc_price > 0),
  eur_price       NUMERIC(12,2),
  -- Image principale
  image_url       TEXT,
  -- Galerie d'images (recto/verso, vues alternatives) — array d'URLs
  images          JSONB DEFAULT '[]',
  -- Tailles disponibles (vide = pas de notion de taille)
  sizes           TEXT[],
  -- Emoji fallback pour produits sans image
  emoji           TEXT,
  stock           INTEGER DEFAULT -1,                     -- -1 = illimité
  total_sold      INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'active'
                  CHECK (status IN ('active','inactive','sold_out','draft')),
  display_order   INTEGER DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_tenant     ON public.products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_category   ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_status     ON public.products(status);


-- ═══════════════════════════════════════════════════════════════════════
-- 5. WALLET PCC (Crossmint)
-- ═══════════════════════════════════════════════════════════════════════
-- Wallet-as-a-Service Crossmint : chaque user a un smart wallet provisionné
-- côté Crossmint (linkedUser ou email). On garde ici les identifiants de
-- correspondance + le solde PCC mirror.

CREATE TABLE IF NOT EXISTS public.wallets (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  crossmint_wallet_id      TEXT UNIQUE,                     -- ex: "wlt_xxx" côté Crossmint
  crossmint_linked_user    TEXT,                            -- ex: "email:foo@bar.com" ou "userId:xxx"
  crossmint_chain          TEXT DEFAULT 'polygon',          -- 'polygon' / 'base' / 'ethereum'
  crossmint_env            TEXT DEFAULT 'staging'           -- 'staging' / 'production'
                           CHECK (crossmint_env IN ('staging','production')),
  wallet_address           TEXT UNIQUE,                     -- 0x... du smart wallet on-chain
  blockchain_network       TEXT DEFAULT 'POLYGON-AMOY',
  pcc_balance              NUMERIC(20,8) DEFAULT 0,
  eur_balance              NUMERIC(12,2) DEFAULT 0,         -- Solde fiat éventuel (compte bancaire)
  wallet_type              TEXT DEFAULT 'fan'
                           CHECK (wallet_type IN ('fan','club_treasury','admin')),
  status                   TEXT DEFAULT 'active'
                           CHECK (status IN ('active','suspended','closed')),
  metadata                 JSONB DEFAULT '{}',
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wallets_user      ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address   ON public.wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallets_crossmint ON public.wallets(crossmint_wallet_id);


-- ═══════════════════════════════════════════════════════════════════════
-- 6. TRANSACTIONNEL (transactions + orders + withdrawals)
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  tenant_id           UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  type                TEXT NOT NULL
                      CHECK (type IN ('mint','spend','transfer','reward','fee','withdrawal','send','receive','refund')),
  pcc_amount          NUMERIC(20,8) NOT NULL,
  eur_amount          NUMERIC(12,2),                     -- Pour mint/withdrawal
  tx_hash             TEXT,                              -- Tx blockchain
  internal_status     TEXT DEFAULT 'pending'
                      CHECK (internal_status IN ('pending','processing','complete','failed','cancelled')),
  blockchain_status   TEXT DEFAULT 'pending'
                      CHECK (blockchain_status IN ('pending','confirmed','failed','n/a')),
  payment_provider    TEXT,                              -- 'crossmint' / 'stripe' / 'transak' / 'manual'
  idempotency_key     TEXT UNIQUE,
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tx_user     ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_tenant   ON public.transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tx_type     ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_tx_status   ON public.transactions(internal_status);
CREATE INDEX IF NOT EXISTS idx_tx_created  ON public.transactions(created_at DESC);


-- Panier : un seul panier ouvert par user (status='cart').
-- Devient une commande lorsque le checkout est lancé (status='pending').
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id       UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  transaction_id  UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  total_pcc       NUMERIC(20,8) NOT NULL DEFAULT 0,
  total_eur       NUMERIC(12,2),
  status          TEXT NOT NULL DEFAULT 'cart'
                  CHECK (status IN ('cart','pending','confirmed','processing','shipped','completed','cancelled','refunded')),
  shipping_address JSONB,
  notes           TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_user   ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
-- Un seul panier ouvert par user
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_one_cart_per_user
  ON public.orders(user_id) WHERE status = 'cart';


CREATE TABLE IF NOT EXISTS public.order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  size            TEXT,
  unit_price_pcc  NUMERIC(20,8) NOT NULL,
  total_pcc       NUMERIC(20,8) NOT NULL,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order   ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);


CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pcc_amount        NUMERIC(20,8) NOT NULL CHECK (pcc_amount > 0),
  eur_amount        NUMERIC(12,2),
  fiat_currency     TEXT DEFAULT 'EUR',
  bank_details      JSONB NOT NULL DEFAULT '{}',         -- iban, bic, holder…
  status            TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending','under_review','approved','processing','completed','rejected','failed')),
  admin_notes       TEXT,
  transaction_id    UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  reviewed_by       UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user   ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawal_requests(status);


-- ═══════════════════════════════════════════════════════════════════════
-- 7. SYSTÈME (audit + notifications)
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,                          -- 'club.create', 'product.update'…
  entity_type     TEXT,                                   -- 'tenant', 'product', 'order'
  entity_id       UUID,
  ip_address      TEXT,
  user_agent      TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_user    ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity  ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);


CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  link_url    TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user_unread
  ON public.notifications(user_id, is_read) WHERE is_read = FALSE;


-- ═══════════════════════════════════════════════════════════════════════
-- 8. TRIGGERS (updated_at + provisionnement auto profile/wallet)
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY[
    'profiles','subscriptions','federations','tenants','players','trophies',
    'products','wallets','transactions','orders','withdrawal_requests'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON public.%s', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON public.%s ' ||
      'FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()', t, t);
  END LOOP;
END $$;


-- Création auto d'un `profiles` lorsqu'un user s'inscrit via Supabase Auth.
-- Le metadata Supabase (raw_user_meta_data) peut contenir display_name etc.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;
CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════
-- 9. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════
-- Principes :
--  • Lecture publique du catalogue (federations, tenants, players, trophies,
--    product_categories, products) — tout le monde peut voir les clubs.
--  • Écriture restreinte aux super_admin ou au club_admin du club concerné.
--  • profiles / wallets / orders / transactions : un user ne voit que les
--    siens. Super_admin voit tout.

-- Helper : récupère le rôle du caller depuis profiles
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper : récupère le tenant_id (club) géré par un club_admin
CREATE OR REPLACE FUNCTION public.current_club_id()
RETURNS UUID AS $$
  SELECT id FROM public.tenants WHERE admin_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Active RLS partout
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.federations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trophies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;

-- ─── Catalogue public (lecture libre) ────────────────────────────────
DROP POLICY IF EXISTS p_read_federations    ON public.federations;
DROP POLICY IF EXISTS p_read_tenants        ON public.tenants;
DROP POLICY IF EXISTS p_read_players        ON public.players;
DROP POLICY IF EXISTS p_read_trophies       ON public.trophies;
DROP POLICY IF EXISTS p_read_categories     ON public.product_categories;
DROP POLICY IF EXISTS p_read_products       ON public.products;

CREATE POLICY p_read_federations    ON public.federations
  FOR SELECT USING (true);
CREATE POLICY p_read_tenants        ON public.tenants
  FOR SELECT USING (status IN ('active','approved') OR public.current_role() = 'super_admin');
CREATE POLICY p_read_players        ON public.players
  FOR SELECT USING (is_active = TRUE OR public.current_role() = 'super_admin');
CREATE POLICY p_read_trophies       ON public.trophies
  FOR SELECT USING (true);
CREATE POLICY p_read_categories     ON public.product_categories
  FOR SELECT USING (true);
CREATE POLICY p_read_products       ON public.products
  FOR SELECT USING (status = 'active' OR public.current_role() IN ('super_admin','club_admin'));

-- ─── Écriture catalogue : super_admin global, club_admin scoped ─────
DROP POLICY IF EXISTS p_write_federations    ON public.federations;
DROP POLICY IF EXISTS p_write_tenants_admin  ON public.tenants;
DROP POLICY IF EXISTS p_write_tenants_self   ON public.tenants;
DROP POLICY IF EXISTS p_write_players_admin  ON public.players;
DROP POLICY IF EXISTS p_write_players_club   ON public.players;
DROP POLICY IF EXISTS p_write_trophies_admin ON public.trophies;
DROP POLICY IF EXISTS p_write_trophies_club  ON public.trophies;
DROP POLICY IF EXISTS p_write_products_admin ON public.products;
DROP POLICY IF EXISTS p_write_products_club  ON public.products;
DROP POLICY IF EXISTS p_write_categories     ON public.product_categories;

CREATE POLICY p_write_federations    ON public.federations
  FOR ALL USING (public.current_role() = 'super_admin')
  WITH CHECK (public.current_role() = 'super_admin');

CREATE POLICY p_write_tenants_admin  ON public.tenants
  FOR ALL USING (public.current_role() = 'super_admin')
  WITH CHECK (public.current_role() = 'super_admin');

CREATE POLICY p_write_tenants_self   ON public.tenants
  FOR UPDATE USING (admin_user_id = auth.uid())
  WITH CHECK (admin_user_id = auth.uid());

CREATE POLICY p_write_players_admin  ON public.players
  FOR ALL USING (public.current_role() = 'super_admin')
  WITH CHECK (public.current_role() = 'super_admin');

CREATE POLICY p_write_players_club   ON public.players
  FOR ALL USING (tenant_id = public.current_club_id())
  WITH CHECK (tenant_id = public.current_club_id());

CREATE POLICY p_write_trophies_admin ON public.trophies
  FOR ALL USING (public.current_role() = 'super_admin')
  WITH CHECK (public.current_role() = 'super_admin');

CREATE POLICY p_write_trophies_club  ON public.trophies
  FOR ALL USING (tenant_id = public.current_club_id())
  WITH CHECK (tenant_id = public.current_club_id());

CREATE POLICY p_write_products_admin ON public.products
  FOR ALL USING (public.current_role() = 'super_admin')
  WITH CHECK (public.current_role() = 'super_admin');

CREATE POLICY p_write_products_club  ON public.products
  FOR ALL USING (tenant_id = public.current_club_id())
  WITH CHECK (tenant_id = public.current_club_id());

CREATE POLICY p_write_categories     ON public.product_categories
  FOR ALL USING (public.current_role() = 'super_admin')
  WITH CHECK (public.current_role() = 'super_admin');

-- ─── Profil personnel ───────────────────────────────────────────────
DROP POLICY IF EXISTS p_profiles_self_read  ON public.profiles;
DROP POLICY IF EXISTS p_profiles_self_write ON public.profiles;
DROP POLICY IF EXISTS p_profiles_admin_all  ON public.profiles;

CREATE POLICY p_profiles_self_read   ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.current_role() = 'super_admin');
CREATE POLICY p_profiles_self_write  ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())); -- empêche d'auto-promouvoir son rôle
CREATE POLICY p_profiles_admin_all   ON public.profiles
  FOR ALL USING (public.current_role() = 'super_admin')
  WITH CHECK (public.current_role() = 'super_admin');

-- ─── Wallet / Transactions / Orders : owner-only ────────────────────
DROP POLICY IF EXISTS p_wallets_owner       ON public.wallets;
DROP POLICY IF EXISTS p_tx_owner            ON public.transactions;
DROP POLICY IF EXISTS p_orders_owner        ON public.orders;
DROP POLICY IF EXISTS p_order_items_owner   ON public.order_items;
DROP POLICY IF EXISTS p_withdrawals_owner   ON public.withdrawal_requests;
DROP POLICY IF EXISTS p_subscriptions_owner ON public.subscriptions;

CREATE POLICY p_wallets_owner       ON public.wallets
  FOR SELECT USING (user_id = auth.uid() OR public.current_role() = 'super_admin');

CREATE POLICY p_tx_owner            ON public.transactions
  FOR SELECT USING (user_id = auth.uid() OR public.current_role() = 'super_admin');

CREATE POLICY p_orders_owner        ON public.orders
  FOR ALL USING (user_id = auth.uid() OR public.current_role() = 'super_admin')
  WITH CHECK (user_id = auth.uid() OR public.current_role() = 'super_admin');

CREATE POLICY p_order_items_owner   ON public.order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND
            (o.user_id = auth.uid() OR public.current_role() = 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND
            (o.user_id = auth.uid() OR public.current_role() = 'super_admin'))
  );

CREATE POLICY p_withdrawals_owner   ON public.withdrawal_requests
  FOR ALL USING (user_id = auth.uid() OR public.current_role() = 'super_admin')
  WITH CHECK (user_id = auth.uid() OR public.current_role() = 'super_admin');

CREATE POLICY p_subscriptions_owner ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid() OR public.current_role() = 'super_admin');

-- ─── Audit (super_admin uniquement) ─────────────────────────────────
DROP POLICY IF EXISTS p_audit_admin  ON public.audit_logs;
CREATE POLICY p_audit_admin  ON public.audit_logs
  FOR SELECT USING (public.current_role() = 'super_admin');

-- ─── Notifications (owner-only) ─────────────────────────────────────
DROP POLICY IF EXISTS p_notif_owner ON public.notifications;
CREATE POLICY p_notif_owner ON public.notifications
  FOR ALL USING (user_id = auth.uid() OR public.current_role() = 'super_admin')
  WITH CHECK (user_id = auth.uid() OR public.current_role() = 'super_admin');


-- ═══════════════════════════════════════════════════════════════════════
-- 10. SEED MINIMAL (catégories produits)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO public.product_categories (slug, name, emoji, display_order) VALUES
  ('jersey',    'Maillot',    '👕', 10),
  ('hoodie',    'Sweat',      '🥋', 20),
  ('tshirt',    'T-Shirt',    '👕', 30),
  ('accessory', 'Accessoire', '🧢', 40),
  ('shoes',     'Chaussures', '👟', 50),
  ('home',      'Maison',     '🏠', 60),
  ('other',     'Autre',      '📦', 99)
ON CONFLICT (slug) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════
-- FIN — Schéma initial unifié PaieCashFan
-- ═══════════════════════════════════════════════════════════════════════

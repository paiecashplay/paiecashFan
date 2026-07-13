-- ═══════════════════════════════════════════════════════════════
-- Sport Bingo — Phase 2a : ledger virtuel, figures (patterns), gains,
-- classements, audit, feature flags, 18+. Additif & idempotent.
-- À exécuter dans Supabase → SQL Editor. Backend service-role (RLS deny-all).
-- ═══════════════════════════════════════════════════════════════

-- 18+ : date de naissance sur le profil
alter table public.profiles add column if not exists birth_date date;

-- ─── Portefeuille virtuel (Fan Credits) + ledger immuable ─────
create table if not exists public.virtual_wallets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid unique not null references public.profiles(id) on delete cascade,
  balance    integer not null default 500,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.virtual_wallet_transactions (
  id               uuid primary key default gen_random_uuid(),
  wallet_id        uuid not null references public.virtual_wallets(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  amount           integer not null,                 -- signé (+crédit / -débit)
  transaction_type text not null,                    -- signup_bonus | daily_bonus | bingo_entry | bingo_reward | admin_adjust
  reference_type   text,
  reference_id     uuid,
  idempotency_key  text unique,                       -- rejoue sans double effet
  balance_before   integer not null,
  balance_after    integer not null,
  created_at       timestamptz not null default now()
);
create index if not exists vwt_user_idx on public.virtual_wallet_transactions (user_id, created_at desc);

-- ─── Figures (patterns) + activation par édition ─────────────
create table if not exists public.bingo_patterns (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  name           text not null,
  description    text,
  pattern_config jsonb default '{}'::jsonb,
  default_points integer not null default 0,
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists public.bingo_edition_patterns (
  id            uuid primary key default gen_random_uuid(),
  edition_id    uuid not null references public.bingo_editions(id) on delete cascade,
  pattern_id    uuid not null references public.bingo_patterns(id) on delete cascade,
  points        integer,
  reward_config jsonb default '{}'::jsonb,
  active        boolean not null default true,
  unique (edition_id, pattern_id)
);

-- ─── Gains détectés (idempotence par version de calcul) ──────
create table if not exists public.bingo_card_wins (
  id                  uuid primary key default gen_random_uuid(),
  card_id             uuid not null references public.bingo_cards(id) on delete cascade,
  pattern_id          uuid not null references public.bingo_patterns(id) on delete cascade,
  points_awarded      integer not null default 0,
  detected_at         timestamptz not null default now(),
  calculation_version integer not null default 1,
  unique (card_id, pattern_id, calculation_version)
);

-- ─── Classements ─────────────────────────────────────────────
create table if not exists public.bingo_leaderboards (
  id                  uuid primary key default gen_random_uuid(),
  period_type         text not null check (period_type in ('weekly','monthly','all_time')),
  period_start        date,
  period_end          date,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  total_points        integer not null default 0,
  correct_predictions integer not null default 0,
  total_predictions   integer not null default 0,
  bingo_count         integer not null default 0,
  rank                integer,
  updated_at          timestamptz not null default now(),
  unique (period_type, period_start, user_id)
);
create index if not exists bingo_lb_idx on public.bingo_leaderboards (period_type, period_start, total_points desc);

-- ─── Journal d'audit des résultats / recalculs ──────────────
create table if not exists public.bingo_result_audit_logs (
  id                  uuid primary key default gen_random_uuid(),
  edition_id          uuid references public.bingo_editions(id) on delete cascade,
  card_id             uuid references public.bingo_cards(id) on delete set null,
  event_id            uuid references public.bingo_events(id) on delete set null,
  action              text not null,
  previous_value      jsonb,
  new_value           jsonb,
  calculation_version integer,
  created_at          timestamptz not null default now()
);

-- ─── Feature flags ───────────────────────────────────────────
create table if not exists public.feature_flags (
  id         uuid primary key default gen_random_uuid(),
  key        text unique not null,
  enabled    boolean not null default false,
  config     jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ─── Enrichissements colonnes existantes ─────────────────────
alter table public.bingo_card_picks add column if not exists points_awarded integer default 0;
alter table public.bingo_card_picks add column if not exists joker_type text;
alter table public.bingo_matches    add column if not exists home_logo text;
alter table public.bingo_matches    add column if not exists away_logo text;
alter table public.bingo_matches    add column if not exists external_fixture_id text;
alter table public.bingo_events      add column if not exists external_fixture_id text;

-- ─── RLS deny-all (le backend service-role passe outre) ──────
alter table public.virtual_wallets              enable row level security;
alter table public.virtual_wallet_transactions  enable row level security;
alter table public.bingo_patterns               enable row level security;
alter table public.bingo_edition_patterns       enable row level security;
alter table public.bingo_card_wins              enable row level security;
alter table public.bingo_leaderboards           enable row level security;
alter table public.bingo_result_audit_logs      enable row level security;
alter table public.feature_flags                enable row level security;

-- ─── Seeds : figures par défaut + flags ──────────────────────
insert into public.bingo_patterns (code, name, default_points) values
  ('LINE_HORIZONTAL','Ligne horizontale',100),
  ('LINE_VERTICAL','Ligne verticale',100),
  ('DIAGONAL','Diagonale',150),
  ('FOUR_CORNERS','Quatre coins',200),
  ('DOUBLE_LINE','Deux lignes',300),
  ('TRIPLE_LINE','Trois lignes',450),
  ('SQUARE_2X2','Carré 2×2',250),
  ('CROSS','Croix',500),
  ('X_SHAPE','X',500),
  ('FULL_CARD','Bingo (grille complète)',2000)
on conflict (code) do nothing;

insert into public.feature_flags (key, enabled, config) values
  ('bingo_money_enabled', false, '{}'::jsonb),
  ('bingo_jokers_enabled', false, '{}'::jsonb),
  ('bingo_daily_bonus_enabled', true, '{"amount":100}'::jsonb),
  ('bingo_signup_bonus', true, '{"amount":500}'::jsonb)
on conflict (key) do nothing;

-- Migre les soldes existants bingo_credits → virtual_wallets (si présents)
insert into public.virtual_wallets (user_id, balance)
select user_id, balance from public.bingo_credits
on conflict (user_id) do nothing;

notify pgrst, 'reload schema';

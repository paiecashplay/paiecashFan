-- ═══════════════════════════════════════════════════════════════
-- PaieCash Sport Bingo — Phase 1 (MVP : MATCH_RESULT, crédits virtuels)
-- À exécuter dans Supabase → SQL Editor (projet npmenstkeahngrzemmna).
-- Idempotent. Backend = service_role (bypass RLS) ; RLS activé sans policy.
-- Aucun argent réel : crédits VIRTUELS, feature flags monétaires OFF.
-- ═══════════════════════════════════════════════════════════════

-- Éditions thématiques
create table if not exists public.bingo_editions (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  description    text,
  cover_url      text,
  theme          jsonb default '{}'::jsonb,          -- couleurs / badge visuel
  badge          text,
  format         text not null default 'standard' check (format in ('express','standard','expert')),
  difficulty     text default 'standard',
  competitions   jsonb default '[]'::jsonb,          -- libellés compétitions
  starts_at      timestamptz,
  locks_at       timestamptz,                        -- verrouillage des grilles
  ends_at        timestamptz,
  cards_available integer,                            -- null = illimité
  cost_credits   integer not null default 0,
  reward_points  integer not null default 0,
  figures_config jsonb default '{}'::jsonb,           -- {code: {points, enabled, priority, limit}}
  status         text not null default 'draft'
                 check (status in ('draft','scheduled','open','locked','live','calculating','completed','cancelled')),
  created_by     uuid references public.profiles(id) on delete set null,
  metadata       jsonb default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists bingo_editions_status_idx on public.bingo_editions (status, starts_at);

-- Matchs d'une édition
create table if not exists public.bingo_matches (
  id            uuid primary key default gen_random_uuid(),
  edition_id    uuid not null references public.bingo_editions(id) on delete cascade,
  home          text not null,
  away          text not null,
  competition   text,
  kickoff_at    timestamptz,
  status        text not null default 'pending' check (status in ('pending','live','finished','void')),
  minute        integer,
  home_score    integer,
  away_score    integer,
  result_source text default 'manual',
  display_order integer default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists bingo_matches_edition_idx on public.bingo_matches (edition_id, display_order);

-- Événements (cases) — MVP: MATCH_RESULT (1/N/2). options extensibles.
create table if not exists public.bingo_events (
  id                uuid primary key default gen_random_uuid(),
  edition_id        uuid not null references public.bingo_editions(id) on delete cascade,
  match_id          uuid references public.bingo_matches(id) on delete cascade,
  type              text not null default 'MATCH_RESULT',
  label             text not null,
  description       text,
  options           jsonb not null default '["1","N","2"]'::jsonb,
  official_answer   text,                              -- rempli à la clôture (résultat officiel)
  validation_status text not null default 'pending' check (validation_status in ('pending','settled','void')),
  display_order     integer default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists bingo_events_edition_idx on public.bingo_events (edition_id, display_order);

-- Cartes (grilles) d'un joueur — layout dérivé d'un seed serveur.
create table if not exists public.bingo_cards (
  id                   uuid primary key default gen_random_uuid(),
  edition_id           uuid not null references public.bingo_editions(id) on delete cascade,
  user_id              uuid not null references public.profiles(id) on delete cascade,
  seed                 text not null,
  format               text not null default 'standard',
  layout               jsonb not null default '[]'::jsonb,   -- [{cell, eventId|null, free}]
  status               text not null default 'draft' check (status in ('draft','submitted','locked','scored','void')),
  submitted_at         timestamptz,
  points_total         integer not null default 0,
  figures_won          jsonb default '[]'::jsonb,
  calculation_version  integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (edition_id, user_id)                          -- 1 carte par édition et par joueur (MVP)
);
create index if not exists bingo_cards_user_idx on public.bingo_cards (user_id);

-- Pronostics par case
create table if not exists public.bingo_card_picks (
  id            uuid primary key default gen_random_uuid(),
  card_id       uuid not null references public.bingo_cards(id) on delete cascade,
  event_id      uuid references public.bingo_events(id) on delete cascade,
  cell_index    integer not null,
  chosen_option text,
  is_correct    boolean,
  state         text not null default 'not_selected'
                check (state in ('not_selected','selected','locked','pending','live','correct','incorrect','void','free')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (card_id, cell_index)
);
create index if not exists bingo_card_picks_card_idx on public.bingo_card_picks (card_id);

-- Journal de scoring (audit + idempotence) — Phase 2
create table if not exists public.bingo_scoring_log (
  id                  uuid primary key default gen_random_uuid(),
  card_id             uuid not null references public.bingo_cards(id) on delete cascade,
  calculation_version integer not null,
  figures             jsonb default '[]'::jsonb,
  points              integer not null default 0,
  created_at          timestamptz not null default now()
);

-- Crédits virtuels (gratuits) par joueur
create table if not exists public.bingo_credits (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  balance      integer not null default 500,          -- solde de départ
  last_refill  timestamptz,
  updated_at   timestamptz not null default now()
);

alter table public.bingo_editions   enable row level security;
alter table public.bingo_matches     enable row level security;
alter table public.bingo_events      enable row level security;
alter table public.bingo_cards       enable row level security;
alter table public.bingo_card_picks  enable row level security;
alter table public.bingo_scoring_log enable row level security;
alter table public.bingo_credits     enable row level security;

notify pgrst, 'reload schema';

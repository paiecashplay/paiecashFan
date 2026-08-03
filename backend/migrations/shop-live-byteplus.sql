-- ═══════════════════════════════════════════════════════════════
-- PaieCashFan — BytePlus Live Shopping
-- Schéma correspondant à backend/db/shopLive.js
-- ═══════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ───────────────────────────────────────────────────────────────
-- 1. Live Rooms
-- ───────────────────────────────────────────────────────────────

create table if not exists public.shop_live_rooms (
  id uuid primary key default gen_random_uuid(),

  tenant_id uuid not null
    references public.tenants(id)
    on delete cascade,

  byteplus_activity_id text unique,

  title text not null,
  description text,
  cover_url text,

  view_url_path text,
  viewer_url text,
  host_url text,
  replay_url text,

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'creating',
        'ready',
        'live',
        'ending',
        'ended',
        'cancelled',
        'failed'
      )
    ),

  latency_mode text not null default 'ultra_low'
    check (
      latency_mode in (
        'template_default',
        'ultra_low',
        'normal'
      )
    ),

  release_playback boolean not null default true,

  scheduled_at timestamptz,
  scheduled_end_at timestamptz,

  started_at timestamptz,
  ended_at timestamptz,

  featured_product_id uuid,

  created_by uuid,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists
  idx_shop_live_rooms_tenant
on public.shop_live_rooms (tenant_id);

create index if not exists
  idx_shop_live_rooms_status
on public.shop_live_rooms (status);

create index if not exists
  idx_shop_live_rooms_activity
on public.shop_live_rooms (byteplus_activity_id);

-- Plusieurs clubs peuvent diffuser simultanément.
-- Un même club ne possède qu’un live boutique ouvert à la fois.
create unique index if not exists
  idx_one_open_shop_live_per_tenant
on public.shop_live_rooms (tenant_id)
where status in (
  'creating',
  'ready',
  'live',
  'ending'
);

-- ───────────────────────────────────────────────────────────────
-- 2. Produits associés au live
-- ───────────────────────────────────────────────────────────────

create table if not exists public.shop_live_products (
  id uuid primary key default gen_random_uuid(),

  live_room_id uuid not null
    references public.shop_live_rooms(id)
    on delete cascade,

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  byteplus_product_id text,

  display_order integer not null default 0,

  is_featured boolean not null default false,

  sync_status text not null default 'pending'
    check (
      sync_status in (
        'pending',
        'syncing',
        'synced',
        'failed',
        'removed'
      )
    ),

  sync_error text,
  featured_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (live_room_id, product_id)
);

create index if not exists
  idx_shop_live_products_room
on public.shop_live_products (live_room_id);

create index if not exists
  idx_shop_live_products_product
on public.shop_live_products (product_id);

create unique index if not exists
  idx_one_featured_product_per_live
on public.shop_live_products (live_room_id)
where is_featured = true;

-- La contrainte est ajoutée après la création de shop_live_products
-- pour éviter les problèmes d’ordre de création.
alter table public.shop_live_rooms
  drop constraint if exists shop_live_rooms_featured_product_id_fkey;

alter table public.shop_live_rooms
  add constraint shop_live_rooms_featured_product_id_fkey
  foreign key (featured_product_id)
  references public.products(id)
  on delete set null;

-- ───────────────────────────────────────────────────────────────
-- 3. Journal technique et callbacks
-- ───────────────────────────────────────────────────────────────

create table if not exists public.shop_live_events (
  id uuid primary key default gen_random_uuid(),

  live_room_id uuid
    references public.shop_live_rooms(id)
    on delete cascade,

  byteplus_activity_id text,

  event_type text not null,
  external_event_id text,

  payload jsonb not null default '{}'::jsonb,

  processed boolean not null default false,
  processing_error text,

  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists
  idx_shop_live_events_room
on public.shop_live_events (live_room_id);

create index if not exists
  idx_shop_live_events_activity
on public.shop_live_events (byteplus_activity_id);

create index if not exists
  idx_shop_live_events_type
on public.shop_live_events (event_type);

create unique index if not exists
  idx_shop_live_events_external
on public.shop_live_events (external_event_id)
where external_event_id is not null;

-- ───────────────────────────────────────────────────────────────
-- 4. Statistiques
-- ───────────────────────────────────────────────────────────────

create table if not exists public.shop_live_stats (
  live_room_id uuid primary key
    references public.shop_live_rooms(id)
    on delete cascade,

  viewer_count integer not null default 0,
  peak_viewer_count integer not null default 0,

  product_click_count integer not null default 0,
  add_to_cart_count integer not null default 0,
  order_count integer not null default 0,

  reaction_count integer not null default 0,
  comment_count integer not null default 0,

  updated_at timestamptz not null default now()
);

-- ───────────────────────────────────────────────────────────────
-- 5. Mise à jour automatique de updated_at
-- ───────────────────────────────────────────────────────────────

create or replace function public.set_shop_live_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists
  trg_shop_live_rooms_updated_at
on public.shop_live_rooms;

create trigger trg_shop_live_rooms_updated_at
before update on public.shop_live_rooms
for each row
execute function public.set_shop_live_updated_at();

drop trigger if exists
  trg_shop_live_products_updated_at
on public.shop_live_products;

create trigger trg_shop_live_products_updated_at
before update on public.shop_live_products
for each row
execute function public.set_shop_live_updated_at();

drop trigger if exists
  trg_shop_live_stats_updated_at
on public.shop_live_stats;

create trigger trg_shop_live_stats_updated_at
before update on public.shop_live_stats
for each row
execute function public.set_shop_live_updated_at();

-- ───────────────────────────────────────────────────────────────
-- 6. Initialisation automatique des statistiques
-- ───────────────────────────────────────────────────────────────

create or replace function public.initialize_shop_live_stats()
returns trigger
language plpgsql
as $$
begin
  insert into public.shop_live_stats (
    live_room_id
  )
  values (
    new.id
  )
  on conflict (live_room_id) do nothing;

  return new;
end;
$$;

drop trigger if exists
  trg_initialize_shop_live_stats
on public.shop_live_rooms;

create trigger trg_initialize_shop_live_stats
after insert on public.shop_live_rooms
for each row
execute function public.initialize_shop_live_stats();

-- ───────────────────────────────────────────────────────────────
-- 7. Sécurité — RLS deny-all (correctif audit, 2026-08-03)
-- Tables accédées UNIQUEMENT par le backend (service-role, qui bypasse la RLS).
-- On active la RLS SANS aucune policy → aucun accès via la clé anon publique.
-- Cohérent avec la convention du projet (RLS deny-all).
-- ───────────────────────────────────────────────────────────────
alter table public.shop_live_rooms    enable row level security;
alter table public.shop_live_products enable row level security;
alter table public.shop_live_events   enable row level security;
alter table public.shop_live_stats    enable row level security;
-- ═══════════════════════════════════════════════════════════════
-- Tombola — campagnes (plateforme ou club) + tickets + tirage
-- À exécuter dans Supabase → SQL Editor (projet npmenstkeahngrzemmna).
-- Idempotent. Backend = service_role (bypass RLS) ; RLS activé sans policy.
-- ═══════════════════════════════════════════════════════════════

-- Campagnes de tombola
create table if not exists public.tombola_campaigns (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid references public.tenants(id) on delete cascade,   -- null = plateforme, sinon club
  title             text not null,
  description       text,
  prize_label       text,
  image_url         text,
  ticket_price_pcc  numeric not null default 0,
  tickets_total     integer,                          -- null = illimité
  starts_at         timestamptz not null default now(),
  ends_at           timestamptz not null,
  status            text not null default 'active'
                    check (status in ('draft','active','closed','drawn','cancelled')),
  winner_user_id    uuid references public.profiles(id) on delete set null,
  winner_ticket_id  uuid,
  drawn_at          timestamptz,
  created_by        uuid references public.profiles(id) on delete set null,
  metadata          jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists tombola_campaigns_status_idx on public.tombola_campaigns (status, ends_at);
create index if not exists tombola_campaigns_tenant_idx on public.tombola_campaigns (tenant_id);

-- Tickets achetés (1 ligne = 1 achat de N tickets, payé via PaieCashCoin)
create table if not exists public.tombola_tickets (
  id            uuid primary key default gen_random_uuid(),
  campaign_id   uuid not null references public.tombola_campaigns(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  quantity      integer not null default 1 check (quantity > 0),
  total_pcc     numeric not null default 0,
  reference     text,                                 -- réf paiement PaieCashCoin
  created_at    timestamptz not null default now()
);
create index if not exists tombola_tickets_campaign_idx on public.tombola_tickets (campaign_id);
create index if not exists tombola_tickets_user_idx on public.tombola_tickets (user_id);

alter table public.tombola_campaigns enable row level security;
alter table public.tombola_tickets   enable row level security;

notify pgrst, 'reload schema';

-- ═══════════════════════════════════════════════════════════════
-- Attribution des events Redtaag aux clubs PaieCashFan (super-admin).
-- Écrit par le backend (service-role) uniquement ; RLS deny-all.
-- Les offres billet elles-mêmes vivent dans tenants.metadata.ticketing ;
-- cette table sert d'index (quel event est assigné à quel club).
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.redtaag_event_clubs (
  redtaag_event_id text        primary key,
  tenant_id        uuid        not null references public.tenants(id) on delete cascade,
  title            text,
  offer_count      int         not null default 0,
  updated_at       timestamptz not null default now()
);

create index if not exists redtaag_event_clubs_tenant_idx
  on public.redtaag_event_clubs (tenant_id);

alter table public.redtaag_event_clubs enable row level security;
-- Aucune policy : accès refusé hors service-role (deny-all).

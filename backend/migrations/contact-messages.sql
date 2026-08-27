-- ═══════════════════════════════════════════════════════════════
-- Messages du formulaire de contact public.
-- Écrits par le backend (service-role) uniquement ; RLS deny-all
-- (convention projet). L'email de notification reste le canal principal ;
-- cette table sert d'archive durable (et de future vue BO).
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  subject    text,
  message    text        not null,
  ip         text,
  handled    boolean     not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;
-- Aucune policy : accès refusé à tout rôle non service-role (deny-all).

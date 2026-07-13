-- ═══════════════════════════════════════════════════════════════
-- Fan Club — feed communautaire par club (posts, commentaires, likes, chat)
-- À exécuter dans Supabase → SQL Editor (projet npmenstkeahngrzemmna).
-- Idempotent (IF NOT EXISTS). Le backend accède via service_role (bypass RLS) ;
-- RLS activé sans policy = accès direct anon/authenticated bloqué (tout passe
-- par l'API PaieCashFan).
-- ═══════════════════════════════════════════════════════════════

-- Posts du fil communautaire d'un club
create table if not exists public.fan_posts (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists fan_posts_tenant_idx  on public.fan_posts (tenant_id, created_at desc);

-- Commentaires d'un post
create table if not exists public.fan_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.fan_posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists fan_comments_post_idx on public.fan_comments (post_id, created_at);

-- Likes (1 par utilisateur et par post)
create table if not exists public.fan_post_likes (
  post_id    uuid not null references public.fan_posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Chat live public du club
create table if not exists public.fan_messages (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists fan_messages_tenant_idx on public.fan_messages (tenant_id, created_at);

-- RLS : bloque l'accès direct (le backend service_role passe outre)
alter table public.fan_posts      enable row level security;
alter table public.fan_comments   enable row level security;
alter table public.fan_post_likes enable row level security;
alter table public.fan_messages   enable row level security;

-- Recharge le cache de schéma PostgREST
notify pgrst, 'reload schema';

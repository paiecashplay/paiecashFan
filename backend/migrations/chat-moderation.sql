-- ═══════════════════════════════════════════════════════════════
-- Modération des salons Fan Club — schéma complet (lots 1 → 7).
--
-- Périmètre : le salon officiel des supporters d'un club = `fan_messages`
-- (scopé par tenant_id). NB : les tables chat_profiles/chat_messages de
-- 008_chat_system.sql n'ont JAMAIS été migrées (legacy mort) — rien à voir.
--
-- RLS : deny-all (aucune policy) — accès uniquement via le backend service-role.
-- À exécuter dans le SQL Editor Supabase. Idempotent.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. fan_messages : colonnes de modération ────────────────────
-- Aucune suppression physique : on masque via moderation_status + deleted_at.
ALTER TABLE public.fan_messages
  ADD COLUMN IF NOT EXISTS moderation_status  text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS moderation_case_id uuid,
  ADD COLUMN IF NOT EXISTS deleted_at         timestamptz,
  ADD COLUMN IF NOT EXISTS edited_at          timestamptz;

ALTER TABLE public.fan_messages DROP CONSTRAINT IF EXISTS fan_messages_moderation_status_check;
ALTER TABLE public.fan_messages ADD CONSTRAINT fan_messages_moderation_status_check
  CHECK (moderation_status IN ('pending', 'published', 'hidden', 'removed', 'blocked'));

-- Lecture du salon : on ne sert que les messages publiés.
CREATE INDEX IF NOT EXISTS fan_messages_moderation_idx
  ON public.fan_messages (tenant_id, moderation_status, created_at DESC);

-- ── 2. Adhésion au salon + acceptation de la charte ─────────────
CREATE TABLE IF NOT EXISTS public.chat_room_memberships (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL,
  charter_version     text,
  charter_accepted_at timestamptz,
  first_joined_at     timestamptz NOT NULL DEFAULT now(),
  last_joined_at      timestamptz NOT NULL DEFAULT now(),
  status              text NOT NULL DEFAULT 'active',
  suspended_until     timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id),
  CONSTRAINT chat_room_memberships_status_check CHECK (status IN ('active', 'suspended', 'banned'))
);
CREATE INDEX IF NOT EXISTS chat_room_memberships_user_idx ON public.chat_room_memberships (user_id);

-- ── 3. Signalements (le signalant reste anonyme côté API) ───────
CREATE TABLE IF NOT EXISTS public.chat_reports (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id       uuid NOT NULL REFERENCES public.fan_messages(id) ON DELETE CASCADE,
  tenant_id        uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  reporter_user_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  reason           text NOT NULL,
  comment          text,
  status           text NOT NULL DEFAULT 'open',
  reviewed_by      uuid,
  reviewed_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, reporter_user_id),   -- un seul signalement par user/message
  CONSTRAINT chat_reports_status_check CHECK (status IN ('open', 'reviewed', 'dismissed'))
);
CREATE INDEX IF NOT EXISTS chat_reports_tenant_idx  ON public.chat_reports (tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS chat_reports_message_idx ON public.chat_reports (message_id);

-- ── 4. File de modération (dossiers) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_moderation_cases (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  message_id      uuid REFERENCES public.fan_messages(id) ON DELETE SET NULL,
  target_user_id  uuid NOT NULL,
  source          text NOT NULL,
  status          text NOT NULL DEFAULT 'open',
  priority        text NOT NULL DEFAULT 'normal',
  ai_risk_score   numeric,
  ai_categories   jsonb,
  ai_summary      text,
  reports_count   integer NOT NULL DEFAULT 0,
  assigned_to     uuid,
  decision        text,
  decision_reason text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  resolved_at     timestamptz,
  resolved_by     uuid,
  CONSTRAINT chat_cases_source_check   CHECK (source   IN ('report', 'ai', 'manual')),
  CONSTRAINT chat_cases_status_check   CHECK (status   IN ('open', 'in_review', 'resolved', 'dismissed')),
  CONSTRAINT chat_cases_priority_check CHECK (priority IN ('low', 'normal', 'high', 'critical'))
);
CREATE INDEX IF NOT EXISTS chat_cases_queue_idx  ON public.chat_moderation_cases (tenant_id, status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS chat_cases_target_idx ON public.chat_moderation_cases (target_user_id);
-- Un seul dossier ouvert par message (dédup des signalements).
CREATE UNIQUE INDEX IF NOT EXISTS chat_cases_one_open_per_message
  ON public.chat_moderation_cases (message_id) WHERE status IN ('open', 'in_review');

-- ── 5. Sanctions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_sanctions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  tenant_id    uuid REFERENCES public.tenants(id) ON DELETE CASCADE,   -- NULL = global
  case_id      uuid REFERENCES public.chat_moderation_cases(id) ON DELETE SET NULL,
  sanction_type text NOT NULL,
  scope        text NOT NULL DEFAULT 'room',
  starts_at    timestamptz NOT NULL DEFAULT now(),
  ends_at      timestamptz,
  is_permanent boolean NOT NULL DEFAULT false,
  reason_code  text,
  reason_text  text,
  issued_by    uuid,          -- NULL = système/IA
  revoked_at   timestamptz,
  revoked_by   uuid,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_sanctions_type_check CHECK (sanction_type IN
    ('warning', 'mute', 'room_suspension', 'room_ban', 'global_chat_ban', 'account_review')),
  CONSTRAINT chat_sanctions_scope_check CHECK (scope IN ('room', 'global')),
  -- 🔒 GARDE-FOU : une exclusion permanente exige TOUJOURS un humain (issued_by).
  -- L'IA (issued_by NULL) ne peut donc jamais bannir définitivement, au niveau BASE.
  CONSTRAINT chat_sanctions_permanent_requires_human CHECK (NOT is_permanent OR issued_by IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS chat_sanctions_active_idx ON public.chat_sanctions (user_id, revoked_at, ends_at);
CREATE INDEX IF NOT EXISTS chat_sanctions_tenant_idx ON public.chat_sanctions (tenant_id);

-- ── 6. Journal d'audit ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_moderation_audit_logs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id        uuid REFERENCES public.chat_moderation_cases(id) ON DELETE CASCADE,
  actor_type     text NOT NULL,
  actor_id       uuid,
  action         text NOT NULL,
  previous_value jsonb,
  new_value      jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_audit_actor_check CHECK (actor_type IN ('user', 'club_admin', 'super_admin', 'ai', 'system'))
);
CREATE INDEX IF NOT EXISTS chat_audit_case_idx ON public.chat_moderation_audit_logs (case_id, created_at DESC);

-- ── 7. RLS deny-all (tout passe par le backend service-role) ────
ALTER TABLE public.chat_room_memberships     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_moderation_cases     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sanctions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_moderation_audit_logs ENABLE ROW LEVEL SECURITY;

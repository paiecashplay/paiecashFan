-- ═══════════════════════════════════════════════════════════════
-- Migration 20260616_001 — Ajout role_request sur profiles
--
-- Permet à un utilisateur de demander une élévation de rôle
-- (ex: 'club_admin') sans l'obtenir immédiatement.
-- Le super_admin valide ou refuse depuis le BO.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role_request TEXT
    CHECK (role_request IN ('club_admin', 'super_admin'))
    DEFAULT NULL;

COMMENT ON COLUMN public.profiles.role_request IS
  'Demande d''élévation de rôle soumise par l''utilisateur, en attente de validation par un super_admin.';

-- RLS : l'utilisateur peut lire son propre role_request (déjà couvert par p_profiles_self_read)
-- L'utilisateur peut positionner son propre role_request (fan → club_admin uniquement)
-- mais ne peut pas s'auto-attribuer un rôle — c'est le super_admin qui fait UPDATE role.
DROP POLICY IF EXISTS p_profiles_self_role_request ON public.profiles;
CREATE POLICY p_profiles_self_role_request ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- L'utilisateur ne peut demander que 'club_admin', pas 'super_admin' directement
    AND (role_request IS NULL OR role_request = 'club_admin')
    -- Et ne peut pas modifier son propre role
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- ---------------------------
-- MODULE NAME: organization
-- MODULE DATE: 20260406
-- MODULE SCOPE: Functions
-- ---------------------------
-- Membership helpers for RLS: inline EXISTS subqueries on user_organizations
-- from policies on the same table (or nested checks) caused infinite recursion (42P17).
-- These SECURITY DEFINER functions read membership with owner privileges so RLS does not
-- re-enter the same policy.

BEGIN;

CREATE OR REPLACE FUNCTION public.is_active_member_of_org(p_organization_id uuid, p_auth_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations uo
    JOIN public.users u ON u.id = uo.user_id
    WHERE uo.organization_id = p_organization_id
      AND u.auth_id = p_auth_id
      AND uo.disabled = FALSE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_admin_or_superadmin_of_org(p_organization_id uuid, p_auth_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations uo
    JOIN public.users u ON u.id = uo.user_id
    WHERE uo.organization_id = p_organization_id
      AND u.auth_id = p_auth_id
      AND uo.disabled = FALSE
      AND uo.role IN ('admin', 'superadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_superadmin_of_org(p_organization_id uuid, p_auth_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_organizations uo
    JOIN public.users u ON u.id = uo.user_id
    WHERE uo.organization_id = p_organization_id
      AND u.auth_id = p_auth_id
      AND uo.disabled = FALSE
      AND uo.role = 'superadmin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_active_member_of_org(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_member_of_org(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_active_admin_or_superadmin_of_org(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_admin_or_superadmin_of_org(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_active_superadmin_of_org(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_superadmin_of_org(uuid, uuid) TO service_role;

COMMENT ON FUNCTION public.is_active_member_of_org(uuid, uuid) IS 'RLS helper: non-disabled membership in organization (bypasses RLS inside).';
COMMENT ON FUNCTION public.is_active_admin_or_superadmin_of_org(uuid, uuid) IS 'RLS helper: admin or superadmin membership (bypasses RLS inside).';
COMMENT ON FUNCTION public.is_active_superadmin_of_org(uuid, uuid) IS 'RLS helper: superadmin membership (bypasses RLS inside).';

-- ---------------------------
-- RLS: organizations (replace policies to use helpers)
-- ---------------------------

DROP POLICY IF EXISTS "Members can view organization" ON public.organizations;
CREATE POLICY "Members can view organization"
ON public.organizations
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.is_active_member_of_org(organizations.id, auth.uid()));

DROP POLICY IF EXISTS "Admins can update organization" ON public.organizations;
CREATE POLICY "Admins can update organization"
ON public.organizations
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.is_active_admin_or_superadmin_of_org(organizations.id, auth.uid()))
WITH CHECK (public.is_active_admin_or_superadmin_of_org(organizations.id, auth.uid()));

DROP POLICY IF EXISTS "Superadmin can delete organization" ON public.organizations;
CREATE POLICY "Superadmin can delete organization"
ON public.organizations
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (public.is_active_superadmin_of_org(organizations.id, auth.uid()));

-- ---------------------------
-- RLS: user_organizations (replace policies to use helpers)
-- ---------------------------

DROP POLICY IF EXISTS "Members can view user_organizations" ON public.user_organizations;
CREATE POLICY "Members can view user_organizations"
ON public.user_organizations
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.is_active_member_of_org(user_organizations.organization_id, auth.uid()));

DROP POLICY IF EXISTS "Admins can add team member" ON public.user_organizations;
CREATE POLICY "Admins can add team member"
ON public.user_organizations
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (public.is_active_admin_or_superadmin_of_org(user_organizations.organization_id, auth.uid()));

DROP POLICY IF EXISTS "Admins can update membership" ON public.user_organizations;
CREATE POLICY "Admins can update membership"
ON public.user_organizations
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.is_active_admin_or_superadmin_of_org(user_organizations.organization_id, auth.uid()))
WITH CHECK (public.is_active_admin_or_superadmin_of_org(user_organizations.organization_id, auth.uid()));

DROP POLICY IF EXISTS "Admins or self can delete membership" ON public.user_organizations;
CREATE POLICY "Admins or self can delete membership"
ON public.user_organizations
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = user_organizations.user_id AND u.auth_id = auth.uid()
    )
    OR public.is_active_admin_or_superadmin_of_org(user_organizations.organization_id, auth.uid())
);

-- ---------------------------
-- RLS: organization_invites (admin insert uses helper)
-- ---------------------------

DROP POLICY IF EXISTS "Admins can create invite" ON public.organization_invites;
CREATE POLICY "Admins can create invite"
ON public.organization_invites
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (public.is_active_admin_or_superadmin_of_org(organization_invites.organization_id, auth.uid()));

-- ---------------------------
-- Backend RPC helpers (API performance)
-- ---------------------------

-- Fast group-by member counts for organization lists.
-- Used by backend `OrganizationRepository.getMemberCounts` to avoid fetching all rows and counting in JS.
CREATE OR REPLACE FUNCTION public.internal_get_org_member_counts(p_org_ids uuid[])
RETURNS TABLE (organization_id uuid, member_count integer)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    uo.organization_id,
    COUNT(*)::integer AS member_count
  FROM public.user_organizations uo
  WHERE uo.organization_id = ANY(p_org_ids)
    AND uo.disabled = false
  GROUP BY uo.organization_id;
$$;

-- One-shot team list (membership + email/full_name).
-- Used by backend `OrganizationRepository.getTeam` to avoid two sequential queries.
CREATE OR REPLACE FUNCTION public.internal_get_org_team_members(p_organization_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  organization_id uuid,
  role text,
  disabled boolean,
  created_at timestamptz,
  updated_at timestamptz,
  email text,
  full_name text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    uo.id,
    uo.user_id,
    uo.organization_id,
    uo.role,
    uo.disabled,
    uo.created_at,
    uo.updated_at,
    u.email,
    u.full_name
  FROM public.user_organizations uo
  JOIN public.users u ON u.id = uo.user_id
  WHERE uo.organization_id = p_organization_id;
$$;

COMMIT;

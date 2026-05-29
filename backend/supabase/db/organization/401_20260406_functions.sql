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

CREATE OR REPLACE FUNCTION public.is_active_admin_or_owner_of_org(p_organization_id uuid, p_auth_id uuid)
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
      AND uo.role IN ('admin', 'owner')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_owner_of_org(p_organization_id uuid, p_auth_id uuid)
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
      AND uo.role = 'owner'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_active_member_of_org(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_member_of_org(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_active_admin_or_owner_of_org(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_admin_or_owner_of_org(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_active_owner_of_org(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_owner_of_org(uuid, uuid) TO service_role;

COMMENT ON FUNCTION public.is_active_member_of_org(uuid, uuid) IS 'RLS helper: non-disabled membership in organization (bypasses RLS inside).';
COMMENT ON FUNCTION public.is_active_admin_or_owner_of_org(uuid, uuid) IS 'RLS helper: admin or owner membership (bypasses RLS inside).';
COMMENT ON FUNCTION public.is_active_owner_of_org(uuid, uuid) IS 'RLS helper: owner membership (bypasses RLS inside).';

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
USING (public.is_active_admin_or_owner_of_org(organizations.id, auth.uid()))
WITH CHECK (public.is_active_admin_or_owner_of_org(organizations.id, auth.uid()));

DROP POLICY IF EXISTS "Owner can delete organization" ON public.organizations;
CREATE POLICY "Owner can delete organization"
ON public.organizations
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (public.is_active_owner_of_org(organizations.id, auth.uid()));

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
WITH CHECK (public.is_active_admin_or_owner_of_org(user_organizations.organization_id, auth.uid()));

DROP POLICY IF EXISTS "Founder can join new organization" ON public.user_organizations;
CREATE POLICY "Founder can join new organization"
ON public.user_organizations
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = user_organizations.user_id
          AND u.auth_id = auth.uid()
    )
    AND user_organizations.role = 'owner'
    AND NOT EXISTS (
        SELECT 1 FROM public.user_organizations uo
        WHERE uo.organization_id = user_organizations.organization_id
    )
);

DROP POLICY IF EXISTS "Admins can update membership" ON public.user_organizations;
CREATE POLICY "Admins can update membership"
ON public.user_organizations
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.is_active_admin_or_owner_of_org(user_organizations.organization_id, auth.uid()))
WITH CHECK (public.is_active_admin_or_owner_of_org(user_organizations.organization_id, auth.uid()));

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
    OR public.is_active_admin_or_owner_of_org(user_organizations.organization_id, auth.uid())
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
WITH CHECK (public.is_active_admin_or_owner_of_org(organization_invites.organization_id, auth.uid()));

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

-- Server-side workspace creation bypasses RLS (service_role / API layer).
-- Direct INSERT into organizations fails when the DB client is subject to RLS
-- (e.g. publishable key without service_role bypass).
DROP FUNCTION IF EXISTS public.internal_create_organization_with_owner(uuid, text, text, text);
DROP FUNCTION IF EXISTS public.internal_create_organization_with_owner(uuid, text, text, text, boolean, boolean);
CREATE OR REPLACE FUNCTION public.internal_create_organization_with_owner(
    p_user_id uuid,
    p_name text,
    p_description text,
    p_allow_trial boolean DEFAULT TRUE,
    p_is_trialing boolean DEFAULT TRUE
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id uuid;
    v_name text;
BEGIN
    v_name := trim(p_name);
    IF v_name IS NULL OR v_name = '' THEN
        RAISE EXCEPTION 'Organization name is required';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = p_user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    INSERT INTO public.organizations (
        name,
        description,
        allow_trial,
        is_trialing,
        updated_at
    )
    VALUES (
        v_name,
        NULLIF(trim(COALESCE(p_description, '')), ''),
        COALESCE(p_allow_trial, TRUE),
        COALESCE(p_is_trialing, TRUE),
        NOW()
    )
    RETURNING organizations.id INTO v_org_id;

    INSERT INTO public.user_organizations (user_id, organization_id, role, disabled, updated_at)
    VALUES (p_user_id, v_org_id, 'owner', FALSE, NOW());

    RETURN QUERY
    SELECT o.id, o.name, o.description, o.created_at, o.updated_at
    FROM public.organizations o
    WHERE o.id = v_org_id;
END;
$$;

REVOKE ALL ON FUNCTION public.internal_create_organization_with_owner(uuid, text, text, boolean, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.internal_create_organization_with_owner(uuid, text, text, boolean, boolean) TO service_role;

COMMENT ON FUNCTION public.internal_create_organization_with_owner(uuid, text, text, boolean, boolean) IS
    'Create organization and add founding user as owner (bypasses RLS); billing flags supplied by API layer.';

COMMIT;

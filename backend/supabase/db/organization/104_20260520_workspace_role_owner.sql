-- ---------------------------
-- MODULE NAME: Organization
-- MODULE DATE: 20260520
-- MODULE SCOPE: Rename workspace role owner → owner
-- ---------------------------

BEGIN;

DO $$ BEGIN
    ALTER TYPE public.workspace_membership_role ADD VALUE 'owner';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

UPDATE public.user_organizations
SET role = 'owner'::public.workspace_membership_role
WHERE role = 'owner'::public.workspace_membership_role;

CREATE OR REPLACE FUNCTION public.is_active_admin_or_owner_of_org(p_organization_id uuid, p_auth_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
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
STABLE
SECURITY DEFINER
SET search_path = public
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

GRANT EXECUTE ON FUNCTION public.is_active_admin_or_owner_of_org(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_admin_or_owner_of_org(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_active_owner_of_org(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_owner_of_org(uuid, uuid) TO service_role;

COMMENT ON FUNCTION public.is_active_admin_or_owner_of_org(uuid, uuid) IS 'RLS helper: admin or owner membership (bypasses RLS inside).';
COMMENT ON FUNCTION public.is_active_owner_of_org(uuid, uuid) IS 'RLS helper: owner membership (bypasses RLS inside).';

COMMIT;

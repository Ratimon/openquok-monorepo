-- MODULE NAME: organization
-- MODULE DATE: 20260519
-- MODULE SCOPE: Founder insert policy + workspace creation RPC (production catch-up)

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
    AND user_organizations.role = 'superadmin'
    AND NOT EXISTS (
        SELECT 1 FROM public.user_organizations uo
        WHERE uo.organization_id = user_organizations.organization_id
    )
);

CREATE OR REPLACE FUNCTION public.internal_create_organization_with_owner(
    p_user_id uuid,
    p_name text,
    p_description text,
    p_api_key text
)
RETURNS TABLE (
    id uuid,
    name text,
    description text,
    api_key text,
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

    INSERT INTO public.organizations (name, description, api_key, updated_at)
    VALUES (
        v_name,
        NULLIF(trim(COALESCE(p_description, '')), ''),
        p_api_key,
        NOW()
    )
    RETURNING organizations.id INTO v_org_id;

    INSERT INTO public.user_organizations (user_id, organization_id, role, disabled, updated_at)
    VALUES (p_user_id, v_org_id, 'superadmin', FALSE, NOW());

    RETURN QUERY
    SELECT o.id, o.name, o.description, o.api_key, o.created_at, o.updated_at
    FROM public.organizations o
    WHERE o.id = v_org_id;
END;
$$;

REVOKE ALL ON FUNCTION public.internal_create_organization_with_owner(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.internal_create_organization_with_owner(uuid, text, text, text) TO service_role;

COMMENT ON FUNCTION public.internal_create_organization_with_owner(uuid, text, text, text) IS
    'Create organization and add founding user as superadmin (bypasses RLS); API service_role only.';

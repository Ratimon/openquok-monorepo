-- ---------------------------
-- MODULE NAME: organization
-- MODULE DATE: 20260918
-- MODULE SCOPE: Functions
-- ---------------------------
-- Default new-workspace trial eligibility from the owner's Cloud trial consumption.

BEGIN;

DROP FUNCTION IF EXISTS public.internal_create_organization_with_owner(uuid, text, text, text);
DROP FUNCTION IF EXISTS public.internal_create_organization_with_owner(uuid, text, text, text, boolean, boolean);
DROP FUNCTION IF EXISTS public.internal_create_organization_with_owner(uuid, text, text, boolean, boolean);

CREATE OR REPLACE FUNCTION public.internal_create_organization_with_owner(
    p_user_id uuid,
    p_name text,
    p_description text,
    p_allow_trial boolean DEFAULT NULL,
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
    v_allow_trial boolean;
BEGIN
    v_name := trim(p_name);
    IF v_name IS NULL OR v_name = '' THEN
        RAISE EXCEPTION 'Organization name is required';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = p_user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    v_allow_trial := COALESCE(
        p_allow_trial,
        (
            SELECT u.cloud_trial_consumed_at IS NULL
            FROM public.users u
            WHERE u.id = p_user_id
        )
    );

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
        COALESCE(v_allow_trial, FALSE),
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
    'Create organization and add founding user as owner (bypasses RLS). When p_allow_trial is omitted, defaults from whether the owner has already consumed a Cloud trial.';

COMMIT;

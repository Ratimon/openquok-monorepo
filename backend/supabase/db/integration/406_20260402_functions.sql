-- ---------------------------
-- MODULE NAME: integration
-- MODULE DATE: 20260402
-- MODULE SCOPE: functions
-- ---------------------------
-- Prefix 406: integration module functions band (106 tables, 206 indexes, 306 rlsgrants).
-- Server-side integration reads/updates that bypass RLS (service_role only).
-- Used by the API service client so programmatic and session flows behave consistently.

BEGIN;

CREATE OR REPLACE FUNCTION public.internal_list_integrations_by_org(p_organization_id uuid)
RETURNS TABLE (
    id uuid,
    organization_id uuid,
    internal_id text,
    name text,
    picture text,
    provider_identifier text,
    type text,
    disabled boolean,
    in_between_steps boolean,
    refresh_needed boolean,
    posting_times text,
    additional_settings text,
    profile text,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT
        i.id,
        i.organization_id,
        i.internal_id,
        i.name,
        i.picture,
        i.provider_identifier,
        i.type,
        i.disabled,
        i.in_between_steps,
        i.refresh_needed,
        i.posting_times,
        i.additional_settings,
        i.profile,
        i.created_at,
        i.updated_at
    FROM public.integrations i
    WHERE i.organization_id = p_organization_id
      AND i.deleted_at IS NULL
    ORDER BY i.created_at ASC;
$$;

REVOKE ALL ON FUNCTION public.internal_list_integrations_by_org(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.internal_list_integrations_by_org(uuid) TO service_role;
COMMENT ON FUNCTION public.internal_list_integrations_by_org(uuid) IS
    'List integrations for an organization (bypasses RLS); service_role only';

CREATE OR REPLACE FUNCTION public.internal_get_integration_by_org_and_id(
    p_organization_id uuid,
    p_integration_id uuid
)
RETURNS SETOF public.integrations
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT i.*
    FROM public.integrations i
    WHERE i.organization_id = p_organization_id
      AND i.id = p_integration_id
      AND i.deleted_at IS NULL
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.internal_get_integration_by_org_and_id(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.internal_get_integration_by_org_and_id(uuid, uuid) TO service_role;
COMMENT ON FUNCTION public.internal_get_integration_by_org_and_id(uuid, uuid) IS
    'Fetch one integration by organization and id (bypasses RLS); service_role only';

CREATE OR REPLACE FUNCTION public.internal_soft_delete_integration(
    p_organization_id uuid,
    p_integration_id uuid,
    p_new_internal_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.integrations
    SET
        internal_id = left(p_new_internal_id, 512),
        deleted_at = now(),
        updated_at = now()
    WHERE organization_id = p_organization_id
      AND id = p_integration_id
      AND deleted_at IS NULL;
    RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.internal_soft_delete_integration(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.internal_soft_delete_integration(uuid, uuid, text) TO service_role;
COMMENT ON FUNCTION public.internal_soft_delete_integration(uuid, uuid, text) IS
    'Soft-delete an integration row (bypasses RLS); service_role only';

COMMIT;

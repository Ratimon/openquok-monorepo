-- ---------------------------
-- MODULE NAME: customer
-- MODULE DATE: 20260412
-- MODULE SCOPE: Functions
-- ---------------------------
-- Canonical `internal_list_integrations_by_org`: joins `integration_customers` for list payloads.
-- MODULE_ORDER runs this module before integration in the same tier; the integration module
-- must not ship a second definition with a different RETURNS TABLE shape (PostgreSQL 42P13).
-- Existing DBs may still have the older RETURNS TABLE; `CREATE OR REPLACE` cannot change OUT
-- types (42P13), so drop first when upgrading.

BEGIN;

DROP FUNCTION IF EXISTS public.internal_list_integrations_by_org(uuid);

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
    updated_at timestamptz,
    customer_id uuid,
    customer_name text
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
        i.updated_at,
        i.customer_id,
        ic.name AS customer_name
    FROM public.integrations i
    LEFT JOIN public.integration_customers ic
        ON ic.id = i.customer_id
        AND ic.organization_id = i.organization_id
    WHERE i.organization_id = p_organization_id
      AND i.deleted_at IS NULL
    ORDER BY i.created_at ASC;
$$;

REVOKE ALL ON FUNCTION public.internal_list_integrations_by_org(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.internal_list_integrations_by_org(uuid) TO service_role;
COMMENT ON FUNCTION public.internal_list_integrations_by_org(uuid) IS
    'List integrations for an organization (bypasses RLS); service_role only; includes optional customer label';

COMMIT;

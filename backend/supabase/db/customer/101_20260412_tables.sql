-- ---------------------------
-- MODULE NAME: customer
-- MODULE DATE: 20260412
-- MODULE SCOPE: Tables
-- ---------------------------
-- Workspace-scoped channel groups (`integration_customers`).
-- Runs before `integration` module `101_*` so `public.integrations` can declare FK to this table.

BEGIN;

CREATE TABLE IF NOT EXISTS public.integration_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_integration_customers_org_name UNIQUE (organization_id, name)
);

COMMENT ON TABLE public.integration_customers IS
    'Optional labels for grouping connected channels within a workspace; referenced by integrations.customer_id';

COMMIT;

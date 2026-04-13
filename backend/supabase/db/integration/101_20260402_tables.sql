-- ---------------------------
-- MODULE NAME: integration
-- MODULE DATE: 20260402
-- MODULE SCOPE: Tables
-- ---------------------------
-- Connected channels per organization: id, internal_id, organization_id, name, picture,
-- provider_identifier, type, token, disabled, token_expiration, refresh_token, profile,
-- deleted_at, created_at, updated_at, in_between_steps, refresh_needed, posting_times,
-- custom_instance_details, customer_id, root_internal_id, additional_settings.
-- Optional relations (plugs, posts, webhooks) are not modeled here yet — columns reserved where noted.
-- `customer_id` FK requires `customer` module tables to run before this file (see MODULE_ORDER).

BEGIN;

CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    internal_id TEXT NOT NULL,
    name TEXT NOT NULL,
    picture TEXT,
    provider_identifier TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'social',
    token TEXT NOT NULL,
    disabled BOOLEAN NOT NULL DEFAULT FALSE,
    token_expiration TIMESTAMPTZ,
    refresh_token TEXT,
    profile TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    in_between_steps BOOLEAN NOT NULL DEFAULT FALSE,
    refresh_needed BOOLEAN NOT NULL DEFAULT FALSE,
    -- Default slots: 120/400/700 = minutes after UTC midnight → 02:00 / 06:40 / 11:40 UTC (local labels depend on client TZ).
    posting_times TEXT NOT NULL DEFAULT '[{"time":120},{"time":400},{"time":700}]',
    custom_instance_details TEXT,
    customer_id UUID REFERENCES public.integration_customers(id) ON DELETE SET NULL,
    root_internal_id TEXT,
    additional_settings TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT uq_integrations_organization_internal UNIQUE (organization_id, internal_id)
);

COMMENT ON TABLE public.integrations IS 'Connected social/article channels per workspace; access tokens via service role from API';
COMMENT ON COLUMN public.integrations.type IS 'social | article (and other provider groupings)';
COMMENT ON COLUMN public.integrations.profile IS 'Display handle or profile line for the connected account';
COMMENT ON COLUMN public.integrations.customer_id IS 'Optional FK to integration_customers for workspace channel grouping';
COMMENT ON COLUMN public.integrations.root_internal_id IS 'Normalized id for cross-org trial checks';
COMMENT ON COLUMN public.integrations.posting_times IS 'JSON [{time:number}, ...]; each time is minutes after UTC midnight for UI decode. Column default 120/400/700 encodes 02:00, 06:40, and 11:40 UTC on that anchor day; local labels depend on the viewer timezone. New rows created with a connect-time offset may use a different default triple in application code.';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

-- ---------------------------
-- MODULE NAME: Acquisition
-- MODULE DATE: 20260828
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_acquisition_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    other_detail TEXT,
    utm TEXT,
    landing_url TEXT,
    referrer TEXT,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    subscription_id TEXT,
    skipped BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_acquisition_responses_user_id_key UNIQUE (user_id)
);

COMMENT ON TABLE public.user_acquisition_responses IS 'One-time post-conversion attribution survey response per user (submit or skip).';
COMMENT ON COLUMN public.user_acquisition_responses.source IS 'Controlled slug (e.g. search_engine, reddit, other); use other_detail when source is other.';
COMMENT ON COLUMN public.user_acquisition_responses.skipped IS 'True when the user skipped or closed without selecting a source.';

COMMIT;

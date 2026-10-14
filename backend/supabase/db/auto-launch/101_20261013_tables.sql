-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261013
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS public.auto_launch_product_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    integration_customer_id UUID REFERENCES public.integration_customers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.auto_launch_product_profiles IS
    'Reusable product snapshots for directory launch flows; scoped to a workspace with optional channel-group label.';
COMMENT ON COLUMN public.auto_launch_product_profiles.profile_data IS
    'Extension-oriented fields (makers, media URLs, pricing type, etc.) not stored as first-class columns.';
COMMENT ON COLUMN public.auto_launch_product_profiles.integration_customer_id IS
    'Optional link to a channel group for My Channels directory launch grouping; not a social integration row.';

CREATE TABLE IF NOT EXISTS public.auto_launch_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_slug TEXT NOT NULL,
    link_directory_opportunity_id UUID REFERENCES public.link_directory_opportunities(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    short_description TEXT,
    submission_path TEXT NOT NULL DEFAULT 'extension'
        CHECK (submission_path IN ('extension', 'auto')),
    start_url TEXT NOT NULL,
    extension_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    picker_group_key TEXT,
    picker_group_title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_auto_launch_destinations_provider_slug UNIQUE (provider_slug)
);

COMMENT ON TABLE public.auto_launch_destinations IS
    'Executable launch targets (extension fill config + start URL) joined to editorial opportunities when present.';
COMMENT ON COLUMN public.auto_launch_destinations.submission_path IS
    'v1 uses extension only; auto is reserved for a future server-side submit path.';
COMMENT ON COLUMN public.auto_launch_destinations.extension_config IS
    'Manifest for the browser extension: startUrlPatterns, steps[].fields[], proof hints, and version.';
COMMENT ON COLUMN public.auto_launch_destinations.picker_group_key IS
    'When set, destinations with the same key are shown as variants in one Add Channel launch card.';
COMMENT ON COLUMN public.auto_launch_destinations.picker_group_title IS
    'Optional card title for the picker group; first non-null title among variants is used.';

CREATE TABLE IF NOT EXISTS public.auto_launch_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    product_profile_id UUID NOT NULL REFERENCES public.auto_launch_product_profiles(id) ON DELETE RESTRICT,
    destination_id UUID NOT NULL REFERENCES public.auto_launch_destinations(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN (
            'draft',
            'intent',
            'in_progress',
            'completed',
            'cancelled',
            'failed'
        )),
    profile_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    extension_config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    listing_url TEXT,
    intent_created_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    completed_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.auto_launch_submissions IS
    'One launch attempt per intent handoff; profile and extension config are frozen at intent time.';
COMMENT ON COLUMN public.auto_launch_submissions.evidence IS
    'Proof from the extension after human submit on the directory site (final URL, timestamps, optional media refs).';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

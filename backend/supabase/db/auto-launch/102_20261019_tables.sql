-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261019
-- MODULE SCOPE: Tables (directory SEO metrics, competitors, profile variants, history backfill)
-- ---------------------------

BEGIN;

-- Global domain rating cache (shared across workspaces; written by backend / housekeeping).
CREATE TABLE IF NOT EXISTS public.seo_domain_metric_snapshots (
    domain TEXT PRIMARY KEY,
    domain_rating NUMERIC(6, 2),
    source TEXT NOT NULL DEFAULT 'dataforseo',
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    provider_history_backfilled_at TIMESTAMPTZ
);

COMMENT ON TABLE public.seo_domain_metric_snapshots IS
    'Latest domain rating per normalized hostname; refreshed by Directory SEO worker with global TTL.';
COMMENT ON COLUMN public.seo_domain_metric_snapshots.domain IS
    'Normalized hostname (lowercase, no scheme or path).';
COMMENT ON COLUMN public.seo_domain_metric_snapshots.source IS
    'Provider that produced domain_rating (v1: dataforseo backlinks summary).';
COMMENT ON COLUMN public.seo_domain_metric_snapshots.provider_history_backfilled_at IS
    'When provider daily timeseries was last imported for chart backfill; NULL until first successful backfill.';

CREATE TABLE IF NOT EXISTS public.seo_domain_metric_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,
    domain_rating NUMERIC(6, 2),
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    origin TEXT NOT NULL DEFAULT 'live_refresh',
    CONSTRAINT chk_seo_domain_metric_history_origin CHECK (
        origin IN ('live_refresh', 'provider_timeseries')
    )
);

COMMENT ON TABLE public.seo_domain_metric_history IS
    'Append-only domain rating samples for charting product and competitor domains.';
COMMENT ON COLUMN public.seo_domain_metric_history.origin IS
    'live_refresh = housekeeping/API snapshot sample; provider_timeseries = imported daily rank from DataForSEO backfill.';

CREATE TABLE IF NOT EXISTS public.directory_seo_competitors (
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    label TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT pk_directory_seo_competitors PRIMARY KEY (organization_id, domain),
    CONSTRAINT chk_directory_seo_competitors_domain_nonempty CHECK (char_length(trim(domain)) > 0)
);

COMMENT ON TABLE public.directory_seo_competitors IS
    'Workspace-tracked competitor domains for Directory analytics; count capped by subscription tier in the API.';

ALTER TABLE public.auto_launch_product_profiles
    ADD COLUMN IF NOT EXISTS parent_profile_id UUID
        REFERENCES public.auto_launch_product_profiles(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS profile_kind TEXT NOT NULL DEFAULT 'main'
        CHECK (profile_kind IN ('main', 'directory_variant')),
    ADD COLUMN IF NOT EXISTS directory_site_key TEXT;

COMMENT ON COLUMN public.auto_launch_product_profiles.parent_profile_id IS
    'NULL for the main product profile; set for per-directory tailored copies branched from main.';
COMMENT ON COLUMN public.auto_launch_product_profiles.profile_kind IS
    'main = default workspace product profile; directory_variant = site-specific tailored copy.';
COMMENT ON COLUMN public.auto_launch_product_profiles.directory_site_key IS
    'Link-directory site slug (e.g. peerpush) for directory_variant rows; NULL on main profiles.';

ALTER TABLE public.auto_launch_product_profiles
    DROP CONSTRAINT IF EXISTS chk_auto_launch_product_profiles_variant_shape;

ALTER TABLE public.auto_launch_product_profiles
    ADD CONSTRAINT chk_auto_launch_product_profiles_variant_shape CHECK (
        (
            profile_kind = 'main'
            AND parent_profile_id IS NULL
            AND directory_site_key IS NULL
        )
        OR (
            profile_kind = 'directory_variant'
            AND parent_profile_id IS NOT NULL
            AND directory_site_key IS NOT NULL
            AND char_length(trim(directory_site_key)) > 0
        )
    );

ALTER TABLE public.auto_launch_product_profiles
    DROP CONSTRAINT IF EXISTS chk_auto_launch_product_profiles_variant_no_channel_group;

ALTER TABLE public.auto_launch_product_profiles
    ADD CONSTRAINT chk_auto_launch_product_profiles_variant_no_channel_group CHECK (
        profile_kind = 'main' OR integration_customer_id IS NULL
    );

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

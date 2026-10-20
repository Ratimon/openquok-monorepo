-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261019
-- MODULE SCOPE: Indexes (directory SEO + profile variants)
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_seo_domain_metric_history_domain_captured
    ON public.seo_domain_metric_history (domain, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_directory_seo_competitors_org_sort
    ON public.directory_seo_competitors (organization_id, sort_order, domain);

CREATE INDEX IF NOT EXISTS idx_auto_launch_product_profiles_parent
    ON public.auto_launch_product_profiles (parent_profile_id)
    WHERE parent_profile_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_auto_launch_product_profiles_directory_variant_site
    ON public.auto_launch_product_profiles (parent_profile_id, directory_site_key)
    WHERE parent_profile_id IS NOT NULL AND deleted_at IS NULL;

COMMENT ON INDEX public.uq_auto_launch_product_profiles_directory_variant_site IS
    'At most one active directory variant per main profile and link-directory site key.';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

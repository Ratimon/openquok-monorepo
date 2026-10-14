-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261013
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_auto_launch_product_profiles_org
    ON public.auto_launch_product_profiles (organization_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_auto_launch_product_profiles_integration_customer
    ON public.auto_launch_product_profiles (integration_customer_id)
    WHERE integration_customer_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_auto_launch_destinations_published_sort
    ON public.auto_launch_destinations (is_published, sort_order);

CREATE INDEX IF NOT EXISTS idx_auto_launch_destinations_opportunity_id
    ON public.auto_launch_destinations (link_directory_opportunity_id);

CREATE INDEX IF NOT EXISTS idx_auto_launch_submissions_org_created
    ON public.auto_launch_submissions (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auto_launch_submissions_destination
    ON public.auto_launch_submissions (destination_id);

CREATE INDEX IF NOT EXISTS idx_auto_launch_submissions_profile
    ON public.auto_launch_submissions (product_profile_id);

CREATE INDEX IF NOT EXISTS idx_auto_launch_submissions_status
    ON public.auto_launch_submissions (organization_id, status);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

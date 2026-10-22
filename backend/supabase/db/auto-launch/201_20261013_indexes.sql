-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261015
-- MODULE SCOPE: Indexes (includes business-profile 1:1 invariant + first-deploy bootstrap)
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

CREATE UNIQUE INDEX IF NOT EXISTS uq_auto_launch_product_profiles_integration_customer_active
    ON public.auto_launch_product_profiles (integration_customer_id)
    WHERE integration_customer_id IS NOT NULL AND deleted_at IS NULL;

COMMENT ON INDEX public.uq_auto_launch_product_profiles_integration_customer_active IS
    'At most one active auto-launch product profile per workspace channel group (business profile).';

-- First deploy: ensure each existing channel group has a business profile row (no-op when none).
INSERT INTO public.auto_launch_product_profiles (
    organization_id,
    integration_customer_id,
    name,
    profile_data,
    created_at,
    updated_at
)
SELECT
    c.organization_id,
    c.id,
    c.name,
    '{}'::jsonb,
    NOW(),
    NOW()
FROM public.integration_customers AS c
WHERE NOT EXISTS (
    SELECT 1
    FROM public.auto_launch_product_profiles AS p
    WHERE p.integration_customer_id = c.id
      AND p.deleted_at IS NULL
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

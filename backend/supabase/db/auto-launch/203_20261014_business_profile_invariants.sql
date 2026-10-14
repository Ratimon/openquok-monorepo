-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261014
-- MODULE SCOPE: Indexes (business profile 1:1 with integration_customers)
-- ---------------------------

BEGIN;

-- Keep one active product profile per channel group before adding the unique index.
WITH ranked AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY integration_customer_id
            ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
        ) AS rn
    FROM public.auto_launch_product_profiles
    WHERE deleted_at IS NULL
      AND integration_customer_id IS NOT NULL
)
UPDATE public.auto_launch_product_profiles AS p
SET
    integration_customer_id = NULL,
    updated_at = NOW()
FROM ranked AS r
WHERE p.id = r.id
  AND r.rn > 1;

DO $$
DECLARE
    rec RECORD;
    cust_id UUID;
BEGIN
    FOR rec IN
        SELECT id, organization_id, name
        FROM public.auto_launch_product_profiles
        WHERE deleted_at IS NULL
          AND integration_customer_id IS NULL
    LOOP
        SELECT ic.id
        INTO cust_id
        FROM public.integration_customers AS ic
        WHERE ic.organization_id = rec.organization_id
          AND lower(ic.name) = lower(rec.name)
        LIMIT 1;

        IF cust_id IS NULL THEN
            INSERT INTO public.integration_customers (organization_id, name, updated_at)
            VALUES (rec.organization_id, rec.name, NOW())
            RETURNING id INTO cust_id;
        END IF;

        UPDATE public.auto_launch_product_profiles
        SET integration_customer_id = cust_id, updated_at = NOW()
        WHERE id = rec.id;
    END LOOP;
END $$;

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

CREATE UNIQUE INDEX IF NOT EXISTS uq_auto_launch_product_profiles_integration_customer_active
    ON public.auto_launch_product_profiles (integration_customer_id)
    WHERE integration_customer_id IS NOT NULL AND deleted_at IS NULL;

COMMENT ON INDEX public.uq_auto_launch_product_profiles_integration_customer_active IS
    'At most one active auto-launch product profile per workspace channel group (business profile).';

COMMIT;

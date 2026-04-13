-- ---------------------------
-- MODULE NAME: customer
-- MODULE DATE: 20260412
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_integration_customers_organization_id
    ON public.integration_customers(organization_id);

COMMIT;

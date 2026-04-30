-- ---------------------------
-- MODULE NAME: signature
-- MODULE DATE: 20260430
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_signatures_organization_id ON public.signatures(organization_id);

-- One default signature per organization.
CREATE UNIQUE INDEX IF NOT EXISTS uq_signatures_organization_default
    ON public.signatures(organization_id)
    WHERE is_default = TRUE;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

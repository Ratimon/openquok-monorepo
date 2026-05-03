-- ---------------------------
-- MODULE NAME: sets
-- MODULE DATE: 20260503
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_sets_organization_id ON public.sets(organization_id);

COMMIT;

-- ---------------------------
-- END OF FILE
-- ---------------------------

-- ---------------------------
-- MODULE NAME: Organization
-- MODULE DATE: 20260529
-- MODULE SCOPE: Tables
-- ---------------------------
-- Remove legacy workspace API key column (programmatic auth uses OAuth app tokens only).

BEGIN;

DROP INDEX IF EXISTS public.idx_organizations_api_key;

ALTER TABLE public.organizations DROP COLUMN IF EXISTS api_key;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

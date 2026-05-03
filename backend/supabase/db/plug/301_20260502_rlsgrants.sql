-- ---------------------------
-- MODULE NAME: plug
-- MODULE DATE: 20260502
-- MODULE SCOPE: RLS & Grants
-- ---------------------------
-- Table privileges and enable RLS only. Policies that call `public.is_active_member_of_org`
-- live in `402_*` (tier 4) so they run after `organization/401_*_functions.sql`.

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plugs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plugs TO service_role;

ALTER TABLE public.plugs ENABLE ROW LEVEL SECURITY;

COMMIT;

-- ---------------------------
-- END OF FILE
-- ---------------------------

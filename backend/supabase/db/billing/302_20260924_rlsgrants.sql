-- ---------------------------
-- MODULE NAME: Billing
-- MODULE DATE: 20260924
-- MODULE SCOPE: RLS + grants
-- ---------------------------
-- Backend service_role only; no authenticated client access.

BEGIN;

ALTER TABLE public.cloud_trial_browser_consumptions ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.cloud_trial_browser_consumptions TO service_role;

DROP POLICY IF EXISTS cloud_trial_browser_consumptions_service_role_all ON public.cloud_trial_browser_consumptions;
CREATE POLICY cloud_trial_browser_consumptions_service_role_all
    ON public.cloud_trial_browser_consumptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMIT;

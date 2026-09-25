-- ---------------------------
-- MODULE NAME: Billing
-- MODULE DATE: 20260924
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS public.cloud_trial_browser_consumptions (
    browser_signal_id UUID PRIMARY KEY,
    consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.cloud_trial_browser_consumptions IS
    'Browsers that have consumed a Cloud free trial; one row per browser_signal_id (first-party cookie).';
COMMENT ON COLUMN public.cloud_trial_browser_consumptions.browser_signal_id IS
    'Stable UUID from oq_cloud_trial_browser cookie / cloudTrialBrowserSignalId request field.';
COMMENT ON COLUMN public.cloud_trial_browser_consumptions.consumed_at IS
    'When the trial was first consumed on this browser signal.';
COMMENT ON COLUMN public.cloud_trial_browser_consumptions.user_id IS
    'User account that consumed the trial on this browser (audit and support).';

COMMIT;

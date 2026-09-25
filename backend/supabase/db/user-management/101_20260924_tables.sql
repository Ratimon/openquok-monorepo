-- ---------------------------
-- MODULE NAME: User Management
-- MODULE DATE: 20260924
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

ALTER TABLE public.users
    ADD COLUMN cloud_trial_browser_signal_id UUID NULL;

COMMENT ON COLUMN public.users.cloud_trial_browser_signal_id IS
    'Last seen first-party browser signal for Cloud trial enforcement (signup, OAuth, billing).';

COMMIT;

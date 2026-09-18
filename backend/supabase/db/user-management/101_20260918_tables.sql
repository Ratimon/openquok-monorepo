-- ---------------------------
-- MODULE NAME: User Management
-- MODULE DATE: 20260918
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS cloud_trial_consumed_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.users.cloud_trial_consumed_at IS
    'Set when the user first starts or completes a Cloud trial. One trial per account.';

-- Historical consumption is backfilled in billing/402 after organization_subscriptions exists.

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

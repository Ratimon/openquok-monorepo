-- ---------------------------
-- MODULE NAME: Billing
-- MODULE DATE: 20260525
-- MODULE SCOPE: Tables
-- ---------------------------
-- Rename misleading total_channels → channels_per_workspace on existing databases.

BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'organization_subscriptions'
          AND column_name = 'total_channels'
    ) THEN
        ALTER TABLE public.organization_subscriptions
            RENAME COLUMN total_channels TO channels_per_workspace;
    END IF;
END $$;

COMMENT ON COLUMN public.organization_subscriptions.channels_per_workspace IS
    'Per-workspace connected-channel cap snapshot (may exceed plan default after upgrades).';

COMMIT;

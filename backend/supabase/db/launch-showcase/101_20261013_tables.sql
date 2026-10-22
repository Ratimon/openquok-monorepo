-- ---------------------------
-- MODULE NAME: Launch Showcase
-- MODULE DATE: 20261013
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

-- Stub only: full schema for launch showcase ships in a later milestone.
-- See docs/auto-launch/launch-showcase.md for entries, entitlements, and boost accounting.
CREATE TABLE IF NOT EXISTS public.launch_showcase_boost_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.launch_showcase_boost_events IS
    'Placeholder for future launch showcase boost and spend events; expand before any product surface reads this table.';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

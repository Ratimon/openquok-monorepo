-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261109
-- MODULE SCOPE: Seed (default auto_launch module config — demo profile off in shared migrations)
-- ---------------------------
-- Production and hosted DBs: SEED_OPENQUOK_BUSINESS_PROFILE_ON_ORG_CREATE stays false.
-- ON CONFLICT merge overwrites a previously true value idempotently.
-- Local only: backend/supabase/seeds/local_dev_openquok_business_profile.sql runs after
-- `supabase db reset` and sets the flag true + backfills workspaces.

BEGIN;

INSERT INTO public.module_configs (module_name, config)
VALUES (
    'auto_launch',
    jsonb_build_object(
        'SEED_OPENQUOK_BUSINESS_PROFILE_ON_ORG_CREATE',
        FALSE
    )
)
ON CONFLICT (module_name) DO UPDATE
SET config = public.module_configs.config || EXCLUDED.config,
    updated_at = NOW();

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

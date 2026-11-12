-- Local Supabase only (see backend/supabase/config.toml [db.seed]).
-- Runs after migrations on `supabase db reset` — not applied to remote/production pushes.

BEGIN;

INSERT INTO public.module_configs (module_name, config)
VALUES (
    'auto_launch',
    jsonb_build_object(
        'SEED_OPENQUOK_BUSINESS_PROFILE_ON_ORG_CREATE',
        TRUE
    )
)
ON CONFLICT (module_name) DO UPDATE
SET config = public.module_configs.config || EXCLUDED.config,
    updated_at = NOW();

DO $$
DECLARE
    v_org_id uuid;
BEGIN
    IF NOT public.auto_launch_dev_openquok_profile_seed_enabled() THEN
        RETURN;
    END IF;

    FOR v_org_id IN
        SELECT o.id
        FROM public.organizations AS o
    LOOP
        PERFORM public.auto_launch_ensure_openquok_business_profile(v_org_id);
    END LOOP;
END;
$$;

COMMIT;

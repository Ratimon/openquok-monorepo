-- ---------------------------
-- MODULE NAME: User Management
-- MODULE DATE: 20261102
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

-- ---------------------------
-- Platform admin flag (service_role / ops only)
-- ---------------------------

CREATE OR REPLACE FUNCTION public.internal_set_is_super_admin(
    p_email TEXT,
    p_is_super_admin BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.users
    SET is_super_admin = p_is_super_admin,
        updated_at = NOW()
    WHERE lower(trim(email)) = lower(trim(p_email));

    IF NOT FOUND THEN
        RAISE EXCEPTION 'user not found for email %', p_email;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.internal_set_is_super_admin(TEXT, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.internal_set_is_super_admin(TEXT, BOOLEAN) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.internal_set_is_super_admin(TEXT, BOOLEAN) TO service_role;
COMMENT ON FUNCTION public.internal_set_is_super_admin IS 'Set users.is_super_admin by email (service_role only; bypasses RLS)';

-- ---------------------------
-- Guard: allow Supabase Dashboard SQL Editor (supabase_admin)
-- ---------------------------

CREATE OR REPLACE FUNCTION public.guard_users_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NEW;
    END IF;

    IF current_user IN ('service_role', 'postgres', 'supabase_admin') THEN
        RETURN NEW;
    END IF;

    IF NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin
       OR NEW.is_email_verified IS DISTINCT FROM OLD.is_email_verified
       OR NEW.email_verification_token IS DISTINCT FROM OLD.email_verification_token
       OR NEW.email_verification_token_expires IS DISTINCT FROM OLD.email_verification_token_expires
       OR NEW.auth_id IS DISTINCT FROM OLD.auth_id
       OR NEW.id IS DISTINCT FROM OLD.id
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.provider IS DISTINCT FROM OLD.provider
       OR NEW.provider_id IS DISTINCT FROM OLD.provider_id
       OR NEW.cloud_trial_consumed_at IS DISTINCT FROM OLD.cloud_trial_consumed_at
       OR NEW.cloud_trial_browser_signal_id IS DISTINCT FROM OLD.cloud_trial_browser_signal_id
    THEN
        RAISE EXCEPTION 'update not allowed on protected user columns';
    END IF;

    RETURN NEW;
END;
$$;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

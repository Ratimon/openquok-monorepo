-- ---------------------------
-- MODULE NAME: User Auth
-- MODULE DATE: 20260401
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

-- Sync auth.users -> public.users: OAuth and email-confirm flows set email_confirmed_at in auth;
-- public.users.is_email_verified must match so password sign-in and app policy stay consistent.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, auth_id, email, full_name, is_email_verified)
  VALUES (
    new.id,
    new.id,
    new.email,
    COALESCE((new.raw_user_meta_data->>'full_name')::text, new.email),
    (new.email_confirmed_at IS NOT NULL)
  );
  RETURN new;
END;
$$;

-- Existing rows: align with Supabase auth confirmation (fixes OAuth users created before this change).
UPDATE public.users u
SET is_email_verified = true,
    updated_at = NOW()
FROM auth.users a
WHERE u.auth_id = a.id
  AND a.email_confirmed_at IS NOT NULL
  AND COALESCE(u.is_email_verified, false) = false;

COMMIT;

-- MODULE user-management
-- MODULE DATE 20260521
-- Extend internal_find_full_user_by_email with OAuth provider columns for sign-in error messaging.

DROP FUNCTION IF EXISTS public.internal_find_full_user_by_email(TEXT);

CREATE OR REPLACE FUNCTION public.internal_find_full_user_by_email(p_email TEXT)
RETURNS TABLE(
    id UUID,
    auth_id UUID,
    email TEXT,
    full_name TEXT,
    is_email_verified BOOLEAN,
    email_verification_token TEXT,
    email_verification_token_expires TIMESTAMPTZ,
    provider TEXT,
    provider_id TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.auth_id, u.email, u.full_name, u.is_email_verified,
           u.email_verification_token, u.email_verification_token_expires,
           u.provider, u.provider_id,
           u.created_at, u.updated_at
    FROM public.users u
    WHERE u.email = LOWER(TRIM(p_email))
    LIMIT 1;
END;
$$;

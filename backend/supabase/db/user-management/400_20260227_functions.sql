-- ---------------------------
-- MODULE NAME: User Management
-- MODULE DATE: 20260227
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

-- ---------------------------
-- (handle_new_user lives in user-auth)
-- ---------------------------

-- ---------------------------
-- Internal helpers (SECURITY DEFINER): bypass RLS for server-side operations
-- that the backend performs via PostgREST service client.
-- ---------------------------

CREATE OR REPLACE FUNCTION public.internal_upsert_user_from_auth(
    p_id UUID,
    p_auth_id UUID,
    p_email TEXT,
    p_full_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, auth_id, email, full_name, updated_at)
    VALUES (p_id, p_auth_id, p_email, p_full_name, NOW())
    ON CONFLICT (id) DO UPDATE SET
        auth_id = EXCLUDED.auth_id,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.internal_upsert_user_from_auth(UUID, UUID, TEXT, TEXT) TO service_role;
COMMENT ON FUNCTION public.internal_upsert_user_from_auth IS 'Server-side upsert into public.users (bypasses RLS)';

CREATE OR REPLACE FUNCTION public.internal_set_verification_token(
    p_user_id UUID,
    p_token TEXT DEFAULT NULL,
    p_expires TIMESTAMPTZ DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    affected INTEGER;
BEGIN
    UPDATE public.users
    SET email_verification_token = p_token,
        email_verification_token_expires = p_expires,
        updated_at = NOW()
    WHERE id = p_user_id;

    GET DIAGNOSTICS affected = ROW_COUNT;
    RETURN affected;
END;
$$;

GRANT EXECUTE ON FUNCTION public.internal_set_verification_token(UUID, TEXT, TIMESTAMPTZ) TO service_role;
COMMENT ON FUNCTION public.internal_set_verification_token IS 'Server-side update of email verification token (bypasses RLS)';

CREATE OR REPLACE FUNCTION public.internal_find_user_by_token_hash(p_hashed_token TEXT)
RETURNS TABLE(
    id UUID,
    auth_id UUID,
    email TEXT,
    full_name TEXT,
    is_email_verified BOOLEAN,
    email_verification_token TEXT,
    email_verification_token_expires TIMESTAMPTZ,
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
           u.created_at, u.updated_at
    FROM public.users u
    WHERE u.email_verification_token = p_hashed_token
      AND u.email_verification_token_expires > NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.internal_find_user_by_token_hash(TEXT) TO service_role;
COMMENT ON FUNCTION public.internal_find_user_by_token_hash IS 'Find user by hashed verification token (bypasses RLS)';

CREATE OR REPLACE FUNCTION public.internal_update_email_verification(
    p_user_id UUID,
    p_is_verified BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.users
    SET is_email_verified = p_is_verified,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.internal_update_email_verification(UUID, BOOLEAN) TO service_role;
COMMENT ON FUNCTION public.internal_update_email_verification IS 'Mark user email as verified/unverified (bypasses RLS)';

CREATE OR REPLACE FUNCTION public.internal_find_user_id_by_auth_id(p_auth_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT u.id INTO v_user_id
    FROM public.users u
    WHERE u.auth_id = p_auth_id
    LIMIT 1;
    RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.internal_find_user_id_by_auth_id(UUID) TO service_role;
COMMENT ON FUNCTION public.internal_find_user_id_by_auth_id IS 'Resolve auth.uid() to public.users.id (bypasses RLS)';

CREATE OR REPLACE FUNCTION public.internal_find_full_user_by_email(p_email TEXT)
RETURNS TABLE(
    id UUID,
    auth_id UUID,
    email TEXT,
    full_name TEXT,
    is_email_verified BOOLEAN,
    email_verification_token TEXT,
    email_verification_token_expires TIMESTAMPTZ,
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
           u.created_at, u.updated_at
    FROM public.users u
    WHERE u.email = LOWER(TRIM(p_email))
    LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.internal_find_full_user_by_email(TEXT) TO service_role;
COMMENT ON FUNCTION public.internal_find_full_user_by_email IS 'Find user by email with all core columns (bypasses RLS)';

CREATE OR REPLACE FUNCTION public.internal_create_refresh_token(
    p_id UUID,
    p_user_id UUID,
    p_token TEXT,
    p_expires_at TIMESTAMPTZ,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.refresh_tokens (id, user_id, token, created_at, expires_at, revoked, ip_address, user_agent)
    VALUES (p_id, p_user_id, p_token, NOW(), p_expires_at, false, p_ip_address, p_user_agent);
    RETURN p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.internal_create_refresh_token(UUID, UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) TO service_role;
COMMENT ON FUNCTION public.internal_create_refresh_token IS 'Insert refresh token row (bypasses RLS)';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

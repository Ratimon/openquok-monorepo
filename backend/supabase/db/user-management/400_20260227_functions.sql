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

REVOKE ALL ON FUNCTION public.internal_upsert_user_from_auth(UUID, UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.internal_upsert_user_from_auth(UUID, UUID, TEXT, TEXT) FROM anon, authenticated;
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

REVOKE ALL ON FUNCTION public.internal_set_verification_token(UUID, TEXT, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.internal_set_verification_token(UUID, TEXT, TIMESTAMPTZ) FROM anon, authenticated;
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

REVOKE ALL ON FUNCTION public.internal_find_user_by_token_hash(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.internal_find_user_by_token_hash(TEXT) FROM anon, authenticated;
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

REVOKE ALL ON FUNCTION public.internal_update_email_verification(UUID, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.internal_update_email_verification(UUID, BOOLEAN) FROM anon, authenticated;
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

REVOKE ALL ON FUNCTION public.internal_find_user_id_by_auth_id(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.internal_find_user_id_by_auth_id(UUID) FROM anon, authenticated;
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

REVOKE ALL ON FUNCTION public.internal_find_full_user_by_email(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.internal_find_full_user_by_email(TEXT) FROM anon, authenticated;
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
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.refresh_tokens (id, user_id, token, created_at, expires_at, revoked, ip_address, user_agent)
    VALUES (p_id, p_user_id, p_token, NOW(), p_expires_at, false, p_ip_address, p_user_agent)
    ON CONFLICT (token) DO NOTHING
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
        SELECT rt.id INTO v_id
        FROM public.refresh_tokens rt
        WHERE rt.token = p_token
          AND rt.user_id = p_user_id;
    END IF;

    IF v_id IS NULL THEN
        RAISE EXCEPTION 'Failed to create refresh token: token exists for another user';
    END IF;

    RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.internal_create_refresh_token(UUID, UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.internal_create_refresh_token(UUID, UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.internal_create_refresh_token(UUID, UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) TO service_role;
COMMENT ON FUNCTION public.internal_create_refresh_token IS 'Insert refresh token row (bypasses RLS); idempotent on duplicate token for same user';

CREATE OR REPLACE FUNCTION public.internal_rotate_refresh_token(
    p_old_token TEXT,
    p_new_id UUID,
    p_user_id UUID,
    p_new_token TEXT,
    p_expires_at TIMESTAMPTZ,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    UPDATE public.refresh_tokens
    SET revoked = true,
        revoked_at = NOW(),
        replaced_by = p_new_token
    WHERE token = p_old_token
      AND user_id = p_user_id;

    INSERT INTO public.refresh_tokens (id, user_id, token, created_at, expires_at, revoked, ip_address, user_agent)
    VALUES (p_new_id, p_user_id, p_new_token, NOW(), p_expires_at, false, p_ip_address, p_user_agent)
    ON CONFLICT (token) DO NOTHING
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
        SELECT rt.id INTO v_id
        FROM public.refresh_tokens rt
        WHERE rt.token = p_new_token
          AND rt.user_id = p_user_id;
    END IF;

    IF v_id IS NULL THEN
        RAISE EXCEPTION 'Failed to rotate refresh token: no row for token %', p_new_token;
    END IF;

    RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.internal_rotate_refresh_token(TEXT, UUID, UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.internal_rotate_refresh_token(TEXT, UUID, UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.internal_rotate_refresh_token(TEXT, UUID, UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) TO service_role;
COMMENT ON FUNCTION public.internal_rotate_refresh_token IS 'Atomically revoke old refresh token and insert new one (bypasses RLS)';

CREATE OR REPLACE FUNCTION public.get_listing_creators()
RETURNS TABLE (
    id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    tag_line TEXT,
    extension_count BIGINT,
    stack_count BIGINT,
    total_likes BIGINT,
    total_bookmarks BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        u.id,
        u.username,
        u.full_name,
        up.avatar_url,
        up.tag_line,
        COUNT(l.id) FILTER (WHERE l.listing_kind = 'extension') AS extension_count,
        COUNT(l.id) FILTER (WHERE l.listing_kind = 'stack') AS stack_count,
        COALESCE(SUM(l.likes), 0)::BIGINT AS total_likes,
        COALESCE(SUM(l.bookmark_count), 0)::BIGINT AS total_bookmarks
    FROM public.users u
    INNER JOIN public.listings l ON l.owner_id = u.id
        AND l.is_user_published = true
        AND l.is_admin_published = true
    LEFT JOIN public.user_profiles up ON up.owner_id = u.id
    WHERE u.username IS NOT NULL
    GROUP BY u.id, u.username, u.full_name, up.avatar_url, up.tag_line
    ORDER BY extension_count DESC, stack_count DESC;
$$;

REVOKE ALL ON FUNCTION public.get_listing_creators() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_listing_creators() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_listing_creators() TO service_role;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

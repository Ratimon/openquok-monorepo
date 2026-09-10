-- ---------------------------
-- MODULE NAME: User Management
-- MODULE DATE: 20260910
-- MODULE SCOPE: Functions
-- ---------------------------

BEGIN;

-- ---------------------------
-- Idempotent refresh token create (ON CONFLICT)
-- ---------------------------

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

GRANT EXECUTE ON FUNCTION public.internal_create_refresh_token(UUID, UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) TO service_role;
COMMENT ON FUNCTION public.internal_create_refresh_token IS 'Insert refresh token row (bypasses RLS); idempotent on duplicate token for same user';

-- ---------------------------
-- Atomic refresh token rotation (revoke old + insert new)
-- ---------------------------

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

GRANT EXECUTE ON FUNCTION public.internal_rotate_refresh_token(TEXT, UUID, UUID, TEXT, TIMESTAMPTZ, TEXT, TEXT) TO service_role;
COMMENT ON FUNCTION public.internal_rotate_refresh_token IS 'Atomically revoke old refresh token and insert new one (bypasses RLS)';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

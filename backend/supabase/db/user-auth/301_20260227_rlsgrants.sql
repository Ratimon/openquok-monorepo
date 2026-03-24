-- ---------------------------
-- MODULE NAME: User Auth
-- MODULE DATE: 20260227
-- MODULE SCOPE: RLS & Grants
-- ---------------------------

BEGIN;

-- ---------------------------
-- refresh_tokens RLS
-- ---------------------------

ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own refresh tokens" ON public.refresh_tokens;
CREATE POLICY "Users can view their own refresh tokens"
ON public.refresh_tokens
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can revoke their own refresh tokens" ON public.refresh_tokens;
CREATE POLICY "Users can revoke their own refresh tokens"
ON public.refresh_tokens
FOR UPDATE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own refresh tokens" ON public.refresh_tokens;
CREATE POLICY "Users can insert their own refresh tokens"
ON public.refresh_tokens
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service roles can manage refresh tokens" ON public.refresh_tokens;
CREATE POLICY "Service roles can manage refresh tokens"
ON public.refresh_tokens
FOR ALL
USING (auth.role() = 'service_role');

-- ---------------------------
-- Comments
-- ---------------------------

COMMENT ON TABLE public.refresh_tokens IS 'Stores refresh tokens for JWT authentication';
COMMENT ON COLUMN public.refresh_tokens.id IS 'Unique identifier for the refresh token record';
COMMENT ON COLUMN public.refresh_tokens.user_id IS 'Reference to the user this token belongs to';
COMMENT ON COLUMN public.refresh_tokens.token IS 'The actual refresh token (hashed)';
COMMENT ON COLUMN public.refresh_tokens.created_at IS 'When the token was created';
COMMENT ON COLUMN public.refresh_tokens.expires_at IS 'When the token expires';
COMMENT ON COLUMN public.refresh_tokens.revoked IS 'Whether the token has been revoked';
COMMENT ON COLUMN public.refresh_tokens.revoked_at IS 'When the token was revoked, if applicable';
COMMENT ON COLUMN public.refresh_tokens.replaced_by IS 'Reference to the token that replaced this one (token rotation)';
COMMENT ON COLUMN public.refresh_tokens.ip_address IS 'IP address where the token was issued';
COMMENT ON COLUMN public.refresh_tokens.user_agent IS 'Browser/device information where the token was issued';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

-- ---------------------------
-- MODULE NAME: User Auth
-- MODULE DATE: 20260227
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

-- ---------------------------
-- Refresh Token
-- ---------------------------

CREATE TABLE IF NOT EXISTS public.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMPTZ,
    replaced_by TEXT,
    ip_address TEXT,
    user_agent TEXT
);

-- ---------------------------
-- Users (OAuth provider columns; table lives in user-management)
-- ---------------------------

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS provider TEXT,
ADD COLUMN IF NOT EXISTS provider_id TEXT;

COMMENT ON COLUMN public.users.provider IS 'OAuth provider name: google, github, generic';
COMMENT ON COLUMN public.users.provider_id IS 'Provider-specific user id';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

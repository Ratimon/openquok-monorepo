-- ---------------------------
-- MODULE NAME: OAuth Apps
-- MODULE DATE: 20260505
-- MODULE SCOPE: Tables
-- ---------------------------
-- OAuth apps + programmatic tokens tied to app/user/org.
-- Tokens are stored as hashes; raw token is shown only at mint time.

BEGIN;

CREATE TABLE IF NOT EXISTS public.oauth_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    picture_id UUID REFERENCES public.media(id) ON DELETE SET NULL,
    redirect_url TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_secret_hash TEXT NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.oauth_apps IS 'OAuth applications for third-party access; scoped to an organization.';
COMMENT ON COLUMN public.oauth_apps.redirect_url IS 'OAuth redirect/callback URL registered by the app owner.';

CREATE TABLE IF NOT EXISTS public.oauth_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oauth_app_id UUID NOT NULL REFERENCES public.oauth_apps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    access_token_hash TEXT,
    authorization_code_hash TEXT,
    code_expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_oauth_authorizations_app_user_org UNIQUE (oauth_app_id, user_id, organization_id)
);

COMMENT ON TABLE public.oauth_authorizations IS 'OAuth2 authorizations: issued codes and access tokens for a user+org per app. Raw secrets are not stored.';
COMMENT ON COLUMN public.oauth_authorizations.authorization_code_hash IS 'SHA-256 hash (plus server pepper) of issued authorization code.';
COMMENT ON COLUMN public.oauth_authorizations.access_token_hash IS 'SHA-256 hash (plus server pepper) of issued access token.';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;


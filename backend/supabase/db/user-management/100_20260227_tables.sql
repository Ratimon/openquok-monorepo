-- ---------------------------
-- MODULE NAME: User Management
-- MODULE DATE: 20260227
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

-- ---------------------------
-- Users
-- ---------------------------

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    is_super_admin BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT false,
    email_verification_token TEXT,
    email_verification_token_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);


COMMENT ON COLUMN public.users.is_super_admin IS 'Whether the user has super admin privileges (e.g. manage module_configs)';
COMMENT ON COLUMN public.users.is_email_verified IS 'Whether the user has verified their email';
COMMENT ON COLUMN public.users.email_verification_token IS 'Hashed token for email verification link';
COMMENT ON COLUMN public.users.email_verification_token_expires IS 'Expiry for email_verification_token';

-- ---------------------------
-- User Profiles
-- ---------------------------

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    website_url TEXT,
    description TEXT,
    tag_line TEXT,
    location TEXT,
    facebook_url TEXT,
    youtube_url TEXT,
    twitter_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(owner_id)
);

COMMENT ON TABLE public.user_profiles IS 'Extended user profile information separated from core users table';
COMMENT ON COLUMN public.user_profiles.owner_id IS 'Reference to the user who owns this profile';
COMMENT ON COLUMN public.user_profiles.website_url IS 'User website URL (renamed from website)';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

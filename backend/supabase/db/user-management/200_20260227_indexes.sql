-- ---------------------------
-- MODULE NAME: User Management
-- MODULE DATE: 20260227
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON public.users(email_verification_token)
    WHERE email_verification_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_last_read_notifications ON public.users(last_read_notifications);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
    ON public.users (username)
    WHERE username IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_provider_id
    ON public.users (provider, provider_id)
    WHERE provider IS NOT NULL AND provider_id IS NOT NULL;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

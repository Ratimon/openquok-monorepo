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

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

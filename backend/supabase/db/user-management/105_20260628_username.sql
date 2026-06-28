-- ---------------------------
-- MODULE NAME: User Management
-- MODULE DATE: 20260628
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
    ON public.users (username)
    WHERE username IS NOT NULL;

COMMENT ON COLUMN public.users.username IS 'Public creator slug for /creators/[username]; nullable until set by user or admin';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

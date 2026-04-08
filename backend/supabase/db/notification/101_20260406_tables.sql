-- ---------------------------
-- MODULE NAME: notification
-- MODULE DATE: 20260406
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.notifications IS 'In-app notifications scoped to an organization';
COMMENT ON COLUMN public.notifications.content IS 'Short message body shown in the app';
COMMENT ON COLUMN public.notifications.link IS 'Optional deep link or URL related to the notification';

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS last_read_notifications TIMESTAMPTZ DEFAULT NOW() NOT NULL;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS send_success_emails BOOLEAN DEFAULT TRUE NOT NULL;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS send_failure_emails BOOLEAN DEFAULT TRUE NOT NULL;

COMMENT ON COLUMN public.users.last_read_notifications IS 'Cursor for unread in-app notification count (per user)';
COMMENT ON COLUMN public.users.send_success_emails IS 'When false, org notification emails typed as success are skipped for this user';
COMMENT ON COLUMN public.users.send_failure_emails IS 'When false, org notification emails typed as failure are skipped for this user';

CREATE INDEX IF NOT EXISTS idx_users_last_read_notifications ON public.users(last_read_notifications);

COMMIT;

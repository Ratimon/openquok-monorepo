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

COMMIT;

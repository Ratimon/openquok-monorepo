-- ---------------------------
-- MODULE NAME: notification
-- MODULE DATE: 20260406
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON public.notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_deleted_at ON public.notifications(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_last_read_notifications ON public.users(last_read_notifications);

COMMIT;

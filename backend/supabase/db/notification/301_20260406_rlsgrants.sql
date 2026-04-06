-- ---------------------------
-- MODULE NAME: notification
-- MODULE DATE: 20260406
-- MODULE SCOPE: RLS & Grants
-- ---------------------------

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view notifications" ON public.notifications;
CREATE POLICY "Members can view notifications"
ON public.notifications
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = notifications.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert notifications" ON public.notifications;
CREATE POLICY "Members can insert notifications"
ON public.notifications
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = notifications.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update notifications" ON public.notifications;
CREATE POLICY "Members can update notifications"
ON public.notifications
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = notifications.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = notifications.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete notifications" ON public.notifications;
CREATE POLICY "Members can delete notifications"
ON public.notifications
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = notifications.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

COMMIT;

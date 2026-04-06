-- ---------------------------
-- MODULE NAME: notification
-- MODULE DATE: 20260406
-- MODULE SCOPE: RLS & Grants
-- ---------------------------
-- Replace membership checks with public.is_active_member_of_org (see organization 401)
-- to avoid RLS recursion when policies scan user_organizations.

BEGIN;

DROP POLICY IF EXISTS "Members can view notifications" ON public.notifications;
CREATE POLICY "Members can view notifications"
ON public.notifications
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.is_active_member_of_org(notifications.organization_id, auth.uid()));

DROP POLICY IF EXISTS "Members can insert notifications" ON public.notifications;
CREATE POLICY "Members can insert notifications"
ON public.notifications
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (public.is_active_member_of_org(notifications.organization_id, auth.uid()));

DROP POLICY IF EXISTS "Members can update notifications" ON public.notifications;
CREATE POLICY "Members can update notifications"
ON public.notifications
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.is_active_member_of_org(notifications.organization_id, auth.uid()))
WITH CHECK (public.is_active_member_of_org(notifications.organization_id, auth.uid()));

DROP POLICY IF EXISTS "Members can delete notifications" ON public.notifications;
CREATE POLICY "Members can delete notifications"
ON public.notifications
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (public.is_active_member_of_org(notifications.organization_id, auth.uid()));

COMMIT;

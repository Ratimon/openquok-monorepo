-- ---------------------------
-- MODULE NAME: Acquisition
-- MODULE DATE: 20260828
-- MODULE SCOPE: RLS & Grants
-- ---------------------------
-- Runs after user-management/300 so public.is_super_admin(uuid) exists.
-- Authenticated users may insert their own row once. Select: super_admin or admin/support app roles.
-- No client UPDATE/DELETE (immutable audit).

BEGIN;

GRANT SELECT, INSERT ON public.user_acquisition_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_acquisition_responses TO service_role;

ALTER TABLE public.user_acquisition_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own acquisition response once" ON public.user_acquisition_responses;
CREATE POLICY "Users can insert their own acquisition response once"
    ON public.user_acquisition_responses FOR INSERT TO authenticated
    WITH CHECK (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
        AND NOT EXISTS (
            SELECT 1 FROM public.user_acquisition_responses existing
            WHERE existing.user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Super admin admins support can select acquisition responses" ON public.user_acquisition_responses;
CREATE POLICY "Super admin admins support can select acquisition responses"
    ON public.user_acquisition_responses FOR SELECT TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'support')
        )
    );

COMMIT;

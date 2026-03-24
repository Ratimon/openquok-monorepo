-- ---------------------------
-- MODULE NAME: Feedback
-- MODULE DATE: 20260311
-- MODULE SCOPE: RLS & Grants
-- ---------------------------
-- Runs after user-management/300 so public.is_super_admin(uuid) exists.
-- Anyone can insert. Select/update/delete: super_admin or user with admin/support app role (support handles feedback; editor is blog-only).

BEGIN;

GRANT SELECT, INSERT ON public.feedback TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO service_role;

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback;
CREATE POLICY "Anyone can insert feedback"
    ON public.feedback FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Super admin, admins and support can select
DROP POLICY IF EXISTS "Super admin admins support can select feedback" ON public.feedback;
CREATE POLICY "Super admin admins support can select feedback"
    ON public.feedback FOR SELECT TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'support')
        )
    );

-- Super admin, admins and support can update
DROP POLICY IF EXISTS "Super admin admins support can update feedback" ON public.feedback;
CREATE POLICY "Super admin admins support can update feedback"
    ON public.feedback FOR UPDATE TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'support')
        )
    );

-- Super admin, admins and support can delete
DROP POLICY IF EXISTS "Super admin admins support can delete feedback" ON public.feedback;
CREATE POLICY "Super admin admins support can delete feedback"
    ON public.feedback FOR DELETE TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'support')
        )
    );

COMMIT;

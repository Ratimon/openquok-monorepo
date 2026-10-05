-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20261005
-- MODULE SCOPE: Row Level Security and Grants
-- ---------------------------

BEGIN;

ALTER TABLE public.link_directory_site_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_directory_site_comments ENABLE ROW LEVEL SECURITY;

-- ---------------------------
-- Ratings
-- ---------------------------

DROP POLICY IF EXISTS "Users can manage their own link directory site ratings" ON public.link_directory_site_ratings;
CREATE POLICY "Users can manage their own link directory site ratings" ON public.link_directory_site_ratings
    FOR ALL TO authenticated
    USING (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
    WITH CHECK (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Public can view link directory site ratings" ON public.link_directory_site_ratings;
CREATE POLICY "Public can view link directory site ratings" ON public.link_directory_site_ratings
    FOR SELECT TO anon, authenticated USING (true);

-- ---------------------------
-- Comments
-- ---------------------------

DROP POLICY IF EXISTS "Everyone can view approved link directory site comments" ON public.link_directory_site_comments;
CREATE POLICY "Everyone can view approved link directory site comments" ON public.link_directory_site_comments
    FOR SELECT TO anon, authenticated USING (is_approved = true);

DROP POLICY IF EXISTS "Users can manage their own link directory site comments" ON public.link_directory_site_comments;
CREATE POLICY "Users can manage their own link directory site comments" ON public.link_directory_site_comments
    FOR ALL TO authenticated
    USING (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
    WITH CHECK (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Super admin admins editors can manage link directory site comments" ON public.link_directory_site_comments;
CREATE POLICY "Super admin admins editors can manage link directory site comments" ON public.link_directory_site_comments
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'editor')
        )
    )
    WITH CHECK (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'editor')
        )
    );

-- ---------------------------
-- Grants
-- ---------------------------

GRANT SELECT ON public.link_directory_site_comments TO anon;

GRANT ALL ON public.link_directory_site_ratings TO authenticated;
GRANT ALL ON public.link_directory_site_comments TO authenticated;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

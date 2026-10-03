-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20261002
-- MODULE SCOPE: Row Level Security and Grants
-- ---------------------------

BEGIN;

ALTER TABLE public.link_directory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_directory_tag_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_directory_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_directory_tag_groups_tags_association ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_directory_opportunity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_directory_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_directory_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_directory_site_tags_association ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_directory_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_directory_saved_sites ENABLE ROW LEVEL SECURITY;

-- ---------------------------
-- Categories, tags, opportunity types (catalog)
-- ---------------------------

DROP POLICY IF EXISTS "Everyone can view link directory categories" ON public.link_directory_categories;
CREATE POLICY "Everyone can view link directory categories" ON public.link_directory_categories
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage link directory categories" ON public.link_directory_categories;
CREATE POLICY "Super admin admins editors can manage link directory categories" ON public.link_directory_categories
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

DROP POLICY IF EXISTS "Everyone can view link directory tag groups" ON public.link_directory_tag_groups;
CREATE POLICY "Everyone can view link directory tag groups" ON public.link_directory_tag_groups
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage link directory tag groups" ON public.link_directory_tag_groups;
CREATE POLICY "Super admin admins editors can manage link directory tag groups" ON public.link_directory_tag_groups
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

DROP POLICY IF EXISTS "Everyone can view link directory tags" ON public.link_directory_tags;
CREATE POLICY "Everyone can view link directory tags" ON public.link_directory_tags
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage link directory tags" ON public.link_directory_tags;
CREATE POLICY "Super admin admins editors can manage link directory tags" ON public.link_directory_tags
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

DROP POLICY IF EXISTS "Everyone can view link directory tag group associations" ON public.link_directory_tag_groups_tags_association;
CREATE POLICY "Everyone can view link directory tag group associations" ON public.link_directory_tag_groups_tags_association
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage link directory tag group associations" ON public.link_directory_tag_groups_tags_association;
CREATE POLICY "Super admin admins editors can manage link directory tag group associations" ON public.link_directory_tag_groups_tags_association
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

DROP POLICY IF EXISTS "Everyone can view link directory opportunity types" ON public.link_directory_opportunity_types;
CREATE POLICY "Everyone can view link directory opportunity types" ON public.link_directory_opportunity_types
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage link directory opportunity types" ON public.link_directory_opportunity_types;
CREATE POLICY "Super admin admins editors can manage link directory opportunity types" ON public.link_directory_opportunity_types
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
-- Sites and opportunities
-- ---------------------------

DROP POLICY IF EXISTS "Public can view published link directory sites" ON public.link_directory_sites;
CREATE POLICY "Public can view published link directory sites" ON public.link_directory_sites
    FOR SELECT TO anon, authenticated
    USING (is_admin_published = true);

DROP POLICY IF EXISTS "Super admin admins editors can manage link directory sites" ON public.link_directory_sites;
CREATE POLICY "Super admin admins editors can manage link directory sites" ON public.link_directory_sites
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

DROP POLICY IF EXISTS "Public can view published link directory opportunities" ON public.link_directory_opportunities;
CREATE POLICY "Public can view published link directory opportunities" ON public.link_directory_opportunities
    FOR SELECT TO anon, authenticated
    USING (
        is_admin_published = true
        AND EXISTS (
            SELECT 1 FROM public.link_directory_sites s
            WHERE s.id = site_id AND s.is_admin_published = true
        )
    );

DROP POLICY IF EXISTS "Super admin admins editors can manage link directory opportunities" ON public.link_directory_opportunities;
CREATE POLICY "Super admin admins editors can manage link directory opportunities" ON public.link_directory_opportunities
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
-- Site tag associations
-- ---------------------------

DROP POLICY IF EXISTS "Everyone can view link directory site tag associations" ON public.link_directory_site_tags_association;
CREATE POLICY "Everyone can view link directory site tag associations" ON public.link_directory_site_tags_association
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage link directory site tag associations" ON public.link_directory_site_tags_association;
CREATE POLICY "Super admin admins editors can manage link directory site tag associations" ON public.link_directory_site_tags_association
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
-- Submissions
-- ---------------------------

DROP POLICY IF EXISTS "Anyone can submit link directory entries" ON public.link_directory_submissions;
CREATE POLICY "Anyone can submit link directory entries" ON public.link_directory_submissions
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Submitters can view their own link directory submissions" ON public.link_directory_submissions;
CREATE POLICY "Submitters can view their own link directory submissions" ON public.link_directory_submissions
    FOR SELECT TO authenticated
    USING (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Super admin admins editors can manage link directory submissions" ON public.link_directory_submissions;
CREATE POLICY "Super admin admins editors can manage link directory submissions" ON public.link_directory_submissions
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
-- Saved sites (user shortlist)
-- ---------------------------

DROP POLICY IF EXISTS "Users can manage their link directory saved sites" ON public.link_directory_saved_sites;
CREATE POLICY "Users can manage their link directory saved sites" ON public.link_directory_saved_sites
    FOR ALL TO authenticated
    USING (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
    WITH CHECK (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    );

-- ---------------------------
-- Storage: link_directory_logos
-- ---------------------------

DROP POLICY IF EXISTS "Allow authenticated users to delete their link directory logos" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their link directory logos"
    ON storage.objects
    AS PERMISSIVE FOR DELETE TO authenticated
    USING (
        bucket_id = 'link_directory_logos'::text
        AND auth.role() = 'authenticated'::text
        AND auth.uid() = owner
    );

DROP POLICY IF EXISTS "Allow authenticated users to update their link directory logos" ON storage.objects;
CREATE POLICY "Allow authenticated users to update their link directory logos"
    ON storage.objects
    AS PERMISSIVE FOR UPDATE TO authenticated
    USING (
        bucket_id = 'link_directory_logos'::text
        AND auth.role() = 'authenticated'::text
        AND auth.uid() = owner
    );

DROP POLICY IF EXISTS "Allow authenticated users to upload link directory logos" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload link directory logos"
    ON storage.objects
    AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'link_directory_logos'::text
        AND auth.role() = 'authenticated'::text
        AND auth.uid() = owner
    );

DROP POLICY IF EXISTS "Allow read access to link directory logos" ON storage.objects;

DROP POLICY IF EXISTS "Allow service_role to manage link directory logos" ON storage.objects;
CREATE POLICY "Allow service_role to manage link directory logos"
    ON storage.objects
    AS PERMISSIVE FOR ALL TO service_role
    USING (bucket_id = 'link_directory_logos'::text);

-- ---------------------------
-- Grants
-- ---------------------------

GRANT SELECT ON public.link_directory_categories TO anon;
GRANT SELECT ON public.link_directory_tag_groups TO anon;
GRANT SELECT ON public.link_directory_tags TO anon;
GRANT SELECT ON public.link_directory_tag_groups_tags_association TO anon;
GRANT SELECT ON public.link_directory_opportunity_types TO anon;
GRANT SELECT ON public.link_directory_sites TO anon;
GRANT SELECT ON public.link_directory_opportunities TO anon;
GRANT SELECT ON public.link_directory_site_tags_association TO anon;
GRANT INSERT ON public.link_directory_submissions TO anon;

GRANT ALL ON public.link_directory_categories TO authenticated;
GRANT ALL ON public.link_directory_tag_groups TO authenticated;
GRANT ALL ON public.link_directory_tags TO authenticated;
GRANT ALL ON public.link_directory_tag_groups_tags_association TO authenticated;
GRANT ALL ON public.link_directory_opportunity_types TO authenticated;
GRANT ALL ON public.link_directory_sites TO authenticated;
GRANT ALL ON public.link_directory_opportunities TO authenticated;
GRANT ALL ON public.link_directory_site_tags_association TO authenticated;
GRANT INSERT, SELECT ON public.link_directory_submissions TO authenticated;
GRANT ALL ON public.link_directory_saved_sites TO authenticated;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

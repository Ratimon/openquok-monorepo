-- ---------------------------
-- MODULE NAME: Listing Tags
-- MODULE DATE: 20260628
-- MODULE SCOPE: Row Level Security and Grants
-- ---------------------------

BEGIN;

ALTER TABLE public.listing_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_tag_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_tag_groups_listing_tags_association ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view listing tags" ON public.listing_tags;
CREATE POLICY "Everyone can view listing tags" ON public.listing_tags
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage listing tags" ON public.listing_tags;
CREATE POLICY "Super admin admins editors can manage listing tags" ON public.listing_tags
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

DROP POLICY IF EXISTS "Everyone can view listing tag groups" ON public.listing_tag_groups;
CREATE POLICY "Everyone can view listing tag groups" ON public.listing_tag_groups
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage listing tag groups" ON public.listing_tag_groups;
CREATE POLICY "Super admin admins editors can manage listing tag groups" ON public.listing_tag_groups
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

DROP POLICY IF EXISTS "Everyone can view tag group associations" ON public.listing_tag_groups_listing_tags_association;
CREATE POLICY "Everyone can view tag group associations" ON public.listing_tag_groups_listing_tags_association
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage tag group associations" ON public.listing_tag_groups_listing_tags_association;
CREATE POLICY "Super admin admins editors can manage tag group associations" ON public.listing_tag_groups_listing_tags_association
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

GRANT SELECT ON public.listing_tags TO anon;
GRANT SELECT ON public.listing_tag_groups TO anon;
GRANT SELECT ON public.listing_tag_groups_listing_tags_association TO anon;

GRANT ALL ON public.listing_tags TO authenticated;
GRANT ALL ON public.listing_tag_groups TO authenticated;
GRANT ALL ON public.listing_tag_groups_listing_tags_association TO authenticated;

GRANT ALL ON public.listing_tags TO service_role;
GRANT ALL ON public.listing_tag_groups TO service_role;
GRANT ALL ON public.listing_tag_groups_listing_tags_association TO service_role;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

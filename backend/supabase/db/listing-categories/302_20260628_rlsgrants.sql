-- ---------------------------
-- MODULE NAME: Listing Categories
-- MODULE DATE: 20260628
-- MODULE SCOPE: Row Level Security and Grants
-- ---------------------------

BEGIN;

ALTER TABLE public.listing_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_category_groups_listing_categories_association ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view listing categories" ON public.listing_categories;
CREATE POLICY "Everyone can view listing categories" ON public.listing_categories
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage listing categories" ON public.listing_categories;
CREATE POLICY "Super admin admins editors can manage listing categories" ON public.listing_categories
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

DROP POLICY IF EXISTS "Everyone can view listing category groups" ON public.listing_category_groups;
CREATE POLICY "Everyone can view listing category groups" ON public.listing_category_groups
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage listing category groups" ON public.listing_category_groups;
CREATE POLICY "Super admin admins editors can manage listing category groups" ON public.listing_category_groups
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

DROP POLICY IF EXISTS "Everyone can view category group associations" ON public.listing_category_groups_listing_categories_association;
CREATE POLICY "Everyone can view category group associations" ON public.listing_category_groups_listing_categories_association
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage category group associations" ON public.listing_category_groups_listing_categories_association;
CREATE POLICY "Super admin admins editors can manage category group associations" ON public.listing_category_groups_listing_categories_association
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

GRANT SELECT ON public.listing_categories TO anon;
GRANT SELECT ON public.listing_category_groups TO anon;
GRANT SELECT ON public.listing_category_groups_listing_categories_association TO anon;

GRANT ALL ON public.listing_categories TO authenticated;
GRANT ALL ON public.listing_category_groups TO authenticated;
GRANT ALL ON public.listing_category_groups_listing_categories_association TO authenticated;

GRANT ALL ON public.listing_categories TO service_role;
GRANT ALL ON public.listing_category_groups TO service_role;
GRANT ALL ON public.listing_category_groups_listing_categories_association TO service_role;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

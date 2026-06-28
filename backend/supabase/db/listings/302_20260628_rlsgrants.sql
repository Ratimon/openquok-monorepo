-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260628
-- MODULE SCOPE: Row Level Security and Grants
-- ---------------------------

BEGIN;

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings_listing_tags_association ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_stack_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_activities ENABLE ROW LEVEL SECURITY;

-- ---------------------------
-- Listings
-- ---------------------------

DROP POLICY IF EXISTS "Public can view published listings" ON public.listings;
CREATE POLICY "Public can view published listings" ON public.listings
    FOR SELECT TO anon, authenticated
    USING (is_user_published = true AND is_admin_published = true);

DROP POLICY IF EXISTS "Owners can manage their own listings" ON public.listings;
CREATE POLICY "Owners can manage their own listings" ON public.listings
    FOR ALL TO authenticated
    USING (
        owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
    WITH CHECK (
        owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Super admin admins editors can manage all listings" ON public.listings;
CREATE POLICY "Super admin admins editors can manage all listings" ON public.listings
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
-- Tag association (owners + editors)
-- ---------------------------

DROP POLICY IF EXISTS "Everyone can view listing tag associations" ON public.listings_listing_tags_association;
CREATE POLICY "Everyone can view listing tag associations" ON public.listings_listing_tags_association
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Listing owners and editors can manage tag associations" ON public.listings_listing_tags_association;
CREATE POLICY "Listing owners and editors can manage tag associations" ON public.listings_listing_tags_association
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'editor')
        )
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_id
              AND l.owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
        )
    )
    WITH CHECK (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'editor')
        )
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_id
              AND l.owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
        )
    );

-- ---------------------------
-- Stack members
-- ---------------------------

DROP POLICY IF EXISTS "Public can view stack members of published stacks" ON public.listing_stack_members;
CREATE POLICY "Public can view stack members of published stacks" ON public.listing_stack_members
    FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.listings s
            WHERE s.id = stack_listing_id
              AND s.is_user_published = true
              AND s.is_admin_published = true
        )
    );

DROP POLICY IF EXISTS "Owners and editors can manage stack members" ON public.listing_stack_members;
CREATE POLICY "Owners and editors can manage stack members" ON public.listing_stack_members
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'editor')
        )
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = stack_listing_id
              AND l.owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
        )
    )
    WITH CHECK (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'editor')
        )
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = stack_listing_id
              AND l.owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
        )
    );

-- ---------------------------
-- Relations
-- ---------------------------

DROP POLICY IF EXISTS "Public can view relations of published listings" ON public.listing_relations;
CREATE POLICY "Public can view relations of published listings" ON public.listing_relations
    FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_id
              AND l.is_user_published = true
              AND l.is_admin_published = true
        )
    );

DROP POLICY IF EXISTS "Owners and editors can manage listing relations" ON public.listing_relations;
CREATE POLICY "Owners and editors can manage listing relations" ON public.listing_relations
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'editor')
        )
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_id
              AND l.owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
        )
    )
    WITH CHECK (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'editor')
        )
        OR EXISTS (
            SELECT 1 FROM public.listings l
            WHERE l.id = listing_id
              AND l.owner_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
        )
    );

-- ---------------------------
-- Bookmarks
-- ---------------------------

DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON public.listing_bookmarks;
CREATE POLICY "Users can manage their own bookmarks" ON public.listing_bookmarks
    FOR ALL TO authenticated
    USING (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
    WITH CHECK (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Editors can view all bookmarks" ON public.listing_bookmarks;
CREATE POLICY "Editors can view all bookmarks" ON public.listing_bookmarks
    FOR SELECT TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'editor')
        )
    );

-- ---------------------------
-- Ratings
-- ---------------------------

DROP POLICY IF EXISTS "Users can manage their own ratings" ON public.listing_ratings;
CREATE POLICY "Users can manage their own ratings" ON public.listing_ratings
    FOR ALL TO authenticated
    USING (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
    WITH CHECK (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Public can view listing ratings aggregate via listings" ON public.listing_ratings;
CREATE POLICY "Public can view listing ratings aggregate via listings" ON public.listing_ratings
    FOR SELECT TO anon, authenticated USING (true);

-- ---------------------------
-- Comments
-- ---------------------------

DROP POLICY IF EXISTS "Everyone can view approved listing comments" ON public.listing_comments;
CREATE POLICY "Everyone can view approved listing comments" ON public.listing_comments
    FOR SELECT TO anon, authenticated USING (is_approved = true);

DROP POLICY IF EXISTS "Users can manage their own listing comments" ON public.listing_comments;
CREATE POLICY "Users can manage their own listing comments" ON public.listing_comments
    FOR ALL TO authenticated
    USING (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    )
    WITH CHECK (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "Super admin admins editors can manage listing comments" ON public.listing_comments;
CREATE POLICY "Super admin admins editors can manage listing comments" ON public.listing_comments
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
-- Activities
-- ---------------------------

DROP POLICY IF EXISTS "Users can view their own listing activities" ON public.listing_activities;
CREATE POLICY "Users can view their own listing activities" ON public.listing_activities
    FOR SELECT TO authenticated
    USING (
        user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    );

DROP POLICY IF EXISTS "System can insert listing activities" ON public.listing_activities;
CREATE POLICY "System can insert listing activities" ON public.listing_activities
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Super admin admins editors can view all listing activities" ON public.listing_activities;
CREATE POLICY "Super admin admins editors can view all listing activities" ON public.listing_activities
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.user_roles ur ON ur.user_id = u.id
            WHERE u.auth_id = auth.uid() AND ur.role IN ('admin', 'editor')
        )
    );

-- ---------------------------
-- Storage: listing_images
-- ---------------------------

DROP POLICY IF EXISTS "Allow authenticated users to delete their listing images" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their listing images"
    ON storage.objects
    AS PERMISSIVE FOR DELETE TO authenticated
    USING (
        bucket_id = 'listing_images'::text
        AND auth.role() = 'authenticated'::text
        AND auth.uid() = owner
    );

DROP POLICY IF EXISTS "Allow authenticated users to update their listing images" ON storage.objects;
CREATE POLICY "Allow authenticated users to update their listing images"
    ON storage.objects
    AS PERMISSIVE FOR UPDATE TO authenticated
    USING (
        bucket_id = 'listing_images'::text
        AND auth.role() = 'authenticated'::text
        AND auth.uid() = owner
    );

DROP POLICY IF EXISTS "Allow authenticated users to upload listing images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload listing images"
    ON storage.objects
    AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'listing_images'::text
        AND auth.role() = 'authenticated'::text
        AND auth.uid() = owner
    );

DROP POLICY IF EXISTS "Allow read access to listing images" ON storage.objects;
CREATE POLICY "Allow read access to listing images"
    ON storage.objects
    AS PERMISSIVE FOR SELECT TO anon, authenticated
    USING (bucket_id = 'listing_images'::text);

DROP POLICY IF EXISTS "Allow service_role to manage listing images" ON storage.objects;
CREATE POLICY "Allow service_role to manage listing images"
    ON storage.objects
    AS PERMISSIVE FOR ALL TO service_role
    USING (bucket_id = 'listing_images'::text);

-- ---------------------------
-- Grants
-- ---------------------------

GRANT SELECT ON public.listings TO anon;
GRANT SELECT ON public.listings_listing_tags_association TO anon;
GRANT SELECT ON public.listing_stack_members TO anon;
GRANT SELECT ON public.listing_relations TO anon;
GRANT SELECT ON public.listing_comments TO anon;
GRANT SELECT ON storage.objects TO anon;

GRANT ALL ON public.listings TO authenticated;
GRANT ALL ON public.listings_listing_tags_association TO authenticated;
GRANT ALL ON public.listing_stack_members TO authenticated;
GRANT ALL ON public.listing_relations TO authenticated;
GRANT ALL ON public.listing_bookmarks TO authenticated;
GRANT ALL ON public.listing_ratings TO authenticated;
GRANT ALL ON public.listing_comments TO authenticated;
GRANT INSERT ON public.listing_activities TO authenticated;
GRANT DELETE, INSERT, SELECT, UPDATE ON storage.objects TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON storage.objects TO service_role;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

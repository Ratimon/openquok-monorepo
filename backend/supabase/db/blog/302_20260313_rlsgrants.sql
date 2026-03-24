-- ---------------------------
-- MODULE NAME: Blog System RLS and Grants
-- MODULE DATE: 20260313
-- MODULE SCOPE: Row Level Security and Grants
-- ---------------------------

BEGIN;

-- ---------------------------
-- Enable Row Level Security
-- ---------------------------
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_activities ENABLE ROW LEVEL SECURITY;

-- ---------------------------
-- Blog Posts Policies
-- ---------------------------

-- Public (including anon) can view only published and approved posts
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
CREATE POLICY "Public can view published posts" ON public.blog_posts
    FOR SELECT TO anon, authenticated USING (is_admin_approved = true AND is_user_published = true);

-- Authors can manage (select/update/delete) their own posts
DROP POLICY IF EXISTS "Authors can manage their own posts" ON public.blog_posts;
CREATE POLICY "Authors can manage their own posts" ON public.blog_posts
    FOR ALL TO authenticated USING (
        user_id = (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    )
    WITH CHECK (
        user_id = (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

-- Super admin, admins and editors can manage all posts
DROP POLICY IF EXISTS "Super admin admins editors can manage all posts" ON public.blog_posts;
CREATE POLICY "Super admin admins editors can manage all posts" ON public.blog_posts
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
-- Blog Topics Policies
-- ---------------------------

DROP POLICY IF EXISTS "Everyone can view topics" ON public.blog_topics;
CREATE POLICY "Everyone can view topics" ON public.blog_topics
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Super admin admins editors can manage topics" ON public.blog_topics;
CREATE POLICY "Super admin admins editors can manage topics" ON public.blog_topics
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
-- Blog Comments Policies
-- ---------------------------

DROP POLICY IF EXISTS "Everyone can view approved comments" ON public.blog_comments;
CREATE POLICY "Everyone can view approved comments" ON public.blog_comments
    FOR SELECT TO anon, authenticated USING (is_approved = true);

DROP POLICY IF EXISTS "Users can manage their own comments" ON public.blog_comments;
CREATE POLICY "Users can manage their own comments" ON public.blog_comments
    FOR ALL TO authenticated
    USING (
        user_id = (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    )
    WITH CHECK (
        user_id = (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Super admin admins editors can manage comments" ON public.blog_comments;
CREATE POLICY "Super admin admins editors can manage comments" ON public.blog_comments
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
-- Blog Activities Policies
-- ---------------------------

DROP POLICY IF EXISTS "Users can view their own activities" ON public.blog_activities;
CREATE POLICY "Users can view their own activities" ON public.blog_activities
    FOR SELECT TO authenticated
    USING (
        user_id = (
            SELECT id FROM public.users WHERE auth_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "System can insert activities" ON public.blog_activities;
CREATE POLICY "System can insert activities" ON public.blog_activities
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Super admin admins editors can view all activities" ON public.blog_activities;
CREATE POLICY "Super admin admins editors can view all activities" ON public.blog_activities
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
-- Blog Images Storage Policies
-- ---------------------------
CREATE POLICY "Allow authenticated users to delete their blog images" 
    ON storage.objects
    AS PERMISSIVE
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'blog_images'::text
        AND auth.role() = 'authenticated'::text
        AND auth.uid() = owner
    );

CREATE POLICY "Allow authenticated users to update their blog images" 
    ON storage.objects
    AS PERMISSIVE
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'blog_images'::text
        AND auth.role() = 'authenticated'::text
        AND auth.uid() = owner
    );

CREATE POLICY "Allow authenticated users to upload blog images" 
    ON storage.objects
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'blog_images'::text
        AND auth.role() = 'authenticated'::text
    );

CREATE POLICY "Allow read access to blog images"
    ON storage.objects
    AS PERMISSIVE
    FOR SELECT
    TO anon, authenticated
    USING (
        bucket_id = 'blog_images'::text
    );

CREATE POLICY "Allow service_role to manage blog images" 
    ON storage.objects
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (bucket_id = 'blog_images'::text);

-- ---------------------------
-- Grants
-- ---------------------------
-- Anonymous users
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT ON public.blog_topics TO anon;
GRANT SELECT ON public.blog_comments TO anon;
GRANT SELECT ON storage.objects TO anon;

-- Authenticated users
GRANT ALL ON public.blog_posts TO authenticated;
GRANT SELECT ON public.blog_topics TO authenticated;
GRANT ALL ON public.blog_comments TO authenticated;
GRANT INSERT ON public.blog_activities TO authenticated;
GRANT DELETE, INSERT, SELECT, UPDATE ON storage.objects TO authenticated;

-- Service role (for backend operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON storage.objects TO service_role;

-- ---------------------------
-- Helper Functions
-- ---------------------------

-- Function to get all users who have published blog posts (profile fields from user_profiles)
CREATE OR REPLACE FUNCTION public.get_published_blog_authors()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    username TEXT,
    avatar_url TEXT,
    website TEXT,
    tag_line TEXT,
    post_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        u.id,
        u.full_name,
        NULL::TEXT AS username,
        up.avatar_url,
        up.website_url AS website,
        up.tag_line,
        COUNT(bp.id) OVER (PARTITION BY u.id) AS post_count
    FROM
        public.users u
        INNER JOIN public.blog_posts bp ON u.id = bp.user_id
        LEFT JOIN public.user_profiles up ON up.owner_id = u.id
    WHERE
        bp.is_user_published = true
        AND bp.is_admin_approved = true
    ORDER BY
        post_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all active blog topics (topics that have published posts)
CREATE OR REPLACE FUNCTION public.get_active_blog_topics()
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    parent_id UUID,
    post_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        bt.id,
        bt.name,
        bt.slug,
        bt.description,
        bt.parent_id,
        COUNT(bp.id) OVER (PARTITION BY bt.id) as post_count
    FROM
        public.blog_topics bt
        INNER JOIN public.blog_posts bp ON bt.id = bp.topic_id
    WHERE
        bp.is_user_published = true
        AND bp.is_admin_approved = true
    ORDER BY
        post_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;


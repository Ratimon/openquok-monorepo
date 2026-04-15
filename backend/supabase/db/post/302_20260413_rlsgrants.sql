-- ---------------------------
-- MODULE NAME: post
-- MODULE DATE: 20260413
-- MODULE SCOPE: RLS & Grants
-- ---------------------------
-- API uses service_role; RLS limits direct authenticated access.

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_tags TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts_tags TO service_role;

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts_tags ENABLE ROW LEVEL SECURITY;

-- post_tags (org_id)
DROP POLICY IF EXISTS "Members can view post_tags" ON public.post_tags;
CREATE POLICY "Members can view post_tags"
ON public.post_tags
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = post_tags.org_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert post_tags" ON public.post_tags;
CREATE POLICY "Members can insert post_tags"
ON public.post_tags
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = post_tags.org_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update post_tags" ON public.post_tags;
CREATE POLICY "Members can update post_tags"
ON public.post_tags
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = post_tags.org_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = post_tags.org_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete post_tags" ON public.post_tags;
CREATE POLICY "Members can delete post_tags"
ON public.post_tags
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = post_tags.org_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

-- posts (scheduling Post model)
DROP POLICY IF EXISTS "Members can view social_posts" ON public.posts;
DROP POLICY IF EXISTS "Members can view posts" ON public.posts;
CREATE POLICY "Members can view posts"
ON public.posts
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = posts.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert social_posts" ON public.posts;
DROP POLICY IF EXISTS "Members can insert posts" ON public.posts;
CREATE POLICY "Members can insert posts"
ON public.posts
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = posts.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update social_posts" ON public.posts;
DROP POLICY IF EXISTS "Members can update posts" ON public.posts;
CREATE POLICY "Members can update posts"
ON public.posts
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = posts.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = posts.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete social_posts" ON public.posts;
DROP POLICY IF EXISTS "Members can delete posts" ON public.posts;
CREATE POLICY "Members can delete posts"
ON public.posts
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = posts.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

-- posts_tags (via parent post org)
DROP POLICY IF EXISTS "Members can view posts_tags" ON public.posts_tags;
CREATE POLICY "Members can view posts_tags"
ON public.posts_tags
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.posts p
        JOIN public.user_organizations uo ON uo.organization_id = p.organization_id
        JOIN public.users u ON u.id = uo.user_id
        WHERE p.id = posts_tags.post_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert posts_tags" ON public.posts_tags;
CREATE POLICY "Members can insert posts_tags"
ON public.posts_tags
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.posts p
        JOIN public.user_organizations uo ON uo.organization_id = p.organization_id
        JOIN public.users u ON u.id = uo.user_id
        WHERE p.id = posts_tags.post_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update posts_tags" ON public.posts_tags;
CREATE POLICY "Members can update posts_tags"
ON public.posts_tags
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.posts p
        JOIN public.user_organizations uo ON uo.organization_id = p.organization_id
        JOIN public.users u ON u.id = uo.user_id
        WHERE p.id = posts_tags.post_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.posts p
        JOIN public.user_organizations uo ON uo.organization_id = p.organization_id
        JOIN public.users u ON u.id = uo.user_id
        WHERE p.id = posts_tags.post_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete posts_tags" ON public.posts_tags;
CREATE POLICY "Members can delete posts_tags"
ON public.posts_tags
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.posts p
        JOIN public.user_organizations uo ON uo.organization_id = p.organization_id
        JOIN public.users u ON u.id = uo.user_id
        WHERE p.id = posts_tags.post_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

-- ---------------------------
-- MODULE NAME: post
-- MODULE DATE: 20260501
-- MODULE SCOPE: RLS & Grants
-- ---------------------------
-- API uses service_role; RLS limits direct authenticated access.

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_thread_replies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_thread_replies TO service_role;

ALTER TABLE public.post_thread_replies ENABLE ROW LEVEL SECURITY;

-- post_thread_replies (organization_id scope)
DROP POLICY IF EXISTS "Members can view post_thread_replies" ON public.post_thread_replies;
CREATE POLICY "Members can view post_thread_replies"
ON public.post_thread_replies
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = post_thread_replies.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert post_thread_replies" ON public.post_thread_replies;
CREATE POLICY "Members can insert post_thread_replies"
ON public.post_thread_replies
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = post_thread_replies.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update post_thread_replies" ON public.post_thread_replies;
CREATE POLICY "Members can update post_thread_replies"
ON public.post_thread_replies
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = post_thread_replies.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = post_thread_replies.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete post_thread_replies" ON public.post_thread_replies;
CREATE POLICY "Members can delete post_thread_replies"
ON public.post_thread_replies
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = post_thread_replies.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;


-- ---------------------------
-- MODULE NAME: comment
-- MODULE DATE: 20260413
-- MODULE SCOPE: RLS & Grants
-- ---------------------------
-- API uses service_role; RLS limits direct authenticated access.

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO service_role;

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- comments (composer post comments; organization_id scope)
DROP POLICY IF EXISTS "Members can view composer comments" ON public.comments;
CREATE POLICY "Members can view composer comments"
ON public.comments
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = comments.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert composer comments" ON public.comments;
CREATE POLICY "Members can insert composer comments"
ON public.comments
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = comments.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update composer comments" ON public.comments;
CREATE POLICY "Members can update composer comments"
ON public.comments
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = comments.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = comments.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete composer comments" ON public.comments;
CREATE POLICY "Members can delete composer comments"
ON public.comments
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = comments.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;


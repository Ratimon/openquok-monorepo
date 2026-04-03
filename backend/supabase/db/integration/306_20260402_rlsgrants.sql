-- ---------------------------
-- MODULE NAME: integration
-- MODULE DATE: 20260402
-- MODULE SCOPE: RLS & Grants
-- ---------------------------
-- API uses service_role; RLS limits direct authenticated access to tokens.

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO service_role;

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view integrations" ON public.integrations;
CREATE POLICY "Members can view integrations"
ON public.integrations
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = integrations.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert integrations" ON public.integrations;
CREATE POLICY "Members can insert integrations"
ON public.integrations
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = integrations.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update integrations" ON public.integrations;
CREATE POLICY "Members can update integrations"
ON public.integrations
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = integrations.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = integrations.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete integrations" ON public.integrations;
CREATE POLICY "Members can delete integrations"
ON public.integrations
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = integrations.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

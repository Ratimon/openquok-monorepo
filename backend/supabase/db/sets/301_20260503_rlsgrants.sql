-- ---------------------------
-- MODULE NAME: sets
-- MODULE DATE: 20260503
-- MODULE SCOPE: RLS & Grants
-- ---------------------------

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sets TO service_role;

ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view sets" ON public.sets;
CREATE POLICY "Members can view sets"
ON public.sets
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = sets.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert sets" ON public.sets;
CREATE POLICY "Members can insert sets"
ON public.sets
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = sets.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update sets" ON public.sets;
CREATE POLICY "Members can update sets"
ON public.sets
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = sets.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = sets.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete sets" ON public.sets;
CREATE POLICY "Members can delete sets"
ON public.sets
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = sets.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

COMMIT;

-- ---------------------------
-- END OF FILE
-- ---------------------------

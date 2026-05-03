-- ---------------------------
-- MODULE NAME: plug
-- MODULE DATE: 20260502
-- MODULE SCOPE: RLS policies (4xx band — after organization functions)
-- ---------------------------
-- Policies call `public.is_active_member_of_org` (defined in organization `401_*_functions.sql`).
-- Plug module defines no SQL functions yet; add `401_*_functions.sql` here when needed.
-- Same layering as integration: `301_*` = grants + enable RLS; `402_*` = membership-aware policies.

BEGIN;

DROP POLICY IF EXISTS "Members can view plugs" ON public.plugs;
CREATE POLICY "Members can view plugs"
ON public.plugs
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.is_active_member_of_org(plugs.organization_id, auth.uid()));

DROP POLICY IF EXISTS "Members can insert plugs" ON public.plugs;
CREATE POLICY "Members can insert plugs"
ON public.plugs
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (public.is_active_member_of_org(plugs.organization_id, auth.uid()));

DROP POLICY IF EXISTS "Members can update plugs" ON public.plugs;
CREATE POLICY "Members can update plugs"
ON public.plugs
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.is_active_member_of_org(plugs.organization_id, auth.uid()))
WITH CHECK (public.is_active_member_of_org(plugs.organization_id, auth.uid()));

DROP POLICY IF EXISTS "Members can delete plugs" ON public.plugs;
CREATE POLICY "Members can delete plugs"
ON public.plugs
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (public.is_active_member_of_org(plugs.organization_id, auth.uid()));

COMMIT;

-- ---------------------------
-- END OF FILE
-- ---------------------------

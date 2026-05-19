-- ---------------------------
-- MODULE NAME: media
-- MODULE DATE: 20260519
-- MODULE SCOPE: RLS & Grants
-- ---------------------------

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_virtual_folders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_virtual_folders TO service_role;

ALTER TABLE public.media_virtual_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view media virtual folders" ON public.media_virtual_folders;
CREATE POLICY "Members can view media virtual folders"
ON public.media_virtual_folders
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = media_virtual_folders.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert media virtual folders" ON public.media_virtual_folders;
CREATE POLICY "Members can insert media virtual folders"
ON public.media_virtual_folders
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = media_virtual_folders.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update media virtual folders" ON public.media_virtual_folders;
CREATE POLICY "Members can update media virtual folders"
ON public.media_virtual_folders
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = media_virtual_folders.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = media_virtual_folders.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete media virtual folders" ON public.media_virtual_folders;
CREATE POLICY "Members can delete media virtual folders"
ON public.media_virtual_folders
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = media_virtual_folders.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

COMMIT;

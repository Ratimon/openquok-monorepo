-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261013
-- MODULE SCOPE: Row Level Security and Grants (tables + storage auto_launch_profile_media)
-- ---------------------------

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.auto_launch_product_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.auto_launch_product_profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.auto_launch_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.auto_launch_submissions TO service_role;

GRANT SELECT ON public.auto_launch_destinations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.auto_launch_destinations TO service_role;

ALTER TABLE public.auto_launch_product_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_launch_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_launch_submissions ENABLE ROW LEVEL SECURITY;

-- ---------------------------
-- Product profiles (workspace members)
-- ---------------------------

DROP POLICY IF EXISTS "Members can view auto launch product profiles" ON public.auto_launch_product_profiles;
CREATE POLICY "Members can view auto launch product profiles"
ON public.auto_launch_product_profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    deleted_at IS NULL
    AND EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = auto_launch_product_profiles.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert auto launch product profiles" ON public.auto_launch_product_profiles;
CREATE POLICY "Members can insert auto launch product profiles"
ON public.auto_launch_product_profiles
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = auto_launch_product_profiles.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update auto launch product profiles" ON public.auto_launch_product_profiles;
CREATE POLICY "Members can update auto launch product profiles"
ON public.auto_launch_product_profiles
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = auto_launch_product_profiles.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = auto_launch_product_profiles.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete auto launch product profiles" ON public.auto_launch_product_profiles;
CREATE POLICY "Members can delete auto launch product profiles"
ON public.auto_launch_product_profiles
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = auto_launch_product_profiles.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

-- ---------------------------
-- Destinations (published catalog)
-- ---------------------------

DROP POLICY IF EXISTS "Everyone can view published auto launch destinations" ON public.auto_launch_destinations;
CREATE POLICY "Everyone can view published auto launch destinations"
ON public.auto_launch_destinations
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (is_published = true);

DROP POLICY IF EXISTS "Super admin admins editors can manage auto launch destinations" ON public.auto_launch_destinations;
CREATE POLICY "Super admin admins editors can manage auto launch destinations"
ON public.auto_launch_destinations
AS PERMISSIVE
FOR ALL
TO authenticated
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
-- Submissions (workspace members)
-- ---------------------------

DROP POLICY IF EXISTS "Members can view auto launch submissions" ON public.auto_launch_submissions;
CREATE POLICY "Members can view auto launch submissions"
ON public.auto_launch_submissions
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = auto_launch_submissions.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert auto launch submissions" ON public.auto_launch_submissions;
CREATE POLICY "Members can insert auto launch submissions"
ON public.auto_launch_submissions
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = auto_launch_submissions.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update auto launch submissions" ON public.auto_launch_submissions;
CREATE POLICY "Members can update auto launch submissions"
ON public.auto_launch_submissions
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = auto_launch_submissions.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = auto_launch_submissions.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete auto launch submissions" ON public.auto_launch_submissions;
CREATE POLICY "Members can delete auto launch submissions"
ON public.auto_launch_submissions
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = auto_launch_submissions.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

-- ---------------------------
-- Storage: auto_launch_profile_media
-- Paths: {organizationId}/{profileId}/...
-- ---------------------------

CREATE OR REPLACE FUNCTION public.auto_launch_profile_media_path_allowed(object_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        coalesce(array_length(storage.foldername(object_name), 1), 0) >= 2
        AND EXISTS (
            SELECT 1
            FROM public.user_organizations uo
            JOIN public.users u ON u.id = uo.user_id
            JOIN public.auto_launch_product_profiles p
                ON p.id::text = (storage.foldername(object_name))[2]
                AND p.organization_id::text = (storage.foldername(object_name))[1]
            WHERE u.auth_id = auth.uid()
              AND uo.disabled = FALSE
              AND uo.organization_id = p.organization_id
              AND p.deleted_at IS NULL
        );
$$;

DROP POLICY IF EXISTS "Allow org members to upload auto launch profile media" ON storage.objects;
CREATE POLICY "Allow org members to upload auto launch profile media"
    ON storage.objects
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'auto_launch_profile_media'::text
        AND auth.role() = 'authenticated'::text
        AND auth.uid() = owner
        AND public.auto_launch_profile_media_path_allowed(name)
    );

DROP POLICY IF EXISTS "Allow org members to update auto launch profile media" ON storage.objects;
CREATE POLICY "Allow org members to update auto launch profile media"
    ON storage.objects
    AS PERMISSIVE
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'auto_launch_profile_media'::text
        AND auth.role() = 'authenticated'::text
        AND auth.uid() = owner
        AND public.auto_launch_profile_media_path_allowed(name)
    )
    WITH CHECK (
        bucket_id = 'auto_launch_profile_media'::text
        AND auth.role() = 'authenticated'::text
        AND auth.uid() = owner
        AND public.auto_launch_profile_media_path_allowed(name)
    );

DROP POLICY IF EXISTS "Allow org members to delete auto launch profile media" ON storage.objects;
CREATE POLICY "Allow org members to delete auto launch profile media"
    ON storage.objects
    AS PERMISSIVE
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'auto_launch_profile_media'::text
        AND auth.role() = 'authenticated'::text
        AND auth.uid() = owner
        AND public.auto_launch_profile_media_path_allowed(name)
    );

DROP POLICY IF EXISTS "Allow service_role to manage auto launch profile media" ON storage.objects;
CREATE POLICY "Allow service_role to manage auto launch profile media"
    ON storage.objects
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (bucket_id = 'auto_launch_profile_media'::text);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

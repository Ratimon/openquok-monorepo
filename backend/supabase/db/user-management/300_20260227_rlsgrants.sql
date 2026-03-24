-- ---------------------------
-- MODULE NAME: User Management
-- MODULE DATE: 20260227
-- MODULE SCOPE: RLS & Grants
-- ---------------------------

BEGIN;

-- ---------------------------
-- Helper: check super admin (bypasses RLS; used by config and other modules)
-- ---------------------------

CREATE OR REPLACE FUNCTION public.is_super_admin(user_auth_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    SELECT is_super_admin INTO is_admin
    FROM public.users
    WHERE auth_id = user_auth_id
    LIMIT 1;
    RETURN COALESCE(is_admin, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO anon;
COMMENT ON FUNCTION public.is_super_admin(UUID) IS 'Check if a user is a super admin (bypasses RLS to avoid recursion)';

-- ---------------------------
-- Users
-- ---------------------------

-- Anon: public profile columns only (no verification tokens)
GRANT SELECT (id, full_name, email, is_email_verified, is_super_admin, created_at, updated_at) ON public.users TO anon;

-- Authenticated: full access (restricted by RLS)
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.users TO authenticated;
GRANT SELECT (email_verification_token, email_verification_token_expires) ON public.users TO authenticated;

-- Service role
GRANT DELETE, INSERT, REFERENCES, SELECT, TRUNCATE, UPDATE, TRIGGER ON public.users TO service_role;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view their own data" ON public.users;
CREATE POLICY "Authenticated users can view their own data"
ON public.users
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update their profiles" ON public.users;
CREATE POLICY "Owners can update their profiles"
ON public.users
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth_id = auth.uid())
WITH CHECK (auth_id = auth.uid());

DROP POLICY IF EXISTS "Anon users can view public profiles" ON public.users;
CREATE POLICY "Anon users can view public profiles"
ON public.users
AS PERMISSIVE
FOR SELECT
TO anon
USING (true);

-- Super admins can view and update any user (e.g. for admin tooling)
DROP POLICY IF EXISTS "Super admins can update any user data" ON public.users;
CREATE POLICY "Super admins can update any user data"
ON public.users
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can view all user data" ON public.users;
CREATE POLICY "Super admins can view all user data"
ON public.users
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- ---------------------------
-- User Profiles
-- ---------------------------

GRANT SELECT ON public.user_profiles TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON public.user_profiles TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRUNCATE, UPDATE, TRIGGER ON public.user_profiles TO service_role;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User profiles are publicly accessible" ON public.user_profiles;
CREATE POLICY "User profiles are publicly accessible"
ON public.user_profiles
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Owners can update their own profiles" ON public.user_profiles;
CREATE POLICY "Owners can update their own profiles"
ON public.user_profiles
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = user_profiles.owner_id
        AND users.auth_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = user_profiles.owner_id
        AND users.auth_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Owners can insert their own profiles" ON public.user_profiles;
CREATE POLICY "Owners can insert their own profiles"
ON public.user_profiles
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = user_profiles.owner_id
        AND users.auth_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Super admins can manage any profile" ON public.user_profiles;
CREATE POLICY "Super admins can manage any profile"
ON public.user_profiles
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- ---------------------------
-- Avatars (storage.objects for bucket 'avatars')
-- ---------------------------

GRANT SELECT ON storage.objects TO anon;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRUNCATE, UPDATE, TRIGGER ON storage.objects TO authenticated;
GRANT DELETE, INSERT, REFERENCES, SELECT, TRUNCATE, UPDATE, TRIGGER ON storage.objects TO service_role;

DROP POLICY IF EXISTS "Allow authenticated users to upload their own avatar." ON storage.objects;
CREATE POLICY "Allow authenticated users to upload their own avatar."
ON storage.objects
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'::text
    AND auth.uid() = owner
);

DROP POLICY IF EXISTS "Allow authenticated users to update their own avatar." ON storage.objects;
CREATE POLICY "Allow authenticated users to update their own avatar."
ON storage.objects
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'::text
    AND auth.uid() = owner
)
WITH CHECK (
    bucket_id = 'avatars'::text
    AND auth.uid() = owner
);

DROP POLICY IF EXISTS "Allow admin users to delete their own avatar." ON storage.objects;
CREATE POLICY "Allow admin users to delete their own avatar."
ON storage.objects
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'::text
    AND auth.uid() = owner
);

DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects
AS PERMISSIVE
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars'::text);

DROP POLICY IF EXISTS "Allow service_role to manage avatars" ON storage.objects;
CREATE POLICY "Allow service_role to manage avatars"
ON storage.objects
AS PERMISSIVE
FOR ALL
TO service_role
USING (bucket_id = 'avatars'::text);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

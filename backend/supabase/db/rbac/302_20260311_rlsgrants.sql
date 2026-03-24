-- ---------------------------
-- MODULE NAME: RBAC
-- MODULE DATE: 20260311
-- MODULE SCOPE: RLS & Grants
-- ---------------------------
-- Runs after user-management/301 so public.is_super_admin(uuid) exists.
-- content-os: public.users.id is PK; users.auth_id = auth.uid() for current user.

BEGIN;

GRANT USAGE ON TYPE public.app_role TO authenticated;
GRANT USAGE ON TYPE public.app_permission TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles (via public.users.id from auth_id)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = user_roles.user_id AND u.auth_id = auth.uid()
        )
    );

-- Super admins can view all roles
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
CREATE POLICY "Super admins can view all roles"
    ON public.user_roles FOR SELECT TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- Only super admins can insert/update/delete user_roles (assign/remove via RPC in app)
DROP POLICY IF EXISTS "Super admins can insert roles" ON public.user_roles;
CREATE POLICY "Super admins can insert roles"
    ON public.user_roles FOR INSERT TO authenticated
    WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;
CREATE POLICY "Super admins can update roles"
    ON public.user_roles FOR UPDATE TO authenticated
    USING (public.is_super_admin(auth.uid()))
    WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;
CREATE POLICY "Super admins can delete roles"
    ON public.user_roles FOR DELETE TO authenticated
    USING (public.is_super_admin(auth.uid()));

-- Authenticated can read role_permissions
DROP POLICY IF EXISTS "Authenticated can view role permissions" ON public.role_permissions;
CREATE POLICY "Authenticated can view role permissions"
    ON public.role_permissions FOR SELECT TO authenticated
    USING (true);

-- Only super admins can modify role_permissions
DROP POLICY IF EXISTS "Super admins can manage role permissions" ON public.role_permissions;
CREATE POLICY "Super admins can manage role permissions"
    ON public.role_permissions FOR ALL TO authenticated
    USING (public.is_super_admin(auth.uid()))
    WITH CHECK (public.is_super_admin(auth.uid()));

COMMIT;

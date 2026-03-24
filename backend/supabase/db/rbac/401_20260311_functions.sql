-- ---------------------------
-- MODULE NAME: RBAC (Role-Based Access Control)
-- MODULE DATE: 20260311
-- MODULE SCOPE: Functions
-- ---------------------------
-- user_id in user_roles is public.users.id. auth.uid() is Supabase auth user id.

-- Function to get all permissions for a user (by public.users.id)
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS TABLE (permission public.app_permission) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT rp.permission
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION public.get_user_permissions(UUID) IS 'Returns all permissions for a given user (public.users.id) based on their roles';

-- Function to check if user has a specific role (by public.users.id)
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, check_role public.app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = user_uuid AND role = check_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION public.has_role(UUID, public.app_role) IS 'Check if a user (public.users.id) has a specific role';

-- Function to assign a role to a user. assigned_by_user_id is public.users.id.
CREATE OR REPLACE FUNCTION public.assign_user_role(
    target_user_id UUID,
    role_to_assign public.app_role,
    assigned_by_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    new_role_id UUID;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = assigned_by_user_id
        AND (u.is_super_admin = true OR EXISTS(
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = assigned_by_user_id AND ur.role = 'admin'
        ))
    ) THEN
        RAISE EXCEPTION 'Only admins can assign roles';
    END IF;

    INSERT INTO public.user_roles (user_id, role, created_by)
    VALUES (target_user_id, role_to_assign, assigned_by_user_id)
    ON CONFLICT (user_id, role) DO NOTHING
    RETURNING id INTO new_role_id;

    RETURN new_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION public.assign_user_role(UUID, public.app_role, UUID) IS 'Assigns a role to a user. Caller must be super admin or have admin role.';

-- Function to remove a role from a user
CREATE OR REPLACE FUNCTION public.remove_user_role(
    target_user_id UUID,
    role_to_remove public.app_role,
    removed_by_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = removed_by_user_id
        AND (u.is_super_admin = true OR EXISTS(
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = removed_by_user_id AND ur.role = 'admin'
        ))
    ) THEN
        RAISE EXCEPTION 'Only admins can remove roles';
    END IF;

    DELETE FROM public.user_roles
    WHERE user_id = target_user_id AND role = role_to_remove;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION public.remove_user_role(UUID, public.app_role, UUID) IS 'Removes a role from a user. Caller must be super admin or have admin role.';

-- Grant execute to authenticated (must run after functions exist)
GRANT EXECUTE ON FUNCTION public.get_user_permissions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_role(UUID, public.app_role, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_user_role(UUID, public.app_role, UUID) TO authenticated;

-- ---------------------------
-- END OF FILE
-- ---------------------------

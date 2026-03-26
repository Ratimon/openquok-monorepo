-- ---------------------------
-- MODULE NAME: RBAC (Role-Based Access Control)
-- MODULE DATE: 20260311
-- MODULE SCOPE: Functions
-- ---------------------------
-- user_id in user_roles is public.users.id. auth.uid() is Supabase auth user id.
-- JWT callers: assign/remove must pass their own public.users.id; get/has_role scoped to self unless admin.
-- Service role (auth.uid() null): assign/remove still validated via actor UUID arg (backend).

-- Function to get all permissions for a user (by public.users.id)
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS TABLE (permission public.app_permission) AS $$
DECLARE
    caller_auth UUID := auth.uid();
    caller_internal UUID;
BEGIN
    IF caller_auth IS NOT NULL THEN
        caller_internal := (SELECT u.id FROM public.users u WHERE u.auth_id = caller_auth LIMIT 1);
        IF user_uuid IS DISTINCT FROM caller_internal THEN
            IF caller_internal IS NULL
                OR NOT (
                    public.is_super_admin(caller_auth)
                    OR EXISTS (
                        SELECT 1
                        FROM public.user_roles ur
                        WHERE ur.user_id = caller_internal AND ur.role = 'admin'
                    )
                )
            THEN
                RAISE EXCEPTION 'Not allowed to query permissions for another user';
            END IF;
        END IF;
    END IF;

    RETURN QUERY
    SELECT DISTINCT rp.permission
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION public.get_user_permissions(UUID) IS 'Returns permissions for public.users.id. JWT callers may only query self unless admin/super_admin.';

-- Function to check if user has a specific role (by public.users.id)
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, check_role public.app_role)
RETURNS BOOLEAN AS $$
DECLARE
    caller_auth UUID := auth.uid();
    caller_internal UUID;
BEGIN
    IF caller_auth IS NOT NULL THEN
        caller_internal := (SELECT u.id FROM public.users u WHERE u.auth_id = caller_auth LIMIT 1);
        IF user_uuid IS DISTINCT FROM caller_internal THEN
            IF caller_internal IS NULL
                OR NOT (
                    public.is_super_admin(caller_auth)
                    OR EXISTS (
                        SELECT 1
                        FROM public.user_roles ur
                        WHERE ur.user_id = caller_internal AND ur.role = 'admin'
                    )
                )
            THEN
                RAISE EXCEPTION 'Not allowed to query roles for another user';
            END IF;
        END IF;
    END IF;

    RETURN EXISTS(
        SELECT 1 FROM public.user_roles
        WHERE user_id = user_uuid AND role = check_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION public.has_role(UUID, public.app_role) IS 'Check role for public.users.id. JWT callers may only query self unless admin/super_admin.';

-- Function to assign a role to a user. assigned_by_user_id is public.users.id.
CREATE OR REPLACE FUNCTION public.assign_user_role(
    target_user_id UUID,
    role_to_assign public.app_role,
    assigned_by_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    new_role_id UUID;
    caller_auth UUID := auth.uid();
    actor_id UUID;
BEGIN
    IF caller_auth IS NOT NULL THEN
        actor_id := (SELECT u.id FROM public.users u WHERE u.auth_id = caller_auth LIMIT 1);
        IF actor_id IS NULL OR assigned_by_user_id IS DISTINCT FROM actor_id THEN
            RAISE EXCEPTION 'assigned_by_user_id must match the authenticated user';
        END IF;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = assigned_by_user_id
        AND (
            u.is_super_admin = true
            OR EXISTS(
                SELECT 1 FROM public.user_roles ur
                WHERE ur.user_id = assigned_by_user_id AND ur.role = 'admin'
            )
        )
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

COMMENT ON FUNCTION public.assign_user_role(UUID, public.app_role, UUID) IS 'Assigns a role. JWT callers must pass their own public.users.id as assigned_by_user_id; must be admin/super_admin.';

-- Function to remove a role from a user
CREATE OR REPLACE FUNCTION public.remove_user_role(
    target_user_id UUID,
    role_to_remove public.app_role,
    removed_by_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    caller_auth UUID := auth.uid();
    actor_id UUID;
BEGIN
    IF caller_auth IS NOT NULL THEN
        actor_id := (SELECT u.id FROM public.users u WHERE u.auth_id = caller_auth LIMIT 1);
        IF actor_id IS NULL OR removed_by_user_id IS DISTINCT FROM actor_id THEN
            RAISE EXCEPTION 'removed_by_user_id must match the authenticated user';
        END IF;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = removed_by_user_id
        AND (
            u.is_super_admin = true
            OR EXISTS(
                SELECT 1 FROM public.user_roles ur
                WHERE ur.user_id = removed_by_user_id AND ur.role = 'admin'
            )
        )
    ) THEN
        RAISE EXCEPTION 'Only admins can remove roles';
    END IF;

    DELETE FROM public.user_roles
    WHERE user_id = target_user_id AND role = role_to_remove;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION public.remove_user_role(UUID, public.app_role, UUID) IS 'Removes a role. JWT callers must pass their own public.users.id as removed_by_user_id; must be admin/super_admin.';

-- Grant execute to authenticated (must run after functions exist)
GRANT EXECUTE ON FUNCTION public.get_user_permissions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_role(UUID, public.app_role, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_user_role(UUID, public.app_role, UUID) TO authenticated;

-- ---------------------------
-- END OF FILE
-- ---------------------------

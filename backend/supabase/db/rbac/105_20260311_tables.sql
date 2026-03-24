-- ---------------------------
-- MODULE NAME: RBAC (Role-Based Access Control)
-- MODULE DATE: 20260311
-- MODULE SCOPE: Tables
-- ---------------------------
-- Runs after user-management (101). user_roles references public.users(id).

BEGIN;

-- ---------------------------
-- App permission and role enums
-- ---------------------------

DO $$ BEGIN
    CREATE TYPE public.app_permission AS ENUM (
        'users.manage_roles'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM (
        'editor',
        'support',
        'admin'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


COMMENT ON TYPE public.app_permission IS 'Application-level permissions for fine-grained access control';
COMMENT ON TYPE public.app_role IS 'App roles: editor (blog only), support (feedback only), admin (all + manage roles)';

-- ---------------------------
-- User Roles Table
-- ---------------------------

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES public.users(id),
    UNIQUE (user_id, role)
);

COMMENT ON TABLE public.user_roles IS 'Maps users (public.users.id) to app roles. Distinct from workspace membership (workspace_membership_role).';
COMMENT ON COLUMN public.user_roles.user_id IS 'References public.users(id)';
COMMENT ON COLUMN public.user_roles.role IS 'The app role assigned to the user';
COMMENT ON COLUMN public.user_roles.created_by IS 'User who assigned this role (public.users.id)';

-- ---------------------------
-- Role Permissions Table
-- ---------------------------

CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.app_role NOT NULL,
    permission public.app_permission NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (role, permission)
);

COMMENT ON TABLE public.role_permissions IS 'Maps app roles to their permissions';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

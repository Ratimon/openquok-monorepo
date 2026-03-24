-- ---------------------------
-- MODULE NAME: RBAC
-- MODULE DATE: 20260311
-- MODULE SCOPE: Indexes
-- ---------------------------

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission);

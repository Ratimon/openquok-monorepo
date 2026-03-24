-- ---------------------------
-- MODULE NAME: RBAC
-- MODULE DATE: 20260311
-- MODULE SCOPE: Seed
-- ---------------------------

-- Admin: can assign/remove roles and manage role-permission mapping
INSERT INTO public.role_permissions (role, permission) VALUES
    ('admin', 'users.manage_roles')
ON CONFLICT (role, permission) DO NOTHING;

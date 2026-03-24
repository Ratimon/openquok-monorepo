-- ---------------------------
-- MODULE NAME: ADMIN AREA
-- MODULE DATE: 20260311
-- MODULE SCOPE: RLS & Grants
-- ---------------------------
-- Runs after user-management/301 so public.is_super_admin(uuid) exists.
-- ---------------------------

BEGIN;

-- ---------------------------
-- ADMIN MODULE CONFIGURATION
-- ---------------------------

-- Enable Row-Level Security on the module_configs table
ALTER TABLE public.module_configs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read (SELECT) configs
-- If you want *everyone* including non-authenticated to read, remove auth checks.
CREATE POLICY "Allow all to read module configs"
ON public.module_configs
FOR SELECT
USING (true);

-- Allow only super admins to INSERT new configs
DROP POLICY IF EXISTS "Allow admins to insert module configs" ON public.module_configs;
CREATE POLICY "Allow admins to insert module configs"
ON public.module_configs
FOR INSERT
WITH CHECK (public.is_super_admin(auth.uid()));

-- Allow only super admins to UPDATE configs
DROP POLICY IF EXISTS "Allow admins to update module configs" ON public.module_configs;
CREATE POLICY "Allow admins to update module configs"
ON public.module_configs
FOR UPDATE
USING (public.is_super_admin(auth.uid()));

-- Allow only super admins to DELETE configs
DROP POLICY IF EXISTS "Allow admins to delete module configs" ON public.module_configs;
CREATE POLICY "Allow admins to delete module configs"
ON public.module_configs
FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

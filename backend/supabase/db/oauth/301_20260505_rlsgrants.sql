-- ---------------------------
-- MODULE NAME: OAuth Apps
-- MODULE DATE: 20260505
-- MODULE SCOPE: RLS & Grants
-- ---------------------------

BEGIN;

-- ---------------------------
-- Grants
-- ---------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON public.oauth_apps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oauth_apps TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.oauth_authorizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.oauth_authorizations TO service_role;

-- ---------------------------
-- RLS: oauth_apps
-- ---------------------------

ALTER TABLE public.oauth_apps ENABLE ROW LEVEL SECURITY;

-- Members can view apps in their org
DROP POLICY IF EXISTS "Members can view oauth apps" ON public.oauth_apps;
CREATE POLICY "Members can view oauth apps"
ON public.oauth_apps
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = oauth_apps.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

-- Admins can manage apps (INSERT/UPDATE/DELETE — use FOR ALL; Postgres allows one command per policy)
DROP POLICY IF EXISTS "Admins can manage oauth apps" ON public.oauth_apps;
CREATE POLICY "Admins can manage oauth apps"
ON public.oauth_apps
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = oauth_apps.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
          AND uo.role IN ('admin', 'superadmin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = oauth_apps.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
          AND uo.role IN ('admin', 'superadmin')
    )
);

-- ---------------------------
-- RLS: oauth_authorizations
-- ---------------------------

ALTER TABLE public.oauth_authorizations ENABLE ROW LEVEL SECURITY;

-- Members can view authorization metadata for their org (not raw secrets)
DROP POLICY IF EXISTS "Members can view oauth authorizations" ON public.oauth_authorizations;
CREATE POLICY "Members can view oauth authorizations"
ON public.oauth_authorizations
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = oauth_authorizations.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

-- Users can insert/update their own authorizations (consent flow)
DROP POLICY IF EXISTS "Users can manage own oauth authorizations" ON public.oauth_authorizations;
DROP POLICY IF EXISTS "Users can insert own oauth authorizations" ON public.oauth_authorizations;
CREATE POLICY "Users can insert own oauth authorizations"
ON public.oauth_authorizations
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = oauth_authorizations.user_id
          AND u.auth_id = auth.uid()
    )
);

-- Users can update their own authorizations
DROP POLICY IF EXISTS "Users can update own oauth authorizations" ON public.oauth_authorizations;
CREATE POLICY "Users can update own oauth authorizations"
ON public.oauth_authorizations
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = oauth_authorizations.user_id
          AND u.auth_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.users u
        WHERE u.id = oauth_authorizations.user_id
          AND u.auth_id = auth.uid()
    )
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;


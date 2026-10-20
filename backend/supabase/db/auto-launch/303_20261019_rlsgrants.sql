-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261019
-- MODULE SCOPE: Row Level Security and Grants (directory SEO tables)
-- ---------------------------

BEGIN;

-- ---------------------------
-- SEO metric cache (read-only for members; backend writes via service_role)
-- ---------------------------

GRANT SELECT ON public.seo_domain_metric_snapshots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_domain_metric_snapshots TO service_role;

GRANT SELECT ON public.seo_domain_metric_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_domain_metric_history TO service_role;

ALTER TABLE public.seo_domain_metric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_domain_metric_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read seo domain metric snapshots" ON public.seo_domain_metric_snapshots;
CREATE POLICY "Authenticated can read seo domain metric snapshots"
ON public.seo_domain_metric_snapshots
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Service role manages seo domain metric snapshots" ON public.seo_domain_metric_snapshots;
CREATE POLICY "Service role manages seo domain metric snapshots"
ON public.seo_domain_metric_snapshots
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can read seo domain metric history" ON public.seo_domain_metric_history;
CREATE POLICY "Authenticated can read seo domain metric history"
ON public.seo_domain_metric_history
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Service role manages seo domain metric history" ON public.seo_domain_metric_history;
CREATE POLICY "Service role manages seo domain metric history"
ON public.seo_domain_metric_history
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ---------------------------
-- Directory SEO competitors (workspace members)
-- ---------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON public.directory_seo_competitors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.directory_seo_competitors TO service_role;

ALTER TABLE public.directory_seo_competitors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view directory seo competitors" ON public.directory_seo_competitors;
CREATE POLICY "Members can view directory seo competitors"
ON public.directory_seo_competitors
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = directory_seo_competitors.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert directory seo competitors" ON public.directory_seo_competitors;
CREATE POLICY "Members can insert directory seo competitors"
ON public.directory_seo_competitors
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = directory_seo_competitors.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update directory seo competitors" ON public.directory_seo_competitors;
CREATE POLICY "Members can update directory seo competitors"
ON public.directory_seo_competitors
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = directory_seo_competitors.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = directory_seo_competitors.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete directory seo competitors" ON public.directory_seo_competitors;
CREATE POLICY "Members can delete directory seo competitors"
ON public.directory_seo_competitors
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = directory_seo_competitors.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Service role manages directory seo competitors" ON public.directory_seo_competitors;
CREATE POLICY "Service role manages directory seo competitors"
ON public.directory_seo_competitors
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

-- ---------------------------
-- MODULE NAME: Billing
-- MODULE DATE: 20260519
-- MODULE SCOPE: RLS + grants
-- ---------------------------

BEGIN;

ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS organization_subscriptions_select_member ON public.organization_subscriptions;
CREATE POLICY organization_subscriptions_select_member
    ON public.organization_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.user_organizations uo
            WHERE uo.organization_id = organization_subscriptions.organization_id
              AND uo.user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
              AND uo.disabled = FALSE
        )
        OR public.is_super_admin(auth.uid())
    );

GRANT SELECT ON public.organization_subscriptions TO authenticated;
GRANT ALL ON public.organization_subscriptions TO service_role;

DROP POLICY IF EXISTS organization_subscriptions_service_role_all ON public.organization_subscriptions;
CREATE POLICY organization_subscriptions_service_role_all
    ON public.organization_subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMIT;

-- ---------------------------
-- MODULE NAME: customer
-- MODULE DATE: 20260412
-- MODULE SCOPE: RLS & Grants
-- ---------------------------

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_customers TO service_role;

ALTER TABLE public.integration_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view integration_customers" ON public.integration_customers;
CREATE POLICY "Members can view integration_customers"
ON public.integration_customers
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = integration_customers.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can insert integration_customers" ON public.integration_customers;
CREATE POLICY "Members can insert integration_customers"
ON public.integration_customers
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = integration_customers.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can update integration_customers" ON public.integration_customers;
CREATE POLICY "Members can update integration_customers"
ON public.integration_customers
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = integration_customers.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = integration_customers.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

DROP POLICY IF EXISTS "Members can delete integration_customers" ON public.integration_customers;
CREATE POLICY "Members can delete integration_customers"
ON public.integration_customers
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = integration_customers.organization_id
          AND u.auth_id = auth.uid()
          AND uo.disabled = FALSE
    )
);

COMMIT;

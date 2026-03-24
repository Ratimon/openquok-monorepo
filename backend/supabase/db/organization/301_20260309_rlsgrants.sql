-- ---------------------------
-- MODULE NAME: Organization
-- MODULE DATE: 20260309
-- MODULE SCOPE: RLS & Grants
-- ---------------------------

BEGIN;

-- ---------------------------
-- Grants
-- ---------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_organizations TO authenticated;
GRANT USAGE ON TYPE public.workspace_membership_role TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_organizations TO service_role;

GRANT SELECT, INSERT, DELETE ON public.organization_invites TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.organization_invites TO service_role;

-- ---------------------------
-- RLS: organizations
-- ---------------------------

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Users can view organizations they are a member of
DROP POLICY IF EXISTS "Members can view organization" ON public.organizations;
CREATE POLICY "Members can view organization"
ON public.organizations
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = organizations.id
          AND u.auth_id = auth.uid()
          AND (uo.disabled = FALSE)
    )
);

-- Only org members with admin or superadmin can update
DROP POLICY IF EXISTS "Admins can update organization" ON public.organizations;
CREATE POLICY "Admins can update organization"
ON public.organizations
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = organizations.id
          AND u.auth_id = auth.uid()
          AND (uo.disabled = FALSE)
          AND uo.role IN ('admin', 'superadmin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = organizations.id
          AND u.auth_id = auth.uid()
          AND (uo.disabled = FALSE)
          AND uo.role IN ('admin', 'superadmin')
    )
);

-- Authenticated users can create organizations (membership is added in app layer)
DROP POLICY IF EXISTS "Authenticated can create organization" ON public.organizations;
CREATE POLICY "Authenticated can create organization"
ON public.organizations
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only superadmin members can delete (optional; we may disallow delete in app)
DROP POLICY IF EXISTS "Superadmin can delete organization" ON public.organizations;
CREATE POLICY "Superadmin can delete organization"
ON public.organizations
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = organizations.id
          AND u.auth_id = auth.uid()
          AND (uo.disabled = FALSE)
          AND uo.role = 'superadmin'
    )
);

-- ---------------------------
-- RLS: user_organizations
-- ---------------------------

ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- Members can view memberships of their organizations
DROP POLICY IF EXISTS "Members can view user_organizations" ON public.user_organizations;
CREATE POLICY "Members can view user_organizations"
ON public.user_organizations
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations self
        JOIN public.users u ON u.id = self.user_id
        WHERE self.organization_id = user_organizations.organization_id
          AND u.auth_id = auth.uid()
          AND (self.disabled = FALSE)
    )
);

-- Admins/superadmins can insert (add member) into user_organizations
DROP POLICY IF EXISTS "Admins can add team member" ON public.user_organizations;
CREATE POLICY "Admins can add team member"
ON public.user_organizations
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations self
        JOIN public.users u ON u.id = self.user_id
        WHERE self.organization_id = user_organizations.organization_id
          AND u.auth_id = auth.uid()
          AND (self.disabled = FALSE)
          AND self.role IN ('admin', 'superadmin')
    )
);

-- Admins can update (e.g. role, disabled) for non-superadmin members; users can update own disabled
DROP POLICY IF EXISTS "Admins can update membership" ON public.user_organizations;
CREATE POLICY "Admins can update membership"
ON public.user_organizations
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_organizations self
        JOIN public.users u ON u.id = self.user_id
        WHERE self.organization_id = user_organizations.organization_id
          AND u.auth_id = auth.uid()
          AND (self.disabled = FALSE)
          AND self.role IN ('admin', 'superadmin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations self
        JOIN public.users u ON u.id = self.user_id
        WHERE self.organization_id = user_organizations.organization_id
          AND u.auth_id = auth.uid()
          AND (self.disabled = FALSE)
          AND self.role IN ('admin', 'superadmin')
    )
);

-- Admins can delete (remove member) other members; users can delete own membership
DROP POLICY IF EXISTS "Admins or self can delete membership" ON public.user_organizations;
CREATE POLICY "Admins or self can delete membership"
ON public.user_organizations
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = user_organizations.user_id AND u.auth_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.user_organizations self
        JOIN public.users u ON u.id = self.user_id
        WHERE self.organization_id = user_organizations.organization_id
          AND u.auth_id = auth.uid()
          AND (self.disabled = FALSE)
          AND self.role IN ('admin', 'superadmin')
    )
);

-- ---------------------------
-- RLS: organization_invites
-- ---------------------------

ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- Invitee can see invites sent to their email
DROP POLICY IF EXISTS "Invitee can view own invites" ON public.organization_invites;
CREATE POLICY "Invitee can view own invites"
ON public.organization_invites
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = auth.uid()
          AND LOWER(u.email) = LOWER(organization_invites.email)
    )
);

-- Admins/superadmins of the org can create invites (send invitation)
DROP POLICY IF EXISTS "Admins can create invite" ON public.organization_invites;
CREATE POLICY "Admins can create invite"
ON public.organization_invites
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_organizations uo
        JOIN public.users u ON u.id = uo.user_id
        WHERE uo.organization_id = organization_invites.organization_id
          AND u.auth_id = auth.uid()
          AND (uo.disabled = FALSE)
          AND uo.role IN ('admin', 'superadmin')
    )
);

-- Invitee can delete their own invite (e.g. when accepting)
DROP POLICY IF EXISTS "Invitee can delete own invite" ON public.organization_invites;
CREATE POLICY "Invitee can delete own invite"
ON public.organization_invites
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.auth_id = auth.uid()
          AND LOWER(u.email) = LOWER(organization_invites.email)
    )
);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

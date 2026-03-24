-- ---------------------------
-- MODULE NAME: Organization
-- MODULE DATE: 20260309
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_organizations_api_key ON public.organizations(api_key)
    WHERE api_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON public.user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_organization_id ON public.user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_disabled ON public.user_organizations(disabled);

CREATE INDEX IF NOT EXISTS idx_organization_invites_email ON public.organization_invites(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_organization_invites_organization_id ON public.organization_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invites_expires_at ON public.organization_invites(expires_at);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

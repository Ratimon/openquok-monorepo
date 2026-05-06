-- ---------------------------
-- MODULE NAME: OAuth Apps
-- MODULE DATE: 20260505
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_oauth_apps_org_id ON public.oauth_apps(organization_id);
CREATE INDEX IF NOT EXISTS idx_oauth_apps_created_by_user_id ON public.oauth_apps(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_apps_deleted_at ON public.oauth_apps(deleted_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_oauth_apps_client_id ON public.oauth_apps(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_apps_client_id ON public.oauth_apps(client_id);

CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_oauth_app_id ON public.oauth_authorizations(oauth_app_id);
CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_user_id ON public.oauth_authorizations(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_org_id ON public.oauth_authorizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_revoked_at ON public.oauth_authorizations(revoked_at);
CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_access_token_hash ON public.oauth_authorizations(access_token_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_authorization_code_hash ON public.oauth_authorizations(authorization_code_hash);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;


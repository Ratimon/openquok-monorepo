-- ---------------------------
-- MODULE NAME: integration
-- MODULE DATE: 20260821
-- MODULE SCOPE: RLS & Grants
-- ---------------------------
-- Hide channel secrets from the authenticated role when querying via PostgREST
-- with a user JWT. The API and workers use service_role and keep full access.
-- Application layer encrypts token / refresh_token at rest (AES-GCM) when
-- INTEGRATIONS_TOKEN_ENCRYPTION_KEY or SECURITY_SECRET is set.

BEGIN;

-- Table-level GRANT SELECT/UPDATE still applies to other columns; revoke only secrets.
REVOKE SELECT (token, refresh_token) ON public.integrations FROM authenticated;
REVOKE UPDATE (token, refresh_token) ON public.integrations FROM authenticated;

COMMENT ON COLUMN public.integrations.token IS
  'Provider access credential (OAuth access token or pasted API key). Stored AES-GCM ciphertext when field-level encryption is enabled; readable/writable by service_role only; authenticated has no column privilege.';
COMMENT ON COLUMN public.integrations.refresh_token IS
  'Provider refresh credential when the platform issues one. Stored AES-GCM ciphertext when field-level encryption is enabled; readable/writable by service_role only; authenticated has no column privilege.';

COMMIT;

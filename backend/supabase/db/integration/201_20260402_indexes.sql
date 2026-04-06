-- ---------------------------
-- MODULE NAME: integration
-- MODULE DATE: 20260402
-- MODULE SCOPE: Indexes
-- ---------------------------
-- Indexes for common filters: organization, provider, lifecycle timestamps, flags.

BEGIN;

CREATE INDEX IF NOT EXISTS idx_integrations_organization_id ON public.integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider_identifier ON public.integrations(provider_identifier);
CREATE INDEX IF NOT EXISTS idx_integrations_root_internal_id ON public.integrations(root_internal_id);
CREATE INDEX IF NOT EXISTS idx_integrations_updated_at ON public.integrations(updated_at);
CREATE INDEX IF NOT EXISTS idx_integrations_created_at ON public.integrations(created_at);
CREATE INDEX IF NOT EXISTS idx_integrations_deleted_at ON public.integrations(deleted_at);
CREATE INDEX IF NOT EXISTS idx_integrations_customer_id ON public.integrations(customer_id)
    WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_integrations_in_between_steps ON public.integrations(in_between_steps);
CREATE INDEX IF NOT EXISTS idx_integrations_refresh_needed ON public.integrations(refresh_needed);
CREATE INDEX IF NOT EXISTS idx_integrations_disabled ON public.integrations(disabled);

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

-- ---------------------------
-- MODULE NAME: plug
-- MODULE DATE: 20260502
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_plugs_organization_id ON public.plugs(organization_id);
CREATE INDEX IF NOT EXISTS idx_plugs_integration_id ON public.plugs(integration_id);
CREATE INDEX IF NOT EXISTS idx_plugs_activated ON public.plugs(activated)
    WHERE activated = TRUE;

COMMIT;

-- ---------------------------
-- END OF FILE
-- ---------------------------

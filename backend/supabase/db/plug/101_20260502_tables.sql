-- ---------------------------
-- MODULE NAME: plug
-- MODULE DATE: 20260502
-- MODULE SCOPE: Tables
-- ---------------------------
-- Global plugs (threshold-triggered replies, etc.)
-- (single table with BOTH organization_id and integration_id).
--
-- Prisma lists `plugs Plugs[]` on Organization and again on Integration — that is one relation
-- mirrored from each parent model to the same child rows, not two separate plug tables.
-- Every row still scopes to exactly one integration (and redundantly stores organization_id for
-- org-level queries / RLS, matching upstream organizationId + integrationId).

BEGIN;

CREATE TABLE IF NOT EXISTS public.plugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
    plug_function TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT '[]',
    activated BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.plugs IS 'Plugs`: org + integration FKs, plug_function, data JSON [{name,value}], activated. Separate from internal/post-compose plugs stored in post settings.';
COMMENT ON COLUMN public.plugs.organization_id IS 'Denormalized workspace scope.';
COMMENT ON COLUMN public.plugs.integration_id IS 'Channel scope.';

COMMIT;

-- ---------------------------
-- END OF FILE
-- ---------------------------

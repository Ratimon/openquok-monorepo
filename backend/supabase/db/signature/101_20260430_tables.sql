-- ---------------------------
-- MODULE NAME: signature
-- MODULE DATE: 20260430
-- MODULE SCOPE: Tables
-- ---------------------------
-- Workspace-scoped signatures.

BEGIN;

CREATE TABLE IF NOT EXISTS public.signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.signatures IS 'Workspace-scoped signatures/snippets for the composer (FK organizations.id).';
COMMENT ON COLUMN public.signatures.organization_id IS 'Owning workspace/organization.';
COMMENT ON COLUMN public.signatures.is_default IS 'When true, default signature for this organization.';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

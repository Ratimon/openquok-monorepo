-- ---------------------------
-- MODULE NAME: sets
-- MODULE DATE: 20260503
-- MODULE SCOPE: Tables
-- ---------------------------
-- Workspace-scoped presets (channel selections + composer snapshot JSON).

BEGIN;

CREATE TABLE IF NOT EXISTS public.sets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.sets IS 'Workspace-scoped presets grouping channels and composer snapshot JSON (FK organizations.id).';
COMMENT ON COLUMN public.sets.organization_id IS 'Owning workspace/organization.';
COMMENT ON COLUMN public.sets.content IS 'Opaque composer snapshot JSON (client-defined schema version).';

COMMIT;

-- ---------------------------
-- END OF FILE
-- ---------------------------

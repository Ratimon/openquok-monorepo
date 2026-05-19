-- ---------------------------
-- MODULE NAME: media
-- MODULE DATE: 20260519
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS public.media_virtual_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT media_virtual_folders_org_path_unique UNIQUE (organization_id, path)
);

COMMENT ON TABLE public.media_virtual_folders IS 'Empty virtual folders for the workspace media library (paths without media rows yet).';
COMMENT ON COLUMN public.media_virtual_folders.path IS 'Normalized virtual path (leading slash, no trailing slash), e.g. /General/Assets.';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

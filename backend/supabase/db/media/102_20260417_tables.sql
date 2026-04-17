-- ---------------------------
-- MODULE NAME: media
-- MODULE DATE: 20260417
-- MODULE SCOPE: Tables
-- ---------------------------

BEGIN;

CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    original_name TEXT,
    path TEXT NOT NULL,
    virtual_path TEXT NOT NULL DEFAULT '/',
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    file_size INT NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'image',
    thumbnail TEXT,
    alt TEXT,
    thumbnail_timestamp INT
);

COMMENT ON TABLE public.media IS 'Workspace media records that reference objects stored in external object storage.';
COMMENT ON COLUMN public.media.path IS 'Public URL or object key returned by storage; used to retrieve the file.';
COMMENT ON COLUMN public.media.virtual_path IS 'Virtual folder path within the workspace (UI-only). Does not affect object storage keys.';
COMMENT ON COLUMN public.media.type IS 'Logical media type label (e.g. image, video).';

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

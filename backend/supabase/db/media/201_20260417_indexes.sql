-- ---------------------------
-- MODULE NAME: media
-- MODULE DATE: 20260417
-- MODULE SCOPE: Indexes
-- ---------------------------

BEGIN;

CREATE INDEX IF NOT EXISTS idx_media_name ON public.media(name);
CREATE INDEX IF NOT EXISTS idx_media_organization_id ON public.media(organization_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(type);
CREATE INDEX IF NOT EXISTS idx_media_deleted_at ON public.media(deleted_at);

CREATE INDEX IF NOT EXISTS idx_media_org_virtual_path
ON public.media (organization_id, virtual_path)
WHERE deleted_at IS NULL;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

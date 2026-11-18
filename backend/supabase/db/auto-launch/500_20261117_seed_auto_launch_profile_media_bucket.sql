-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261117
-- MODULE SCOPE: Seed (profile media storage bucket)
-- ---------------------------
-- Object keys: {organizationId}/{profileId}/{filename}
-- Shared by directory launch destinations that upload logo + gallery via the API.

BEGIN;

INSERT INTO storage.buckets (
    id,
    name,
    public,
    avif_autodetection,
    file_size_limit,
    allowed_mime_types
) VALUES (
    'auto_launch_profile_media',
    'auto_launch_profile_media',
    TRUE,
    FALSE,
    4194304, -- 4MB limit (matches API upload cap)
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
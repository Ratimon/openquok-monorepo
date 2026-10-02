-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20261002
-- MODULE SCOPE: Seed (storage bucket link_directory_logos)
-- ---------------------------

BEGIN;

-- ---------------------------
-- Create Link Directory Logos Bucket
-- ---------------------------
INSERT INTO storage.buckets (
    id,
    name,
    public,
    avif_autodetection,
    file_size_limit,
    allowed_mime_types
) VALUES (
    'link_directory_logos',
    'link_directory_logos',
    TRUE,
    FALSE,
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

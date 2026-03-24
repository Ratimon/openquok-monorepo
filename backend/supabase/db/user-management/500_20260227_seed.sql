-- ---------------------------
-- MODULE NAME: User Management
-- MODULE DATE: 20260227
-- MODULE SCOPE: Seed
-- ---------------------------

BEGIN;

-- ---------------------------
-- Avatars
-- ---------------------------

INSERT INTO storage.buckets (
    id, 
    name, 
    owner, 
    created_at, 
    updated_at, 
    public, 
    avif_autodetection, 
    file_size_limit, 
    allowed_mime_types, 
    owner_id
) VALUES (
    'avatars', 
    'avatars', 
    NULL, 
    '2024-05-15 17:15:33.949923+00', 
    '2024-05-15 17:15:33.949923+00', 
    TRUE, 
    FALSE, 
    NULL, 
    NULL, 
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

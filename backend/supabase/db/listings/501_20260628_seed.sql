-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260628
-- MODULE SCOPE: Seed
-- ---------------------------

BEGIN;

INSERT INTO storage.buckets (
    id,
    name,
    public,
    avif_autodetection,
    file_size_limit,
    allowed_mime_types
) VALUES (
    'listing_images',
    'listing_images',
    TRUE,
    FALSE,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.module_configs (module_name, config) VALUES
(
    'listings',
    '{
  "EXTENSIONS_META_TITLE": "Extensions Hub",
  "EXTENSIONS_META_DESCRIPTION": "Browse skills and MCP server extensions for your agent stack.",
  "LISTING_SCHEMA_TYPE": "SoftwareApplication",
  "PRE_ADMIN_APPROVE_NEW_LISTINGS": false,
  "PRE_ADMIN_APPROVE_UPDATED_LISTINGS": true
}'::jsonb
)
ON CONFLICT (module_name) DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

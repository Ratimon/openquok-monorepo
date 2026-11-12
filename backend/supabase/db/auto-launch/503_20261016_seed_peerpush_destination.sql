-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261016
-- MODULE SCOPE: Seed (PeerPush free queue + Standard launch destinations)
-- ---------------------------
-- extension_config: synced from destination-configs/*.ts via 505_*_extension_configs.sql
-- PeerPush submit form: logo file upload uses extension file fill (no fillMode on file steps).
-- Tag-style discovery fields use fillMode "tags"; product description is plain text (profile HTML is stripped at fill/compare).

BEGIN;

INSERT INTO public.auto_launch_destinations (
    id,
    provider_slug,
    link_directory_opportunity_id,
    name,
    short_description,
    submission_path,
    start_url,
    extension_config,
    is_published,
    sort_order,
    picker_group_key,
    picker_group_title
)
SELECT
    'd5f7d000-0030-4000-a000-000000000004'::uuid,
    'peerpush-standard-launch'::text,
    o.id,
    'PeerPush — Standard launch',
    'Instant publish on PeerPush; extension autofills the submit flow at peerpush.com/submit.',
    'extension',
    'https://peerpush.com/submit',
    '{}'::jsonb,
    true,
    40,
    NULL::text,
    NULL::text
FROM public.link_directory_opportunities o
INNER JOIN public.link_directory_sites s ON s.id = o.site_id
WHERE s.slug = 'peerpush'
  AND o.slug = 'standard-launch'
ON CONFLICT (provider_slug) DO UPDATE SET
    link_directory_opportunity_id = EXCLUDED.link_directory_opportunity_id,
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    submission_path = EXCLUDED.submission_path,
    start_url = EXCLUDED.start_url,
    is_published = EXCLUDED.is_published,
    sort_order = EXCLUDED.sort_order,
    picker_group_key = EXCLUDED.picker_group_key,
    picker_group_title = EXCLUDED.picker_group_title,
    updated_at = NOW();

INSERT INTO public.auto_launch_destinations (
    id,
    provider_slug,
    link_directory_opportunity_id,
    name,
    short_description,
    submission_path,
    start_url,
    extension_config,
    is_published,
    sort_order,
    picker_group_key,
    picker_group_title
)
SELECT
    'd5f7d000-0030-4000-a000-000000000005'::uuid,
    'peerpush-free-queue'::text,
    o.id,
    'PeerPush — Free queue',
    'Free queue on PeerPush; extension autofills after you open pricing and start submit.',
    'extension',
    'https://peerpush.com/pricing',
    '{}'::jsonb,
    true,
    35,
    NULL::text,
    NULL::text
FROM public.link_directory_opportunities o
INNER JOIN public.link_directory_sites s ON s.id = o.site_id
WHERE s.slug = 'peerpush'
  AND o.slug = 'free-queue'
ON CONFLICT (provider_slug) DO UPDATE SET
    link_directory_opportunity_id = EXCLUDED.link_directory_opportunity_id,
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    submission_path = EXCLUDED.submission_path,
    start_url = EXCLUDED.start_url,
    is_published = EXCLUDED.is_published,
    sort_order = EXCLUDED.sort_order,
    picker_group_key = EXCLUDED.picker_group_key,
    picker_group_title = EXCLUDED.picker_group_title,
    updated_at = NOW();

COMMIT;

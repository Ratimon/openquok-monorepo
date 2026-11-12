-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261108
-- MODULE SCOPE: Seed (Open Launch premium + free queue destinations)
-- ---------------------------
-- extension_config: synced from destination-configs/*.ts via 505_*_extension_configs.sql
-- Joins link_directory_opportunities on site slug open-launch (CMS / listing manager in production).
-- Launch date and Review steps are user-completed in v1 (no autofilled fields).

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
    'd5f7d000-0030-4000-a000-000000000006'::uuid,
    'open-launch-premium-launch'::text,
    o.id,
    'Open Launch — Premium launch',
    'Premium slot on Open Launch; extension autofills the submit wizard at open-launch.com/projects/submit.',
    'extension',
    'https://open-launch.com/projects/submit',
    '{}'::jsonb,
    true,
    45,
    'open-launch'::text,
    'Open Launch'::text
FROM public.link_directory_opportunities o
INNER JOIN public.link_directory_sites s ON s.id = o.site_id
WHERE s.slug = 'open-launch'
  AND o.slug = 'premium-launch'
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
    'd5f7d000-0030-4000-a000-000000000007'::uuid,
    'open-launch-free-launch'::text,
    o.id,
    'Open Launch — Free launch',
    'Free queue on Open Launch; extension autofills after you open pricing and start submit.',
    'extension',
    'https://open-launch.com/pricing',
    '{}'::jsonb,
    true,
    42,
    'open-launch'::text,
    'Open Launch'::text
FROM public.link_directory_opportunities o
INNER JOIN public.link_directory_sites s ON s.id = o.site_id
WHERE s.slug = 'open-launch'
  AND o.slug = 'free-launch'
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

-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261117
-- MODULE SCOPE: Seed (TinyLaunch premium + Standard queue destinations)
-- ---------------------------
-- extension_config: embedded on INSERT from destination-configs/*.ts; refreshed via 502_*_extension_configs.sql
-- Joins link_directory_opportunities on site slug tinylaunch (catalog backfill / listing manager).
-- Scheduling, payment, and upvote pledge stay manual after the create-startup form is filled.

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
    'd5f7d000-0030-4000-a000-000000000008'::uuid,
    'tinylaunch-premium-launch'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'tinylaunch'
          AND o.slug = 'premium-launch'
        LIMIT 1
    ),
    'TinyLaunch — Premium launch',
    'Premium launch on TinyLaunch; extension autofills the create-startup form at tinylaunch.com/dashboard/startups/new.',
    'extension',
    'https://www.tinylaunch.com/dashboard/startups/new',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://tinylaunch.com/*",
        "https://www.tinylaunch.com/*"
    ],
    "readyUrlHint": "dashboard/startups",
    "steps": [
        {
            "id": "create_startup",
            "label": "Create startup",
            "fields": [
                {
                    "key": "name",
                    "label": "Startup Name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "maxScalarLength": 30,
                    "required": true,
                    "selectorHint": "input[name*='name' i], input[placeholder*='startup name' i], input[aria-label*='startup name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "maxScalarLength": 60,
                    "required": true,
                    "selectorHint": "input[name*='tagline' i], textarea[name*='tagline' i], input[placeholder*='tagline' i], textarea[placeholder*='tagline' i]"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "required": true,
                    "selectorHint": "input[type='file'][accept*='image']"
                },
                {
                    "key": "gallery",
                    "label": "Images",
                    "labelAliases": [
                        "Screenshots",
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "maxItems": 3,
                    "selectorHint": "input[type='file'][accept*='image']"
                },
                {
                    "key": "website",
                    "label": "Website URL",
                    "labelAliases": [
                        "Website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[type='url'], input[name*='website' i], input[name*='url' i], input[placeholder*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Description",
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='description' i], textarea[placeholder*='description' i]"
                },
                {
                    "key": "category",
                    "label": "Category",
                    "profilePath": "profile_data.category",
                    "fillMode": "select",
                    "selectCatalog": "tinylaunch",
                    "required": true,
                    "selectorHint": "select[name*='categor' i], [role='combobox'][aria-label*='categor' i], button[aria-label*='categor' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/dashboard/startups/",
        "listingUrlSelector": "a[href*='tinylaunch.com'][href*='/startups/']"
    }
}$json$::jsonb,
    true,
    48,
    'tinylaunch'::text,
    'TinyLaunch'::text
ON CONFLICT (provider_slug) DO UPDATE SET
    link_directory_opportunity_id = EXCLUDED.link_directory_opportunity_id,
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    submission_path = EXCLUDED.submission_path,
    start_url = EXCLUDED.start_url,
    extension_config = EXCLUDED.extension_config,
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
    'd5f7d000-0030-4000-a000-000000000009'::uuid,
    'tinylaunch-standard-launch'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'tinylaunch'
          AND o.slug = 'standard-launch'
        LIMIT 1
    ),
    'TinyLaunch — Standard launch',
    'Free Standard queue on TinyLaunch; extension autofills after you open pricing and create your startup.',
    'extension',
    'https://www.tinylaunch.com/pricing',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://tinylaunch.com/*",
        "https://www.tinylaunch.com/*"
    ],
    "readyUrlHint": "pricing",
    "steps": [
        {
            "id": "create_startup",
            "label": "Create startup",
            "fields": [
                {
                    "key": "name",
                    "label": "Startup Name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "maxScalarLength": 30,
                    "required": true,
                    "selectorHint": "input[name*='name' i], input[placeholder*='startup name' i], input[aria-label*='startup name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "maxScalarLength": 60,
                    "required": true,
                    "selectorHint": "input[name*='tagline' i], textarea[name*='tagline' i], input[placeholder*='tagline' i], textarea[placeholder*='tagline' i]"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "required": true,
                    "selectorHint": "input[type='file'][accept*='image']"
                },
                {
                    "key": "gallery",
                    "label": "Images",
                    "labelAliases": [
                        "Screenshots",
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "maxItems": 3,
                    "selectorHint": "input[type='file'][accept*='image']"
                },
                {
                    "key": "website",
                    "label": "Website URL",
                    "labelAliases": [
                        "Website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[type='url'], input[name*='website' i], input[name*='url' i], input[placeholder*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Description",
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='description' i], textarea[placeholder*='description' i]"
                },
                {
                    "key": "category",
                    "label": "Category",
                    "profilePath": "profile_data.category",
                    "fillMode": "select",
                    "selectCatalog": "tinylaunch",
                    "required": true,
                    "selectorHint": "select[name*='categor' i], [role='combobox'][aria-label*='categor' i], button[aria-label*='categor' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/dashboard/startups/",
        "listingUrlSelector": "a[href*='tinylaunch.com'][href*='/startups/']"
    }
}$json$::jsonb,
    true,
    46,
    'tinylaunch'::text,
    'TinyLaunch'::text
ON CONFLICT (provider_slug) DO UPDATE SET
    link_directory_opportunity_id = EXCLUDED.link_directory_opportunity_id,
    name = EXCLUDED.name,
    short_description = EXCLUDED.short_description,
    submission_path = EXCLUDED.submission_path,
    start_url = EXCLUDED.start_url,
    extension_config = EXCLUDED.extension_config,
    is_published = EXCLUDED.is_published,
    sort_order = EXCLUDED.sort_order,
    picker_group_key = EXCLUDED.picker_group_key,
    picker_group_title = EXCLUDED.picker_group_title,
    updated_at = NOW();

COMMIT;

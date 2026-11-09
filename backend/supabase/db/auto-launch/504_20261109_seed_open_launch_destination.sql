-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261108
-- MODULE SCOPE: Seed (Open Launch premium + free queue destinations + extension_config)
-- ---------------------------
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
    $json${
        "version": 1,
        "startUrlPatterns": [
            "https://open-launch.com/*",
            "https://www.open-launch.com/*"
        ],
        "readyUrlHint": "submit",
        "steps": [
            {
                "id": "project_info",
                "label": "Project Info",
                "fields": [
                    {
                        "key": "name",
                        "label": "Project name",
                        "profilePath": "name",
                        "fillMode": "text",
                        "selectorHint": "input[name*='name' i], input[placeholder*='project name' i], input[aria-label*='name' i]"
                    },
                    {
                        "key": "website",
                        "label": "Website URL",
                        "profilePath": "website_url",
                        "fillMode": "text",
                        "selectorHint": "input[type='url'], input[name*='website' i], input[name*='url' i], input[placeholder*='website' i]"
                    },
                    {
                        "key": "description",
                        "label": "Short description",
                        "profilePath": "description",
                        "fillMode": "rich_html",
                        "selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='description' i], textarea[placeholder*='description' i]"
                    },
                    {
                        "key": "logo",
                        "label": "Logo",
                        "profilePath": "logo_url",
                        "fillMode": "file",
                        "fileInputIndex": 0,
                        "selectorHint": "input[type='file'][accept*='image']"
                    },
                    {
                        "key": "product_image",
                        "label": "Product image",
                        "profilePath": "profile_data.gallery_urls",
                        "fillMode": "files",
                        "fileInputIndex": 1,
                        "selectorHint": "input[type='file'][accept*='image']"
                    }
                ]
            },
            {
                "id": "details",
                "label": "Details",
                "fields": [
                    {
                        "key": "categories",
                        "label": "Categories",
                        "profilePath": "profile_data.categories",
                        "fillMode": "tags",
                        "selectorHint": "input[name*='categor' i], [placeholder*='categor' i], [role='combobox'][aria-label*='categor' i], fieldset input[type='checkbox']"
                    },
                    {
                        "key": "tech_stack",
                        "label": "Tech stack",
                        "profilePath": "profile_data.tech_stack",
                        "fillMode": "tags",
                        "selectorHint": "input[name*='tech' i], [placeholder*='tech' i], [aria-label*='tech stack' i], [aria-label*='stack' i]"
                    },
                    {
                        "key": "platforms",
                        "label": "Platforms",
                        "profilePath": "profile_data.platforms",
                        "fillMode": "tags",
                        "selectorHint": "input[name*='platform' i], [placeholder*='platform' i], [aria-label*='platform' i], fieldset input[type='checkbox']"
                    },
                    {
                        "key": "pricing_type",
                        "label": "Pricing model",
                        "profilePath": "profile_data.pricing_type",
                        "fillMode": "select",
                        "selectorHint": "select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i], button[aria-label*='pricing' i]"
                    },
                    {
                        "key": "social_github",
                        "label": "GitHub",
                        "profilePath": "profile_data.social_github",
                        "fillMode": "text",
                        "selectorHint": "input[name*='github' i], input[placeholder*='github' i], input[aria-label*='github' i]"
                    },
                    {
                        "key": "social_x",
                        "label": "X (Twitter)",
                        "profilePath": "profile_data.social_x",
                        "fillMode": "text",
                        "selectorHint": "input[name*='twitter' i], input[name*='x.com' i], input[placeholder*='twitter' i], input[aria-label*='twitter' i]"
                    }
                ]
            }
        ],
        "proof": {
            "successPathRegex": "/projects/|/submit",
            "listingUrlSelector": "a[href*='open-launch.com/projects/']"
        }
    }$json$::jsonb,
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
    'd5f7d000-0030-4000-a000-000000000007'::uuid,
    'open-launch-free-launch'::text,
    o.id,
    'Open Launch — Free launch',
    'Free queue on Open Launch; extension autofills after you open pricing and start submit.',
    'extension',
    'https://open-launch.com/pricing',
    jsonb_set(COALESCE(prem.extension_config, '{}'::jsonb), '{readyUrlHint}', '"pricing"'::jsonb),
    true,
    42,
    'open-launch'::text,
    'Open Launch'::text
FROM public.link_directory_opportunities o
INNER JOIN public.link_directory_sites s ON s.id = o.site_id
CROSS JOIN LATERAL (
    SELECT extension_config
    FROM public.auto_launch_destinations
    WHERE provider_slug = 'open-launch-premium-launch'
    LIMIT 1
) prem
WHERE s.slug = 'open-launch'
  AND o.slug = 'free-launch'
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

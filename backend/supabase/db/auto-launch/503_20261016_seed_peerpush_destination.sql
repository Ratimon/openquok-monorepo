-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261016
-- MODULE SCOPE: Seed (PeerPush free queue + Standard launch destinations + extension_config)
-- ---------------------------
-- PeerPush submit form: logo file upload uses extension file fill (no fillMode on file steps).
-- Tag-style discovery fields use fillMode "tags"; description uses rich_html where the editor is ProseMirror-like.

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
    $json${
        "version": 1,
        "startUrlPatterns": [
            "https://peerpush.com/*",
            "https://www.peerpush.com/*"
        ],
        "readyUrlHint": "submit",
        "steps": [
            {
                "id": "basic",
                "label": "Basic",
                "fields": [
                    {
                        "key": "name",
                        "label": "Product name",
                        "profilePath": "name",
                        "fillMode": "text",
                        "selectorHint": "input[name*='name' i], input[placeholder*='product name' i], input[aria-label*='name' i]"
                    },
                    {
                        "key": "tagline",
                        "label": "Tagline",
                        "profilePath": "tagline",
                        "fillMode": "text",
                        "selectorHint": "input[name*='tagline' i], textarea[name*='tagline' i], input[placeholder*='tagline' i], input[aria-label*='tagline' i]"
                    },
                    {
                        "key": "description",
                        "label": "Description",
                        "profilePath": "description",
                        "fillMode": "rich_html",
                        "selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='description' i], textarea[placeholder*='description' i]"
                    },
                    {
                        "key": "website",
                        "label": "Website",
                        "profilePath": "website_url",
                        "fillMode": "text",
                        "selectorHint": "input[type='url'], input[name*='website' i], input[name*='url' i], input[placeholder*='website' i]"
                    },
                    {
                        "key": "logo",
                        "label": "Logo",
                        "profilePath": "logo_url",
                        "fillMode": "file",
                        "fileInputIndex": 0,
                        "selectorHint": "input[type='file'][accept*='image']"
                    }
                ]
            },
            {
                "id": "discovery",
                "label": "Discovery",
                "fields": [
                    {
                        "key": "categories",
                        "label": "Categories",
                        "profilePath": "profile_data.categories",
                        "fillMode": "tags",
                        "selectorHint": "input[name*='categor' i], [placeholder*='categor' i], [role='combobox'][aria-label*='categor' i]"
                    },
                    {
                        "key": "use_cases",
                        "label": "Use cases",
                        "profilePath": "profile_data.use_cases",
                        "fillMode": "tags",
                        "selectorHint": "input[name*='use' i][name*='case' i], [placeholder*='use case' i], [aria-label*='use case' i]"
                    },
                    {
                        "key": "target_audiences",
                        "label": "Target audience",
                        "profilePath": "profile_data.target_audiences",
                        "fillMode": "tags",
                        "selectorHint": "input[name*='audience' i], [placeholder*='audience' i], [aria-label*='audience' i]"
                    },
                    {
                        "key": "pricing_type",
                        "label": "Pricing",
                        "profilePath": "profile_data.pricing_type",
                        "fillMode": "select",
                        "selectorHint": "select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i], button[aria-label*='pricing' i]"
                    },
                    {
                        "key": "platforms",
                        "label": "Platforms",
                        "profilePath": "profile_data.platforms",
                        "fillMode": "tags",
                        "selectorHint": "input[name*='platform' i], [placeholder*='platform' i], [aria-label*='platform' i]"
                    },
                    {
                        "key": "alternatives",
                        "label": "Similar products",
                        "profilePath": "profile_data.alternatives",
                        "fillMode": "tags",
                        "selectorHint": "input[name*='alternative' i], input[name*='similar' i], [placeholder*='alternative' i], [placeholder*='similar' i]"
                    },
                    {
                        "key": "monthly_revenue_usd",
                        "label": "Monthly recurring revenue (optional)",
                        "profilePath": "profile_data.monthly_revenue_usd",
                        "fillMode": "text",
                        "selectorHint": "input[name*='mrr' i], input[name*='monthly' i][name*='revenue' i], input[placeholder*='MRR' i], input[aria-label*='revenue' i]"
                    }
                ]
            },
            {
                "id": "media",
                "label": "Media",
                "fields": [
                    {
                        "key": "gallery",
                        "label": "Screenshots",
                        "profilePath": "profile_data.gallery_urls",
                        "fillMode": "files",
                        "fileInputIndex": 1,
                        "selectorHint": "input[type='file'][accept*='image']"
                    }
                ]
            }
        ],
        "proof": {
            "successPathRegex": "/p/|/submit",
            "listingUrlSelector": "a[href*='peerpush.com/p/']"
        }
    }$json$::jsonb,
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
    'd5f7d000-0030-4000-a000-000000000005'::uuid,
    'peerpush-free-queue'::text,
    o.id,
    'PeerPush — Free queue',
    'Free queue on PeerPush; extension autofills after you open pricing and start submit.',
    'extension',
    'https://peerpush.com/pricing',
    jsonb_set(COALESCE(std.extension_config, '{}'::jsonb), '{readyUrlHint}', '"pricing"'::jsonb),
    true,
    35,
    NULL::text,
    NULL::text
FROM public.link_directory_opportunities o
INNER JOIN public.link_directory_sites s ON s.id = o.site_id
CROSS JOIN LATERAL (
    SELECT extension_config
    FROM public.auto_launch_destinations
    WHERE provider_slug = 'peerpush-standard-launch'
    LIMIT 1
) std
WHERE s.slug = 'peerpush'
  AND o.slug = 'free-queue'
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

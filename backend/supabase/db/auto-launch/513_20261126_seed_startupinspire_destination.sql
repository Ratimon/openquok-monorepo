-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261126
-- MODULE SCOPE: Seed (StartupInspire free listing + Starter launch destinations)
-- ---------------------------
-- extension_config: embedded on INSERT from destination-configs/*.ts; refreshed via 502_*_extension_configs.sql
-- Joins link_directory_opportunities on site slug startupinspire (catalog backfill / listing manager).
-- Starter checkout, manual review queue, social links, reCAPTCHA, and publish stay manual after the form is filled.

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
    'd5f7d000-0030-4000-a000-000000000026'::uuid,
    'startupinspire-paid-listing'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'startupinspire'
          AND o.slug = 'starter-launch'
        LIMIT 1
    ),
    'StartupInspire — Starter launch',
    'Paid Starter launch on StartupInspire; extension autofills the dashboard startup create form after you sign in.',
    'extension',
    'https://www.startupinspire.com/dashboard/startup/create',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://startupinspire.com/*",
        "https://www.startupinspire.com/*"
    ],
    "readyUrlHint": "dashboard/startup",
    "readyStatusHint": "Sign in on StartupInspire, then open the startup create or edit form before Fill. OpenQuok fills startup name, headline, description, website URL, logo, and technology/category when the form is visible. Starter checkout, free-tier manual review, launch status, social links (LinkedIn, X, Product Hunt, …), reCAPTCHA, and final publish stay manual on StartupInspire. After publish, confirm the website button on your public `/startup/{slug}` page has the link treatment you expect.",
    "steps": [
        {
            "id": "create_startup",
            "label": "Create startup",
            "fields": [
                {
                    "key": "name",
                    "label": "Startup name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[formcontrolname='startup_name'], input[name='startup_name'], input[aria-label*='startup name' i], input[placeholder*='startup name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Headline",
                    "labelAliases": [
                        "Tagline",
                        "Startup headline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[formcontrolname='startup_headline'], input[name='startup_headline'], input[aria-label*='headline' i], input[placeholder*='headline' i]"
                },
                {
                    "key": "description",
                    "label": "Description",
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "textarea[formcontrolname='startup_description'], textarea[name='startup_description'], [contenteditable='true'], .ProseMirror, .tiptap, textarea[aria-label*='description' i]"
                },
                {
                    "key": "website",
                    "label": "Website URL",
                    "labelAliases": [
                        "Website",
                        "Startup URL"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[formcontrolname='startup_url'], input[name='startup_url'], input[type='url'], input[aria-label*='website' i], input[placeholder*='website' i]"
                },
                {
                    "key": "technology",
                    "label": "Technology Stack",
                    "labelAliases": [
                        "Technology",
                        "Tech stack"
                    ],
                    "profilePath": "profile_data.tech_stack",
                    "fillMode": "tags",
                    "maxItems": 10,
                    "profileSourcePaths": [
                        "profile_data.tech_stack"
                    ],
                    "selectorHint": "p-multiselect[formcontrolname='startup_technology'], [formcontrolname='startup_technology'].p-multiselect"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "labelAliases": [
                        "Startup logo",
                        "Upload Your Logo",
                        "Replace Logo"
                    ],
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "required": true,
                    "selectorHint": "app-upload-single input[type=\"file\"], input[type=\"file\"][accept*=\"image\"]"
                },
                {
                    "key": "gallery",
                    "label": "Screenshots",
                    "labelAliases": [
                        "Add Screenshots",
                        "Product screenshots"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "maxItems": 5,
                    "selectorHint": "app-upload input[type=\"file\"], .upload-trigger input[type=\"file\"][multiple]"
                }
            ]
        },
        {
            "id": "social_and_launch",
            "label": "Social & launch",
            "fields": []
        }
    ],
    "proof": {
        "successPathRegex": "/startup/",
        "listingUrlSelector": "a[href*='startupinspire.com/startup/']"
    }
}$json$::jsonb,
    true,
    78,
    'startupinspire'::text,
    'StartupInspire'::text
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
    'd5f7d000-0030-4000-a000-000000000027'::uuid,
    'startupinspire-free-listing'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'startupinspire'
          AND o.slug = 'free-listing'
        LIMIT 1
    ),
    'StartupInspire — Free listing',
    'Free StartupInspire listing queue; extension autofills after you open the dashboard create form (use pricing when you need the free tier).',
    'extension',
    'https://www.startupinspire.com/dashboard',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://startupinspire.com/*",
        "https://www.startupinspire.com/*"
    ],
    "readyUrlHint": "pricing",
    "readyStatusHint": "Open StartupInspire pricing, sign in if needed, then continue to the free tier or Starter checkout before the create form. Sign in on StartupInspire, then open the startup create or edit form before Fill. Starter checkout, free-tier manual review, launch status, social links (LinkedIn, X, Product Hunt, …), reCAPTCHA, and final publish stay manual on StartupInspire.",
    "steps": [
        {
            "id": "create_startup",
            "label": "Create startup",
            "fields": [
                {
                    "key": "name",
                    "label": "Startup name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[formcontrolname='startup_name'], input[name='startup_name'], input[aria-label*='startup name' i], input[placeholder*='startup name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Headline",
                    "labelAliases": [
                        "Tagline",
                        "Startup headline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[formcontrolname='startup_headline'], input[name='startup_headline'], input[aria-label*='headline' i], input[placeholder*='headline' i]"
                },
                {
                    "key": "description",
                    "label": "Description",
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "textarea[formcontrolname='startup_description'], textarea[name='startup_description'], [contenteditable='true'], .ProseMirror, .tiptap, textarea[aria-label*='description' i]"
                },
                {
                    "key": "website",
                    "label": "Website URL",
                    "labelAliases": [
                        "Website",
                        "Startup URL"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[formcontrolname='startup_url'], input[name='startup_url'], input[type='url'], input[aria-label*='website' i], input[placeholder*='website' i]"
                },
                {
                    "key": "technology",
                    "label": "Technology Stack",
                    "labelAliases": [
                        "Technology",
                        "Tech stack"
                    ],
                    "profilePath": "profile_data.tech_stack",
                    "fillMode": "tags",
                    "maxItems": 10,
                    "profileSourcePaths": [
                        "profile_data.tech_stack"
                    ],
                    "selectorHint": "p-multiselect[formcontrolname='startup_technology'], [formcontrolname='startup_technology'].p-multiselect"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "labelAliases": [
                        "Startup logo",
                        "Upload Your Logo",
                        "Replace Logo"
                    ],
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "required": true,
                    "selectorHint": "app-upload-single input[type=\"file\"], input[type=\"file\"][accept*=\"image\"]"
                },
                {
                    "key": "gallery",
                    "label": "Screenshots",
                    "labelAliases": [
                        "Add Screenshots",
                        "Product screenshots"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "maxItems": 5,
                    "selectorHint": "app-upload input[type=\"file\"], .upload-trigger input[type=\"file\"][multiple]"
                }
            ]
        },
        {
            "id": "social_and_launch",
            "label": "Social & launch",
            "fields": []
        }
    ],
    "proof": {
        "successPathRegex": "/startup/",
        "listingUrlSelector": "a[href*='startupinspire.com/startup/']"
    }
}$json$::jsonb,
    true,
    76,
    'startupinspire'::text,
    'StartupInspire'::text
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

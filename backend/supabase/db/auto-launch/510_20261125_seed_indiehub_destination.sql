-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261125
-- MODULE SCOPE: Seed (IndieHub Basic and Pro launch destinations)
-- ---------------------------
-- extension_config: embedded on INSERT from destination-configs/*.ts; refreshed via 502_*_extension_configs.sql
-- Joins link_directory_opportunities on site slug indiehub (catalog backfill / listing manager).
-- Payment (step 2) and Publish (step 3) stay manual after OpenQuok fills submit step 1 (Details).

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
    'd5f7d000-0030-4000-a000-000000000019'::uuid,
    'indiehub-basic-launch'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'indiehub'
          AND o.slug = 'basic-launch'
        LIMIT 1
    ),
    'IndieHub — Basic launch',
    'Basic listing ($4.9) on IndieHub with dofollow links and no badge requirement. Extension autofills submit step 1 (Details) after you sign in.',
    'extension',
    'https://indiehub.best/submit',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://indiehub.best/*"
    ],
    "readyUrlHint": "submit",
    "readyStatusHint": "Sign in on IndieHub and open submit step 1 (Details) for a Basic listing ($4.9). If IndieHub AI AutoFill prefills from your website link, skip or review it before OpenQuok fills the form. On step 2 (Payment), choose Basic and checkout on IndieHub. Payment (step 2) and Publish (step 3) stay manual on IndieHub.",
    "steps": [
        {
            "id": "submit_details",
            "label": "Details",
            "fields": [
                {
                    "key": "website",
                    "label": "Link",
                    "labelAliases": [
                        "Website",
                        "Website URL",
                        "URL"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name='link'], input[type='url'][name='link'], form input[name*='link' i]:not([aria-label*='autofill' i])"
                },
                {
                    "key": "name",
                    "label": "Name",
                    "labelAliases": [
                        "Product name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name='name'], input[aria-label*='name' i], input[placeholder*='name' i]"
                },
                {
                    "key": "categories",
                    "label": "Categories",
                    "profilePath": "profile_data.categories",
                    "fillMode": "tags",
                    "tagsCatalog": "indiehub_categories",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "required": true,
                    "selectorHint": "input[role='combobox'], input[name*='categor' i], input[placeholder*='categor' i], [aria-label*='categor' i]"
                },
                {
                    "key": "tags",
                    "label": "Tags",
                    "profilePath": "profile_data.tags",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "selectorHint": "input[role='combobox'], input[name*='tag' i], input[placeholder*='tag' i], [aria-label*='tag' i]"
                },
                {
                    "key": "tagline",
                    "label": "Description",
                    "labelAliases": [
                        "Short description"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "textarea[name*='description' i]:not([name*='intro' i]), input[name*='tagline' i], input[placeholder*='short' i]"
                },
                {
                    "key": "description",
                    "label": "Introduction",
                    "labelAliases": [
                        "Introduction (Markdown supported)",
                        "Markdown"
                    ],
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='intro' i], textarea[name*='markdown' i]"
                },
                {
                    "key": "logo",
                    "label": "Icon",
                    "labelAliases": [
                        "Logo"
                    ],
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "required": true,
                    "selectorHint": "input[type='file'][name*='icon' i], input[type='file'][name*='logo' i]"
                },
                {
                    "key": "cover",
                    "label": "Image",
                    "labelAliases": [
                        "Cover",
                        "Banner"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "maxItems": 1,
                    "required": true,
                    "selectorHint": "input[type='file'][name*='banner' i], input[type='file'][name*='cover' i], input[type='file'][name*='image' i]:not([name*='icon' i]):not([name*='logo' i])"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/product/|/submit",
        "listingUrlSelector": "a[href*='indiehub.best/product/'], a[href*='indiehub.best/products/']"
    }
}$json$::jsonb,
    true,
    62,
    'indiehub'::text,
    'IndieHub'::text
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
    'd5f7d000-0030-4000-a000-000000000020'::uuid,
    'indiehub-pro-launch'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'indiehub'
          AND o.slug = 'pro-launch'
        LIMIT 1
    ),
    'IndieHub — Pro launch',
    'Pro listing ($9.9) on IndieHub with stronger placement and more dofollow links than Basic. Extension autofills step 1; payment and publish stay manual.',
    'extension',
    'https://indiehub.best/submit',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://indiehub.best/*"
    ],
    "readyUrlHint": "submit",
    "readyStatusHint": "Sign in on IndieHub and open submit step 1 (Details) for a Pro listing ($9.9). If IndieHub AI AutoFill prefills from your website link, skip or review it before OpenQuok fills the form. On step 2 (Payment), choose Pro and checkout on IndieHub. Payment (step 2) and Publish (step 3) stay manual on IndieHub.",
    "steps": [
        {
            "id": "submit_details",
            "label": "Details",
            "fields": [
                {
                    "key": "website",
                    "label": "Link",
                    "labelAliases": [
                        "Website",
                        "Website URL",
                        "URL"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name='link'], input[type='url'][name='link'], form input[name*='link' i]:not([aria-label*='autofill' i])"
                },
                {
                    "key": "name",
                    "label": "Name",
                    "labelAliases": [
                        "Product name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name='name'], input[aria-label*='name' i], input[placeholder*='name' i]"
                },
                {
                    "key": "categories",
                    "label": "Categories",
                    "profilePath": "profile_data.categories",
                    "fillMode": "tags",
                    "tagsCatalog": "indiehub_categories",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "required": true,
                    "selectorHint": "input[role='combobox'], input[name*='categor' i], input[placeholder*='categor' i], [aria-label*='categor' i]"
                },
                {
                    "key": "tags",
                    "label": "Tags",
                    "profilePath": "profile_data.tags",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "selectorHint": "input[role='combobox'], input[name*='tag' i], input[placeholder*='tag' i], [aria-label*='tag' i]"
                },
                {
                    "key": "tagline",
                    "label": "Description",
                    "labelAliases": [
                        "Short description"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "textarea[name*='description' i]:not([name*='intro' i]), input[name*='tagline' i], input[placeholder*='short' i]"
                },
                {
                    "key": "description",
                    "label": "Introduction",
                    "labelAliases": [
                        "Introduction (Markdown supported)",
                        "Markdown"
                    ],
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='intro' i], textarea[name*='markdown' i]"
                },
                {
                    "key": "logo",
                    "label": "Icon",
                    "labelAliases": [
                        "Logo"
                    ],
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "required": true,
                    "selectorHint": "input[type='file'][name*='icon' i], input[type='file'][name*='logo' i]"
                },
                {
                    "key": "cover",
                    "label": "Image",
                    "labelAliases": [
                        "Cover",
                        "Banner"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "maxItems": 1,
                    "required": true,
                    "selectorHint": "input[type='file'][name*='banner' i], input[type='file'][name*='cover' i], input[type='file'][name*='image' i]:not([name*='icon' i]):not([name*='logo' i])"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/product/|/submit",
        "listingUrlSelector": "a[href*='indiehub.best/product/'], a[href*='indiehub.best/products/']"
    }
}$json$::jsonb,
    true,
    64,
    'indiehub'::text,
    'IndieHub'::text
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

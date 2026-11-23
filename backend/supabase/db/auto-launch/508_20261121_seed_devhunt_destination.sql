-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261121
-- MODULE SCOPE: Seed (DevHunt free listing + paid launch destinations)
-- ---------------------------
-- extension_config: embedded on INSERT from destination-configs/*.ts; refreshed via 502_*_extension_configs.sql
-- Joins link_directory_opportunities on site slug devhunt (catalog backfill / listing manager).
-- Launch week, $49 checkout, and maker comment stay manual after the tool form is filled.

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
    'd5f7d000-0030-4000-a000-000000000014'::uuid,
    'devhunt-standard-launch'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'devhunt'
          AND o.slug = 'standard-launch'
        LIMIT 1
    ),
    'DevHunt — Free listing',
    'Free listing on DevHunt with a nofollow tool-page link; extension autofills after you sign in.',
    'extension',
    'https://devhunt.org/account/tools/new',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://devhunt.org/*"
    ],
    "readyUrlHint": "account/tools/new",
    "readyStatusHint": "Sign in on DevHunt and open the new-tool form for a free listing. Skip or review any AI draft from your website URL, then use OpenQuok on the tool form. Free listings use a nofollow link on the tool page.",
    "steps": [
        {
            "id": "submit_tool",
            "label": "Submit tool",
            "fields": [
                {
                    "key": "logo",
                    "label": "Tool logo",
                    "labelAliases": [
                        "Logo"
                    ],
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "required": true,
                    "selectorHint": "input[type='file'][accept*='image'], input[type='file'][accept*='png' i]"
                },
                {
                    "key": "gallery",
                    "label": "Tool screenshots",
                    "labelAliases": [
                        "Screenshots",
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 0,
                    "maxItems": 3,
                    "required": true,
                    "selectorHint": "#tool-screenshots-container input[type='file']"
                },
                {
                    "key": "name",
                    "label": "Tool name",
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[placeholder*='My Awesome Dev Tool' i], input[name*='tool_name' i], input[aria-label*='tool name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Catchy slogan",
                    "labelAliases": [
                        "Slogan",
                        "Tagline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[placeholder*='Supercharge Your Development Workflow' i], input[name*='slogan' i], textarea[name*='slogan' i]"
                },
                {
                    "key": "website",
                    "label": "Tool website URL",
                    "labelAliases": [
                        "Website URL",
                        "Website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[placeholder*='myawesomedevtool' i], input[type='url'], input[name*='tool_website' i], input[name*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Quick Description",
                    "labelAliases": [
                        "Description"
                    ],
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "textarea[placeholder*='Briefly explain what your tool does' i], [contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='tool_description' i]"
                },
                {
                    "key": "social_github",
                    "label": "GitHub repo URL",
                    "labelAliases": [
                        "GitHub repo URL (optional)",
                        "GitHub"
                    ],
                    "profilePath": "profile_data.social_github",
                    "fillMode": "text",
                    "selectorHint": "input[placeholder*='github.com/username' i], input[name*='github' i], input[name*='github_repo' i]",
                    "profileSourcePaths": [
                        "profile_data.repository_url"
                    ]
                },
                {
                    "key": "pricing_type",
                    "label": "Tool pricing type",
                    "labelAliases": [
                        "Pricing type",
                        "Pricing"
                    ],
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectCatalog": "devhunt_pricing",
                    "selectorHint": "#pricing-container input[type='radio'][name='pricing_type'], input[type='radio'][name='pricing_type'], input[type='radio'][name*='pricing_type' i]"
                },
                {
                    "key": "categories",
                    "label": "Tool categories",
                    "labelAliases": [
                        "Categories"
                    ],
                    "profilePath": "profile_data.categories",
                    "fillMode": "tags",
                    "selectorHint": "input[name*='categor' i], input[placeholder*='categor' i], [aria-label*='categor' i]"
                },
                {
                    "key": "demo_video",
                    "label": "Demo video",
                    "labelAliases": [
                        "Demo video (optional)"
                    ],
                    "profilePath": "profile_data.launch_video_url",
                    "fillMode": "text",
                    "selectorHint": "input[placeholder*='Demo video (optional)' i], input[name*='demo_video' i], input[type='url'][placeholder*='video' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/tool/|/account/tools",
        "listingUrlSelector": "a[href*='devhunt.org/tool/']"
    }
}$json$::jsonb,
    true,
    53,
    'devhunt'::text,
    'DevHunt'::text
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
    'd5f7d000-0030-4000-a000-000000000013'::uuid,
    'devhunt-paid-launch'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'devhunt'
          AND o.slug = 'paid-launch'
        LIMIT 1
    ),
    'DevHunt — Paid launch',
    '$49 launch week on DevHunt for a dofollow link; extension autofills account/tools/new after you sign in.',
    'extension',
    'https://devhunt.org/account/tools/new',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://devhunt.org/*"
    ],
    "readyUrlHint": "account/tools/new",
    "readyStatusHint": "Sign in on DevHunt, then open the new-tool form. Skip or review any AI draft from your website URL, then use OpenQuok on the tool form. Launch week and $49 checkout stay manual on DevHunt.",
    "steps": [
        {
            "id": "submit_tool",
            "label": "Submit tool",
            "fields": [
                {
                    "key": "logo",
                    "label": "Tool logo",
                    "labelAliases": [
                        "Logo"
                    ],
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "required": true,
                    "selectorHint": "input[type='file'][accept*='image'], input[type='file'][accept*='png' i]"
                },
                {
                    "key": "gallery",
                    "label": "Tool screenshots",
                    "labelAliases": [
                        "Screenshots",
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 0,
                    "maxItems": 3,
                    "required": true,
                    "selectorHint": "#tool-screenshots-container input[type='file']"
                },
                {
                    "key": "name",
                    "label": "Tool name",
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[placeholder*='My Awesome Dev Tool' i], input[name*='tool_name' i], input[aria-label*='tool name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Catchy slogan",
                    "labelAliases": [
                        "Slogan",
                        "Tagline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[placeholder*='Supercharge Your Development Workflow' i], input[name*='slogan' i], textarea[name*='slogan' i]"
                },
                {
                    "key": "website",
                    "label": "Tool website URL",
                    "labelAliases": [
                        "Website URL",
                        "Website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[placeholder*='myawesomedevtool' i], input[type='url'], input[name*='tool_website' i], input[name*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Quick Description",
                    "labelAliases": [
                        "Description"
                    ],
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "textarea[placeholder*='Briefly explain what your tool does' i], [contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='tool_description' i]"
                },
                {
                    "key": "social_github",
                    "label": "GitHub repo URL",
                    "labelAliases": [
                        "GitHub repo URL (optional)",
                        "GitHub"
                    ],
                    "profilePath": "profile_data.social_github",
                    "fillMode": "text",
                    "selectorHint": "input[placeholder*='github.com/username' i], input[name*='github' i], input[name*='github_repo' i]",
                    "profileSourcePaths": [
                        "profile_data.repository_url"
                    ]
                },
                {
                    "key": "pricing_type",
                    "label": "Tool pricing type",
                    "labelAliases": [
                        "Pricing type",
                        "Pricing"
                    ],
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectCatalog": "devhunt_pricing",
                    "selectorHint": "#pricing-container input[type='radio'][name='pricing_type'], input[type='radio'][name='pricing_type'], input[type='radio'][name*='pricing_type' i]"
                },
                {
                    "key": "categories",
                    "label": "Tool categories",
                    "labelAliases": [
                        "Categories"
                    ],
                    "profilePath": "profile_data.categories",
                    "fillMode": "tags",
                    "selectorHint": "input[name*='categor' i], input[placeholder*='categor' i], [aria-label*='categor' i]"
                },
                {
                    "key": "demo_video",
                    "label": "Demo video",
                    "labelAliases": [
                        "Demo video (optional)"
                    ],
                    "profilePath": "profile_data.launch_video_url",
                    "fillMode": "text",
                    "selectorHint": "input[placeholder*='Demo video (optional)' i], input[name*='demo_video' i], input[type='url'][placeholder*='video' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/tool/|/account/tools",
        "listingUrlSelector": "a[href*='devhunt.org/tool/']"
    }
}$json$::jsonb,
    true,
    55,
    'devhunt'::text,
    'DevHunt'::text
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

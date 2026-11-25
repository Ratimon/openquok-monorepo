-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261124
-- MODULE SCOPE: Seed (Nick Launches free launch, paid launch, and maker profile destinations)
-- ---------------------------
-- extension_config: embedded on INSERT from destination-configs/*.ts; refreshed via 502_*_extension_configs.sql
-- Joins link_directory_opportunities on site slug nick-launches (catalog backfill / listing manager).
-- Plan selection, checkout, weekly upvotes, Featured badge, and admin review stay manual after the listing form is filled.

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
    'd5f7d000-0030-4000-a000-000000000016'::uuid,
    'nick-launches-free-launch'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'nick-launches'
          AND o.slug = 'free-launch'
        LIMIT 1
    ),
    'Nick Launches — Free launch',
    'Free listing on Nick Launches; weekly upvotes and a live Featured badge are required for a dofollow link. Extension autofills the listing form after you sign in.',
    'extension',
    'https://nicklaunches.com/submit/new/',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://nicklaunches.com/*"
    ],
    "readyUrlHint": "submit/new",
    "readyStatusHint": "Sign in on Nick Launches, then open the new listing form for a free launch. If Nick Launches prefills a draft from your website URL, skip or review it before OpenQuok fills the form. Weekly upvotes and a live Featured badge are required for the free dofollow path. Launch week and admin review stay manual. Target keyword, discount, first comment, launch date, and slug stay manual. Plan selection happens after this form.",
    "steps": [
        {
            "id": "submit_listing",
            "label": "Submit listing",
            "fields": [
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "required": true,
                    "selectorHint": "input[type='file'][name*='logo' i], input[type='file'][accept*='image']"
                },
                {
                    "key": "gallery",
                    "label": "Screenshots",
                    "labelAliases": [
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 0,
                    "maxItems": 5,
                    "required": true,
                    "selectorHint": "input[type='file'][name*='screenshot' i], input[type='file'][multiple]"
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
                    "key": "tagline",
                    "label": "Tagline",
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name='tagline'], textarea[name='tagline'], input[placeholder*='tagline' i]"
                },
                {
                    "key": "description",
                    "label": "Description",
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "textarea[name='description'], [contenteditable='true'], .ProseMirror, .tiptap"
                },
                {
                    "key": "website",
                    "label": "Website URL",
                    "labelAliases": [
                        "URL",
                        "Website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name='url'], input[type='url'][name='url']"
                },
                {
                    "key": "categories",
                    "label": "Categories",
                    "profilePath": "profile_data.categories",
                    "fillMode": "tags",
                    "tagsCatalog": "nick_launches_categories",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "maxItems": 3,
                    "required": true,
                    "selectorHint": "[data-field='categories'] input[role='combobox'], [data-field='categories'] input[placeholder*='categor' i], input[name*='categor' i], input[placeholder*='categor' i], [aria-label*='categor' i]"
                },
                {
                    "key": "use_cases",
                    "label": "Use cases",
                    "labelAliases": [
                        "How people use your product",
                        "Use Cases"
                    ],
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "maxItems": 3,
                    "selectorHint": "[data-field='useCases'] input[role='combobox'], [data-field='useCases'] input[placeholder*='use case' i], input[placeholder*='Add use cases' i]"
                },
                {
                    "key": "use_case_lines",
                    "label": "Use cases",
                    "labelAliases": [
                        "Use case descriptions"
                    ],
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='useCases'], textarea[aria-label*='Use cases' i]"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectCatalog": "nick_launches_pricing",
                    "required": true,
                    "selectorHint": "select[name='pricing'], select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i], input[name='pricing']"
                },
                {
                    "key": "is_open_source",
                    "label": "Open source",
                    "profilePath": "profile_data.is_open_source",
                    "fillMode": "boolean",
                    "selectorHint": "input[type='checkbox'][name*='openSource' i], input[type='checkbox'][name*='open' i], [role='switch'][aria-label*='open source' i], [role='checkbox'][aria-label*='open source' i]"
                },
                {
                    "key": "social_x",
                    "label": "X (Twitter)",
                    "labelAliases": [
                        "Twitter",
                        "Twitter username"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "socialXScalar": "username",
                    "selectorHint": "input[name='twitterUsername'], input[name*='twitter' i], input[placeholder*='twitter' i], input[aria-label*='twitter' i]"
                },
                {
                    "key": "demo_video",
                    "label": "Demo video URL",
                    "labelAliases": [
                        "Demo video"
                    ],
                    "profilePath": "profile_data.launch_video_url",
                    "fillMode": "text",
                    "selectorHint": "input[name='demoVideoUrl'], input[name*='demo' i], input[placeholder*='video' i], input[type='url'][name*='video' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/products/",
        "listingUrlSelector": "a[href*='nicklaunches.com/products/']"
    }
}$json$::jsonb,
    true,
    56,
    'nick-launches'::text,
    'Nick Launches'::text
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
    'd5f7d000-0030-4000-a000-000000000017'::uuid,
    'nick-launches-paid-launch'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'nick-launches'
          AND o.slug = 'paid-launch'
        LIMIT 1
    ),
    'Nick Launches — Paid launch',
    'Paid launch tiers on Nick Launches ($19, $39, $99, or $199). Extension autofills the listing form; plan checkout stays manual.',
    'extension',
    'https://nicklaunches.com/submit/new/',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://nicklaunches.com/*"
    ],
    "readyUrlHint": "submit/new",
    "readyStatusHint": "Sign in on Nick Launches, then open the new listing form. If Nick Launches prefills a draft from your website URL, skip or review it before OpenQuok fills the form. Paid tiers are a one-time charge ($19, $39, $99, or $199) chosen on the plan step after this form; checkout stays manual. The Featured badge is optional on paid tiers. Admin review is always required. Target keyword, discount, first comment, launch date, and slug stay manual.",
    "steps": [
        {
            "id": "submit_listing",
            "label": "Submit listing",
            "fields": [
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "required": true,
                    "selectorHint": "input[type='file'][name*='logo' i], input[type='file'][accept*='image']"
                },
                {
                    "key": "gallery",
                    "label": "Screenshots",
                    "labelAliases": [
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 0,
                    "maxItems": 5,
                    "required": true,
                    "selectorHint": "input[type='file'][name*='screenshot' i], input[type='file'][multiple]"
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
                    "key": "tagline",
                    "label": "Tagline",
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name='tagline'], textarea[name='tagline'], input[placeholder*='tagline' i]"
                },
                {
                    "key": "description",
                    "label": "Description",
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "textarea[name='description'], [contenteditable='true'], .ProseMirror, .tiptap"
                },
                {
                    "key": "website",
                    "label": "Website URL",
                    "labelAliases": [
                        "URL",
                        "Website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name='url'], input[type='url'][name='url']"
                },
                {
                    "key": "categories",
                    "label": "Categories",
                    "profilePath": "profile_data.categories",
                    "fillMode": "tags",
                    "tagsCatalog": "nick_launches_categories",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "maxItems": 3,
                    "required": true,
                    "selectorHint": "[data-field='categories'] input[role='combobox'], [data-field='categories'] input[placeholder*='categor' i], input[name*='categor' i], input[placeholder*='categor' i], [aria-label*='categor' i]"
                },
                {
                    "key": "use_cases",
                    "label": "Use cases",
                    "labelAliases": [
                        "How people use your product",
                        "Use Cases"
                    ],
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "maxItems": 3,
                    "selectorHint": "[data-field='useCases'] input[role='combobox'], [data-field='useCases'] input[placeholder*='use case' i], input[placeholder*='Add use cases' i]"
                },
                {
                    "key": "use_case_lines",
                    "label": "Use cases",
                    "labelAliases": [
                        "Use case descriptions"
                    ],
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='useCases'], textarea[aria-label*='Use cases' i]"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectCatalog": "nick_launches_pricing",
                    "required": true,
                    "selectorHint": "select[name='pricing'], select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i], input[name='pricing']"
                },
                {
                    "key": "is_open_source",
                    "label": "Open source",
                    "profilePath": "profile_data.is_open_source",
                    "fillMode": "boolean",
                    "selectorHint": "input[type='checkbox'][name*='openSource' i], input[type='checkbox'][name*='open' i], [role='switch'][aria-label*='open source' i], [role='checkbox'][aria-label*='open source' i]"
                },
                {
                    "key": "social_x",
                    "label": "X (Twitter)",
                    "labelAliases": [
                        "Twitter",
                        "Twitter username"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "socialXScalar": "username",
                    "selectorHint": "input[name='twitterUsername'], input[name*='twitter' i], input[placeholder*='twitter' i], input[aria-label*='twitter' i]"
                },
                {
                    "key": "demo_video",
                    "label": "Demo video URL",
                    "labelAliases": [
                        "Demo video"
                    ],
                    "profilePath": "profile_data.launch_video_url",
                    "fillMode": "text",
                    "selectorHint": "input[name='demoVideoUrl'], input[name*='demo' i], input[placeholder*='video' i], input[type='url'][name*='video' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/products/",
        "listingUrlSelector": "a[href*='nicklaunches.com/products/']"
    }
}$json$::jsonb,
    true,
    58,
    'nick-launches'::text,
    'Nick Launches'::text
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
    'd5f7d000-0030-4000-a000-000000000018'::uuid,
    'nick-launches-maker-profile'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'nick-launches'
          AND o.slug = 'maker-profile'
        LIMIT 1
    ),
    'Nick Launches — Maker profile',
    'Maker profile on Nick Launches. Extension autofills headline, bio, website, avatar, and known socials.',
    'extension',
    'https://nicklaunches.com/profile/',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://nicklaunches.com/*"
    ],
    "readyUrlHint": "profile",
    "readyStatusHint": "Sign in on Nick Launches and open your maker profile. OpenQuok fills headline, bio, website, avatar, and X, GitHub, LinkedIn, and YouTube when those profile fields are set. First name, last name, handle, banner, city, country, calendar, Twitch, and Product Hunt stay manual.",
    "steps": [
        {
            "id": "profile_info",
            "label": "Profile",
            "fields": [
                {
                    "key": "name",
                    "label": "Display name",
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "input[name='name'], input[aria-label*='display name' i], input[placeholder*='display name' i]"
                },
                {
                    "key": "headline",
                    "label": "Headline",
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "input[name='headline'], textarea[name='headline'], input[aria-label*='headline' i]"
                },
                {
                    "key": "bio",
                    "label": "Bio",
                    "profilePath": "description",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='bio'], textarea[aria-label*='bio' i]"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "input[name='website'], input[type='url'], input[aria-label*='website' i]"
                },
                {
                    "key": "avatar",
                    "label": "Avatar",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "input[type='file'][name*='avatar' i], input[type='file'][accept*='image']"
                },
                {
                    "key": "social_x",
                    "label": "X (Twitter)",
                    "labelAliases": [
                        "Twitter",
                        "X"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "socialXScalar": "username",
                    "selectorHint": "input[name='socials.x'], input[name*='twitter' i], input[aria-label*='twitter' i], input[placeholder*='x.com' i]"
                },
                {
                    "key": "social_github",
                    "label": "GitHub",
                    "profilePath": "profile_data.social_github",
                    "profileSourcePaths": [
                        "profile_data.repository_url"
                    ],
                    "fillMode": "text",
                    "selectorHint": "input[name='socials.github'], input[name*='github' i]"
                },
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "input[name='socials.linkedin'], input[name*='linkedin' i]"
                },
                {
                    "key": "social_youtube",
                    "label": "YouTube",
                    "profilePath": "profile_data.social_youtube",
                    "fillMode": "text",
                    "selectorHint": "input[name='socials.youtube'], input[name*='youtube' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/profile|/builders/",
        "listingUrlSelector": "a[href*='nicklaunches.com/builders/'], a[href*='nicklaunches.com/profile']"
    }
}$json$::jsonb,
    true,
    60,
    NULL::text,
    NULL::text
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

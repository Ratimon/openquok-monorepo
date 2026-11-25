-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261125
-- MODULE SCOPE: Seed (AlternativeTo free listing, Priority review, We finish it, and user profile destinations)
-- ---------------------------
-- extension_config: embedded on INSERT from destination-configs/*.ts; refreshed via 502_*_extension_configs.sql
-- Joins link_directory_opportunities on site slug alternativeto (catalog backfill / listing manager).
-- Post-submit Stripe upsell, features, languages, and final Submit stay manual after OpenQuok fills manage-item.

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
    'd5f7d000-0030-4000-a000-000000000021'::uuid,
    'alternativeto-free-listing'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'alternativeto'
          AND o.slug = 'free-listing'
        LIMIT 1
    ),
    'AlternativeTo — Free listing',
    'Free listing queue on AlternativeTo; extension autofills manage-item after you sign in with a verified email.',
    'extension',
    'https://alternativeto.net/manage-item/',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://alternativeto.net/*"
    ],
    "readyUrlHint": "manage-item",
    "readyStatusHint": "Sign in on AlternativeTo (Google, GitHub, Apple, or email) with a verified email, then open manage-item. OpenQuok fills the listing cards for a free-queue submission. After you submit, skip Priority Review ($15) and We finish it ($29) if you want the free backlog. Features, supported languages, suggest-as-alternative, post-submit paid upsell, and final Submit stay manual on AlternativeTo. Strip promo links from descriptions per AlternativeTo FAQ.",
    "steps": [
        {
            "id": "main_info",
            "label": "Main info",
            "fields": [
                {
                    "key": "name",
                    "label": "Name",
                    "labelAliases": [
                        "Application name",
                        "Product name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name*='name' i], input[aria-label*='name' i], input[placeholder*='name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Short description",
                    "labelAliases": [
                        "Short Description",
                        "Short description",
                        "Tagline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "textarea[aria-label*='short description' i], input[aria-label*='short description' i], textarea[name*='short' i]:not([name*='full' i]), input[name*='short' i], textarea[name='shortDescription' i]"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "labelAliases": [
                        "Website URL",
                        "Official website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[type='url'], input[name*='website' i], input[aria-label*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Full description",
                    "labelAliases": [
                        "Full Description",
                        "Full description",
                        "Description",
                        "Long description"
                    ],
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "textarea[aria-label*='full description' i], textarea[name*='full' i], textarea[name='description' i], textarea[name*='description' i]:not([name*='short' i]), [contenteditable='true'][aria-label*='full description' i], .ProseMirror, .tiptap"
                }
            ]
        },
        {
            "id": "tags",
            "label": "Tags",
            "fields": [
                {
                    "key": "tags",
                    "label": "Tags",
                    "profilePath": "profile_data.tags",
                    "profileSourcePaths": [
                        "profile_data.categories",
                        "profile_data.use_cases",
                        "profile_data.platforms"
                    ],
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "required": true,
                    "selectorHint": "input[role='combobox'], input[name*='tag' i], input[placeholder*='tag' i], [aria-label*='tag' i]"
                }
            ]
        },
        {
            "id": "platforms",
            "label": "Platforms",
            "fields": [
                {
                    "key": "platforms",
                    "label": "Platforms",
                    "profilePath": "profile_data.platforms",
                    "fillMode": "checkbox_group",
                    "checkboxCatalog": "alternativeto_platforms",
                    "labelMatch": "section",
                    "required": true,
                    "selectorHint": "input[type='checkbox'][name*='platform' i], fieldset input[type='checkbox'], [aria-label*='platform' i] input[type='checkbox']"
                }
            ]
        },
        {
            "id": "author",
            "label": "Company / Author",
            "fields": [
                {
                    "key": "author",
                    "label": "Company / Author",
                    "labelAliases": [
                        "Company",
                        "Author"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name*='company' i], input[name*='author' i], input[aria-label*='company' i], input[aria-label*='author' i]"
                },
                {
                    "key": "social_x",
                    "label": "X (Twitter)",
                    "labelAliases": [
                        "Twitter"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "socialScalar": "username",
                    "selectorHint": "input[name*='twitter' i], input[name*='x.com' i], input[aria-label*='twitter' i]"
                }
            ]
        },
        {
            "id": "pricing",
            "label": "Pricing / license",
            "fields": [
                {
                    "key": "pricing_type",
                    "label": "Pricing / license",
                    "labelAliases": [
                        "License",
                        "Pricing"
                    ],
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectCatalog": "alternativeto_license",
                    "required": true,
                    "selectorHint": "input[type='radio'][name*='license' i], input[type='radio'][name*='pricing' i], select[name*='license' i]"
                },
                {
                    "key": "is_open_source",
                    "label": "Open source",
                    "profilePath": "profile_data.is_open_source",
                    "fillMode": "boolean",
                    "selectorHint": "input[type='checkbox'][name*='open' i], input[type='radio'][value*='open source' i], [role='switch'][aria-label*='open source' i]"
                }
            ]
        },
        {
            "id": "media",
            "label": "Media",
            "fields": [
                {
                    "key": "logo",
                    "label": "Application icon",
                    "labelAliases": [
                        "Icon",
                        "Logo"
                    ],
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "required": true,
                    "selectorHint": "input[type='file'][accept*='image'], input[type='file'][name*='icon' i], input[type='file'][name*='logo' i]"
                },
                {
                    "key": "gallery",
                    "label": "Screenshots",
                    "labelAliases": [
                        "Screenshot",
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "maxItems": 5,
                    "selectorHint": "input[type='file'][multiple], input[type='file'][name*='screenshot' i]"
                }
            ]
        },
        {
            "id": "videos",
            "label": "Videos",
            "fields": [
                {
                    "key": "launch_video_url",
                    "label": "Add a new video URL",
                    "labelAliases": [
                        "Videos",
                        "Video",
                        "YouTube"
                    ],
                    "profilePath": "profile_data.launch_video_url",
                    "fillMode": "text",
                    "selectorHint": "input[type='url'][aria-label*='video' i], input[type='url'][name*='video' i], input[placeholder*='youtube' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/software/|/manage-item/",
        "listingUrlSelector": "a[href*='alternativeto.net/software/']"
    }
}$json$::jsonb,
    true,
    66,
    'alternativeto'::text,
    'AlternativeTo'::text
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
    'd5f7d000-0030-4000-a000-000000000022'::uuid,
    'alternativeto-priority-review'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'alternativeto'
          AND o.slug = 'priority-review'
        LIMIT 1
    ),
    'AlternativeTo — Priority review',
    'Priority Review ($15) on AlternativeTo after manage-item submit; extension autofills the listing form.',
    'extension',
    'https://alternativeto.net/manage-item/',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://alternativeto.net/*"
    ],
    "readyUrlHint": "manage-item",
    "readyStatusHint": "Sign in on AlternativeTo (Google, GitHub, Apple, or email) with a verified email, then open manage-item. OpenQuok fills manage-item; submit the application, then pay $15 for Priority Review on AlternativeTo (checkout stays manual). Features, supported languages, suggest-as-alternative, post-submit paid upsell, and final Submit stay manual on AlternativeTo. Strip promo links from descriptions per AlternativeTo FAQ.",
    "steps": [
        {
            "id": "main_info",
            "label": "Main info",
            "fields": [
                {
                    "key": "name",
                    "label": "Name",
                    "labelAliases": [
                        "Application name",
                        "Product name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name*='name' i], input[aria-label*='name' i], input[placeholder*='name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Short description",
                    "labelAliases": [
                        "Short Description",
                        "Short description",
                        "Tagline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "textarea[aria-label*='short description' i], input[aria-label*='short description' i], textarea[name*='short' i]:not([name*='full' i]), input[name*='short' i], textarea[name='shortDescription' i]"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "labelAliases": [
                        "Website URL",
                        "Official website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[type='url'], input[name*='website' i], input[aria-label*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Full description",
                    "labelAliases": [
                        "Full Description",
                        "Full description",
                        "Description",
                        "Long description"
                    ],
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "textarea[aria-label*='full description' i], textarea[name*='full' i], textarea[name='description' i], textarea[name*='description' i]:not([name*='short' i]), [contenteditable='true'][aria-label*='full description' i], .ProseMirror, .tiptap"
                }
            ]
        },
        {
            "id": "tags",
            "label": "Tags",
            "fields": [
                {
                    "key": "tags",
                    "label": "Tags",
                    "profilePath": "profile_data.tags",
                    "profileSourcePaths": [
                        "profile_data.categories",
                        "profile_data.use_cases",
                        "profile_data.platforms"
                    ],
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "required": true,
                    "selectorHint": "input[role='combobox'], input[name*='tag' i], input[placeholder*='tag' i], [aria-label*='tag' i]"
                }
            ]
        },
        {
            "id": "platforms",
            "label": "Platforms",
            "fields": [
                {
                    "key": "platforms",
                    "label": "Platforms",
                    "profilePath": "profile_data.platforms",
                    "fillMode": "checkbox_group",
                    "checkboxCatalog": "alternativeto_platforms",
                    "labelMatch": "section",
                    "required": true,
                    "selectorHint": "input[type='checkbox'][name*='platform' i], fieldset input[type='checkbox'], [aria-label*='platform' i] input[type='checkbox']"
                }
            ]
        },
        {
            "id": "author",
            "label": "Company / Author",
            "fields": [
                {
                    "key": "author",
                    "label": "Company / Author",
                    "labelAliases": [
                        "Company",
                        "Author"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name*='company' i], input[name*='author' i], input[aria-label*='company' i], input[aria-label*='author' i]"
                },
                {
                    "key": "social_x",
                    "label": "X (Twitter)",
                    "labelAliases": [
                        "Twitter"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "socialScalar": "username",
                    "selectorHint": "input[name*='twitter' i], input[name*='x.com' i], input[aria-label*='twitter' i]"
                }
            ]
        },
        {
            "id": "pricing",
            "label": "Pricing / license",
            "fields": [
                {
                    "key": "pricing_type",
                    "label": "Pricing / license",
                    "labelAliases": [
                        "License",
                        "Pricing"
                    ],
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectCatalog": "alternativeto_license",
                    "required": true,
                    "selectorHint": "input[type='radio'][name*='license' i], input[type='radio'][name*='pricing' i], select[name*='license' i]"
                },
                {
                    "key": "is_open_source",
                    "label": "Open source",
                    "profilePath": "profile_data.is_open_source",
                    "fillMode": "boolean",
                    "selectorHint": "input[type='checkbox'][name*='open' i], input[type='radio'][value*='open source' i], [role='switch'][aria-label*='open source' i]"
                }
            ]
        },
        {
            "id": "media",
            "label": "Media",
            "fields": [
                {
                    "key": "logo",
                    "label": "Application icon",
                    "labelAliases": [
                        "Icon",
                        "Logo"
                    ],
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "required": true,
                    "selectorHint": "input[type='file'][accept*='image'], input[type='file'][name*='icon' i], input[type='file'][name*='logo' i]"
                },
                {
                    "key": "gallery",
                    "label": "Screenshots",
                    "labelAliases": [
                        "Screenshot",
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "maxItems": 5,
                    "selectorHint": "input[type='file'][multiple], input[type='file'][name*='screenshot' i]"
                }
            ]
        },
        {
            "id": "videos",
            "label": "Videos",
            "fields": [
                {
                    "key": "launch_video_url",
                    "label": "Add a new video URL",
                    "labelAliases": [
                        "Videos",
                        "Video",
                        "YouTube"
                    ],
                    "profilePath": "profile_data.launch_video_url",
                    "fillMode": "text",
                    "selectorHint": "input[type='url'][aria-label*='video' i], input[type='url'][name*='video' i], input[placeholder*='youtube' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/software/|/manage-item/",
        "listingUrlSelector": "a[href*='alternativeto.net/software/']"
    }
}$json$::jsonb,
    true,
    68,
    'alternativeto'::text,
    'AlternativeTo'::text
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
    'd5f7d000-0030-4000-a000-000000000023'::uuid,
    'alternativeto-finish-listing'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'alternativeto'
          AND o.slug = 'finish-listing'
        LIMIT 1
    ),
    'AlternativeTo — We finish it',
    'We finish it ($29) concierge tier on AlternativeTo; extension prefills manage-item before checkout.',
    'extension',
    'https://alternativeto.net/manage-item/',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://alternativeto.net/*"
    ],
    "readyUrlHint": "manage-item",
    "readyStatusHint": "Sign in on AlternativeTo (Google, GitHub, Apple, or email) with a verified email, then open manage-item. OpenQuok prefills core listing fields; submit, then pay $29 for We finish it on AlternativeTo so their team completes remaining fields. Features, supported languages, suggest-as-alternative, post-submit paid upsell, and final Submit stay manual on AlternativeTo. Strip promo links from descriptions per AlternativeTo FAQ.",
    "steps": [
        {
            "id": "main_info",
            "label": "Main info",
            "fields": [
                {
                    "key": "name",
                    "label": "Name",
                    "labelAliases": [
                        "Application name",
                        "Product name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name*='name' i], input[aria-label*='name' i], input[placeholder*='name' i]"
                },
                {
                    "key": "tagline",
                    "label": "Short description",
                    "labelAliases": [
                        "Short Description",
                        "Short description",
                        "Tagline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "textarea[aria-label*='short description' i], input[aria-label*='short description' i], textarea[name*='short' i]:not([name*='full' i]), input[name*='short' i], textarea[name='shortDescription' i]"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "labelAliases": [
                        "Website URL",
                        "Official website"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[type='url'], input[name*='website' i], input[aria-label*='website' i]"
                },
                {
                    "key": "description",
                    "label": "Full description",
                    "labelAliases": [
                        "Full Description",
                        "Full description",
                        "Description",
                        "Long description"
                    ],
                    "profilePath": "description",
                    "fillMode": "rich_html",
                    "required": true,
                    "selectorHint": "textarea[aria-label*='full description' i], textarea[name*='full' i], textarea[name='description' i], textarea[name*='description' i]:not([name*='short' i]), [contenteditable='true'][aria-label*='full description' i], .ProseMirror, .tiptap"
                }
            ]
        },
        {
            "id": "tags",
            "label": "Tags",
            "fields": [
                {
                    "key": "tags",
                    "label": "Tags",
                    "profilePath": "profile_data.tags",
                    "profileSourcePaths": [
                        "profile_data.categories",
                        "profile_data.use_cases",
                        "profile_data.platforms"
                    ],
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "required": true,
                    "selectorHint": "input[role='combobox'], input[name*='tag' i], input[placeholder*='tag' i], [aria-label*='tag' i]"
                }
            ]
        },
        {
            "id": "platforms",
            "label": "Platforms",
            "fields": [
                {
                    "key": "platforms",
                    "label": "Platforms",
                    "profilePath": "profile_data.platforms",
                    "fillMode": "checkbox_group",
                    "checkboxCatalog": "alternativeto_platforms",
                    "labelMatch": "section",
                    "required": true,
                    "selectorHint": "input[type='checkbox'][name*='platform' i], fieldset input[type='checkbox'], [aria-label*='platform' i] input[type='checkbox']"
                }
            ]
        },
        {
            "id": "author",
            "label": "Company / Author",
            "fields": [
                {
                    "key": "author",
                    "label": "Company / Author",
                    "labelAliases": [
                        "Company",
                        "Author"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name*='company' i], input[name*='author' i], input[aria-label*='company' i], input[aria-label*='author' i]"
                },
                {
                    "key": "social_x",
                    "label": "X (Twitter)",
                    "labelAliases": [
                        "Twitter"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "socialScalar": "username",
                    "selectorHint": "input[name*='twitter' i], input[name*='x.com' i], input[aria-label*='twitter' i]"
                }
            ]
        },
        {
            "id": "pricing",
            "label": "Pricing / license",
            "fields": [
                {
                    "key": "pricing_type",
                    "label": "Pricing / license",
                    "labelAliases": [
                        "License",
                        "Pricing"
                    ],
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectCatalog": "alternativeto_license",
                    "required": true,
                    "selectorHint": "input[type='radio'][name*='license' i], input[type='radio'][name*='pricing' i], select[name*='license' i]"
                },
                {
                    "key": "is_open_source",
                    "label": "Open source",
                    "profilePath": "profile_data.is_open_source",
                    "fillMode": "boolean",
                    "selectorHint": "input[type='checkbox'][name*='open' i], input[type='radio'][value*='open source' i], [role='switch'][aria-label*='open source' i]"
                }
            ]
        },
        {
            "id": "media",
            "label": "Media",
            "fields": [
                {
                    "key": "logo",
                    "label": "Application icon",
                    "labelAliases": [
                        "Icon",
                        "Logo"
                    ],
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "required": true,
                    "selectorHint": "input[type='file'][accept*='image'], input[type='file'][name*='icon' i], input[type='file'][name*='logo' i]"
                },
                {
                    "key": "gallery",
                    "label": "Screenshots",
                    "labelAliases": [
                        "Screenshot",
                        "Gallery"
                    ],
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "maxItems": 5,
                    "selectorHint": "input[type='file'][multiple], input[type='file'][name*='screenshot' i]"
                }
            ]
        },
        {
            "id": "videos",
            "label": "Videos",
            "fields": [
                {
                    "key": "launch_video_url",
                    "label": "Add a new video URL",
                    "labelAliases": [
                        "Videos",
                        "Video",
                        "YouTube"
                    ],
                    "profilePath": "profile_data.launch_video_url",
                    "fillMode": "text",
                    "selectorHint": "input[type='url'][aria-label*='video' i], input[type='url'][name*='video' i], input[placeholder*='youtube' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/software/|/manage-item/",
        "listingUrlSelector": "a[href*='alternativeto.net/software/']"
    }
}$json$::jsonb,
    true,
    70,
    'alternativeto'::text,
    'AlternativeTo'::text
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
    'd5f7d000-0030-4000-a000-000000000024'::uuid,
    'alternativeto-user-profile'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'alternativeto'
          AND o.slug = 'user-profile'
        LIMIT 1
    ),
    'AlternativeTo — User profile',
    'Public profile social handles and LinkedIn on AlternativeTo; extension autofills user edit.',
    'extension',
    'https://alternativeto.net/user/edit/',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://alternativeto.net/*"
    ],
    "readyUrlHint": "user/edit",
    "readyStatusHint": "Sign in on AlternativeTo and open user edit. OpenQuok fills social handles (no full URLs where AlternativeTo expects usernames) and your LinkedIn profile URL. Reddit is not mapped in OpenQuok v1 — add it manually if needed.",
    "steps": [
        {
            "id": "profile_socials",
            "label": "Social links",
            "fields": [
                {
                    "key": "social_x",
                    "label": "Twitter",
                    "labelAliases": [
                        "X",
                        "X (Twitter)"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "socialScalar": "username",
                    "selectorHint": "input[name*='twitter' i], input[aria-label*='twitter' i], input[placeholder*='twitter' i]"
                },
                {
                    "key": "social_github",
                    "label": "GitHub",
                    "profilePath": "profile_data.social_github",
                    "profileSourcePaths": [
                        "profile_data.repository_url"
                    ],
                    "fillMode": "text",
                    "socialScalar": "username",
                    "selectorHint": "input[name*='github' i], input[aria-label*='github' i]"
                },
                {
                    "key": "social_instagram",
                    "label": "Instagram",
                    "profilePath": "profile_data.social_instagram",
                    "fillMode": "text",
                    "socialScalar": "username",
                    "selectorHint": "input[name*='instagram' i], input[aria-label*='instagram' i]"
                },
                {
                    "key": "social_youtube",
                    "label": "YouTube",
                    "profilePath": "profile_data.social_youtube",
                    "fillMode": "text",
                    "socialScalar": "username",
                    "selectorHint": "input[name*='youtube' i], input[aria-label*='youtube' i]"
                },
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "input[name*='linkedin' i], input[type='url'][aria-label*='linkedin' i]"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/user/",
        "listingUrlSelector": "a[href*='alternativeto.net/user/']"
    }
}$json$::jsonb,
    true,
    72,
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

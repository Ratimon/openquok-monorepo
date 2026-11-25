-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261016
-- MODULE SCOPE: Seed (PeerPush free queue + Standard launch destinations)
-- ---------------------------
-- extension_config: embedded on INSERT from destination-configs/*.ts; refreshed via 502_*_extension_configs.sql
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
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'peerpush'
          AND o.slug = 'standard-launch'
        LIMIT 1
    ),
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
                    "selectorHint": "#name, input#name"
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "labelAliases": [
                        "One-line tagline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "#tagline, input#tagline"
                },
                {
                    "key": "description",
                    "label": "Product description",
                    "labelAliases": [
                        "Description"
                    ],
                    "profilePath": "description",
                    "fillMode": "text",
                    "selectorHint": "#description, textarea#description"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "#websiteUrl, input#websiteUrl, input[type='url'][id*='website' i]"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "[data-field='logo'] input[type='file'], input[type='file'][accept*='image']"
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
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "maxItems": 3,
                    "selectorHint": "[data-field='categories'] input[role='combobox'], [data-field='categories'] input[placeholder*='categor' i]"
                },
                {
                    "key": "use_cases",
                    "label": "Use Cases",
                    "labelAliases": [
                        "Use cases"
                    ],
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "selectorHint": "[data-field='useCases'] input[role='combobox'], [data-field='useCases'] input[placeholder*='use case' i]"
                },
                {
                    "key": "target_audiences",
                    "label": "Target Audience",
                    "labelAliases": [
                        "Target audience",
                        "Audiences"
                    ],
                    "profilePath": "profile_data.target_audiences",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "selectorHint": "[data-field='audiences'] input[role='combobox'], [data-field='audiences'] input[placeholder*='audience' i]"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectorHint": "[data-field='pricingType'] select, select[aria-label='Pricing type']"
                },
                {
                    "key": "platforms",
                    "label": "Platforms",
                    "profilePath": "profile_data.platforms",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "maxItems": 5,
                    "selectorHint": "[data-field='platforms'] input[role='combobox'], [data-field='platforms'] input[placeholder*='platform' i]"
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
                    "fileInputIndex": 0,
                    "maxItems": 10,
                    "selectorHint": "[data-field='screenshots'] input[type='file'], input[type='file'][accept*='image']"
                }
            ]
        },
        {
            "id": "additional",
            "label": "Additional Info",
            "fields": [
                {
                    "key": "monthly_revenue_usd",
                    "label": "Monthly recurring revenue (optional)",
                    "labelAliases": [
                        "MRR",
                        "MRR - Monthly Recurring Revenue (optional)"
                    ],
                    "profilePath": "profile_data.monthly_revenue_usd",
                    "fillMode": "text",
                    "selectorHint": "#mrr, input#mrr, input[name='mrr'], input[placeholder='1000']"
                },
                {
                    "key": "social_x",
                    "label": "Twitter username",
                    "labelAliases": [
                        "X (Twitter)",
                        "X username"
                    ],
                    "profilePath": "profile_data.social_x",
                    "socialScalar": "username",
                    "fillMode": "text",
                    "selectorHint": "#twitterUsername, input#twitterUsername, input[aria-label='X username']"
                },
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn URL",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "#linkedinUrl, input#linkedinUrl, input[aria-label='LinkedIn URL'], input[type='url'][placeholder*='linkedin.com' i]"
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
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'peerpush'
          AND o.slug = 'free-queue'
        LIMIT 1
    ),
    'PeerPush — Free queue',
    'Free queue on PeerPush; extension autofills after you open pricing and start submit.',
    'extension',
    'https://peerpush.com/pricing',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://peerpush.com/*",
        "https://www.peerpush.com/*"
    ],
    "readyUrlHint": "pricing",
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
                    "selectorHint": "#name, input#name"
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "labelAliases": [
                        "One-line tagline"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "#tagline, input#tagline"
                },
                {
                    "key": "description",
                    "label": "Product description",
                    "labelAliases": [
                        "Description"
                    ],
                    "profilePath": "description",
                    "fillMode": "text",
                    "selectorHint": "#description, textarea#description"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "#websiteUrl, input#websiteUrl, input[type='url'][id*='website' i]"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "[data-field='logo'] input[type='file'], input[type='file'][accept*='image']"
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
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "maxItems": 3,
                    "selectorHint": "[data-field='categories'] input[role='combobox'], [data-field='categories'] input[placeholder*='categor' i]"
                },
                {
                    "key": "use_cases",
                    "label": "Use Cases",
                    "labelAliases": [
                        "Use cases"
                    ],
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "selectorHint": "[data-field='useCases'] input[role='combobox'], [data-field='useCases'] input[placeholder*='use case' i]"
                },
                {
                    "key": "target_audiences",
                    "label": "Target Audience",
                    "labelAliases": [
                        "Target audience",
                        "Audiences"
                    ],
                    "profilePath": "profile_data.target_audiences",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "selectorHint": "[data-field='audiences'] input[role='combobox'], [data-field='audiences'] input[placeholder*='audience' i]"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectorHint": "[data-field='pricingType'] select, select[aria-label='Pricing type']"
                },
                {
                    "key": "platforms",
                    "label": "Platforms",
                    "profilePath": "profile_data.platforms",
                    "fillMode": "tags",
                    "labelMatch": "section",
                    "tagsScope": "section",
                    "maxItems": 5,
                    "selectorHint": "[data-field='platforms'] input[role='combobox'], [data-field='platforms'] input[placeholder*='platform' i]"
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
                    "fileInputIndex": 0,
                    "maxItems": 10,
                    "selectorHint": "[data-field='screenshots'] input[type='file'], input[type='file'][accept*='image']"
                }
            ]
        },
        {
            "id": "additional",
            "label": "Additional Info",
            "fields": [
                {
                    "key": "monthly_revenue_usd",
                    "label": "Monthly recurring revenue (optional)",
                    "labelAliases": [
                        "MRR",
                        "MRR - Monthly Recurring Revenue (optional)"
                    ],
                    "profilePath": "profile_data.monthly_revenue_usd",
                    "fillMode": "text",
                    "selectorHint": "#mrr, input#mrr, input[name='mrr'], input[placeholder='1000']"
                },
                {
                    "key": "social_x",
                    "label": "Twitter username",
                    "labelAliases": [
                        "X (Twitter)",
                        "X username"
                    ],
                    "profilePath": "profile_data.social_x",
                    "socialScalar": "username",
                    "fillMode": "text",
                    "selectorHint": "#twitterUsername, input#twitterUsername, input[aria-label='X username']"
                },
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn URL",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "#linkedinUrl, input#linkedinUrl, input[aria-label='LinkedIn URL'], input[type='url'][placeholder*='linkedin.com' i]"
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
    35,
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

-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261120
-- MODULE SCOPE: Seed (Fazier page + free/paid product listing destinations)
-- ---------------------------
-- extension_config: embedded on INSERT from destination-configs/*.ts; refreshed via 502_*_extension_configs.sql
-- Joins link_directory_opportunities on site slug fazier (catalog backfill / listing manager).
-- Post-submit badge, comments, homepage link, and Lite Plan checkout stay manual in v1.
-- Upgrade fazier-launch → free product listing (preserve destination id for submissions FK).
UPDATE public.auto_launch_destinations SET provider_slug = 'fazier-free-product-listing' WHERE provider_slug = 'fazier-launch';

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
    'd5f7d000-0030-4000-a000-000000000010'::uuid,
    'fazier-page'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'fazier'
          AND o.slug = 'company-page'
        LIMIT 1
    ),
    'Fazier — Page',
    'Company page on Fazier; extension autofills the three-step wizard at fazier.com/page/new.',
    'extension',
    'https://fazier.com/page/new',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://fazier.com/*",
        "https://www.fazier.com/*"
    ],
    "readyUrlHint": "page/new",
    "readyStatusHint": "On fazier.com/page/new, complete any listing-type or sign-in gate Fazier shows, then open the company wizard (Basic info → Overview → Social links). Use Fill all steps or Fill on each row—review every field before you submit on Fazier.",
    "steps": [
        {
            "id": "basic",
            "label": "Basic info",
            "fields": [
                {
                    "key": "name",
                    "label": "Name",
                    "labelAliases": [
                        "Organization name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "input[name='name']",
                    "required": true
                },
                {
                    "key": "company_slug",
                    "label": "Page URL",
                    "labelAliases": [
                        "company-slug"
                    ],
                    "profilePath": "profile_data.slug",
                    "fillMode": "text",
                    "selectorHint": "input[name='company']"
                },
                {
                    "key": "website",
                    "label": "Website",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "input[name='website'], input[type='url'][placeholder*='https' i]",
                    "required": true
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "input[type='file'][name='logo'], input[type='file'][accept*='image']",
                    "required": true
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "labelAliases": [
                        "One-line description of your organization"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "input[name='tagline'], textarea[name='tagline']",
                    "maxScalarLength": 120,
                    "required": true
                }
            ]
        },
        {
            "id": "overview",
            "label": "Overview",
            "fields": [
                {
                    "key": "industry",
                    "label": "Industry",
                    "profilePath": "profile_data.categories",
                    "fillMode": "text",
                    "selectorHint": "input[name='industry']"
                },
                {
                    "key": "company_size",
                    "label": "Company size",
                    "profilePath": "profile_data.target_audiences",
                    "fillMode": "select",
                    "selectorHint": "select[name='companySize'], [role='combobox'][aria-label*='size' i]"
                },
                {
                    "key": "company_type",
                    "label": "Organization type",
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "select",
                    "selectorHint": "select[name='companyType'], [role='combobox'][aria-label*='type' i]"
                },
                {
                    "key": "country",
                    "label": "Country",
                    "profilePath": "profile_data.platforms",
                    "fillMode": "select",
                    "selectorHint": "select[name='country'], [role='combobox'][aria-label*='country' i]"
                },
                {
                    "key": "city",
                    "label": "City",
                    "profilePath": "profile_data.tech_stack",
                    "fillMode": "text",
                    "selectorHint": "input[name='city']"
                },
                {
                    "key": "founded_month",
                    "label": "Founded month",
                    "profilePath": "profile_data.launch_date",
                    "fillMode": "select",
                    "selectorHint": "select[name='month'], [role='combobox'][aria-label*='month' i]"
                },
                {
                    "key": "founded_year",
                    "label": "Founded year",
                    "profilePath": "profile_data.launch_date",
                    "fillMode": "select",
                    "selectorHint": "select[name='year'], [role='combobox'][aria-label*='year' i]"
                },
                {
                    "key": "about",
                    "label": "About",
                    "profilePath": "description",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='about']"
                }
            ]
        },
        {
            "id": "social_links",
            "label": "Social links",
            "fields": [
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "input[name='linkedin']"
                },
                {
                    "key": "social_x",
                    "label": "Twitter",
                    "labelAliases": [
                        "X (Twitter)"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "selectorHint": "input[name='twitter']"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/company/",
        "listingUrlSelector": "a[href*='fazier.com/company/']"
    }
}$json$::jsonb,
    true,
    50,
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
    'd5f7d000-0030-4000-a000-000000000011'::uuid,
    'fazier-free-product-listing'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'fazier'
          AND o.slug = 'free-product-listing'
        LIMIT 1
    ),
    'Fazier — Free product listing',
    'Basic (free) product launch on Fazier; extension autofills fazier.com/submit — badge, comments, and moderation stay manual.',
    'extension',
    'https://fazier.com/submit',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://fazier.com/*",
        "https://www.fazier.com/*"
    ],
    "readyUrlHint": "submit",
    "steps": [
        {
            "id": "product_info",
            "label": "Product info",
            "fields": [
                {
                    "key": "name",
                    "label": "Product name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "input[name='name']",
                    "required": true
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "labelAliases": [
                        "Describe your product in few words only"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "input[name='tagline'], textarea[name='tagline']",
                    "maxScalarLength": 80,
                    "required": true
                },
                {
                    "key": "website",
                    "label": "Website",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "input[name='website'], input[type='url'][placeholder*='https' i]",
                    "required": true
                },
                {
                    "key": "description",
                    "label": "Description",
                    "labelAliases": [
                        "Brief description of the product"
                    ],
                    "profilePath": "description",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='description'], textarea[placeholder*='description' i]"
                },
                {
                    "key": "features",
                    "label": "Features",
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='features'], input[name='features']"
                },
                {
                    "key": "use_cases",
                    "label": "Use cases",
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='useCases'], input[name='useCases']"
                },
                {
                    "key": "logo",
                    "label": "Square logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "input[type='file'][name='logo'], input[type='file'][accept*='image']"
                },
                {
                    "key": "gallery",
                    "label": "Product images",
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "selectorHint": "input[type='file'][accept*='image']:not([name='logo']):not(:first-of-type)"
                }
            ]
        },
        {
            "id": "classification",
            "label": "Classification",
            "fields": [
                {
                    "key": "category",
                    "label": "Category",
                    "profilePath": "profile_data.categories",
                    "fillMode": "select",
                    "selectorHint": "select[name='category'], [role='combobox'][aria-label*='categor' i]"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectorHint": "input[type='radio'][name='planType'], input[name='planType'], input[type='radio'][name='paymentPlan'], input[name='paymentPlan']"
                }
            ]
        },
        {
            "id": "socials",
            "label": "Social links",
            "fields": [
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "input[name='linkdinUrl'], input[name='linkedin']"
                },
                {
                    "key": "social_x",
                    "label": "Twitter",
                    "labelAliases": [
                        "X (Twitter)"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "selectorHint": "input[name='twitterUrl'], input[name='twitter']"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/launches/|/p/",
        "listingUrlSelector": "a[href*='fazier.com/launches/'], a[href*='fazier.com/p/']"
    },
    "readyStatusHint": "On fazier.com/submit, choose Product launch (not Company page). Pick Basic (free) when Fazier shows plan tiers. When product fields are visible, use Fill all steps or Fill on each row—then complete badge, comments, and moderation on Fazier."
}$json$::jsonb,
    true,
    51,
    'fazier-product-listing'::text,
    'Product listing'::text
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
    'd5f7d000-0030-4000-a000-000000000012'::uuid,
    'fazier-paid-product-listing'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'fazier'
          AND o.slug = 'paid-product-listing'
        LIMIT 1
    ),
    'Fazier — Paid product listing',
    'Lite Plan or higher on Fazier; same product form at fazier.com/submit — checkout stays manual on Fazier.',
    'extension',
    'https://fazier.com/submit',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://fazier.com/*",
        "https://www.fazier.com/*"
    ],
    "readyUrlHint": "submit",
    "steps": [
        {
            "id": "product_info",
            "label": "Product info",
            "fields": [
                {
                    "key": "name",
                    "label": "Product name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "selectorHint": "input[name='name']",
                    "required": true
                },
                {
                    "key": "tagline",
                    "label": "Tagline",
                    "labelAliases": [
                        "Describe your product in few words only"
                    ],
                    "profilePath": "tagline",
                    "fillMode": "text",
                    "selectorHint": "input[name='tagline'], textarea[name='tagline']",
                    "maxScalarLength": 80,
                    "required": true
                },
                {
                    "key": "website",
                    "label": "Website",
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "selectorHint": "input[name='website'], input[type='url'][placeholder*='https' i]",
                    "required": true
                },
                {
                    "key": "description",
                    "label": "Description",
                    "labelAliases": [
                        "Brief description of the product"
                    ],
                    "profilePath": "description",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='description'], textarea[placeholder*='description' i]"
                },
                {
                    "key": "features",
                    "label": "Features",
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='features'], input[name='features']"
                },
                {
                    "key": "use_cases",
                    "label": "Use cases",
                    "profilePath": "profile_data.use_cases",
                    "fillMode": "text",
                    "selectorHint": "textarea[name='useCases'], input[name='useCases']"
                },
                {
                    "key": "logo",
                    "label": "Square logo",
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "fileInputIndex": 0,
                    "selectorHint": "input[type='file'][name='logo'], input[type='file'][accept*='image']"
                },
                {
                    "key": "gallery",
                    "label": "Product images",
                    "profilePath": "profile_data.gallery_urls",
                    "fillMode": "files",
                    "fileInputIndex": 1,
                    "selectorHint": "input[type='file'][accept*='image']:not([name='logo']):not(:first-of-type)"
                }
            ]
        },
        {
            "id": "classification",
            "label": "Classification",
            "fields": [
                {
                    "key": "category",
                    "label": "Category",
                    "profilePath": "profile_data.categories",
                    "fillMode": "select",
                    "selectorHint": "select[name='category'], [role='combobox'][aria-label*='categor' i]"
                },
                {
                    "key": "pricing_type",
                    "label": "Pricing",
                    "profilePath": "profile_data.pricing_type",
                    "fillMode": "select",
                    "selectorHint": "input[type='radio'][name='planType'], input[name='planType'], input[type='radio'][name='paymentPlan'], input[name='paymentPlan']"
                }
            ]
        },
        {
            "id": "socials",
            "label": "Social links",
            "fields": [
                {
                    "key": "social_linkedin",
                    "label": "LinkedIn",
                    "profilePath": "profile_data.social_linkedin",
                    "fillMode": "text",
                    "selectorHint": "input[name='linkdinUrl'], input[name='linkedin']"
                },
                {
                    "key": "social_x",
                    "label": "Twitter",
                    "labelAliases": [
                        "X (Twitter)"
                    ],
                    "profilePath": "profile_data.social_x",
                    "fillMode": "text",
                    "selectorHint": "input[name='twitterUrl'], input[name='twitter']"
                }
            ]
        }
    ],
    "proof": {
        "successPathRegex": "/launches/|/p/",
        "listingUrlSelector": "a[href*='fazier.com/launches/'], a[href*='fazier.com/p/']"
    },
    "readyStatusHint": "On fazier.com/submit, choose Product launch (not Company page). Pick Lite Plan or higher when Fazier shows plan tiers. When product fields are visible, use Fill all steps or Fill on each row—then finish checkout on Fazier."
}$json$::jsonb,
    true,
    52,
    'fazier-product-listing'::text,
    'Product listing'::text
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

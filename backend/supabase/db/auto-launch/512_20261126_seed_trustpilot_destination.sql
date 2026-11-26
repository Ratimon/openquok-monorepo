-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261126
-- MODULE SCOPE: Seed (Trustpilot company profile destination)
-- ---------------------------
-- extension_config: embedded on INSERT from destination-configs/*.ts; refreshed via 502_*_extension_configs.sql
-- Joins link_directory_opportunities on site slug trustpilot (catalog backfill / listing manager).
-- Contact info, Save and publish, domain/business-email verification, and homepage screenshot stay manual.

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
    'd5f7d000-0030-4000-a000-000000000025'::uuid,
    'trustpilot-company-profile'::text,
    (
        SELECT o.id
        FROM public.link_directory_opportunities o
        INNER JOIN public.link_directory_sites s ON s.id = o.site_id
        WHERE s.slug = 'trustpilot'
          AND o.slug = 'company-profile'
        LIMIT 1
    ),
    'Trustpilot — Company profile',
    'Free Trustpilot Business company profile; extension autofills company settings and description after you sign in.',
    'extension',
    'https://businessapp.b2b.trustpilot.com/company-settings/',
    $json${
    "version": 1,
    "startUrlPatterns": [
        "https://businessapp.b2b.trustpilot.com/*"
    ],
    "readyUrlHint": "company-settings",
    "readyStatusHint": "Sign in to Trustpilot Business, then open company settings. OpenQuok fills company name, domain, description, and logo (JPG or PNG about 400×300 within Trustpilot size limits). Contact info (email, phone, address), Save and publish, homepage screenshot, and domain/business-email verification stay manual on Trustpilot. Public trustpilot.com/review/… links to your website are typically nofollow — confirm rel after you publish.",
    "steps": [
        {
            "id": "company_settings",
            "label": "Company settings",
            "fields": [
                {
                    "key": "name",
                    "label": "Company name",
                    "labelAliases": [
                        "Name"
                    ],
                    "profilePath": "name",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name*='company' i][name*='name' i], input[aria-label*='company name' i], input[placeholder*='company name' i], input[name*='name' i]:not([name*='user' i])"
                },
                {
                    "key": "website",
                    "label": "Company domain",
                    "labelAliases": [
                        "Domain",
                        "Website",
                        "Website URL"
                    ],
                    "profilePath": "website_url",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "input[name*='domain' i], input[aria-label*='domain' i], input[placeholder*='domain' i], input[type='url']"
                },
                {
                    "key": "logo",
                    "label": "Logo",
                    "labelAliases": [
                        "Upload logo",
                        "Company logo"
                    ],
                    "profilePath": "logo_url",
                    "fillMode": "file",
                    "required": true,
                    "selectorHint": "input[type='file'][accept*='image'], input[type='file'][name*='logo' i]"
                }
            ]
        },
        {
            "id": "company_description",
            "label": "Company description",
            "fields": [
                {
                    "key": "description",
                    "label": "Describe your company",
                    "labelAliases": [
                        "Description",
                        "Company description"
                    ],
                    "profilePath": "description",
                    "fillMode": "text",
                    "required": true,
                    "selectorHint": "textarea[name*='description' i], textarea[aria-label*='describe' i], textarea[placeholder*='describe' i], [contenteditable='true'][aria-label*='describe' i]"
                }
            ]
        },
        {
            "id": "contact_info",
            "label": "Contact info",
            "fields": []
        }
    ],
    "proof": {
        "successPathRegex": "trustpilot\\.com/review/",
        "listingUrlSelector": "a[href*='trustpilot.com/review']"
    }
}$json$::jsonb,
    true,
    74,
    'trustpilot'::text,
    'Trustpilot'::text
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

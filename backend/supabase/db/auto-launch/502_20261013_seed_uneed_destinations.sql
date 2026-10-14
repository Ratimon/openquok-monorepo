-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261013
-- MODULE SCOPE: Seed (Uneed destinations + editorial opportunity flags)
-- ---------------------------
-- Idempotent: matches opportunities on link_directory_sites.slug = 'uneed' + known opportunity
-- slugs (production CMS rows use random UUIDs; local exemplar uses fixed UUIDs).

BEGIN;

-- Local / exemplar gap only: no Join-the-line row yet (production uses slug free-launch-join-the-line-).
INSERT INTO public.link_directory_opportunities (
    id,
    site_id,
    published_at,
    slug,
    title,
    opportunity_type_id,
    effort,
    approval_mode,
    approval_time_hint,
    dofollow,
    cost_tier,
    cost_note,
    description,
    steps,
    openquok_cta_kind,
    openquok_channel_slug,
    openquok_plug_name,
    cta_href,
    cta_label,
    sort_order,
    is_admin_published
)
SELECT
    'd5f7d000-0020-4000-a000-000000000015'::uuid,
    u.id,
    NOW(),
    'free-launch',
    'Free queue launch (Join the line)',
    'd5f7d000-0004-4000-a000-000000000006'::uuid,
    'hard',
    'manual_review',
    'Launch date assigned (up to about five months)',
    'unknown',
    'free',
    NULL,
    'Submit a new product on the free Join the line tier. Uneed assigns your launch date; upvote score 10 keeps the listing live and 20 earns a dofollow backlink per their pricing page.',
    '[]'::jsonb,
    'external_doc',
    NULL,
    NULL,
    'https://uneed.best/pricing',
    'Uneed pricing',
    10,
    true
FROM public.link_directory_sites u
WHERE u.slug = 'uneed'
  AND NOT EXISTS (
      SELECT 1
      FROM public.link_directory_opportunities o
      WHERE o.site_id = u.id
        AND o.slug IN (
            'free-launch',
            'free-launch-join-the-line',
            'free-launch-join-the-line-'
        )
  )
ON CONFLICT (site_id, slug) DO UPDATE SET
    title = EXCLUDED.title,
    opportunity_type_id = EXCLUDED.opportunity_type_id,
    effort = EXCLUDED.effort,
    approval_mode = EXCLUDED.approval_mode,
    approval_time_hint = EXCLUDED.approval_time_hint,
    dofollow = EXCLUDED.dofollow,
    cost_tier = EXCLUDED.cost_tier,
    cost_note = EXCLUDED.cost_note,
    description = EXCLUDED.description,
    cta_href = EXCLUDED.cta_href,
    cta_label = EXCLUDED.cta_label,
    sort_order = EXCLUDED.sort_order,
    is_admin_published = EXCLUDED.is_admin_published,
    published_at = COALESCE(public.link_directory_opportunities.published_at, EXCLUDED.published_at);

UPDATE public.link_directory_opportunities o
SET sort_order = 15
FROM public.link_directory_sites s
WHERE o.site_id = s.id
  AND s.slug = 'uneed'
  AND o.slug = 'paid-launch';

UPDATE public.link_directory_opportunities o
SET
    auto_launch_enabled = true,
    auto_launch_provider_slug = 'uneed-join-line'
FROM public.link_directory_sites s
WHERE o.site_id = s.id
  AND s.slug = 'uneed'
  AND o.slug IN (
      'free-launch-join-the-line-',
      'free-launch-join-the-line',
      'free-launch'
  );

UPDATE public.link_directory_opportunities o
SET
    auto_launch_enabled = true,
    auto_launch_provider_slug = 'uneed-paid-launch'
FROM public.link_directory_sites s
WHERE o.site_id = s.id
  AND s.slug = 'uneed'
  AND o.slug = 'paid-launch';

UPDATE public.link_directory_opportunities o
SET
    auto_launch_enabled = true,
    auto_launch_provider_slug = 'uneed-maker-profile'
FROM public.link_directory_sites s
WHERE o.site_id = s.id
  AND s.slug = 'uneed'
  AND o.slug IN ('free-profile', 'free-maker-profile', '-free-maker-profile');

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
    v.id,
    v.provider_slug,
    v.opportunity_id,
    v.name,
    v.short_description,
    v.submission_path,
    v.start_url,
    v.extension_config,
    v.is_published,
    v.sort_order,
    v.picker_group_key,
    v.picker_group_title
FROM (
    VALUES
        (
            'd5f7d000-0030-4000-a000-000000000001'::uuid,
            'uneed-join-line'::text,
            (
                SELECT o.id
                FROM public.link_directory_opportunities o
                INNER JOIN public.link_directory_sites s ON s.id = o.site_id
                WHERE s.slug = 'uneed'
                  AND o.slug IN (
                      'free-launch-join-the-line-',
                      'free-launch-join-the-line',
                      'free-launch'
                  )
                ORDER BY
                    CASE o.slug
                        WHEN 'free-launch-join-the-line-' THEN 1
                        WHEN 'free-launch-join-the-line' THEN 2
                        WHEN 'free-launch' THEN 3
                        ELSE 4
                    END
                LIMIT 1
            ),
            'Uneed — Join the line',
            'Free product queue on Uneed; extension fills the listing form after you open Pricing.',
            'extension',
            'https://uneed.best/pricing',
            $json${
            "version": 1,
            "startUrlPatterns": [
                "https://uneed.best/*",
                "https://www.uneed.best/*"
            ],
            "readyUrlHint": "pricing",
            "steps": [
                {
                    "id": "product_info",
                    "label": "Product info",
                    "fields": [
                        {
                            "key": "name",
                            "label": "Product name",
                            "profilePath": "name",
                            "selectorHint": "input[name*='name' i], input[placeholder*='product' i]"
                        },
                        {
                            "key": "tagline",
                            "label": "Tagline",
                            "profilePath": "tagline",
                            "selectorHint": "input[name*='tagline' i], textarea[name*='tagline' i]"
                        },
                        {
                            "key": "description",
                            "label": "Description",
                            "profilePath": "description",
                            "selectorHint": "textarea[name*='description' i]"
                        },
                        {
                            "key": "website",
                            "label": "Website",
                            "profilePath": "website_url",
                            "selectorHint": "input[type='url'], input[name*='url' i]"
                        },
                        {
                            "key": "pricing_type",
                            "label": "Pricing",
                            "profilePath": "profile_data.pricing_type",
                            "selectorHint": "select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i]"
                        }
                    ]
                },
                {
                    "id": "media",
                    "label": "Logo & screenshots",
                    "fields": [
                        {
                            "key": "logo",
                            "label": "Logo",
                            "profilePath": "logo_url",
                            "selectorHint": "input[type='file'][accept*='image']"
                        },
                        {
                            "key": "gallery",
                            "label": "Gallery images",
                            "profilePath": "profile_data.gallery_urls",
                            "selectorHint": "input[type='file'][accept*='image']:not(:first-of-type)"
                        }
                    ]
                }
            ],
            "proof": {
                "successPathRegex": "/product/|/launch/",
                "listingUrlSelector": "a[href*='uneed.best'][href*='/product']"
            }
        }$json$::jsonb,
            true,
            10,
            'uneed-product-listing'::text,
            'Product listing'::text
        ),
        (
            'd5f7d000-0030-4000-a000-000000000002'::uuid,
            'uneed-paid-launch'::text,
            (
                SELECT o.id
                FROM public.link_directory_opportunities o
                INNER JOIN public.link_directory_sites s ON s.id = o.site_id
                WHERE s.slug = 'uneed'
                  AND o.slug = 'paid-launch'
                LIMIT 1
            ),
            'Uneed — Paid launch',
            'Skip the line, fast-track, or relaunch tiers; same listing fields as the free queue.',
            'extension',
            'https://uneed.best/pricing',
            $json${
            "version": 1,
            "startUrlPatterns": [
                "https://uneed.best/*",
                "https://www.uneed.best/*"
            ],
            "readyUrlHint": "pricing",
            "steps": [
                {
                    "id": "product_info",
                    "label": "Product info",
                    "fields": [
                        {
                            "key": "name",
                            "label": "Product name",
                            "profilePath": "name",
                            "selectorHint": "input[name*='name' i], input[placeholder*='product' i]"
                        },
                        {
                            "key": "tagline",
                            "label": "Tagline",
                            "profilePath": "tagline",
                            "selectorHint": "input[name*='tagline' i], textarea[name*='tagline' i]"
                        },
                        {
                            "key": "description",
                            "label": "Description",
                            "profilePath": "description",
                            "selectorHint": "textarea[name*='description' i]"
                        },
                        {
                            "key": "website",
                            "label": "Website",
                            "profilePath": "website_url",
                            "selectorHint": "input[type='url'], input[name*='url' i]"
                        },
                        {
                            "key": "pricing_type",
                            "label": "Pricing",
                            "profilePath": "profile_data.pricing_type",
                            "selectorHint": "select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i]"
                        }
                    ]
                },
                {
                    "id": "media",
                    "label": "Logo & screenshots",
                    "fields": [
                        {
                            "key": "logo",
                            "label": "Logo",
                            "profilePath": "logo_url",
                            "selectorHint": "input[type='file'][accept*='image']"
                        },
                        {
                            "key": "gallery",
                            "label": "Gallery images",
                            "profilePath": "profile_data.gallery_urls",
                            "selectorHint": "input[type='file'][accept*='image']:not(:first-of-type)"
                        }
                    ]
                },
                {
                    "id": "launch_notes",
                    "label": "Launch details",
                    "fields": [
                        {
                            "key": "launch_date",
                            "label": "Preferred launch date",
                            "profilePath": "profile_data.launch_date",
                            "selectorHint": "input[type='date'], [data-test*='date' i]"
                        },
                        {
                            "key": "tier_note",
                            "label": "Tier or promo code",
                            "profilePath": "profile_data.paid_tier_note",
                            "selectorHint": "input[name*='promo' i], input[name*='code' i]"
                        }
                    ]
                }
            ],
            "proof": {
                "successPathRegex": "/product/|/launch/",
                "listingUrlSelector": "a[href*='uneed.best'][href*='/product']"
            }
        }$json$::jsonb,
            true,
            20,
            'uneed-product-listing'::text,
            'Product listing'::text
        ),
        (
            'd5f7d000-0030-4000-a000-000000000003'::uuid,
            'uneed-maker-profile'::text,
            (
                SELECT o.id
                FROM public.link_directory_opportunities o
                INNER JOIN public.link_directory_sites s ON s.id = o.site_id
                WHERE s.slug = 'uneed'
                  AND o.slug IN ('free-profile', 'free-maker-profile', '-free-maker-profile')
                ORDER BY
                    CASE o.slug
                        WHEN '-free-maker-profile' THEN 1
                        WHEN 'free-maker-profile' THEN 2
                        WHEN 'free-profile' THEN 3
                        ELSE 4
                    END
                LIMIT 1
            ),
            'Uneed — Maker profile',
            'Free maker profile with a website field (typically nofollow).',
            'extension',
            'https://uneed.best/',
            $json${
            "version": 1,
            "startUrlPatterns": [
                "https://uneed.best/*",
                "https://www.uneed.best/*"
            ],
            "readyUrlHint": "profile",
            "steps": [
                {
                    "id": "profile_info",
                    "label": "Profile",
                    "fields": [
                        {
                            "key": "name",
                            "label": "Display name",
                            "profilePath": "name",
                            "selectorHint": "input[name*='name' i], input[placeholder*='name' i]"
                        },
                        {
                            "key": "website",
                            "label": "Website",
                            "profilePath": "website_url",
                            "selectorHint": "input[type='url'], input[name*='website' i]"
                        },
                        {
                            "key": "tagline",
                            "label": "Bio or tagline",
                            "profilePath": "tagline",
                            "selectorHint": "textarea[name*='bio' i], textarea[name*='about' i]"
                        }
                    ]
                }
            ],
            "proof": {
                "successPathRegex": "/profile/",
                "listingUrlSelector": "a[href*='uneed.best/profile']"
            }
        }$json$::jsonb,
            true,
            30,
            NULL::text,
            NULL::text
        )
) AS v (
    id,
    provider_slug,
    opportunity_id,
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
WHERE v.opportunity_id IS NOT NULL
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

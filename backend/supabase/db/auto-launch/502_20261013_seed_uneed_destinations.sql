-- ---------------------------
-- MODULE NAME: Auto Launch
-- MODULE DATE: 20261013
-- MODULE SCOPE: Seed (profile media bucket + Uneed destinations + editorial opportunity flags)
-- ---------------------------
-- Idempotent: matches opportunities on link_directory_sites.slug = 'uneed' + known opportunity
-- slugs (production CMS rows use random UUIDs; local exemplar uses fixed UUIDs).

BEGIN;

-- ---------------------------
-- Create Auto Launch profile media bucket (logo + gallery)
-- Object keys: {organizationId}/{profileId}/{filename}
-- ---------------------------
INSERT INTO storage.buckets (
    id,
    name,
    public,
    avif_autodetection,
    file_size_limit,
    allowed_mime_types
) VALUES (
    'auto_launch_profile_media',
    'auto_launch_profile_media',
    TRUE,
    FALSE,
    4194304, -- 4MB limit (matches API upload cap)
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

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
                        "id": "general",
                        "label": "General",
                        "fields": [
                            {
                                "key": "name",
                                "label": "Product name",
                                "profilePath": "name",
                                "fillMode": "text",
                                "selectorHint": "input[name*='name' i], input[placeholder*='product' i]"
                            },
                            {
                                "key": "slug",
                                "label": "Slug",
                                "profilePath": "profile_data.slug",
                                "fillMode": "text",
                                "selectorHint": "input[name*='slug' i], input[placeholder*='slug' i]"
                            },
                            {
                                "key": "website",
                                "label": "Website",
                                "profilePath": "website_url",
                                "fillMode": "text",
                                "selectorHint": "input[type='url'], input[name*='website' i], input[name*='url' i]"
                            },
                            {
                                "key": "tagline",
                                "label": "Tagline",
                                "profilePath": "tagline",
                                "fillMode": "text",
                                "selectorHint": "input[name*='tagline' i], textarea[name*='tagline' i], input[placeholder*='tagline' i]"
                            },
                            {
                                "key": "category",
                                "label": "Category",
                                "profilePath": "profile_data.category",
                                "fillMode": "select",
                                "selectorHint": "select[name*='categor' i], [role='combobox'][aria-label*='categor' i], input[name*='categor' i]"
                            },
                            {
                                "key": "pricing_type",
                                "label": "Pricing",
                                "profilePath": "profile_data.pricing_type",
                                "fillMode": "select",
                                "selectorHint": "select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i]"
                            },
                            {
                                "key": "tags",
                                "label": "Tags",
                                "profilePath": "profile_data.tags",
                                "fillMode": "tags",
                                "selectorHint": "input[name*='tag' i], [placeholder*='tag' i], [data-testid*='tag' i]"
                            },
                            {
                                "key": "is_open_source",
                                "label": "Open source",
                                "profilePath": "profile_data.is_open_source",
                                "fillMode": "boolean",
                                "selectorHint": "input[type='checkbox'][name*='open' i], [role='switch'][aria-label*='open source' i]"
                            },
                            {
                                "key": "repository_url",
                                "label": "Repository URL",
                                "profilePath": "profile_data.repository_url",
                                "fillMode": "text",
                                "selectorHint": "input[type='url'][name*='repo' i], input[name*='github' i], input[placeholder*='repository' i]"
                            },
                            {
                                "key": "description",
                                "label": "Rich description",
                                "profilePath": "description",
                                "fillMode": "rich_html",
                                "selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='description' i]"
                            }
                        ]
                    },
                    {
                        "id": "media",
                        "label": "Media",
                        "fields": [
                            {
                                "key": "logo",
                                "label": "Logo",
                                "profilePath": "logo_url",
                                "selectorHint": "input[type='file'][accept*='image']"
                            },
                            {
                                "key": "launch_video_url",
                                "label": "Launch video URL",
                                "profilePath": "profile_data.launch_video_url",
                                "fillMode": "text",
                                "selectorHint": "input[type='url'][name*='video' i], input[placeholder*='video' i], input[name*='youtube' i]"
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
                        "id": "socials",
                        "label": "Socials",
                        "fields": [
                            {
                                "key": "social_x",
                                "label": "X (Twitter)",
                                "profilePath": "profile_data.social_x",
                                "fillMode": "text",
                                "selectorHint": "input[name*='twitter' i], input[name*='x.com' i], input[placeholder*='twitter' i]"
                            },
                            {
                                "key": "social_github",
                                "label": "GitHub",
                                "profilePath": "profile_data.social_github",
                                "fillMode": "text",
                                "selectorHint": "input[name*='github' i], input[placeholder*='github' i]"
                            },
                            {
                                "key": "social_instagram",
                                "label": "Instagram",
                                "profilePath": "profile_data.social_instagram",
                                "fillMode": "text",
                                "selectorHint": "input[name*='instagram' i], input[placeholder*='instagram' i]"
                            },
                            {
                                "key": "social_linkedin",
                                "label": "LinkedIn",
                                "profilePath": "profile_data.social_linkedin",
                                "fillMode": "text",
                                "selectorHint": "input[name*='linkedin' i], input[placeholder*='linkedin' i]"
                            },
                            {
                                "key": "social_tiktok",
                                "label": "TikTok",
                                "profilePath": "profile_data.social_tiktok",
                                "fillMode": "text",
                                "selectorHint": "input[name*='tiktok' i], input[placeholder*='tiktok' i]"
                            },
                            {
                                "key": "social_facebook",
                                "label": "Facebook",
                                "profilePath": "profile_data.social_facebook",
                                "fillMode": "text",
                                "selectorHint": "input[name*='facebook' i], input[placeholder*='facebook' i]"
                            },
                            {
                                "key": "social_youtube",
                                "label": "YouTube",
                                "profilePath": "profile_data.social_youtube",
                                "fillMode": "text",
                                "selectorHint": "input[name*='youtube' i], input[placeholder*='youtube' i]"
                            },
                            {
                                "key": "social_bluesky",
                                "label": "Bluesky",
                                "profilePath": "profile_data.social_bluesky",
                                "fillMode": "text",
                                "selectorHint": "input[name*='bluesky' i], input[name*='bsky' i], input[placeholder*='bluesky' i]"
                            }
                        ]
                    },
                    {
                        "id": "sell",
                        "label": "Sell",
                        "fields": [
                            {
                                "key": "acquisition_listed",
                                "label": "Listed for acquisition",
                                "profilePath": "profile_data.acquisition_listed",
                                "fillMode": "boolean",
                                "selectorHint": "input[type='checkbox'][name*='acquisition' i], input[type='checkbox'][name*='sell' i], [role='switch'][aria-label*='acquisition' i]"
                            },
                            {
                                "key": "asking_price_usd",
                                "label": "Asking price (USD)",
                                "profilePath": "profile_data.asking_price_usd",
                                "fillMode": "text",
                                "selectorHint": "input[name*='asking' i], input[name*='price' i][type='number'], input[placeholder*='asking' i]"
                            },
                            {
                                "key": "ttm_revenue_usd",
                                "label": "TTM revenue (USD)",
                                "profilePath": "profile_data.ttm_revenue_usd",
                                "fillMode": "text",
                                "selectorHint": "input[name*='ttm' i][name*='revenue' i], input[name*='ttm_revenue' i], input[placeholder*='TTM revenue' i]"
                            },
                            {
                                "key": "monthly_revenue_usd",
                                "label": "Monthly revenue (USD)",
                                "profilePath": "profile_data.monthly_revenue_usd",
                                "fillMode": "text",
                                "selectorHint": "input[name*='monthly' i][name*='revenue' i], input[name*='monthly_revenue' i]"
                            },
                            {
                                "key": "ttm_profit_usd",
                                "label": "TTM profit (USD)",
                                "profilePath": "profile_data.ttm_profit_usd",
                                "fillMode": "text",
                                "selectorHint": "input[name*='ttm' i][name*='profit' i], input[name*='ttm_profit' i]"
                            },
                            {
                                "key": "monthly_profit_usd",
                                "label": "Monthly profit (USD)",
                                "profilePath": "profile_data.monthly_profit_usd",
                                "fillMode": "text",
                                "selectorHint": "input[name*='monthly' i][name*='profit' i], input[name*='monthly_profit' i]"
                            },
                            {
                                "key": "selling_reason",
                                "label": "Selling reason",
                                "profilePath": "profile_data.selling_reason",
                                "fillMode": "text",
                                "selectorHint": "textarea[name*='reason' i], textarea[name*='selling' i], textarea[placeholder*='reason' i]"
                            },
                            {
                                "key": "included_assets",
                                "label": "Included assets",
                                "profilePath": "profile_data.included_assets",
                                "fillMode": "tags",
                                "selectorHint": "input[type='checkbox'][name*='asset' i], fieldset[name*='included' i] input[type='checkbox']"
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
                        "id": "general",
                        "label": "General",
                        "fields": [
                            {
                                "key": "name",
                                "label": "Product name",
                                "profilePath": "name",
                                "fillMode": "text",
                                "selectorHint": "input[name*='name' i], input[placeholder*='product' i]"
                            },
                            {
                                "key": "slug",
                                "label": "Slug",
                                "profilePath": "profile_data.slug",
                                "fillMode": "text",
                                "selectorHint": "input[name*='slug' i], input[placeholder*='slug' i]"
                            },
                            {
                                "key": "website",
                                "label": "Website",
                                "profilePath": "website_url",
                                "fillMode": "text",
                                "selectorHint": "input[type='url'], input[name*='website' i], input[name*='url' i]"
                            },
                            {
                                "key": "tagline",
                                "label": "Tagline",
                                "profilePath": "tagline",
                                "fillMode": "text",
                                "selectorHint": "input[name*='tagline' i], textarea[name*='tagline' i], input[placeholder*='tagline' i]"
                            },
                            {
                                "key": "category",
                                "label": "Category",
                                "profilePath": "profile_data.category",
                                "fillMode": "select",
                                "selectorHint": "select[name*='categor' i], [role='combobox'][aria-label*='categor' i], input[name*='categor' i]"
                            },
                            {
                                "key": "pricing_type",
                                "label": "Pricing",
                                "profilePath": "profile_data.pricing_type",
                                "fillMode": "select",
                                "selectorHint": "select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i]"
                            },
                            {
                                "key": "tags",
                                "label": "Tags",
                                "profilePath": "profile_data.tags",
                                "fillMode": "tags",
                                "selectorHint": "input[name*='tag' i], [placeholder*='tag' i], [data-testid*='tag' i]"
                            },
                            {
                                "key": "is_open_source",
                                "label": "Open source",
                                "profilePath": "profile_data.is_open_source",
                                "fillMode": "boolean",
                                "selectorHint": "input[type='checkbox'][name*='open' i], [role='switch'][aria-label*='open source' i]"
                            },
                            {
                                "key": "repository_url",
                                "label": "Repository URL",
                                "profilePath": "profile_data.repository_url",
                                "fillMode": "text",
                                "selectorHint": "input[type='url'][name*='repo' i], input[name*='github' i], input[placeholder*='repository' i]"
                            },
                            {
                                "key": "description",
                                "label": "Rich description",
                                "profilePath": "description",
                                "fillMode": "rich_html",
                                "selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='description' i]"
                            }
                        ]
                    },
                    {
                        "id": "media",
                        "label": "Media",
                        "fields": [
                            {
                                "key": "logo",
                                "label": "Logo",
                                "profilePath": "logo_url",
                                "selectorHint": "input[type='file'][accept*='image']"
                            },
                            {
                                "key": "launch_video_url",
                                "label": "Launch video URL",
                                "profilePath": "profile_data.launch_video_url",
                                "fillMode": "text",
                                "selectorHint": "input[type='url'][name*='video' i], input[placeholder*='video' i], input[name*='youtube' i]"
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
                        "id": "socials",
                        "label": "Socials",
                        "fields": [
                            {
                                "key": "social_x",
                                "label": "X (Twitter)",
                                "profilePath": "profile_data.social_x",
                                "fillMode": "text",
                                "selectorHint": "input[name*='twitter' i], input[name*='x.com' i], input[placeholder*='twitter' i]"
                            },
                            {
                                "key": "social_github",
                                "label": "GitHub",
                                "profilePath": "profile_data.social_github",
                                "fillMode": "text",
                                "selectorHint": "input[name*='github' i], input[placeholder*='github' i]"
                            },
                            {
                                "key": "social_instagram",
                                "label": "Instagram",
                                "profilePath": "profile_data.social_instagram",
                                "fillMode": "text",
                                "selectorHint": "input[name*='instagram' i], input[placeholder*='instagram' i]"
                            },
                            {
                                "key": "social_linkedin",
                                "label": "LinkedIn",
                                "profilePath": "profile_data.social_linkedin",
                                "fillMode": "text",
                                "selectorHint": "input[name*='linkedin' i], input[placeholder*='linkedin' i]"
                            },
                            {
                                "key": "social_tiktok",
                                "label": "TikTok",
                                "profilePath": "profile_data.social_tiktok",
                                "fillMode": "text",
                                "selectorHint": "input[name*='tiktok' i], input[placeholder*='tiktok' i]"
                            },
                            {
                                "key": "social_facebook",
                                "label": "Facebook",
                                "profilePath": "profile_data.social_facebook",
                                "fillMode": "text",
                                "selectorHint": "input[name*='facebook' i], input[placeholder*='facebook' i]"
                            },
                            {
                                "key": "social_youtube",
                                "label": "YouTube",
                                "profilePath": "profile_data.social_youtube",
                                "fillMode": "text",
                                "selectorHint": "input[name*='youtube' i], input[placeholder*='youtube' i]"
                            },
                            {
                                "key": "social_bluesky",
                                "label": "Bluesky",
                                "profilePath": "profile_data.social_bluesky",
                                "fillMode": "text",
                                "selectorHint": "input[name*='bluesky' i], input[name*='bsky' i], input[placeholder*='bluesky' i]"
                            }
                        ]
                    },
                    {
                        "id": "sell",
                        "label": "Sell",
                        "fields": [
                            {
                                "key": "acquisition_listed",
                                "label": "Listed for acquisition",
                                "profilePath": "profile_data.acquisition_listed",
                                "fillMode": "boolean",
                                "selectorHint": "input[type='checkbox'][name*='acquisition' i], input[type='checkbox'][name*='sell' i], [role='switch'][aria-label*='acquisition' i]"
                            },
                            {
                                "key": "asking_price_usd",
                                "label": "Asking price (USD)",
                                "profilePath": "profile_data.asking_price_usd",
                                "fillMode": "text",
                                "selectorHint": "input[name*='asking' i], input[name*='price' i][type='number'], input[placeholder*='asking' i]"
                            },
                            {
                                "key": "ttm_revenue_usd",
                                "label": "TTM revenue (USD)",
                                "profilePath": "profile_data.ttm_revenue_usd",
                                "fillMode": "text",
                                "selectorHint": "input[name*='ttm' i][name*='revenue' i], input[name*='ttm_revenue' i], input[placeholder*='TTM revenue' i]"
                            },
                            {
                                "key": "monthly_revenue_usd",
                                "label": "Monthly revenue (USD)",
                                "profilePath": "profile_data.monthly_revenue_usd",
                                "fillMode": "text",
                                "selectorHint": "input[name*='monthly' i][name*='revenue' i], input[name*='monthly_revenue' i]"
                            },
                            {
                                "key": "ttm_profit_usd",
                                "label": "TTM profit (USD)",
                                "profilePath": "profile_data.ttm_profit_usd",
                                "fillMode": "text",
                                "selectorHint": "input[name*='ttm' i][name*='profit' i], input[name*='ttm_profit' i]"
                            },
                            {
                                "key": "monthly_profit_usd",
                                "label": "Monthly profit (USD)",
                                "profilePath": "profile_data.monthly_profit_usd",
                                "fillMode": "text",
                                "selectorHint": "input[name*='monthly' i][name*='profit' i], input[name*='monthly_profit' i]"
                            },
                            {
                                "key": "selling_reason",
                                "label": "Selling reason",
                                "profilePath": "profile_data.selling_reason",
                                "fillMode": "text",
                                "selectorHint": "textarea[name*='reason' i], textarea[name*='selling' i], textarea[placeholder*='reason' i]"
                            },
                            {
                                "key": "included_assets",
                                "label": "Included assets",
                                "profilePath": "profile_data.included_assets",
                                "fillMode": "tags",
                                "selectorHint": "input[type='checkbox'][name*='asset' i], fieldset[name*='included' i] input[type='checkbox']"
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
                                "fillMode": "text",
                                "selectorHint": "input[type='date'], [data-test*='date' i]"
                            },
                            {
                                "key": "tier_note",
                                "label": "Tier or promo code",
                                "profilePath": "profile_data.paid_tier_note",
                                "fillMode": "text",
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
                                "fillMode": "text",
                                "selectorHint": "input[name*='name' i], input[placeholder*='name' i]"
                            },
                            {
                                "key": "website",
                                "label": "Website",
                                "profilePath": "website_url",
                                "fillMode": "text",
                                "selectorHint": "input[type='url'], input[name*='website' i]"
                            },
                            {
                                "key": "tagline",
                                "label": "Bio or tagline",
                                "profilePath": "tagline",
                                "fillMode": "text",
                                "selectorHint": "textarea[name*='bio' i], textarea[name*='about' i], textarea[name*='tagline' i]"
                            }
                        ]
                    },
                    {
                        "id": "socials",
                        "label": "Socials",
                        "fields": [
                            {
                                "key": "social_x",
                                "label": "X (Twitter)",
                                "profilePath": "profile_data.social_x",
                                "fillMode": "text",
                                "selectorHint": "input[name*='twitter' i], input[name*='x.com' i], input[placeholder*='twitter' i]"
                            },
                            {
                                "key": "social_github",
                                "label": "GitHub",
                                "profilePath": "profile_data.social_github",
                                "fillMode": "text",
                                "selectorHint": "input[name*='github' i], input[placeholder*='github' i]"
                            },
                            {
                                "key": "social_instagram",
                                "label": "Instagram",
                                "profilePath": "profile_data.social_instagram",
                                "fillMode": "text",
                                "selectorHint": "input[name*='instagram' i], input[placeholder*='instagram' i]"
                            },
                            {
                                "key": "social_linkedin",
                                "label": "LinkedIn",
                                "profilePath": "profile_data.social_linkedin",
                                "fillMode": "text",
                                "selectorHint": "input[name*='linkedin' i], input[placeholder*='linkedin' i]"
                            },
                            {
                                "key": "social_tiktok",
                                "label": "TikTok",
                                "profilePath": "profile_data.social_tiktok",
                                "fillMode": "text",
                                "selectorHint": "input[name*='tiktok' i], input[placeholder*='tiktok' i]"
                            },
                            {
                                "key": "social_facebook",
                                "label": "Facebook",
                                "profilePath": "profile_data.social_facebook",
                                "fillMode": "text",
                                "selectorHint": "input[name*='facebook' i], input[placeholder*='facebook' i]"
                            },
                            {
                                "key": "social_youtube",
                                "label": "YouTube",
                                "profilePath": "profile_data.social_youtube",
                                "fillMode": "text",
                                "selectorHint": "input[name*='youtube' i], input[placeholder*='youtube' i]"
                            },
                            {
                                "key": "social_bluesky",
                                "label": "Bluesky",
                                "profilePath": "profile_data.social_bluesky",
                                "fillMode": "text",
                                "selectorHint": "input[name*='bluesky' i], input[name*='bsky' i], input[placeholder*='bluesky' i]"
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

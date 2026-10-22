-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20261016
-- MODULE SCOPE: Seed (PeerPush site, free queue + Standard launch opportunities, catalog logo path)
-- ---------------------------

BEGIN;

INSERT INTO public.link_directory_sites (
    id,
    published_at,
    slug,
    title,
    site_url,
    logo_url,
    short_description,
    long_description,
    domain_rating,
    monthly_visits,
    metrics_source,
    metrics_updated_at,
    category_id,
    is_openquok_auth_supported,
    openquok_channel_slug,
    is_admin_published,
    sort_order,
    tag_slugs
) VALUES
    (
        'd5f7d000-0010-4000-a000-000000000008',
        NOW(),
        'peerpush',
        'PeerPush',
        'https://peerpush.com',
        'https://www.openquok.com/icons/link-directory/peerpush.svg',
        'Product discovery for people and AI with structured listings and a builder community.',
        'PeerPush catalogs products with controlled vocabularies for use cases, audiences, platforms, and pricing so humans and AI assistants can discover tools. Free submissions join a publishing queue; Standard Launch publishes instantly with a permanent listing.',
        52,
        1388303,
        'editor_estimate',
        NOW(),
        'd5f7d000-0001-4000-a000-000000000002',
        false,
        NULL,
        true,
        0,
        ARRAY['high-dr']::text[]
    )
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    site_url = EXCLUDED.site_url,
    logo_url = COALESCE(EXCLUDED.logo_url, public.link_directory_sites.logo_url),
    short_description = EXCLUDED.short_description,
    long_description = EXCLUDED.long_description,
    domain_rating = EXCLUDED.domain_rating,
    monthly_visits = EXCLUDED.monthly_visits,
    metrics_source = EXCLUDED.metrics_source,
    metrics_updated_at = EXCLUDED.metrics_updated_at,
    category_id = EXCLUDED.category_id,
    is_openquok_auth_supported = EXCLUDED.is_openquok_auth_supported,
    openquok_channel_slug = EXCLUDED.openquok_channel_slug,
    is_admin_published = EXCLUDED.is_admin_published,
    sort_order = EXCLUDED.sort_order,
    tag_slugs = EXCLUDED.tag_slugs,
    published_at = COALESCE(public.link_directory_sites.published_at, EXCLUDED.published_at);

INSERT INTO public.link_directory_site_tags_association (site_id, link_directory_tag_id)
SELECT s.id, t.id
FROM public.link_directory_sites s
JOIN public.link_directory_tags t ON t.slug = ANY (s.tag_slugs)
WHERE s.slug = 'peerpush'
ON CONFLICT DO NOTHING;

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
    is_admin_published,
    auto_launch_enabled,
    auto_launch_provider_slug
)
SELECT
    'd5f7d000-0020-4000-a000-000000000016'::uuid,
    s.id,
    NOW(),
    'standard-launch',
    'Standard launch',
    'd5f7d000-0004-4000-a000-000000000006'::uuid,
    'medium',
    'manual_review',
    'Usually within a few business days after publish',
    'dofollow',
    'paid',
    'Check current pricing on PeerPush',
    'Standard Launch ($39 one-time on peerpush.com/pricing) publishes instantly with a permanent listing link to your website. Product pages on PeerPush typically link to your site without nofollow on listing pages — confirm rel on your live peerpush.com/p/… URL.',
    '[
        {"order":1,"title":"Review pricing","body":"Compare Standard Launch with the free queue on https://peerpush.com/pricing before you checkout."},
        {"order":2,"title":"Open submit","body":"Sign in at https://peerpush.com/submit and start a new product submission."},
        {"order":3,"title":"Publish listing","body":"Confirm copy, discovery tags, screenshots, and pricing. Complete checkout for Standard Launch to go live immediately."}
    ]'::jsonb,
    'external_doc',
    NULL,
    NULL,
    'https://peerpush.com/submit',
    'Submit on PeerPush',
    15,
    true,
    true,
    'peerpush-standard-launch'
FROM public.link_directory_sites s
WHERE s.slug = 'peerpush'
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
    steps = EXCLUDED.steps,
    openquok_cta_kind = EXCLUDED.openquok_cta_kind,
    openquok_channel_slug = EXCLUDED.openquok_channel_slug,
    openquok_plug_name = EXCLUDED.openquok_plug_name,
    cta_href = EXCLUDED.cta_href,
    cta_label = EXCLUDED.cta_label,
    sort_order = EXCLUDED.sort_order,
    is_admin_published = EXCLUDED.is_admin_published,
    auto_launch_enabled = EXCLUDED.auto_launch_enabled,
    auto_launch_provider_slug = EXCLUDED.auto_launch_provider_slug,
    published_at = COALESCE(public.link_directory_opportunities.published_at, EXCLUDED.published_at);

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
    is_admin_published,
    auto_launch_enabled,
    auto_launch_provider_slug
)
SELECT
    'd5f7d000-0020-4000-a000-000000000017'::uuid,
    s.id,
    NOW(),
    'free-queue',
    'Free submission queue',
    'd5f7d000-0004-4000-a000-000000000006'::uuid,
    'hard',
    'manual_review',
    'Waits behind paid Standard Launch submissions',
    'unknown',
    'free',
    NULL,
    'Submit for free on peerpush.com/pricing and wait in line behind paid launches. You still add a website URL on the listing; PeerPush does not document dofollow vs nofollow for the free tier — verify rel on your public product page after publish.',
    '[
        {"order":1,"title":"Open pricing","body":"Review Standard Launch vs the free queue on https://peerpush.com/pricing."},
        {"order":2,"title":"Submit for free","body":"Choose Submit for Free and complete the product form at https://peerpush.com/submit."},
        {"order":3,"title":"Wait for publish","body":"Free listings publish after paid queue volume clears; confirm your live listing URL when it goes live."}
    ]'::jsonb,
    'external_doc',
    NULL,
    NULL,
    'https://peerpush.com/pricing',
    'PeerPush pricing',
    10,
    true,
    true,
    'peerpush-free-queue'
FROM public.link_directory_sites s
WHERE s.slug = 'peerpush'
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
    steps = EXCLUDED.steps,
    openquok_cta_kind = EXCLUDED.openquok_cta_kind,
    openquok_channel_slug = EXCLUDED.openquok_channel_slug,
    openquok_plug_name = EXCLUDED.openquok_plug_name,
    cta_href = EXCLUDED.cta_href,
    cta_label = EXCLUDED.cta_label,
    sort_order = EXCLUDED.sort_order,
    is_admin_published = EXCLUDED.is_admin_published,
    auto_launch_enabled = EXCLUDED.auto_launch_enabled,
    auto_launch_provider_slug = EXCLUDED.auto_launch_provider_slug,
    published_at = COALESCE(public.link_directory_opportunities.published_at, EXCLUDED.published_at);

UPDATE public.link_directory_sites s
SET tag_slugs = sub.slugs
FROM (
    SELECT
        sta.site_id,
        ARRAY_AGG(t.slug ORDER BY t.slug) AS slugs
    FROM public.link_directory_site_tags_association sta
    INNER JOIN public.link_directory_tags t ON t.id = sta.link_directory_tag_id
    WHERE sta.site_id IN (SELECT id FROM public.link_directory_sites WHERE slug = 'peerpush')
    GROUP BY sta.site_id
) sub
WHERE s.id = sub.site_id;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

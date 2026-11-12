-- ---------------------------
-- MODULE NAME: Link Directory
-- MODULE DATE: 20261110
-- MODULE SCOPE: Seed (Open Launch premium + free opportunities for auto-launch destination joins)
-- ---------------------------
-- Production may author these in CMS; local / CI needs rows so auto_launch_destinations 504_* INSERT … SELECT succeeds.

BEGIN;

UPDATE public.link_directory_sites
SET
    site_url = 'https://open-launch.com',
    short_description = 'Launch and list startup projects on open-launch.com.',
    long_description = COALESCE(
        long_description,
        'Open Launch runs product launch slots (free queue and premium submit). Listings can link to your site when published.'
    ),
    is_admin_published = true,
    published_at = COALESCE(published_at, NOW())
WHERE slug = 'open-launch';

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
    'd5f7d000-0020-4000-a000-000000000018'::uuid,
    s.id,
    NOW(),
    'premium-launch',
    'Premium launch',
    'd5f7d000-0004-4000-a000-000000000006'::uuid,
    'medium',
    'manual_review',
    'Usually within a few business days after submit',
    'unknown',
    'paid',
    'Check current pricing on Open Launch',
    'Premium submit at open-launch.com/projects/submit lists your project when the slot is approved.',
    '[
        {"order":1,"title":"Open pricing","body":"Review free vs premium on https://open-launch.com/pricing."},
        {"order":2,"title":"Submit project","body":"Sign in and complete the submit wizard at https://open-launch.com/projects/submit."},
        {"order":3,"title":"Confirm listing","body":"Verify categories, tech stack, and links before you publish on Open Launch."}
    ]'::jsonb,
    'external_doc',
    NULL,
    NULL,
    'https://open-launch.com/projects/submit',
    'Submit on Open Launch',
    20,
    true,
    true,
    'open-launch-premium-launch'
FROM public.link_directory_sites s
WHERE s.slug = 'open-launch'
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
    'd5f7d000-0020-4000-a000-000000000019'::uuid,
    s.id,
    NOW(),
    'free-launch',
    'Free launch',
    'd5f7d000-0004-4000-a000-000000000006'::uuid,
    'hard',
    'manual_review',
    'Free queue; timing varies by slot availability',
    'unknown',
    'free',
    NULL,
    'Join the free launch queue from open-launch.com/pricing, then complete submit when your slot is ready.',
    '[
        {"order":1,"title":"Open pricing","body":"Choose the free queue on https://open-launch.com/pricing."},
        {"order":2,"title":"Prepare submit","body":"Have your project URL, logo, and discovery tags ready for the submit form."},
        {"order":3,"title":"Publish","body":"Confirm your live listing URL on Open Launch when the slot goes live."}
    ]'::jsonb,
    'external_doc',
    NULL,
    NULL,
    'https://open-launch.com/pricing',
    'Open Launch pricing',
    10,
    true,
    true,
    'open-launch-free-launch'
FROM public.link_directory_sites s
WHERE s.slug = 'open-launch'
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

COMMIT;

-- ---------------------------
-- MODULE NAME: Listing Categories
-- MODULE DATE: 20260628
-- MODULE SCOPE: Seed
-- ---------------------------

BEGIN;

INSERT INTO public.listing_categories (
    id,
    parent_path,
    name,
    slug,
    description,
    emoji
) VALUES
    (
        'd5f7b000-0000-4000-a000-000000000001',
        '/',
        'Creative & media',
        'creative-media',
        'Generate brand assets, images, and media to upload and schedule with OpenQuok.',
        '🎨'
    ),
    (
        'd5f7b000-0000-4000-a000-000000000002',
        '/',
        'Analytics & metrics',
        'analytics-metrics',
        'Read live metrics and KPIs to draft social updates for human review.',
        '📊'
    ),
    (
        'd5f7b000-0000-4000-a000-000000000003',
        '/',
        'Research & trends',
        'research-trends',
        'Discover trends, competitors, and ideas before drafting posts.',
        '🔍'
    ),
    (
        'd5f7b000-0000-4000-a000-000000000004',
        '/',
        'Developer & releases',
        'developer-releases',
        'Ship notes, changelogs, and launch announcements to social channels.',
        '🚀'
    ),
    (
        'd5f7b000-0000-4000-a000-000000000005',
        '/',
        'Productivity & ops',
        'productivity-ops',
        'Pull tasks, docs, and ops context into social-ready snippets.',
        '⚡'
    ),
    (
        'd5f7b000-0000-4000-a000-000000000006',
        '/',
        'Social publishing',
        'social-publishing',
        'Schedule, draft, and publish posts across connected social channels with OpenQuok.',
        '📣'
    )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

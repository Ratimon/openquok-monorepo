-- ---------------------------
-- MODULE NAME: Listing Tags
-- MODULE DATE: 20260628
-- MODULE SCOPE: Seed
-- ---------------------------

BEGIN;

INSERT INTO public.listing_tags (
    id,
    name,
    slug,
    description
) VALUES
    (
        'd5f7c000-0000-4000-a000-000000000001',
        'Threads',
        'threads',
        'Meta Threads channel integrations and workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-000000000002',
        'Instagram',
        'instagram',
        'Instagram feed, Reels, Stories, and carousel workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-000000000003',
        'TikTok',
        'tiktok',
        'TikTok publish, inbox upload, and draft workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-000000000004',
        'LinkedIn',
        'linkedin',
        'LinkedIn profile and Page posting workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-000000000005',
        'YouTube',
        'youtube',
        'YouTube upload, metadata, and channel analytics workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-000000000006',
        'X',
        'x',
        'X (Twitter) posting, threads, and analytics workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-000000000007',
        'OpenClaw',
        'openclaw',
        'Skills and MCP servers for OpenClaw agents.'
    ),
    (
        'd5f7c000-0000-4000-a000-000000000008',
        'Hermes',
        'hermes',
        'Skills and MCP servers for Hermes Agent.'
    ),
    (
        'd5f7c000-0000-4000-a000-000000000009',
        'Cursor',
        'cursor',
        'Cursor IDE MCP setup and agent workflows.'
    )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

-- ---------------------------
-- MODULE NAME: Listing Tags
-- MODULE DATE: 20260629
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
        'd5f7c000-0000-4000-a000-00000000000a',
        'Antigravity CLI',
        'antigravity-cli',
        'Antigravity CLI (agy) terminal agent and MCP workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-00000000000b',
        'Codex',
        'codex',
        'OpenAI Codex terminal and IDE agent MCP workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-00000000000c',
        'Claude Code',
        'claude-code',
        'Anthropic Claude Code terminal agent MCP workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-00000000000d',
        'Claude Cowork',
        'claude-cowork',
        'Claude Cowork organization connector and MCP workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-00000000000e',
        'VS Code / Copilot',
        'vscode-copilot',
        'VS Code and GitHub Copilot MCP workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-00000000000f',
        'Devin Desktop',
        'devin-desktop',
        'Devin Desktop local agent MCP workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-000000000010',
        'Amp',
        'amp',
        'Amp coding agent terminal and IDE MCP workflows.'
    ),
    (
        'd5f7c000-0000-4000-a000-000000000011',
        'Warp',
        'warp',
        'Warp terminal AI and MCP workflows.'
    )
ON CONFLICT (id) DO NOTHING;

-- Tag groups for Extensions Hub filters. Base channel tags are seeded in 501_20260628_seed.sql;
-- agent and MCP client tags above extend that catalog. A tag may belong to multiple groups.
--
--   Videos            — video-first publish workflows (YouTube, TikTok)
--   Social platforms  — every social channel tag in the catalog
--   Photos            — image-first feed workflows (Instagram)
--   Text              — text and microblog channels (Threads, LinkedIn, X)
--   Autonomous agents — self-hosted agent hosts (OpenClaw, Hermes)
--   CLI               — terminal-first MCP clients
--   IDE               — editor and desktop MCP clients

INSERT INTO public.listing_tag_groups (
    id,
    name
) VALUES
    (
        'd5f7c100-0000-4000-a000-000000000001',
        'Videos'
    ),
    (
        'd5f7c100-0000-4000-a000-000000000002',
        'Social platforms'
    ),
    (
        'd5f7c100-0000-4000-a000-000000000003',
        'Autonomous agents'
    ),
    (
        'd5f7c100-0000-4000-a000-000000000004',
        'CLI'
    ),
    (
        'd5f7c100-0000-4000-a000-000000000005',
        'IDE'
    ),
    (
        'd5f7c100-0000-4000-a000-000000000006',
        'Photos'
    ),
    (
        'd5f7c100-0000-4000-a000-000000000007',
        'Text'
    )
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    updated_at = NOW();

DELETE FROM public.listing_tag_groups_listing_tags_association
WHERE listing_tag_group_id IN (
    'd5f7c100-0000-4000-a000-000000000001',
    'd5f7c100-0000-4000-a000-000000000002',
    'd5f7c100-0000-4000-a000-000000000003',
    'd5f7c100-0000-4000-a000-000000000004',
    'd5f7c100-0000-4000-a000-000000000005',
    'd5f7c100-0000-4000-a000-000000000006',
    'd5f7c100-0000-4000-a000-000000000007'
);

INSERT INTO public.listing_tag_groups_listing_tags_association (
    listing_tag_id,
    listing_tag_group_id
) VALUES
    -- Videos: youtube, tiktok
    ('d5f7c000-0000-4000-a000-000000000005', 'd5f7c100-0000-4000-a000-000000000001'), -- youtube
    ('d5f7c000-0000-4000-a000-000000000003', 'd5f7c100-0000-4000-a000-000000000001'), -- tiktok
    -- Social platforms: threads, instagram, tiktok, linkedin, youtube, x
    ('d5f7c000-0000-4000-a000-000000000001', 'd5f7c100-0000-4000-a000-000000000002'), -- threads
    ('d5f7c000-0000-4000-a000-000000000002', 'd5f7c100-0000-4000-a000-000000000002'), -- instagram
    ('d5f7c000-0000-4000-a000-000000000003', 'd5f7c100-0000-4000-a000-000000000002'), -- tiktok
    ('d5f7c000-0000-4000-a000-000000000004', 'd5f7c100-0000-4000-a000-000000000002'), -- linkedin
    ('d5f7c000-0000-4000-a000-000000000005', 'd5f7c100-0000-4000-a000-000000000002'), -- youtube
    ('d5f7c000-0000-4000-a000-000000000006', 'd5f7c100-0000-4000-a000-000000000002'), -- x
    -- Photos: instagram
    ('d5f7c000-0000-4000-a000-000000000002', 'd5f7c100-0000-4000-a000-000000000006'), -- instagram
    -- Text: threads, linkedin, x
    ('d5f7c000-0000-4000-a000-000000000001', 'd5f7c100-0000-4000-a000-000000000007'), -- threads
    ('d5f7c000-0000-4000-a000-000000000004', 'd5f7c100-0000-4000-a000-000000000007'), -- linkedin
    ('d5f7c000-0000-4000-a000-000000000006', 'd5f7c100-0000-4000-a000-000000000007'), -- x
    -- Autonomous agents: openclaw, hermes
    ('d5f7c000-0000-4000-a000-000000000007', 'd5f7c100-0000-4000-a000-000000000003'), -- openclaw
    ('d5f7c000-0000-4000-a000-000000000008', 'd5f7c100-0000-4000-a000-000000000003'), -- hermes
    -- CLI: antigravity-cli, codex, claude-code, amp, warp
    ('d5f7c000-0000-4000-a000-00000000000a', 'd5f7c100-0000-4000-a000-000000000004'), -- antigravity-cli
    ('d5f7c000-0000-4000-a000-00000000000b', 'd5f7c100-0000-4000-a000-000000000004'), -- codex
    ('d5f7c000-0000-4000-a000-00000000000c', 'd5f7c100-0000-4000-a000-000000000004'), -- claude-code
    ('d5f7c000-0000-4000-a000-000000000010', 'd5f7c100-0000-4000-a000-000000000004'), -- amp
    ('d5f7c000-0000-4000-a000-000000000011', 'd5f7c100-0000-4000-a000-000000000004'), -- warp
    -- IDE: cursor, claude-cowork, vscode-copilot, devin-desktop
    ('d5f7c000-0000-4000-a000-000000000009', 'd5f7c100-0000-4000-a000-000000000005'), -- cursor
    ('d5f7c000-0000-4000-a000-00000000000d', 'd5f7c100-0000-4000-a000-000000000005'), -- claude-cowork
    ('d5f7c000-0000-4000-a000-00000000000e', 'd5f7c100-0000-4000-a000-000000000005'), -- vscode-copilot
    ('d5f7c000-0000-4000-a000-00000000000f', 'd5f7c100-0000-4000-a000-000000000005')  -- devin-desktop
ON CONFLICT DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

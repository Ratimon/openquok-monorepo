-- ---------------------------
-- MODULE NAME: Listings
-- MODULE DATE: 20260629
-- MODULE SCOPE: Seed (openquok-core)
-- ---------------------------
-- Sync openquok-core listing tags with the full listing_tags catalog.
-- MCP About tab: description_mcp + content_mcp. mcp_tools → hub card + ExtensionMcpToolsTable on detail.

BEGIN;

UPDATE public.listings
SET
    click_url = 'https://www.openquok.com/docs/getting-started-for-cli',
    click_url_skills = 'https://www.openquok.com/docs/agent-setup-guides',
    click_url_mcp = 'https://www.openquok.com/docs/mcp-setup-guides',
    description_mcp = 'Connect OpenQuok over HTTP MCP to list channels, read platform rules, and schedule posts from Cursor, Claude Code, Codex, and other native MCP clients — authenticate with an opo_ programmatic token.',
    content_mcp = $openquok_core_mcp$## Overview

OpenQuok exposes a **hosted MCP server** at `https://api.openquok.com/mcp` so native clients (Cursor, Claude Code, Codex, VS Code Copilot, and others) can list channels, read platform rules, and schedule posts without the CLI skill.

Authenticate with a programmatic token (`opo_`) from **Settings → Developers → Access**.

## Connect in three steps

1. **Generate a token** — create an `opo_…` token in the dashboard (shown once).
2. **Add the server** — `https://api.openquok.com/mcp` with `Authorization: Bearer opo_…`, or put the token in the URL path when your client cannot set headers.
3. **Verify** — ask your agent to list connected social accounts; it should call `integrationList`.

Client-specific wiring: [MCP setup guides](https://www.openquok.com/docs/mcp-setup-guides). Copy-paste snippets: [Client setup](https://www.openquok.com/docs/getting-started-for-mcp/setup).
$openquok_core_mcp$,
    mcp_tools = '[
        {"name": "groupList", "description": "List channel groups (customers) for the authenticated workspace. Use a group id with integrationList to filter channels."},
        {"name": "integrationList", "description": "List connected social media channels for the authenticated workspace. Optionally filter by channel group id from groupList."},
        {"name": "integrationSchema", "description": "Return posting rules, character limits, compose settings schema, and allow-listed tools for a platform (provider identifier, e.g. threads, facebook)."},
        {"name": "triggerTool", "description": "Invoke an allow-listed provider method on a connected channel (same as POST /public/integration-trigger/:id)."},
        {"name": "schedulePostTool", "description": "Create or schedule social posts across connected channels. Supports draft, schedule, and publish-now modes."}
    ]'::jsonb,
    updated_at = NOW()
WHERE slug = 'openquok-core';

UPDATE public.listings l
SET listing_tag_slugs = sub.slugs
FROM (
    SELECT ARRAY_AGG(t.slug ORDER BY t.slug) AS slugs
    FROM public.listing_tags t
) sub
WHERE l.slug = 'openquok-core';

DELETE FROM public.listings_listing_tags_association lta
USING public.listings l
WHERE lta.listing_id = l.id
  AND l.slug = 'openquok-core';

INSERT INTO public.listings_listing_tags_association (listing_id, listing_tag_id)
SELECT
    l.id,
    t.id
FROM public.listings l
CROSS JOIN public.listing_tags t
WHERE l.slug = 'openquok-core'
ON CONFLICT DO NOTHING;

-- ---------------------------
-- END OF FILE
-- ---------------------------

COMMIT;

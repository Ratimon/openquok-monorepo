---
title: Introduction to OpenQuok MCP
description: Connect Cursor, Claude Code, Codex, and other MCP (Model Context Protocol) clients to OpenQuok.
order: 0
lastUpdated: 2026-09-10
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Mermaid } from '$lib/ui/components/docs/mdx/index.js';

const mcpFlow = `sequenceDiagram
    participant Agent as AI Agent
    participant MCP as OpenQuok MCP Server
    participant API as OpenQuok Backend

    Agent->>MCP: Connect with opo_ Bearer token
    MCP-->>Agent: List available tools
    Agent->>MCP: Call tool (e.g. schedulePostTool)
    MCP->>API: Execute action
    API-->>MCP: Return result
    MCP-->>Agent: Tool response
`;
</script>

## What is OpenQuok MCP?

OpenQuok exposes a **hosted MCP server** so AI clients can list connected channels, schedule and manage posts, configure plugs, and read analytics without installing the CLI skill.

Use the same <Badge text="opo_" variant="default" /> programmatic access token you generate under <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.

## How it works

The server registers tools that AI clients discover at connect time. The agent reads each tool's schema, then calls them on your behalf against the authenticated workspace.

<Mermaid string={mcpFlow} />

A typical workflow:

1. **List** — <Badge text="groupList" variant="default" /> (optional) then <Badge text="integrationList" variant="default" /> to find channel UUIDs; <Badge text="integrationSchema" variant="default" /> for platform rules.
2. **Schedule** — <Badge text="schedulePostTool" variant="default" /> to draft, schedule, or publish now; <Badge text="uploadFromUrl" variant="default" /> when you need media ids before scheduling.
3. **Manage** — <Badge text="postsList" variant="default" />, <Badge text="postsStatus" variant="default" />, <Badge text="postsDelete" variant="default" />, <Badge text="postsReviewTodo" variant="default" />; <Badge text="postsMissing" variant="default" /> then <Badge text="postsConnect" variant="default" /> when <Badge text="release_id" variant="param" /> is missing.
4. **Analytics** — <Badge text="analyticsPlatform" variant="default" /> or <Badge text="analyticsPost" variant="default" /> with <Badge text="days" variant="param" /> <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, or <Badge text="90" variant="param" />.
5. **Plugs** — <Badge text="plugsCatalog" variant="default" />, <Badge text="plugsList" variant="default" />, <Badge text="plugsUpsert" variant="default" /> for global like-threshold rules; cross-account comments on create go in <Badge text="schedulePostTool" variant="default" /> <Badge text="settings" variant="param" />.

All of this can happen when you ask your agent something like:

> Schedule a post to X for tomorrow at 10am: Excited to announce our new feature!

## Endpoints

| Endpoint | Auth | Purpose |
| --- | --- | --- |
| <Badge text="GET/POST /mcp" variant="path" /> | <Badge text="Authorization: Bearer opo_…" variant="default" /> | Streamable HTTP MCP |
| <Badge text="GET/POST /mcp/:token" variant="path" /> | API key in URL path | Clients that cannot set headers |
| <Badge text="OPTIONS" variant="default" /> on both | CORS <Badge text="*" variant="default" /> | Browser-based MCP clients |

### Base URL

| Environment | MCP URL |
| --- | --- |
| OpenQuok Cloud | <Badge text="https://api.openquok.com/mcp" variant="new" /> |
| Self-hosted | Your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin + <Badge text="/mcp" variant="path" /> |

<Callout type="tip" title="Dashboard generator">
<p>Copy ready-to-run snippets from <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" /> → <strong>MCP client configuration</strong>. See <a href="/docs/getting-started-for-mcp/setup">Client setup</a>.</p>
</Callout>

## Authentication

Send your workspace programmatic token as a Bearer credential:

```bash
curl -H "Authorization: Bearer opo_your_programmatic_token" \
  https://api.openquok.com/mcp
```

If your client cannot set headers, append the token to the path:

```text
https://api.openquok.com/mcp/opo_your_programmatic_token
```

OAuth2 access tokens from third-party apps also use the <Badge text="opo_" variant="default" /> prefix and work the same way.

## Available tools

| Group | Tool | Purpose |
| --- | --- | --- |
| Channels | <Badge text="groupList" variant="default" /> | List channel groups (customers) |
| Channels | <Badge text="integrationList" variant="default" /> | List connected social channels; optionally filter by group |
| Channels | <Badge text="integrationSchema" variant="default" /> | Character limits, compose settings, and allow-listed provider tools |
| Channels | <Badge text="triggerTool" variant="default" /> | Invoke an allow-listed provider method on a connected channel |
| Scheduling | <Badge text="schedulePostTool" variant="default" /> | Draft, schedule, or publish-now posts; per-channel <Badge text="settings" variant="param" /> for plugs |
| Scheduling | <Badge text="uploadFromUrl" variant="default" /> | Fetch a public HTTPS URL into workspace media |
| Posts | <Badge text="postsList" variant="default" /> | List posts in a date window |
| Posts | <Badge text="postsFindSlot" variant="default" /> | Suggest a free schedule slot |
| Posts | <Badge text="postsStatus" variant="default" /> | Flip draft ↔ scheduled |
| Posts | <Badge text="postsReviewTodo" variant="default" /> | Set or update a review-todo note |
| Posts | <Badge text="postsDelete" variant="default" /> | Delete a post row |
| Posts | <Badge text="postsMissing" variant="default" /> | List candidates when <Badge text="release_id" variant="param" /> is missing |
| Posts | <Badge text="postsConnect" variant="default" /> | Link a post to a provider <Badge text="release_id" variant="param" /> |
| Analytics | <Badge text="analyticsPlatform" variant="default" /> | Platform-level metrics for a channel (<Badge text="days" variant="param" /> 7, 30, or 90) |
| Analytics | <Badge text="analyticsPost" variant="default" /> | Per-post metrics for a published row |
| Plugs | <Badge text="plugsCatalog" variant="default" /> | List global plug types and field names |
| Plugs | <Badge text="plugsList" variant="default" /> | List saved global plug rules on a channel |
| Plugs | <Badge text="plugsUpsert" variant="default" /> | Create or update a global plug rule |
| Plugs | <Badge text="plugsActivate" variant="default" /> | Enable or disable a saved global plug |
| Plugs | <Badge text="plugsDelete" variant="default" /> | Delete a saved global plug |

Image and video generation MCP tools are not available yet. Local file upload and CLI device login stay on the <a href="/docs/getting-started-for-cli">openquok-core CLI skill</a>.

## Verify connection

After configuring your client, ask your agent:

> List my connected social media accounts

If authentication succeeds, the agent calls <Badge text="integrationList" variant="default" /> and returns your workspace channels.

## Related Section(s)

<CardGrid>
<LinkCard title="Client setup" description="MCP configuration snippets for Cursor, Claude Code, Codex, and more" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="MCP setup guides" description="Step-by-step guides for Cursor, Claude Code, ChatGPT, Warp, and other clients" href="/docs/mcp-setup-guides" />
<LinkCard title="Tools reference" description="Input shapes and responses for every MCP tool" href="/docs/mcp-references/tools" />
<LinkCard title="MCP examples" description="Agent workflows — scheduling, plugs, analytics, and cross-account Threads" href="/docs/mcp-examples" />
<LinkCard title="Public API overview" description="REST authentication, rate limits, and SDK quick start" href="/docs/getting-started-for-public-api" />
</CardGrid>

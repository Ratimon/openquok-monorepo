---
title: Introduction to Openquok MCP
description: Connect Cursor, Claude Code, Codex, and other MCP (Model Context Protocol) clients to OpenQuok.
order: 0
lastUpdated: 2026-06-25
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

OpenQuok exposes a **hosted  MCP server** so AI clients can list connected channels, read platform rules, and schedule posts without installing the CLI skill.

Use the same <Badge text="opo_" variant="default" /> programmatic access token you generate under <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.

## How it works

The server registers **four v1 tools** that AI clients discover at connect time. The agent reads each tool’s schema, then calls them on your behalf against the authenticated workspace.

<Mermaid string={mcpFlow} />

A typical flow:

1. **Agent connects** — sends your <Badge text="opo_" variant="default" /> token (Bearer header or URL path).
2. **Agent calls <Badge text="integrationList" variant="default" />** — returns connected channels (X, Threads, Discord, etc.).
3. **Agent calls <Badge text="integrationSchema" variant="default" />** — learns character limits, compose settings, and allow-listed provider tools for a platform.
4. **Agent calls <Badge text="schedulePostTool" variant="default" />** — drafts, schedules, or publishes content in the correct shape.

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

## Available tools (v1)

| Tool | Purpose |
| --- | --- |
| <Badge text="integrationList" variant="default" /> | List connected social channels for the authenticated workspace |
| <Badge text="integrationSchema" variant="default" /> | Character limits, compose settings, and allow-listed provider tools for a platform identifier |
| <Badge text="triggerTool" variant="default" /> | Invoke an allow-listed provider method on a connected channel |
| <Badge text="schedulePostTool" variant="default" /> | Draft, schedule, or publish-now posts across one or more channels |

Image and video generation tools are not available in v1.

## Verify connection

After configuring your client, ask your agent:

> List my connected social media accounts

If authentication succeeds, the agent calls <Badge text="integrationList" variant="default" /> and returns your workspace channels.

## Related Section(s)

<CardGrid>
<LinkCard title="Client setup" description="MCP configuration snippets for Cursor, Claude Code, Codex, and more" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="Tools reference" description="Input shapes and responses for integrationList, schedulePostTool, and other v1 tools" href="/docs/getting-started-for-mcp/tools" />
<LinkCard title="Examples" description="Schedule to X, Discord channel posts, and Threads reply chains" href="/docs/getting-started-for-mcp/examples" />
<LinkCard title="Public API overview" description="REST authentication, rate limits, and SDK quick start" href="/docs/getting-started-for-public-api" />
</CardGrid>

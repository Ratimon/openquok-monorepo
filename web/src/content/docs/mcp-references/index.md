---
title: Overview - MCP References
description: OpenQuok MCP reference — tool input shapes, responses, and provider settings for AI agent clients.
order: 0
lastUpdated: 2026-09-10
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

Schema-level reference for OpenQuok MCP tools. Use these pages when you need exact parameter tables, JSON shapes, and provider-specific settings — not copy-paste agent prompts (see <a href="/docs/mcp-examples">MCP Examples</a>).

<Callout type="note">
<p>All tools run in the workspace tied to your <Badge text="opo_" variant="default" /> token and call the same backend services as <Badge text="/api/v1/public/*" variant="path" />.</p>
</Callout>

## Tool groups

| Group | Tools |
| --- | --- |
| Channel discovery | <Badge text="groupList" variant="default" />, <Badge text="integrationList" variant="default" />, <Badge text="integrationSchema" variant="default" />, <Badge text="triggerTool" variant="default" /> |
| Scheduling | <Badge text="schedulePostTool" variant="default" />, <Badge text="uploadFromUrl" variant="default" /> |
| Post management | <Badge text="postsList" variant="default" />, <Badge text="postsFindSlot" variant="default" />, <Badge text="postsStatus" variant="default" />, <Badge text="postsReviewTodo" variant="default" />, <Badge text="postsDelete" variant="default" />, <Badge text="postsMissing" variant="default" />, <Badge text="postsConnect" variant="default" /> |
| Analytics | <Badge text="analyticsPlatform" variant="default" />, <Badge text="analyticsPost" variant="default" /> |
| Global plugs | <Badge text="plugsCatalog" variant="default" />, <Badge text="plugsList" variant="default" />, <Badge text="plugsUpsert" variant="default" />, <Badge text="plugsActivate" variant="default" />, <Badge text="plugsDelete" variant="default" /> |

<CardGrid>
<LinkCard title="Tools Reference" description="Parameter tables for every MCP tool — scheduling, post management, analytics, and plugs" href="/docs/mcp-references/tools" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="MCP introduction" description="Endpoints, authentication, and typical agent workflows" href="/docs/getting-started-for-mcp" />
<LinkCard title="MCP examples" description="End-to-end agent prompts for scheduling, plugs, and analytics" href="/docs/mcp-examples" />
<LinkCard title="MCP setup guides" description="Per-client MCP server configuration" href="/docs/mcp-setup-guides" />
</CardGrid>

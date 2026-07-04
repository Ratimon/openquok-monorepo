---
title: Overview - MCP References
description: OpenQuok MCP v1 reference — tool input shapes, responses, and provider settings for AI agent clients.
order: 0
lastUpdated: 2026-07-04
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

Schema-level reference for OpenQuok MCP v1 tools. Use these pages when you need exact parameter tables, JSON shapes, and provider-specific settings — not copy-paste agent prompts (see <a href="/docs/mcp-examples">MCP Examples</a>).

<Callout type="note">
<p>All tools run in the workspace tied to your <Badge text="opo_" variant="default" /> token and call the same backend services as <Badge text="/api/v1/public/*" variant="path" />.</p>
</Callout>

<CardGrid>
<LinkCard title="Tools Reference" description="groupList, integrationList, integrationSchema, triggerTool, and schedulePostTool" href="/docs/mcp-references/tools" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="MCP introduction" description="Endpoints, authentication, and the five v1 tools" href="/docs/getting-started-for-mcp" />
<LinkCard title="MCP examples" description="End-to-end agent prompts for scheduling and channel tools" href="/docs/mcp-examples" />
<LinkCard title="MCP setup guides" description="Per-client MCP server configuration" href="/docs/mcp-setup-guides" />
</CardGrid>

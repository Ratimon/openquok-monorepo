---
title: Warp
description: Connect OpenQuok MCP to Warp terminal via Settings → MCP Servers.
order: 9
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://www.warp.dev">Warp</DocsExternalLink> terminal with MCP support enabled.
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />).

## Setup

<Steps>

### Generate your token

Create an <Badge text="opo_…" variant="default" /> token under <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.

### Open MCP settings

In Warp, go to <strong>Settings → MCP Servers → + Add</strong>.

### Paste the server config

Warp expects a top-level JSON object keyed by server name. Use <Badge text="openquok" variant="default" /> as the key:

<Tabs items={["Authorization header", "API key in URL"]}>
<TabItem label="Authorization header">

```json
{
  "openquok": {
    "url": "https://api.openquok.com/mcp",
    "headers": {
      "Authorization": "Bearer opo_your_programmatic_token"
    }
  }
}
```

</TabItem>
<TabItem label="API key in URL">

```json
{
  "openquok": {
    "url": "https://api.openquok.com/mcp/opo_your_programmatic_token"
  }
}
```

</TabItem>
</Tabs>

<Callout type="tip" title="Dashboard generator">
<p>Select <Badge text="Warp" variant="default" /> on the Developers → Access page to copy this JSON with your token already filled in.</p>
</Callout>

### Save and verify

Save the server entry. In Warp AI, ask:

> List my connected social media accounts

Warp should call <Badge text="integrationList" variant="default" /> and list your channels.

</Steps>

## Self-hosted API

Replace <Badge text="https://api.openquok.com" variant="new" /> with your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin.

## Related Section(s)

<CardGrid>
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP client setup" description="Dashboard snippet generator" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="MCP examples" description="Scheduling workflows" href="/docs/mcp-examples" />
<LinkCard title="Tools reference" description="v1 tool schemas" href="/docs/mcp-references/tools" />
</CardGrid>

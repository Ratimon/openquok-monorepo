---
title: Windsurf
description: Connect OpenQuok MCP to Codeium Windsurf via mcp_config.json.
order: 5
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://codeium.com/windsurf">Windsurf</DocsExternalLink> editor with MCP enabled.
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />).

## Configuration file

Windsurf stores MCP servers in <Badge text="~/.codeium/windsurf/mcp_config.json" variant="path" /> (user-level). Entries use <Badge text="mcpServers" variant="param" /> with <Badge text="serverUrl" variant="param" /> for the HTTP endpoint.

## Setup

<Steps>

### Generate your token

Create an <Badge text="opo_…" variant="default" /> token under <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.

### Edit mcp_config.json

Create the file if it does not exist, then add or merge the <Badge text="openquok" variant="default" /> block:

<Tabs items={["Authorization header", "API key in URL"]}>
<TabItem label="Authorization header">

```json
{
  "mcpServers": {
    "openquok": {
      "serverUrl": "https://api.openquok.com/mcp",
      "headers": {
        "Authorization": "Bearer opo_your_programmatic_token"
      }
    }
  }
}
```

</TabItem>
<TabItem label="API key in URL">

```json
{
  "mcpServers": {
    "openquok": {
      "serverUrl": "https://api.openquok.com/mcp/opo_your_programmatic_token"
    }
  }
}
```

</TabItem>
</Tabs>

### Restart Windsurf

Fully quit and reopen Windsurf (or use its MCP reload action if available) so the config is re-read.

### Verify

In Cascade or chat, ask:

> List my connected social media accounts

The agent should call <Badge text="integrationList" variant="default" />.

</Steps>

## Self-hosted API

Set <Badge text="serverUrl" variant="param" /> to your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> + <Badge text="/mcp" variant="path" />.

## Related Section(s)

<CardGrid>
<LinkCard title="Cursor" description="Project-level MCP in Cursor" href="/docs/mcp-setup-guides/cursor" />
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP client setup" description="Dashboard snippet generator" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="Tools reference" description="v1 tool schemas" href="/docs/mcp-references/tools" />
</CardGrid>

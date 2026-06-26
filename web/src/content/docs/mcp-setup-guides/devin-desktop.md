---
title: Devin Desktop
description: Connect OpenQuok MCP to Devin Desktop via ~/.codeium/mcp_config.json.
order: 5
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://docs.devin.ai/desktop/getting-started">Devin Desktop</DocsExternalLink> installed with MCP enabled.
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />).

## Configuration file

Devin Desktop stores MCP servers in <Badge text="~/.codeium/mcp_config.json" variant="path" /> (user-level). See the <DocsExternalLink href="https://docs.devin.ai/desktop/cascade/mcp">official MCP guide</DocsExternalLink> and <DocsExternalLink href="https://docs.devin.ai/desktop/devin-desktop-faq">Devin Desktop FAQ</DocsExternalLink> (configuration paths).

Entries use top-level <Badge text="mcpServers" variant="param" />. Remote HTTP servers require <Badge text="serverUrl" variant="param" /> (or <Badge text="url" variant="param" />) pointing at your OpenQuok MCP endpoint — typically <Badge text="…/mcp" variant="path" /> on your API host.

You can edit the file directly or open it from <Badge text="Settings" variant="default" /> → <Badge text="Tools" variant="default" /> → <Badge text="View Raw Config" variant="default" />.

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

### Restart Devin Desktop

Fully quit and reopen Devin Desktop, or use the MCP refresh action in <Badge text="Settings" variant="default" /> → <Badge text="Tools" variant="default" />, so the config is re-read.

### Verify

In Devin Local or chat, ask:

> List my connected social media accounts

The agent should call <Badge text="integrationList" variant="default" />.

</Steps>

## Self-hosted API

Set <Badge text="serverUrl" variant="param" /> to your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> + <Badge text="/mcp" variant="path" />.

For local development, that is often:

```json
{
  "mcpServers": {
    "openquok": {
      "serverUrl": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer opo_your_programmatic_token"
      }
    }
  }
}
```

## Related Section(s)

<CardGrid>
<LinkCard title="Cursor" description="Project-level MCP in Cursor" href="/docs/mcp-setup-guides/cursor" />
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP client setup" description="Dashboard snippet generator" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="Tools reference" description="v1 tool schemas" href="/docs/mcp-references/tools" />
</CardGrid>

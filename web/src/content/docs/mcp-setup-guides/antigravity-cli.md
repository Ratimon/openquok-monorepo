---
title: Antigravity CLI
description: Connect OpenQuok MCP to Antigravity CLI via ~/.gemini/config/mcp_config.json.
order: 8
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://antigravity.google/docs/cli-overview">Antigravity CLI</DocsExternalLink> (<Badge text="agy" variant="default" />) installed.
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />).

## Configuration file

Antigravity CLI stores MCP servers in a dedicated <Badge text="mcp_config.json" variant="path" /> profile — not inline in <Badge text="settings.json" variant="path" />. See <DocsExternalLink href="https://antigravity.google/docs/gcli-migration">Migrating from Gemini CLI</DocsExternalLink> (MCP config formatting) and <DocsExternalLink href="https://antigravity.google/docs/cli-features">CLI features</DocsExternalLink> (<Badge text="/mcp" variant="default" /> slash command).

| Scope | Path |
| --- | --- |
| Global | <Badge text="~/.gemini/config/mcp_config.json" variant="path" /> |
| Workspace | <Badge text=".agents/mcp_config.json" variant="path" /> |

Remote HTTP servers must use <Badge text="serverUrl" variant="param" /> (not <Badge text="url" variant="param" /> or <Badge text="httpUrl" variant="param" />) and should end with <Badge text="/mcp" variant="path" /> on your API host. Using the legacy <Badge text="url" variant="param" /> key can make the server appear connected but fail silently when tools run.

<Callout type="note" title="Migrating from Gemini CLI">
If you used Gemini CLI, run <Badge text="agy plugin import gemini" variant="default" /> or follow the <DocsExternalLink href="https://antigravity.google/docs/gcli-migration">official migration guide</DocsExternalLink> to move extensions and MCP definitions.
</Callout>

## Setup

<Steps>

### Generate your token

Create an <Badge text="opo_…" variant="default" /> token under <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.

### Edit mcp_config.json

Create <Badge text="~/.gemini/config/mcp_config.json" variant="path" /> if it does not exist, then add or merge the <Badge text="openquok" variant="default" /> block:

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

### Restart the CLI

Exit and restart <Badge text="agy" variant="default" /> so the config is re-read.

### Verify

Ask:

> List my connected social media accounts

The CLI agent should call <Badge text="integrationList" variant="default" />.

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
<LinkCard title="Claude Code" description="Terminal MCP registration" href="/docs/mcp-setup-guides/claude-code" />
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP examples" description="Scheduling workflows" href="/docs/mcp-examples" />
<LinkCard title="Tools reference" description="v1 tool schemas" href="/docs/mcp-references/tools" />
</CardGrid>

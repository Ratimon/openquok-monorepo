---
title: Gemini CLI
description: Connect OpenQuok MCP to Google Gemini CLI via settings.json mcpServers.
order: 8
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://github.com/google-gemini/gemini-cli">Google Gemini CLI</DocsExternalLink> installed.
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />).

## Configuration file

Gemini CLI stores MCP servers in <Badge text="~/.gemini/settings.json" variant="path" /> under <Badge text="mcpServers" variant="param" />.

## Setup

<Steps>

### Generate your token

Create an <Badge text="opo_…" variant="default" /> token under <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.

### Edit settings.json

<Tabs items={["Authorization header", "API key in URL"]}>
<TabItem label="Authorization header">

```json
{
  "mcpServers": {
    "openquok": {
      "url": "https://api.openquok.com/mcp",
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
      "url": "https://api.openquok.com/mcp/opo_your_programmatic_token"
    }
  }
}
```

</TabItem>
</Tabs>

### Restart the CLI

Exit and restart <Badge text="gemini" variant="default" /> so the new server loads.

### Verify

Ask:

> List my connected social media accounts

The CLI agent should call <Badge text="integrationList" variant="default" />.

</Steps>

## Self-hosted API

Point <Badge text="url" variant="param" /> at <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> + <Badge text="/mcp" variant="path" />.

## Related Section(s)

<CardGrid>
<LinkCard title="Claude Code" description="Terminal MCP registration" href="/docs/mcp-setup-guides/claude-code" />
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP examples" description="Scheduling workflows" href="/docs/mcp-examples" />
<LinkCard title="Tools reference" description="v1 tool schemas" href="/docs/mcp-references/tools" />
</CardGrid>

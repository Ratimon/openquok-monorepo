---
title: VS Code / Copilot
description: Connect OpenQuok MCP to VS Code and GitHub Copilot via .vscode/mcp.json.
order: 4
lastUpdated: 2026-07-22
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://code.visualstudio.com">VS Code</DocsExternalLink> with <DocsExternalLink href="https://docs.github.com/en/copilot">GitHub Copilot</DocsExternalLink> and MCP support enabled.
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />).

## Configuration file

VS Code reads MCP servers from <Badge text=".vscode/mcp.json" variant="path" /> at the **workspace root**. The OpenQuok entry lives under <Badge text="servers" variant="param" /> with <Badge text="type" variant="param" /> set to <Badge text="http" variant="default" />.

## Setup

<Steps>

### Generate your token

In the OpenQuok app, open <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />. Create an OAuth app if prompted, then generate an <Badge text="opo_…" variant="default" /> token.

![Generate programmatic token](/docs/_assets/mcp-setup-guides/generate-programmatic-token.webp)

### Create or edit .vscode/mcp.json

<Tabs items={["Authorization header", "API key in URL"]}>
<TabItem label="Authorization header">

```json
{
  "servers": {
    "openquok": {
      "type": "http",
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
  "servers": {
    "openquok": {
      "type": "http",
      "url": "https://api.openquok.com/mcp/opo_your_programmatic_token"
    }
  }
}
```

</TabItem>
</Tabs>

### Reload the workspace

Reload VS Code or reopen the folder so Copilot picks up the new server. Check the MCP panel for <Badge text="openquok" variant="default" /> with a healthy status.

### Verify

Ask Copilot Chat:

> List my connected social media accounts

Copilot should call <Badge text="integrationList" variant="default" /> and list your channels.

</Steps>

<Callout type="note" title="Merge with existing servers">
<p>If you already have other MCP entries, add <Badge text="openquok" variant="default" /> alongside them inside <Badge text="servers" variant="param" /> — do not replace the whole file unless you intend to.</p>
</Callout>

## Self-hosted API

Point <Badge text="url" variant="param" /> at <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> + <Badge text="/mcp" variant="path" />.

## Related Section(s)

<CardGrid>
<LinkCard title="Cursor" description="Cursor .cursor/mcp.json setup" href="/docs/mcp-setup-guides/cursor" />
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP examples" description="Agent scheduling workflows" href="/docs/mcp-examples" />
<LinkCard title="Tools reference" description="v1 tool schemas" href="/docs/mcp-references/tools" />
</CardGrid>

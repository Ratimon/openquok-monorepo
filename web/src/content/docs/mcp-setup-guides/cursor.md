---
title: Cursor
description: Connect OpenQuok MCP to Cursor via .cursor/mcp.json for Agent, Composer, and inline chat tools.
order: 1
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://cursor.com">Cursor</DocsExternalLink> with MCP support enabled (recent stable builds).
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />) from <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.
- At least one connected social channel in your OpenQuok workspace (for verification).

## Configuration file

Cursor reads MCP servers from <Badge text=".cursor/mcp.json" variant="path" /> at the **project root**. Create the file (or merge into an existing one) so Agent and Composer can call OpenQuok tools.

<Callout type="tip" title="Dashboard generator">
<p>Copy a ready-made snippet from <strong>MCP client configuration</strong> on the Developers → Access page. Choose <Badge text="Cursor" variant="default" /> and your preferred auth method.</p>
</Callout>

## Setup

<Steps>

### Generate your token

In the OpenQuok app, open <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />. Create an OAuth app if prompted, then generate an <Badge text="opo_…" variant="default" /> token.

### Create or edit .cursor/mcp.json

In your project root, add an <Badge text="openquok" variant="default" /> entry under <Badge text="mcpServers" variant="param" />:

<Tabs items={["Authorization header", "API key in URL"]}>
<TabItem label="Authorization header">

<p><strong>Recommended</strong> — keeps the token out of logs and browser history.</p>

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

<p>Use when Cursor or your environment cannot send custom headers reliably.</p>

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

### Reload MCP in Cursor

Save the file, then reload the window or open <strong>Cursor Settings → MCP</strong> and confirm <Badge text="openquok" variant="default" /> appears with a connected status. Start a **new Agent or Composer session** so the tool list refreshes.

### Verify the connection

Ask your agent:

> List my connected social media accounts

The agent should call <Badge text="integrationList" variant="default" /> and return channel names and IDs from your workspace.

</Steps>

## Self-hosted API

Replace <Badge text="https://api.openquok.com" variant="new" /> with your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin (no <Badge text="/api/v1" variant="path" /> suffix). The MCP path is always <Badge text="/mcp" variant="path" /> on the API host.

## Troubleshooting

<Callout type="warning" title="Server not listed">
<p>Confirm <Badge text=".cursor/mcp.json" variant="path" /> is at the workspace root Cursor opened — not a parent folder. Merge multiple servers under one <Badge text="mcpServers" variant="param" /> object; duplicate top-level keys overwrite earlier entries.</p>
</Callout>

<Callout type="note" title="Auth failures">
<p>If header auth fails, switch to <strong>API key in URL</strong> in the dashboard snippet and retry. If path auth fails, confirm the full <Badge text="opo_" variant="default" /> token was pasted with no trailing spaces.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP client setup" description="Dashboard snippet generator" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="MCP examples" description="Scheduling workflows by platform" href="/docs/mcp-examples" />
<LinkCard title="Tools reference" description="integrationList and schedulePostTool schemas" href="/docs/mcp-references/tools" />
</CardGrid>

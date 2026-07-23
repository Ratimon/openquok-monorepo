---
title: Cursor
description: Connect OpenQuok MCP to Cursor via .cursor/mcp.json for Agent, Composer, and inline chat tools.
order: 1
lastUpdated: 2026-07-23
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

In the OpenQuok app, open <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />. Create an OAuth app if prompted, then generate an <Badge text="opo_…" variant="default" /> token.

![Generate programmatic token](/docs/_assets/mcp-setup-guides/generate-programmatic-token.webp)

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

### Attach OpenQuok in Cursor

Save <Badge text=".cursor/mcp.json" variant="path" />, then make sure Cursor has loaded the server into the session you will use:

1. Open <strong>Customize → MCPs</strong> (or <strong>Cursor Settings → MCP</strong> on builds that still use that label).
2. Confirm <Badge text="openquok" variant="default" /> shows as <strong>connected</strong> — not error or disabled.
3. Start a <strong>new</strong> Agent or Composer chat and ask there. Existing sessions often keep the old server list and will not see tools from a server added after the chat started.

On some Cursor versions, editing <Badge text="mcp.json" variant="path" /> alone is not enough. If the file looks valid but <Badge text="openquok" variant="default" /> is missing or stuck, fully quit Cursor and reopen the project, then repeat the steps above.

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

<Callout type="warning" title="Config valid, but tools missing in chat">
<p><Badge text=".cursor/mcp.json" variant="path" /> can be correct while the current chat still has no OpenQuok tools. After a full quit and reopen:</p>
<ul>
<li>Open <strong>Customize → MCPs</strong> and confirm <Badge text="openquok" variant="default" /> is connected (not error or disabled).</li>
<li>Start a <strong>new</strong> agent chat and ask again — existing sessions often keep the old server list.</li>
</ul>
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

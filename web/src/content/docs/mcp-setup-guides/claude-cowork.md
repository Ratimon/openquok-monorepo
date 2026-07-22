---
title: Claude Cowork
description: Connect OpenQuok MCP to Claude Cowork via custom connectors or managedMcpServers organization settings.
order: 3
lastUpdated: 2026-07-22
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- Access to Claude Cowork organization settings (admin or connector manager).
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />) scoped to the workspace whose channels agents should manage.

## Overview

Claude Cowork registers remote MCP servers at the **organization** level — either through the **Custom connectors** UI or a <Badge text="managedMcpServers" variant="param" /> JSON block in org settings. OpenQuok uses **streamable HTTP** transport; server name should be <Badge text="openquok" variant="default" />.

## Setup

<Steps>

### Generate your token

In the OpenQuok app, open <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />. Create an OAuth app if prompted, then generate an <Badge text="opo_…" variant="default" /> token.

![Generate programmatic token](/docs/_assets/mcp-setup-guides/generate-programmatic-token.webp)

### Add the connector JSON

Paste one of the following arrays into Custom connectors or <Badge text="managedMcpServers" variant="param" /> (exact field name depends on your Cowork admin console):

<Tabs items={["Authorization header", "API key in URL"]}>
<TabItem label="Authorization header">

```json
[
  {
    "name": "openquok",
    "url": "https://api.openquok.com/mcp",
    "transport": "http",
    "headers": {
      "Authorization": "Bearer opo_your_programmatic_token"
    }
  }
]
```

</TabItem>
<TabItem label="API key in URL">

```json
[
  {
    "name": "openquok",
    "url": "https://api.openquok.com/mcp/opo_your_programmatic_token",
    "transport": "http"
  }
]
```

</TabItem>
</Tabs>

### Save and propagate

Save organization settings. Cowork members may need to start a **new session** before <Badge text="openquok" variant="default" /> tools appear.

### Verify

In a Cowork chat, ask:

> List my connected social media accounts

The agent should call <Badge text="integrationList" variant="default" /> for the workspace tied to the token.

</Steps>

<Callout type="warning" title="Workspace scope">
<p>Each <Badge text="opo_" variant="default" /> token is bound to one OpenQuok workspace. Use separate tokens or connectors if different teams need isolated channel lists.</p>
</Callout>

## Self-hosted API

Replace <Badge text="https://api.openquok.com" variant="new" /> with your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin.

## Related Section(s)

<CardGrid>
<LinkCard title="Claude Code" description="Terminal claude mcp add setup" href="/docs/mcp-setup-guides/claude-code" />
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP introduction" description="Endpoints and authentication" href="/docs/getting-started-for-mcp" />
<LinkCard title="Tools reference" description="v1 tool schemas" href="/docs/mcp-references/tools" />
</CardGrid>

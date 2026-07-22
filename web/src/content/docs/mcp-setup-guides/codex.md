---
title: Codex
description: Connect OpenQuok MCP to OpenAI Codex via config.toml MCP server entries.
order: 7
lastUpdated: 2026-07-22
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://github.com/openai/codex">OpenAI Codex</DocsExternalLink> CLI installed.
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />).

## Configuration file

Codex reads MCP servers from <Badge text="~/.codex/config.toml" variant="path" />. Each server is a TOML table under <Badge text="mcp_servers" variant="param" />.

## Setup

<Steps>

### Generate your token

In the OpenQuok app, open <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />. Create an OAuth app if prompted, then generate an <Badge text="opo_…" variant="default" /> token.

![Generate programmatic token](/docs/_assets/mcp-setup-guides/generate-programmatic-token.webp)

### Add the OpenQuok server block

Append to <Badge text="~/.codex/config.toml" variant="path" />:

<Tabs items={["Authorization header", "API key in URL"]}>
<TabItem label="Authorization header">

```toml
[mcp_servers.openquok]
url = "https://api.openquok.com/mcp"
http_headers = { "Authorization" = "Bearer opo_your_programmatic_token" }
```

</TabItem>
<TabItem label="API key in URL">

```toml
[mcp_servers.openquok]
url = "https://api.openquok.com/mcp/opo_your_programmatic_token"
```

</TabItem>
</Tabs>

### Restart Codex

Start a **new Codex session** so MCP configuration reloads.

### Verify

Ask:

> List my connected social media accounts

Codex should call <Badge text="integrationList" variant="default" /> and return workspace channels.

</Steps>

<Callout type="note" title="TOML quoting">
<p>Keep the Bearer value in double quotes inside <Badge text="http_headers" variant="param" />. If auth fails after editing, confirm there are no smart quotes or line breaks inside the token string.</p>
</Callout>

## Self-hosted API

Set <Badge text="url" variant="param" /> to your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> + <Badge text="/mcp" variant="path" />.

## Related Section(s)

<CardGrid>
<LinkCard title="MCP client setup" description="Dashboard checklist for Codex" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP examples" description="Scheduling workflows" href="/docs/mcp-examples" />
<LinkCard title="Tools reference" description="v1 tool schemas" href="/docs/mcp-references/tools" />
</CardGrid>

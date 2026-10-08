---
title: Grok Build
description: Add OpenQuok to Grok Build with grok mcp add and HTTP transport.
order: 11
lastUpdated: 2026-10-08
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://grok.com/build">Grok Build</DocsExternalLink> installed (xAI coding agent CLI). See <DocsExternalLink href="https://x.ai/build">x.ai/build</DocsExternalLink> for current access.
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />) from <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.

Grok Build is not the Grok chatbot and not <a href="/agents/grok-bot">Grok Bot</a> cloud teammates. A Grok web custom connector does not configure this CLI.

## Setup

<Steps
	howToName="Grok Build Setup"
	howToDescription="Add OpenQuok MCP to Grok Build with grok mcp add."
>

### Generate your token

In the OpenQuok app, open <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />. Create an OAuth app if prompted, then generate an <Badge text="opo_…" variant="default" /> token.

![Generate programmatic token](/docs/_assets/mcp-setup-guides/generate-programmatic-token.webp)

### Register the OpenQuok MCP server

Run one of the following in your terminal. Server name is always <Badge text="openquok" variant="default" />.

<Tabs items={["Authorization header", "API key in URL"]}>
<TabItem label="Authorization header">

<p>Add the server in <Badge text="~/.grok/config.toml" variant="path" />:</p>

```bash
# ~/.grok/config.toml

[[mcp.servers]]
name = "openquok"
type = "http"
url = "https://api.openquok.com/mcp"
headers.Authorization = "Bearer opo_your_programmatic_token"
```

<p>Or run <Badge text="grok mcp add --transport http openquok https://api.openquok.com/mcp" variant="default" /> and complete sign-in if Grok Build prompts you.</p>

</TabItem>
<TabItem label="API key in URL">

```bash
grok mcp add --transport http openquok "https://api.openquok.com/mcp/opo_your_programmatic_token"
```

</TabItem>
</Tabs>

### Confirm registration

Start Grok Build:

```bash
grok
```

Ask it to list MCP servers, or inspect <Badge text="~/.grok/config.toml" variant="path" /> for an <Badge text="openquok" variant="default" /> HTTP entry.

### Start a new session and verify

In a fresh session, ask:

> List my connected social media accounts

Grok Build should call OpenQuok tools and return your workspace channels.

</Steps>

## Self-hosted API

Use your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin instead of <Badge text="https://api.openquok.com" variant="new" />. Grok cloud connectors need public HTTPS. A LAN or <Badge text="localhost" variant="default" /> URL is not reachable from Grok web.

## Related Section(s)

<CardGrid>
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="Grok Bot" description="Always-on xAI teammates on a shared cloud computer" href="/docs/agent-setup-guides/grok-bot" />
<LinkCard title="Grok Build integration" description="Landing page and FAQs" href="/agents/grok-build" />
</CardGrid>

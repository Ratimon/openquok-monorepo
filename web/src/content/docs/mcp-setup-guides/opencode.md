---
title: OpenCode
description: Add OpenQuok to OpenCode with opencode mcp add and remote HTTP MCP.
order: 12
lastUpdated: 2026-11-16
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://opencode.ai/">OpenCode</DocsExternalLink> installed (terminal, desktop, or web). See <DocsExternalLink href="https://opencode.ai/docs/mcp-servers/">MCP servers</DocsExternalLink> in the official docs.
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />) from <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.

OpenCode is not <a href="/agents/cursor">Cursor</a> and not an OpenQuok agent host. You connect OpenQuok as a remote MCP server inside OpenCode config.

## Setup

<Steps
	howToName="OpenCode Setup"
	howToDescription="Add OpenQuok MCP to OpenCode as a remote HTTP server."
>

### Generate your token

In the OpenQuok app, open <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />. Create an OAuth app if prompted, then generate an <Badge text="opo_…" variant="default" /> token.

![Generate programmatic token](/docs/_assets/mcp-setup-guides/generate-programmatic-token.webp)

### Register the OpenQuok MCP server

Run one of the following, or merge the JSON into <Badge text="~/.config/opencode/opencode.jsonc" variant="path" />. Server name is always <Badge text="openquok" variant="default" />. Set <Badge text="oauth" variant="param" /> to <Badge text="false" variant="default" /> so OpenQuok uses your programmatic token instead of OAuth.

<Tabs items={["Authorization header", "API key in URL"]}>
<TabItem label="Authorization header">

```bash
opencode mcp add openquok --global --url "https://api.openquok.com/mcp" --header "Authorization=Bearer opo_your_programmatic_token"
```

<p>Or add to <Badge text="~/.config/opencode/opencode.jsonc" variant="path" />:</p>

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "openquok": {
        "type": "remote",
        "url": "https://api.openquok.com/mcp",
        "oauth": false,
        "headers": {
          "Authorization": "Bearer opo_your_programmatic_token"
        }
      }
    }
  }
}
```

</TabItem>
<TabItem label="API key in URL">

```bash
opencode mcp add openquok --global --url "https://api.openquok.com/mcp/opo_your_programmatic_token"
```

<p>Or add to <Badge text="opencode.jsonc" variant="path" /> in your project or global config:</p>

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "openquok": {
        "type": "remote",
        "url": "https://api.openquok.com/mcp/opo_your_programmatic_token",
        "oauth": false
      }
    }
  }
}
```

</TabItem>
</Tabs>

### Confirm registration

List MCP servers:

```bash
opencode mcp list
```

You can also run <Badge text="/mcps" variant="default" /> inside OpenCode and confirm <Badge text="openquok" variant="default" /> shows as connected.

### Start a new session and verify

In a fresh session, ask:

> List my connected social media accounts

OpenCode should call OpenQuok tools and return your workspace channels.

</Steps>

## Self-hosted API

Use your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin instead of <Badge text="https://api.openquok.com" variant="new" />. OpenCode must reach your API over public HTTPS when you run outside your LAN.

## Related Section(s)

<CardGrid>
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="Cursor" description="Add OpenQuok in .cursor/mcp.json for IDE workflows" href="/docs/mcp-setup-guides/cursor" />
<LinkCard title="OpenCode integration" description="Landing page and FAQs" href="/agents/opencode" />
</CardGrid>
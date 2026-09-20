---
title: Muse Code
description: Connect OpenQuok MCP to Meta Muse Code via ~/.config/muse/settings.json streamable_http servers.
order: 10
lastUpdated: 2026-09-20
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://dev.meta.ai/docs/muse-code/">Muse Code</DocsExternalLink> installed and authenticated (<Badge text="muse" variant="default" /> in a trusted project directory).
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />).

## Configuration file

Muse Code reads user settings from <Badge text="~/.config/muse/settings.json" variant="path" />. The file must include <Badge text="schema_version" variant="param" /> set to <Badge text="1" variant="default" />. Declare MCP servers under <Badge text="mcp_servers" variant="param" /> with <Badge text="streamable_http" variant="param" /> transport.

## Setup

<Steps
	howToName="Muse Code Setup"
	howToDescription="Connect OpenQuok MCP to Meta Muse Code."
>

### Generate your token

In the OpenQuok app, open <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />. Create an OAuth app if prompted, then generate an <Badge text="opo_…" variant="default" /> token.

![Generate programmatic token](/docs/_assets/mcp-setup-guides/generate-programmatic-token.webp)

### Add the OpenQuok server entry

Create or edit <Badge text="~/.config/muse/settings.json" variant="path" />. Merge the <Badge text="openquok" variant="default" /> block below into <Badge text="mcp_servers" variant="param" /> — keep any existing servers and always set <Badge text="schema_version" variant="param" /> to <Badge text="1" variant="default" />:

<Tabs items={["Authorization header", "API key in URL"]}>
<TabItem label="Authorization header">

```json
{
  "schema_version": 1,
  "mcp_servers": {
    "openquok": {
      "transport": "streamable_http",
      "url": "https://api.openquok.com/mcp",
      "headers": {
        "Authorization": "Bearer opo_your_programmatic_token"
      },
      "mode": "optional"
    }
  }
}
```

</TabItem>
<TabItem label="API key in URL">

```json
{
  "schema_version": 1,
  "mcp_servers": {
    "openquok": {
      "transport": "streamable_http",
      "url": "https://api.openquok.com/mcp/opo_your_programmatic_token",
      "mode": "optional"
    }
  }
}
```

</TabItem>
</Tabs>

<Callout type="tip" title="Dashboard generator">
<p>Select <Badge text="Muse Code" variant="default" /> on the Developers → Access page to copy this JSON with your token already filled in.</p>
</Callout>

### Restart Muse Code

Start a **new Muse Code session** (<Badge text="muse" variant="default" />) so settings reload. If the file omits <Badge text="schema_version" variant="param" />, Muse Code fails at startup with a malformed settings error.

### Verify

Ask:

> List my connected social media accounts

Muse Code should call <Badge text="integrationList" variant="default" /> and return workspace channels.

</Steps>

<Callout type="warning" title="Trust MCP servers">
<p>Only connect servers you trust. Muse Code MCP tools are not sandboxed — the agent can call remote tools outside the filesystem sandbox. Use <Badge text="mode" variant="param" /> <Badge text="optional" variant="default" /> if you want Muse Code to continue when OpenQuok is temporarily unreachable.</p>
</Callout>

## Self-hosted API

Replace <Badge text="https://api.openquok.com" variant="new" /> in <Badge text="url" variant="param" /> with your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin.

## Related Section(s)

<CardGrid>
<LinkCard title="MCP client setup" description="Dashboard checklist for Muse Code" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP examples" description="Scheduling workflows" href="/docs/mcp-examples" />
<LinkCard title="Tools reference" description="v1 tool schemas" href="/docs/mcp-references/tools" />
</CardGrid>

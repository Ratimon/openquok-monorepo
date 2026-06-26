---
title: Amp
description: Connect OpenQuok MCP to Amp via amp mcp add or Amp settings.json.
order: 6
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://ampcode.com">Amp</DocsExternalLink> CLI or editor integration with MCP support.
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />).

## Setup

<Steps>

### Generate your token

Create an <Badge text="opo_…" variant="default" /> token under <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.

### Register OpenQuok

<Tabs items={["CLI (path auth)", "settings.json (header auth)"]}>
<TabItem label="CLI (path auth)">

<p>Fastest path when Amp supports URL-based credentials:</p>

```bash
amp mcp add openquok https://api.openquok.com/mcp/opo_your_programmatic_token
```

</TabItem>
<TabItem label="settings.json (header auth)">

<p>Add to your Amp <Badge text="settings.json" variant="path" />:</p>

```json
{
  "amp.mcpServers": {
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
</Tabs>

### Verify

Start a new Amp session and ask:

> List my connected social media accounts

The agent should call <Badge text="integrationList" variant="default" />.

</Steps>

## Self-hosted API

Replace <Badge text="https://api.openquok.com" variant="new" /> with your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin.

## Related Section(s)

<CardGrid>
<LinkCard title="Claude Code" description="claude mcp add setup" href="/docs/mcp-setup-guides/claude-code" />
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP examples" description="Scheduling workflows" href="/docs/mcp-examples" />
<LinkCard title="Tools reference" description="v1 tool schemas" href="/docs/mcp-references/tools" />
</CardGrid>

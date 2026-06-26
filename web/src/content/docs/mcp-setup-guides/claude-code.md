---
title: Claude Code
description: Add OpenQuok to Claude Code with claude mcp add and HTTP streamable transport.
order: 2
lastUpdated: 2026-06-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</DocsExternalLink> installed and on your <Badge text="PATH" variant="param" />.
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />) from <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.

## Setup

<Steps>

### Generate your token

Create an <Badge text="opo_…" variant="default" /> token under <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />.

### Register the OpenQuok MCP server

Run one of the following in your terminal. Server name is always <Badge text="openquok" variant="default" />.

<Tabs items={["Authorization header", "API key in URL"]}>
<TabItem label="Authorization header">

```bash
claude mcp add openquok \
  --transport http \
  --header "Authorization: Bearer opo_your_programmatic_token" \
  "https://api.openquok.com/mcp"
```

</TabItem>
<TabItem label="API key in URL">

```bash
claude mcp add openquok --transport http --url "https://api.openquok.com/mcp/opo_your_programmatic_token"
```

</TabItem>
</Tabs>

### Confirm registration

```bash
claude mcp list
```

You should see <Badge text="openquok" variant="default" /> with HTTP transport pointing at your API origin.

### Start a new session and verify

Open a fresh Claude Code session, then ask:

> List my connected social media accounts

Claude should call <Badge text="integrationList" variant="default" /> and return your workspace channels.

</Steps>

## Updating or removing

To change auth or URL, remove and re-add:

```bash
claude mcp remove openquok
```

Then run the <Badge text="claude mcp add" variant="default" /> command again with the updated token or method.

## Self-hosted API

Use your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin instead of <Badge text="https://api.openquok.com" variant="new" /> in the command.

## Related Section(s)

<CardGrid>
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="Claude Cowork" description="Organization-wide MCP for Cowork" href="/docs/mcp-setup-guides/claude-cowork" />
<LinkCard title="MCP examples" description="Scheduling workflows by platform" href="/docs/mcp-examples" />
<LinkCard title="Tools reference" description="schedulePostTool and integrationSchema" href="/docs/mcp-references/tools" />
</CardGrid>

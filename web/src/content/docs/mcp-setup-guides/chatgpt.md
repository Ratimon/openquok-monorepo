---
title: ChatGPT
description: Connect OpenQuok MCP to ChatGPT via a custom connector or developer-mode MCP app URL.
order: 2
lastUpdated: 2026-07-29
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- A <DocsExternalLink href="https://chatgpt.com">ChatGPT</DocsExternalLink> account on <strong>Plus, Pro, Business, Enterprise, or Education</strong> (custom MCP connectors / developer mode are not available on Free).
- An OpenQuok programmatic token (<Badge text="opo_" variant="default" />) scoped to the workspace whose channels ChatGPT should manage.

## Overview

ChatGPT talks to remote MCP servers over <strong>HTTPS</strong> — paste an OpenQuok MCP URL as a <strong>custom connector</strong> or create a <strong>developer-mode</strong> MCP app. OpenQuok uses <strong>streamable HTTP</strong> transport. Embedding the token in the URL path is the simplest auth path for ChatGPT connectors (same pattern as other hosted MCP links).

Official OpenAI guidance: <DocsExternalLink href="https://developers.openai.com/api/docs/guides/developer-mode">ChatGPT developer mode</DocsExternalLink>.

## Setup

<Steps>

### Generate your token

In the OpenQuok app, open <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />. Create an OAuth app if prompted, then generate an <Badge text="opo_…" variant="default" /> token.

![Generate programmatic token](/docs/_assets/mcp-setup-guides/generate-programmatic-token.webp)

### Enable developer mode (when adding a custom MCP app)

In ChatGPT, open <strong>Settings → Security and login</strong> and turn on <strong>Developer mode</strong> if you are creating a developer-mode MCP app. Workspace admins on Business/Enterprise may need to allow custom connectors first.

### Add the OpenQuok MCP URL

Open <strong>Settings → Connectors</strong> (or use the plus button to create a developer-mode app after Developer mode is on). Add a custom connector / MCP server and paste one of:

<Tabs items={["API key in URL (recommended)", "Authorization header"]}>
<TabItem label="API key in URL (recommended)">

```text
https://api.openquok.com/mcp/opo_your_programmatic_token
```

</TabItem>
<TabItem label="Authorization header">

Use only if your ChatGPT connector UI accepts a server URL plus a custom <Badge text="Authorization" variant="param" /> header:

```text
Server URL: https://api.openquok.com/mcp
Authorization: Bearer opo_your_programmatic_token
```

Most ChatGPT custom connectors work best with the token in the URL path — prefer that tab.

</TabItem>
</Tabs>

Name the connector something recognizable (for example <Badge text="OpenQuok" variant="default" />). Save, then enable the connector for the chat (Developer mode tool / connectors picker).

### Verify

In a new ChatGPT conversation with the OpenQuok connector enabled, ask:

> List my connected social media accounts

ChatGPT should call <Badge text="integrationList" variant="default" /> and return channels from the workspace tied to the token.

</Steps>

<Callout type="warning" title="Human in the loop">
<p>Keep a human reviewing drafts on the OpenQuok calendar or kanban before publish. Write tools in developer mode can change live data — confirm tool calls when ChatGPT prompts you.</p>
</Callout>

<Callout type="note" title="Workspace scope">
<p>Each <Badge text="opo_" variant="default" /> token is bound to one OpenQuok workspace. Use a separate connector (and token) per brand or team when channel lists must stay isolated.</p>
</Callout>

## Self-hosted API

Replace <Badge text="https://api.openquok.com" variant="new" /> with your <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> origin. The MCP path must be publicly reachable over HTTPS — ChatGPT cannot call localhost directly.

## Related Section(s)

<CardGrid>
<LinkCard title="Codex" description="OpenAI Codex config.toml MCP setup" href="/docs/mcp-setup-guides/codex" />
<LinkCard title="MCP clients overview" description="All supported MCP client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP introduction" description="Endpoints and authentication" href="/docs/getting-started-for-mcp" />
<LinkCard title="Tools reference" description="v1 tool schemas" href="/docs/mcp-references/tools" />
</CardGrid>

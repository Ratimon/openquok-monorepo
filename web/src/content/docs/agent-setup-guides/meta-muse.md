---
title: Meta Muse
description: Connect OpenQuok to Meta Muse for Facebook, Instagram, Threads, and WhatsApp — custom connector, public API, or openquok-core in Muse Secure VM.
order: 6
lastUpdated: 2026-09-29
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- A Meta Muse account on a supported device or region. Meta ships Muse as a **consumer personal agent** (mobile, muse.ai, messaging). This is **not** <a href="/agents/muse-code">Muse Code</a>, Meta's terminal coding agent for developers.
- An OpenQuok workspace with at least one connected social channel.
- A programmatic token from <Badge text="Developers → Access" variant="default" /> (or OAuth device flow if Muse runs the CLI in its Secure VM).

<Callout type="note" title="Meta Muse vs Muse Code">
<p><strong>Meta Muse</strong> handles everyday tasks in a Secure VM and can build <strong>custom connectors</strong> from public APIs. <strong>Muse Code</strong> is a developer tool in your terminal with MCP in <Badge text="~/.config/muse/settings.json" variant="path" />. Use this guide for consumer Muse; use the <a href="/docs/mcp-setup-guides/muse-code">Muse Code MCP guide</a> for the coding agent.</p>
</Callout>

<Callout type="note" title="How Muse works">
<p><strong>Meta Muse</strong> is a personal agent on <strong>Muse Secure VM</strong> — a dedicated cloud computer with its own browser and credential storage. You can message Muse in the app or <strong>WhatsApp</strong>. Muse can keep working after you close the app and ask before sensitive actions. OpenQuok connects through a <strong>custom connector</strong> (public OpenAPI) or <strong>openquok-core</strong> in the VM; you still approve social publishes on OpenQuok. Product overview: <DocsExternalLink href="https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/">Introducing Muse</DocsExternalLink>.</p>
</Callout>

## Installation

<Steps
	howToName="Connect OpenQuok to Meta Muse"
	howToDescription="Custom connector, optional CLI skill in the Secure VM, and verification prompts."
>

### Confirm you are on Meta Muse

<p>Official consumer product: <DocsExternalLink href="https://www.meta.ai/muse">Meta Muse</DocsExternalLink>. Developer tooling (Muse Code, Meta Model API) lives on <DocsExternalLink href="https://dev.meta.ai/">dev.meta.ai</DocsExternalLink> — a different app and subscription.</p>

### Create an OpenQuok API key

<p>In the OpenQuok dashboard, open <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" /> and create a programmatic token for the workspace Muse should use.</p>

<p>Keep the key for Muse <strong>secure credential prompts</strong>. Do not paste it into ordinary chat messages.</p>

<h3 id="choose-a-connection-path">Choose a connection path</h3>

<Tabs items={["Custom connector (recommended)", "CLI + SKILL.md in VM", "Hosted MCP"]}>
<TabItem label="Custom connector (recommended)">

<p>Meta documents that Muse can create a <strong>custom connector</strong> when a service exposes an API. OpenQuok publishes a public OpenAPI document:</p>

```text
https://www.openquok.com/api/v1/openapi.json
```

<p>Ask Muse in chat:</p>

<blockquote><p>Create a custom connector for OpenQuok using https://www.openquok.com/api/v1/openapi.json. Do not publish anything yet. First list my connected social accounts and the available scheduling operations.</p></blockquote>

<p>When Muse asks for authentication, paste your <Badge text="opo_" variant="default" /> token into the <strong>secure credential</strong> flow — not the main conversation.</p>

<p>API requests use the <Badge text="Authorization" variant="default" /> header with your programmatic token. See <a href="/docs/getting-started-for-public-api">Public API</a> for concepts and limits.</p>

</TabItem>
<TabItem label="CLI + SKILL.md in VM">

<p>Muse runs tasks inside a <strong>Secure VM</strong> with a terminal. You can install the global CLI and fetch the openquok-core skill there:</p>

```bash
npm install -g @openquok/auto-cli@latest
openquok --version

mkdir -p ~/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o ~/openquok-core/SKILL.md
```

<p>Authenticate with device OAuth or a programmatic token:</p>

```bash
openquok auth:login
# or
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

<p>Ask Muse to follow <Badge text="SKILL.md" variant="path" /> when you want shell-based scheduling beside a custom connector.</p>

</TabItem>
<TabItem label="Hosted MCP">

<p>When your Muse environment exposes MCP configuration, point it at the same hosted OpenQuok MCP server as other clients. Consumer Muse today emphasizes API and CLI custom connectors; use MCP where the product exposes it.</p>

<p>Setup: <a href="/docs/mcp-setup-guides">MCP setup guides</a> and <a href="/docs/getting-started-for-mcp">MCP introduction</a>.</p>

</TabItem>
</Tabs>

### Verify before you schedule

<p>After the connector or CLI is ready, ask Muse:</p>

<blockquote><p>List my connected OpenQuok channels and tell me which destinations support this post format before drafting anything.</p></blockquote>

<p>Then draft with explicit approval:</p>

<blockquote><p>Turn these notes into platform-specific drafts for my connected accounts, validate every target, and keep the result as drafts for review on OpenQuok.</p></blockquote>

</Steps>

## Meta Muse + OpenQuok notes

- **Custom connectors** are built per user; Meta does not review them the same way as directory connectors. Read OpenQuok privacy and terms before you grant access.
- **Human approval:** drafts and scheduled items appear in your OpenQuok workspace. Review on the calendar or kanban before publish.
- **Muse Code:** terminal coding agents should use <a href="/docs/mcp-setup-guides/muse-code">Muse Code MCP setup</a>, not this agent-host skill path.

## Troubleshooting

<Callout type="warning" title="Wrong product">
<p>If you installed <Badge text="@openquok/auto-cli" variant="experimental" /> on your laptop for <strong>Muse Code</strong>, you still need consumer Muse steps above for the personal agent. Muse Code MCP config does not replace a Meta Muse custom connector.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Muse Code (MCP)" description="Terminal coding agent — streamable HTTP MCP in settings.json" href="/docs/mcp-setup-guides/muse-code" />
<LinkCard title="Public API" description="Auth, workspaces, and OpenAPI reference" href="/docs/getting-started-for-public-api" />
<LinkCard title="CLI authentication" description="OAuth device flow and programmatic tokens" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="MCP setup guides" description="Cursor, Claude Code, and other MCP clients" href="/docs/mcp-setup-guides" />
</CardGrid>

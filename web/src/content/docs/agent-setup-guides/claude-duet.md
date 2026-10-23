---
title: Claude Duet
description: Install openquok-core on Claude Duet’s virtual machine — proactive agent on iOS, Android, and claude.ai.
order: 9
lastUpdated: 2026-10-22
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- <DocsExternalLink href="https://claude.com/resources/articles/claude-duet">Claude Duet</DocsExternalLink> research preview access (Anthropic documents US <strong>Claude Pro</strong> and <strong>Max</strong> subscribers on a waitlist; availability can change).
- The Claude Duet app on <strong>iOS</strong> or <strong>Android</strong>, or Duet enabled on <strong>claude.ai</strong>.
- An OpenQuok workspace with at least one connected social channel.
- For OAuth device login: a browser on your phone or laptop to approve the device link.

<Callout type="warning">
<p><strong>Claude Duet</strong> is the proactive consumer app with a virtual machine and mobile apps. <a href="/agents/claude-code">Claude Code</a> is the terminal agent with MCP. <a href="/agents/claude-cowork">Claude Cowork</a> is the desktop cowork surface. Each has its own OpenQuok setup guide.</p>
</Callout>

## Installation

<Steps
	howToName="Connect OpenQuok to Claude Duet"
	howToDescription="Install the global CLI and openquok-core skill on Duet’s virtual machine."
>

### Confirm Claude Duet is enabled

<p>Install the Claude Duet app or open claude.ai when your account has Duet access. You message Duet in one ongoing thread by text or voice.</p>

### Install the global OpenQuok CLI

<p>Ask Claude Duet to run this on its <strong>virtual machine</strong> (the environment Duet uses for background tasks):</p>

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

<Callout type="warning" title="CLI version update">
<p>Starting a new task does <strong>not</strong> upgrade <Badge text="openquok --version" variant="default"/>. Ask Duet to run <Badge text="npm install -g @openquok/auto-cli@latest" variant="default"/> on the VM when you need a newer CLI.</p>
</Callout>

<h3 id="install-the-openquok-core-skill">Install the openquok-core skill</h3>

<p>The skill file lives at <Badge text="agent/skills/openquok-core/SKILL.md" variant="path" /> in the monorepo. Duet can reuse skills from your Claude account. Choose one install path:</p>

<Tabs items={["Ask Claude Duet", "curl + Skills"]}>
<TabItem label="Ask Claude Duet">

<blockquote><p>Install the openquok-core skill from the official SKILL.md on your virtual machine and confirm openquok auth:status works.</p></blockquote>

</TabItem>
<TabItem label="curl + Skills">

```bash
mkdir -p ~/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o ~/openquok-core/SKILL.md
```

<p>Add the instructions to your Claude <strong>skills</strong> library so Duet can load them on later tasks.</p>

</TabItem>
</Tabs>

### Authenticate

<p><strong>Recommended:</strong> ask Duet to run <Badge text="openquok auth:login" variant="default" /> on the VM. Open the verification link, sign in, and authorize your workspace.</p>

<p><strong>Alternative:</strong> create a programmatic <Badge text="opo_" variant="default" /> token under <Badge text="Developers → Access" variant="default" />:</p>

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

### Verify before you schedule

<blockquote><p>List my connected OpenQuok integrations, then draft a LinkedIn post for tomorrow at 10:00 — queue as a draft only.</p></blockquote>

<p>Confirm Duet calls OpenQuok (for example <Badge text="integrations:list" variant="default" /> or MCP tools), not caption-only text. Approve publishes on the OpenQuok calendar or kanban.</p>

</Steps>

## Related

<CardGrid>
<LinkCard title="Claude Code MCP" description="Terminal claude mcp add setup" href="/docs/mcp-setup-guides/claude-code" />
<LinkCard title="Claude Cowork" description="Desktop custom connector setup" href="/docs/mcp-setup-guides/claude-cowork" />
<LinkCard title="CLI introduction" description="openquok-core commands and auth" href="/docs/getting-started-for-cli" />
<LinkCard title="Claude Duet landing" description="Proactive agent + OpenQuok overview" href="/agents/claude-duet" />
</CardGrid>

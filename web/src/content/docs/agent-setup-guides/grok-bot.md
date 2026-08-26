---
title: Grok Bot
description: Install the openquok-core skill and OpenQuok CLI on a Grok Bot cloud computer (desktop and iOS).
order: 2
lastUpdated: 2026-08-14
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>


## Prerequisites

- An eligible plan such as SuperGrok Heavy, Cursor Ultra, or Cursor Teams Premium — sign in with your Cursor account when you install Grok Bot.
- The Grok Bot desktop app (macOS or Windows) or iOS app, with at least one Bot created.
- For OAuth device login: you can authorize the sign-in link on your phone when the Bot asks you to log in.

<p class="not-prose flex justify-center">
  <img src="/docs/_assets/getting-started-for-cli/oauth-mobile-login.webp" alt="OAuth mobile login" />
</p>

## Installation

<Steps
	howToName="Installation for Grok Bot"
	howToDescription="Install OpenQuok CLI on a Grok Bot (desktop and iOS)."
>

### Install Grok Bot

Download the desktop client for macOS or Windows, or install on iOS. Create a Bot teammate — each Bot gets a shared persistent cloud computer (browser, filesystem, terminal).

<p>Official product and setup docs: <DocsExternalLink href="https://x.ai/bot">Grok Bot</DocsExternalLink> and the <DocsExternalLink href="https://docs.x.ai/grok-bot/get-started">get started guide</DocsExternalLink>.</p>

### Install the global OpenQuok CLI

Ask your Bot to run this on its cloud computer (the same shell environment it uses for terminal tools):

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

Production auth uses the API at <Badge text="https://cli-auth.openquok.com" variant="new" /> and opens the browser on <Badge text="https://www.openquok.com/cli/device/verify" variant="new" />.

<Callout type="warning" title="CLI version update">
<p>Installing a skill or starting a new chat does <strong>not</strong> change <Badge text="openquok --version" variant="default"/>. Ask the Bot to run <Badge text="npm install -g @openquok/auto-cli@latest" variant="default"/> on its computer when you need a newer CLI.</p>
</Callout>

<h3 id="install-the-openquok-core-skill">Install the openquok-core skill</h3>

The skill file lives at <Badge text="agent/skills/openquok-core/SKILL.md" variant="path" /> in the monorepo. Grok Bot loads skills from <strong>Settings → Plugins</strong> or when you invoke <Badge text="/" variant="default" /> in chat. Choose one install path:

<Tabs items={["Ask the Bot", "curl + Plugins"]}>
<TabItem label="Ask the Bot">

<p>After the global CLI is on PATH, message your Bot:</p>

<blockquote><p>Install the openquok-core skill from the official SKILL.md and confirm openquok auth:status works.</p></blockquote>

<p>The Bot can fetch the skill from the monorepo and save it under Plugins as <Badge text="openquok-core" variant="default" />.</p>

</TabItem>
<TabItem label="curl + Plugins">

<p>Fetch the skill into the durable workspace, then ask the Bot to register it:</p>

```bash
mkdir -p /workspace/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o /workspace/openquok-core/SKILL.md
```

<p>In chat, ask the Bot to save <Badge text="/workspace/openquok-core/SKILL.md" variant="path" /> as a skill named <Badge text="openquok-core" variant="default" /> (Settings → Plugins → Yours if it does not appear under <Badge text="/" variant="default" />).</p>

</TabItem>
</Tabs>

Start a <strong>new</strong> chat after install so the Bot reloads skill instructions.

### Authenticate

**Recommended:** ask the Bot to log in to OpenQuok. It runs device OAuth on its cloud computer; open the link on your phone, sign in if needed, and tap <strong>Authorize</strong>.

**Alternative for headless or scripted runs:** rotate a programmatic token from the <a href="https://www.openquok.com">OpenQuok dashboard</a> (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />):

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

Credentials are stored on the Bot shared computer — not in your desktop chat history.

### Confirm the Bot can run commands

After auth, ask your Bot to run:

```bash
openquok integrations:list
```

</Steps>

## Verify in chat

Ask your Bot something like:

<blockquote><p>List my connected channels, then draft a TikTok post for tomorrow at 10am — do not publish until I approve on OpenQuok.</p></blockquote>

Posts should land as drafts or scheduled items in your OpenQuok workspace. Review on the calendar or kanban before anything goes live.

## Grok Bot + OpenQuok notes

- **CLI-first:** openquok-core teaches shell commands on the shared computer. Optional Connectors/MCP are a secondary path — prefer the skill for scheduling workflows.
- **Shared computer:** <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> and <Badge text="~/.openquok/credentials.json" variant="path" /> live on the Bot environment. Do not paste tokens into chat.
- **Plugins vs MCP:** save <Badge text="openquok-core" variant="default" /> under Settings → Plugins; invoke with <Badge text="/" variant="default" /> when you need scheduling. Connectors are optional for other tools.
- **Human approval:** the Bot can queue volume; you approve quality on OpenQuok before publish.

## Troubleshooting

<Callout type="warning" title="Outdated skill or CLI">
<p>Updating the skill does <strong>not</strong> upgrade <Badge text="openquok --version" variant="default" />. Ask the Bot to run <Badge text="npm install -g @openquok/auto-cli@latest" variant="default" /> on its computer, then start a new chat so the OpenQuok skill re-runs its opening checks.</p>
</Callout>

<Callout type="danger" title="Skill not found">
<p>Confirm <Badge text="/workspace/openquok-core/SKILL.md" variant="path" /> exists or that <Badge text="openquok-core" variant="default" /> appears under Settings → Plugins. Re-save the skill from the curl path above if needed.</p>
</Callout>

<Callout type="note" title="Plan eligibility">
<p>Grok Bot requires an eligible subscription (for example SuperGrok Heavy, Cursor Ultra, or Cursor Teams Premium). OpenQuok billing is separate — you still need a workspace and connected channels in the OpenQuok app.</p>
</Callout>

## Skill source on GitHub

<DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-core/SKILL.md">agent/skills/openquok-core/SKILL.md</DocsExternalLink> — authoritative instructions the skill installer copies.

## Related

<CardGrid>
<LinkCard title="Grok Bot landing" description="Schedule from desktop chat and approve on OpenQuok" href="/agents/grok-bot" />
<LinkCard title="Introduction to OpenQuok CLI" description="General install and quick start" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI authentication" description="OAuth device flow, programmatic token, and self-hosted auth server" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="OpenClaw agent guide" description="Install openquok-core for OpenClaw" href="/docs/agent-setup-guides/openclaw" />
<LinkCard title="Hermes Agent guide" description="Install openquok-core for Hermes Agent" href="/docs/agent-setup-guides/hermes" />
<LinkCard title="Skill Builder" description="Compose channel-specific SKILL.md exports" href="/tools/skill-builder" />
</CardGrid>

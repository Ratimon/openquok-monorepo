---
title: Dots
description: Install openquok-core on OpenAI Dots — always-on ChatGPT agents with a cloud computer. Schedule from ChatGPT, Slack, or Teams. Not the ChatGPT MCP connector path.
order: 7
lastUpdated: 2026-10-01
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>


## Prerequisites

- An eligible ChatGPT plan with Dots (for example Pro, Business Premium, or Enterprise when your workspace admin enables it).
- ChatGPT on desktop or browser to create your dot and connect apps.
- For OAuth device login: you can authorize the sign-in link on your phone when your dot runs <Badge text="openquok auth:login" variant="default" /> on its cloud computer.

<p class="not-prose flex justify-center">
  <img src="/docs/_assets/getting-started-for-cli/oauth-mobile-login.webp" alt="OAuth mobile login" />
</p>

<Callout type="note" title="Dots vs ChatGPT MCP">
<p><strong>Dots</strong> are always-on agents with a persistent cloud computer and plugins. <a href="/agents/chatgpt">ChatGPT MCP</a> connects OpenQuok inside a chat session via a custom connector — better for ad hoc tool calls, not long-running CLI work on the dot computer. This guide is for <strong>Dots + openquok-core</strong>.</p>
</Callout>

## Installation

<Steps
	howToName="Installation for Dots"
	howToDescription="Install OpenQuok CLI on an OpenAI dot cloud computer."
>

### Create your dot

In ChatGPT, create and name your primary dot. Connect the apps your dot may read. Open the dot cloud computer when you want to inspect browser, filesystem, or shell work.

<p>Product overview: <DocsExternalLink href="https://openai.com/index/introducing-dots/">Introducing dots</DocsExternalLink>. Help Center articles cover Custom Rules, Activity View, and app permissions.</p>

### Install the global OpenQuok CLI

Ask your dot to run this on its cloud computer:

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

Production auth uses the API at <Badge text="https://cli-auth.openquok.com" variant="new" /> and opens the browser on <Badge text="https://www.openquok.com/cli/device/verify" variant="new" />.

<Callout type="warning" title="CLI version update">
<p>Connecting a new plugin does <strong>not</strong> change <Badge text="openquok --version" variant="default"/>. Ask your dot to run <Badge text="npm install -g @openquok/auto-cli@latest" variant="default" /> when you need a newer CLI.</p>
</Callout>

<h3 id="install-the-openquok-core-skill">Install the openquok-core skill</h3>

The skill file lives at <Badge text="agent/skills/openquok-core/SKILL.md" variant="path" /> in the monorepo. Register it through your dot plugins workflow. Choose one install path:

<Tabs items={["Ask your dot", "curl + plugins"]}>
<TabItem label="Ask your dot">

<p>After the global CLI is on PATH, message your dot:</p>

<blockquote><p>Install the openquok-core skill from the official SKILL.md and confirm openquok auth:status works.</p></blockquote>

<p>Your dot can fetch the skill and save it as <Badge text="openquok-core" variant="default" /> in plugins.</p>

</TabItem>
<TabItem label="curl + plugins">

<p>Fetch the skill on the dot cloud computer, then ask your dot to register it:</p>

```bash
mkdir -p ~/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o ~/openquok-core/SKILL.md
```

<p>In chat, ask your dot to register <Badge text="~/openquok-core/SKILL.md" variant="path" /> as <Badge text="openquok-core" variant="default" />.</p>

</TabItem>
</Tabs>

Start a <strong>new</strong> conversation after install so your dot reloads skill instructions.

### Authenticate

**Recommended:** ask your dot to log in to OpenQuok. It runs device OAuth on its cloud computer; open the link on your phone, sign in if needed, and tap <strong>Authorize</strong>.

**Alternative for headless or scripted runs:** rotate a programmatic token from the <a href="https://www.openquok.com">OpenQuok dashboard</a> (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />):

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

Credentials are stored on the dot cloud computer — not in Slack or Teams message history.

### Confirm your dot can run commands

After auth, ask your dot to run:

```bash
openquok integrations:list
```

</Steps>

## Verify in chat

Ask your dot something like:

<blockquote><p>List my connected channels, then draft a LinkedIn post for tomorrow at 10am — do not publish until I approve on OpenQuok.</p></blockquote>

Posts should land as drafts or scheduled items in your OpenQuok workspace. Review on the calendar or kanban before anything goes live.

## Dots + OpenQuok notes

- **CLI-first:** openquok-core teaches shell commands on the dot computer. Optional <a href="/agents/cursor">Cursor MCP</a> is a secondary path for IDE sessions.
- **Cloud computer:** <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> and <Badge text="~/.openquok/credentials.json" variant="path" /> live on the dot environment. Do not paste tokens into Slack or Teams threads.
- **Custom Rules:** require approval for outbound social actions. OpenQuok remains the calendar and kanban checkpoint before publish.
- **Human approval:** your dot can queue volume; you approve quality on OpenQuok.

## Troubleshooting

<Callout type="warning" title="Outdated skill or CLI">
<p>Updating plugins does <strong>not</strong> upgrade <Badge text="openquok --version" variant="default" />. Ask your dot to run <Badge text="npm install -g @openquok/auto-cli@latest" variant="default" />, then start a new chat.</p>
</Callout>

<Callout type="danger" title="Skill not found">
<p>Confirm <Badge text="~/openquok-core/SKILL.md" variant="path" /> exists on the dot computer and that <Badge text="openquok-core" variant="default" /> is registered in plugins. Re-fetch SKILL.md if needed.</p>
</Callout>

<Callout type="note" title="Plan eligibility">
<p>Dots roll out on eligible ChatGPT Pro, Business Premium, and Enterprise plans. OpenQuok billing is separate — you still need a workspace and connected channels in the OpenQuok app.</p>
</Callout>

## Skill source on GitHub

<DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-core/SKILL.md">agent/skills/openquok-core/SKILL.md</DocsExternalLink> — authoritative instructions the skill installer copies.

## Related

<CardGrid>
<LinkCard title="Dots landing" description="Schedule from ChatGPT, Slack, or Teams and approve on OpenQuok" href="/agents/dots" />
<LinkCard title="ChatGPT MCP" description="OpenQuok custom connector in ChatGPT — not the same as Dots" href="/agents/chatgpt" />
<LinkCard title="Grok Bot agent guide" description="xAI cloud-computer teammates" href="/docs/agent-setup-guides/grok-bot" />
<LinkCard title="OpenClaw agent guide" description="Self-hosted Telegram, WhatsApp, and Slack" href="/docs/agent-setup-guides/openclaw" />
<LinkCard title="Introduction to OpenQuok CLI" description="General install and quick start" href="/docs/getting-started-for-cli" />
<LinkCard title="Skill Builder" description="Compose channel-specific SKILL.md exports" href="/tools/skill-builder" />
</CardGrid>

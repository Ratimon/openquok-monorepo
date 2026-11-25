---
title: Tucano
description: Install the OpenQuok CLI and openquok-core skill where your Tucano scheduling agent runs shell commands.
order: 13
lastUpdated: 2026-11-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- Tucano desktop app on macOS, Windows, or Linux — the app is free.
- At least one agent with a connected harness (Claude Code, Codex, Cursor, Gemini, Grok, OpenCode, or Pi).
- Node.js on the computer or isolated Linux box where the scheduling agent runs commands when you install <Badge text="@openquok/auto-cli" variant="experimental" /> globally.

<p>Official product: <DocsExternalLink href="https://tucano.sh/en/">Tucano</DocsExternalLink></p>

## Installation

<Steps
	howToName="Installation for Tucano"
	howToDescription="Install OpenQuok CLI where your scheduling agent runs commands and add openquok-core to a folder it can read."
>

### Install Tucano and connect a harness

Download Tucano, complete harness sign-in in onboarding, and create a scheduling agent with shell access on your machine or an isolated Linux box.

### Install the global OpenQuok CLI

On the computer the agent uses for terminal work:

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

Production auth uses the API at <Badge text="https://cli-auth.openquok.com" variant="new" /> and opens the browser on <Badge text="https://www.openquok.com/cli/device/verify" variant="new" />.

<Callout type="warning" title="CLI version update">
<p>Adding a skill does <strong>not</strong> change <Badge text="openquok --version" variant="default"/>. Run <Badge text="npm install -g @openquok/auto-cli@latest" variant="default"/> when you need a newer CLI.</p>
</Callout>

<h3 id="install-the-openquok-core-skill">Install the openquok-core skill</h3>

The skill file lives at <Badge text="agent/skills/openquok-core/SKILL.md" variant="path" /> in the monorepo. Point your scheduling agent at it:

<Tabs items={["Ask your agent", "curl + folder"]}>
<TabItem label="Ask your agent">

<p>After the global CLI is on PATH, message your scheduling agent in a channel:</p>

<blockquote><p>Install openquok-core from the official SKILL.md in a folder you can read and confirm openquok auth:status works.</p></blockquote>

</TabItem>
<TabItem label="curl + folder">

```bash
mkdir -p ~/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o ~/openquok-core/SKILL.md
```

<p>Tell the agent where SKILL.md lives, or copy it into a path the agent already uses for tools.</p>

</TabItem>
</Tabs>

### Authenticate

**Recommended:** ask the scheduling agent to log in to OpenQuok. It runs device OAuth on the agent computer; open the link, sign in if needed, and tap <strong>Authorize</strong>.

**Alternative for headless runs:** rotate a programmatic token from the <a href="https://www.openquok.com">OpenQuok dashboard</a> (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />):

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

Credentials stay on the agent computer — not inside channel exports.

### Confirm the agent can run commands

After auth, ask your scheduling agent to run:

```bash
openquok integrations:list
```

You should see connected channels for your workspace.

</Steps>

## Multi-agent scheduling

Run specialists in channels for briefs or launch copy, then message your scheduling agent to queue drafts with openquok-core. Use routines when you want weekday social runs. You approve on OpenQuok before anything goes live.

<Callout type="note" title="Not MausBot">
<p><a href="/agents/mausbot">MausBot</a> is a separate open-source multi-bot desktop chat. Tucano emphasizes channel-based teams, routines, and per-agent harness choice. Pick the guide that matches your product.</p>
</Callout>

## Verify from chat

Ask your scheduling agent something like:

> Schedule a post to LinkedIn for tomorrow at 9am: We connected Tucano to OpenQuok — review before publish.

## Related

<CardGrid>
<LinkCard title="Tucano integration" description="Landing page for Tucano + OpenQuok" href="/agents/tucano" />
<LinkCard title="MausBot" description="Open-source multi-bot desktop — compare hosts" href="/docs/agent-setup-guides/mausbot" />
<LinkCard title="OpenBot" description="BYO desktop multi-agent workspace" href="/docs/agent-setup-guides/openbot" />
<LinkCard title="Introduction to OpenQuok CLI" description="Auth, commands, and workspace concepts" href="/docs/getting-started-for-cli" />
</CardGrid>
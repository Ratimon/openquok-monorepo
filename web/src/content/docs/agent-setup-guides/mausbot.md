---
title: MausBot
description: Install the OpenQuok CLI and openquok-core skill on the computer your MausBot uses for shell commands.
order: 12
lastUpdated: 2026-11-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- MausBot desktop app on macOS, Windows, or Linux — the app is free and open source.
- At least one bot with a connected agent engine (Claude Code, Codex, Grok, or another supported CLI).
- Node.js on the computer where the bot runs shell commands when you install <Badge text="@openquok/auto-cli" variant="experimental" /> globally.

<p>Official product: <DocsExternalLink href="https://mausbot.com/">MausBot</DocsExternalLink></p>

## Installation

<Steps
	howToName="Installation for MausBot"
	howToDescription="Install OpenQuok CLI where your bot runs commands and add openquok-core to its working folder."
>

### Install MausBot and connect an engine

Download MausBot, complete the engine check in App settings, and create a bot with a working folder when you need file access.

### Install the global OpenQuok CLI

On the computer the bot uses for terminal work (your Mac, a bot cloud desktop, or an always-on host):

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

Production auth uses the API at <Badge text="https://cli-auth.openquok.com" variant="new" /> and opens the browser on <Badge text="https://www.openquok.com/cli/device/verify" variant="new" />.

<Callout type="warning" title="CLI version update">
<p>Adding a skill does <strong>not</strong> change <Badge text="openquok --version" variant="default"/>. Run <Badge text="npm install -g @openquok/auto-cli@latest" variant="default"/> when you need a newer CLI.</p>
</Callout>

<h3 id="install-the-openquok-core-skill">Install the openquok-core skill</h3>

The skill file lives at <Badge text="agent/skills/openquok-core/SKILL.md" variant="path" /> in the monorepo. Point your scheduling bot at it from its working folder:

<Tabs items={["Ask your bot", "curl + folder", "Skill recorder"]}>
<TabItem label="Ask your bot">

<p>After the global CLI is on PATH, message your bot:</p>

<blockquote><p>Install openquok-core from the official SKILL.md in my working folder and confirm openquok auth:status works.</p></blockquote>

</TabItem>
<TabItem label="curl + folder">

```bash
mkdir -p ~/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o ~/openquok-core/SKILL.md
```

<p>Set the bot working folder to that path, or copy SKILL.md into the folder the bot already uses.</p>

</TabItem>
<TabItem label="Skill recorder">

<p>After the bot runs a successful openquok workflow, use MausBot’s skill recorder to capture the commands into a reusable skill for the same bot.</p>

</TabItem>
</Tabs>

### Authenticate

**Recommended:** ask the bot to log in to OpenQuok. It runs device OAuth on the bot computer; open the link, sign in if needed, and tap <strong>Authorize</strong>.

**Alternative for headless runs:** rotate a programmatic token from the <a href="https://www.openquok.com">OpenQuok dashboard</a> (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />):

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

Credentials stay on the bot computer — not inside chat exports.

### Confirm the bot can run commands

After auth, ask your bot to run:

```bash
openquok integrations:list
```

You should see connected channels for your workspace.

</Steps>

## Multi-bot scheduling

Run a specialist bot for briefs or SEO, then message your scheduling bot to queue drafts with openquok-core. Use automations when you want weekday runs. You approve on OpenQuok before anything goes live.

## Connected apps vs CLI

MausBot can reach many suites through connected apps. OpenQuok social scheduling still flows through openquok-core and the CLI on the bot computer for structured JSON and approval-friendly drafts.

<Callout type="note" title="Not Grok Bot">
<p><a href="/agents/grok-bot">Grok Bot</a> is xAI’s managed cloud teammate. MausBot is separate open-source desktop software you run locally. Pick the guide that matches your product.</p>
</Callout>

## Verify from chat

Ask your scheduling bot something like:

> Schedule a post to LinkedIn for tomorrow at 9am: We connected MausBot to OpenQuok — review before publish.

## Related

<CardGrid>
<LinkCard title="MausBot integration" description="Landing page for MausBot + OpenQuok" href="/agents/mausbot" />
<LinkCard title="Grok Bot" description="Managed xAI cloud teammate — compare hosts" href="/docs/agent-setup-guides/grok-bot" />
<LinkCard title="OpenBot" description="Another BYO desktop multi-agent workspace" href="/docs/agent-setup-guides/openbot" />
<LinkCard title="Introduction to OpenQuok CLI" description="Auth, commands, and workspace concepts" href="/docs/getting-started-for-cli" />
</CardGrid>
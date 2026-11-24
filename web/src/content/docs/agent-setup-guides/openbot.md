---
title: OpenBot
description: Install the OpenQuok CLI and openquok-core skill on the computer that runs OpenBot — desktop, mobile, and multi-agent rooms.
order: 11
lastUpdated: 2026-11-24
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- OpenBot installed on macOS, Windows, or Linux — personal use runs on hardware you control.
- At least one agent with a connected provider (ChatGPT, Claude, Gemini, Grok, or a custom OpenAI-compatible endpoint).
- Node.js on the OpenBot computer when you install <Badge text="@openquok/auto-cli" variant="experimental" /> globally.

<p>Official product and guides: <DocsExternalLink href="https://openbot.run/">OpenBot</DocsExternalLink> and the <DocsExternalLink href="https://openbot.run/guides/openbot-marketplace">Marketplace guide</DocsExternalLink>.</p>

## Installation

<Steps
	howToName="Installation for OpenBot"
	howToDescription="Install OpenQuok CLI on your OpenBot computer and register openquok-core on an agent."
>

### Install OpenBot and connect a provider

Download OpenBot, sign in, and connect the AI subscription or API key you already use. Create a scheduling-focused agent or pick one from the Marketplace.

### Install the global OpenQuok CLI

On the same computer that runs OpenBot:

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

Production auth uses the API at <Badge text="https://cli-auth.openquok.com" variant="new" /> and opens the browser on <Badge text="https://www.openquok.com/cli/device/verify" variant="new" />.

<Callout type="warning" title="CLI version update">
<p>Installing a skill does <strong>not</strong> change <Badge text="openquok --version" variant="default"/>. Run <Badge text="npm install -g @openquok/auto-cli@latest" variant="default"/> when you need a newer CLI.</p>
</Callout>

<h3 id="install-the-openquok-core-skill">Install the openquok-core skill</h3>

The skill file lives at <Badge text="agent/skills/openquok-core/SKILL.md" variant="path" /> in the monorepo. Attach it to the agent that should schedule posts. Choose one install path:

<Tabs items={["Marketplace", "Ask the agent", "curl + register"]}>
<TabItem label="Marketplace">

<p>In OpenBot, open the Marketplace → <strong>Skills</strong> tab. Select your scheduling agent and install a skill package, or import openquok-core when you host the SKILL.md file locally.</p>

</TabItem>
<TabItem label="Ask the agent">

<p>After the global CLI is on PATH, message your agent:</p>

<blockquote><p>Install the openquok-core skill from the official SKILL.md and confirm openquok auth:status works.</p></blockquote>

</TabItem>
<TabItem label="curl + register">

```bash
mkdir -p ~/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o ~/openquok-core/SKILL.md
```

<p>Register the file on the agent through Agent settings or the agent’s <Badge text="create_skill" variant="default" /> flow.</p>

</TabItem>
</Tabs>

### Authenticate

**Recommended:** ask the agent to log in to OpenQuok. It runs device OAuth on your OpenBot computer; open the link on your phone, sign in if needed, and tap <strong>Authorize</strong>.

**Alternative for headless runs:** rotate a programmatic token from the <a href="https://www.openquok.com">OpenQuok dashboard</a> (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />):

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

Credentials stay on your OpenBot computer — not inside shared chat exports.

### Confirm the agent can run commands

After auth, ask your agent to run:

```bash
openquok integrations:list
```

You should see connected channels for your workspace.

</Steps>

## Multi-agent scheduling

Use a shared channel when you want QA, SecOps, and Dev agents to brainstorm a launch first. Then message the agent that carries openquok-core to draft and queue posts. You approve on OpenQuok before anything goes live.

## Native apps vs skills

OpenBot’s built-in app catalog is still growing. When a connector is missing, add a skill that calls OpenQuok over MCP or keep CLI-first openquok-core for repeatable scheduling.

## Optional MCP

You can author or install a skill that calls OpenQuok’s hosted MCP tools when you prefer tool calls over shell recipes. CLI-first scheduling remains the default for volume and structured JSON output.

<Callout type="note" title="License and team hosting">
<p>Personal noncommercial use is free under PolyForm Noncommercial 1.0.0. Read the license before commercial use. OpenBot for Teams uses vendor-managed servers only — personal OpenBot still runs on your computer.</p>
</Callout>

## Verify from chat

Ask your scheduling agent something like:

> Schedule a post to LinkedIn for tomorrow at 9am: We connected OpenBot to OpenQuok — review before publish.

## Related

<CardGrid>
<LinkCard title="OpenBot integration" description="Landing page for OpenBot + OpenQuok" href="/agents/openbot" />
<LinkCard title="Rakazo" description="Self-hosted sandboxes — compare when you pick a host" href="/docs/agent-setup-guides/rakazo" />
<LinkCard title="ThinkRail" description="Worktree IDE + pi skills" href="/docs/agent-setup-guides/thinkrail" />
<LinkCard title="Introduction to OpenQuok CLI" description="Auth, commands, and workspace concepts" href="/docs/getting-started-for-cli" />
</CardGrid>
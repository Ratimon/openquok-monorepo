---
title: Rakazo
description: Install the OpenQuok CLI and openquok-core skill on Rakazo bot sandboxes you self-host.
order: 10
lastUpdated: 2026-11-07
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>


## Prerequisites

- A Rakazo deployment you control — Docker images on a laptop or VPS, or a dev stack from source.
- At least one bot with its own sandbox computer (browser, shell, and persisted home).
- Node.js on the bot sandbox when you install <Badge text="@openquok/auto-cli" variant="experimental" /> globally.

<p>Official product and self-hosting docs: <DocsExternalLink href="https://rakazo.com/self-hosted-ai-agent/">Rakazo self-hosting</DocsExternalLink> and the <DocsExternalLink href="https://rakazo.com/docs/">documentation hub</DocsExternalLink>.</p>

## Installation

<Steps
	howToName="Installation for Rakazo"
	howToDescription="Install OpenQuok CLI on a Rakazo bot computer and register openquok-core."
>

### Run Rakazo

Install with published Docker images or run from source. Sign in, connect a model, and create a bot. Open the bot computer when you need a shell.

### Install the global OpenQuok CLI

On the bot sandbox terminal:

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

Production auth uses the API at <Badge text="https://cli-auth.openquok.com" variant="new" /> and opens the browser on <Badge text="https://www.openquok.com/cli/device/verify" variant="new" />.

<Callout type="warning" title="CLI version update">
<p>Installing a skill does <strong>not</strong> change <Badge text="openquok --version" variant="default"/>. Run <Badge text="npm install -g @openquok/auto-cli@latest" variant="default"/> on the sandbox when you need a newer CLI.</p>
</Callout>

<h3 id="install-the-openquok-core-skill">Install the openquok-core skill</h3>

The skill file lives at <Badge text="agent/skills/openquok-core/SKILL.md" variant="path" /> in the monorepo. Register it as a bot skill on the sandbox. Choose one install path:

<Tabs items={["Ask the bot", "curl + skill"]}>
<TabItem label="Ask the bot">

<p>After the global CLI is on PATH, message your bot:</p>

<blockquote><p>Install the openquok-core skill from the official SKILL.md and confirm openquok auth:status works.</p></blockquote>

<p>The bot can fetch the skill and save it under its skills directory.</p>

</TabItem>
<TabItem label="curl + skill">

```bash
mkdir -p ~/skills/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o ~/skills/openquok-core/SKILL.md
```

<p>Register the saved file as a bot skill named <Badge text="openquok-core" variant="default" /> in the Rakazo UI.</p>

</TabItem>
</Tabs>

### Authenticate

**Recommended:** ask the bot to log in to OpenQuok. It runs device OAuth on its sandbox; open the link on your phone, sign in if needed, and tap <strong>Authorize</strong>.

**Alternative for headless runs:** rotate a programmatic token from the <a href="https://www.openquok.com">OpenQuok dashboard</a> (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />):

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

Credentials stay on the bot sandbox — not in Slack or mobile chat history.

### Confirm the bot can run commands

After auth, ask your bot to run:

```bash
openquok integrations:list
```

You should see connected channels for your workspace.

</Steps>

## Optional MCP

You can add OpenQuok as an HTTPS MCP server under <strong>Integrations</strong> instead of or beside the CLI skill. Copy the MCP URL and token from <a href="https://www.openquok.com">Developers → Access</a> on OpenQuok. CLI-first scheduling stays the default for repeatable bot routines.

## Related

<CardGrid>
<LinkCard title="Rakazo integration" description="Landing page for Rakazo + OpenQuok" href="/agents/rakazo" />
<LinkCard title="Grok Bot" description="Managed xAI cloud teammates — compare when you pick a host" href="/docs/agent-setup-guides/grok-bot" />
<LinkCard title="OpenClaw" description="Self-hosted messaging gateway skill install" href="/docs/agent-setup-guides/openclaw" />
<LinkCard title="Introduction to OpenQuok CLI" description="Auth, commands, and workspace concepts" href="/docs/getting-started-for-cli" />
</CardGrid>

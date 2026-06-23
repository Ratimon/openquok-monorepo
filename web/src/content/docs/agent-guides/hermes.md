---
title: Hermes Agent
description: Install the openquok-core skill and Openquok CLI on a Hermes Agent host (Telegram, Discord, Slack, and more).
order: 1
lastUpdated: 2026-06-22
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>


## Prerequisites

- Shell access on the host where Hermes runs terminal commands (local machine, Docker, SSH, Daytona, or Modal).
- A working Hermes chat before adding skills — run <Badge text="hermes" variant="default" /> and confirm the agent responds.
- For OAuth device login: you can authorize the sign-in link on your phone when the agent asks you to log in.

<p class="not-prose flex justify-center">
  <img src="/docs/getting-started-for-cli/oauth-mobile-login.webp" alt="OAuth mobile login" />
</p>

## Installation

<Steps>

### Install Hermes Agent

On Linux, macOS, WSL2, or Android (Termux):

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
source ~/.bashrc   # or source ~/.zshrc
```

On native Windows (PowerShell):

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

Then choose a provider — fastest path with Nous Portal:

```bash
hermes setup --portal
```

Or run <Badge text="hermes model" variant="default" /> to pick Anthropic, OpenRouter, OpenAI, Gemini, or a custom endpoint. See the <DocsExternalLink href="https://hermes-agent.nousresearch.com/docs/getting-started/quickstart">Hermes quickstart</DocsExternalLink> for provider tables and troubleshooting.

### Connect a messaging gateway (optional)

After CLI chat works, connect Telegram, Discord, Slack, WhatsApp, or another platform:

```bash
hermes gateway setup
```

Check status with <Badge text="hermes gateway status" variant="default" />. Messaging is optional for OpenQuok — the agent can draft and schedule from the terminal alone.

### Install the global Openquok CLI

In the <strong>same</strong> environment Hermes uses for shell tools:

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

Production auth uses the API at <Badge text="https://cli-auth.openquok.com" variant="new" /> and opens the browser on <Badge text="https://www.openquok.com/cli/device/verify" variant="new" />.

<Callout type="warning" title="CLI version update">
<p>Installing a skill or restarting Hermes does <strong>not</strong> change <Badge text="openquok --version" variant="default"/>. You need to update it yourself by running <Badge text="npm install -g @openquok/auto-cli@latest" variant="default"/> </p>
</Callout>

### Install the openquok-core skill

The skill file lives at <Badge text="agent/skills/openquok-core/SKILL.md" variant="path" /> in the monorepo. Hermes loads skills from <Badge text="~/.hermes/skills/" variant="path" />. Choose one install path:

<Tabs items={["hermes CLI", "curl"]}>
<TabItem label="hermes CLI">

<p>Install a single-file skill from the monorepo URL. The skill name comes from the YAML frontmatter (<Badge text="openquok-core" variant="default" />).</p>

```bash
hermes skills install https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md
```

<p>Run this in the <strong>Hermes terminal</strong> (local shell, SSH, or container exec) — the same environment Hermes uses for shell tools. On Telegram, Discord, and other gateways, <Badge text="/skills install" variant="default" /> is not available; search and install are CLI-only.</p>

</TabItem>
<TabItem label="curl">

<p>Manual copy when <Badge text="hermes skills install" variant="default" /> is unavailable (minimal shell, no Hermes CLI on PATH).</p>

```bash
mkdir -p ~/.hermes/skills/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o ~/.hermes/skills/openquok-core/SKILL.md
```

</TabItem>
</Tabs>

Start a <strong>new</strong> Hermes session after install so skill descriptions reload. You should see <Badge text="~/.hermes/skills/openquok-core/SKILL.md" variant="path" /> on disk. In the Hermes CLI, <Badge text="hermes skills list" variant="default" /> or <Badge text="/reload-skills" variant="default" /> confirms the skill is loaded.

### Authenticate

**Recommended:** ask the agent in chat to log in to Openquok. It sends you a sign-in link; open it on your phone, sign in if needed, and tap <strong>Authorize</strong>.

**Alternative for fully headless hosts (VPS, Docker, Telegram bots):** rotate a programmatic token from the <a href="https://www.openquok.com">Openquok dashboard</a> (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />):

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

### Confirm the agent can run commands

After auth:

```bash
openquok integrations:list
```

</Steps>

## Hermes + messaging notes

- Start a **new chat session** after installing the skill or upgrading the CLI so Hermes reloads skils and checks <Badge text="openquok --version" variant="default" /> once at session start.
- If the agent reports an old CLI version after you upgraded, run <Badge text="command -v openquok" variant="default" /> and <Badge text="which -a openquok" variant="default" /> — another binary may be earlier on <Badge text="PATH" variant="param" />.
- Hermes separates secrets (<Badge text="~/.hermes/.env" variant="path" />) from config (<Badge text="~/.hermes/config.yaml" variant="path" />). Set <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> in the environment Hermes inherits for terminal tools, or export it in your shell profile before starting <Badge text="hermes gateway" variant="default" />.
- For posting with images in chat, the user must provide a file  or a direct <code>https://</code> image URL for <Badge text="upload-from-url" variant="default" />; ask before calling <Badge text="posts:create" variant="default" /> with media.

## Run on a VPS or serverless host

Hermes supports six terminal backends: local, Docker, SSH, Daytona, Singularity, and Modal. Mount a persistent <Badge text="~/.hermes/" variant="path" /> volume (or set <Badge text="HERMES_HOME" variant="envBackend" />), install openquok-core and the global CLI in the container shell, then authenticate.

On headless hosts prefer <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> or <Badge text="auth:login --json" variant="default" /> so the user opens <Badge text="verification_uri_complete" variant="param" /> on another device. See the <DocsExternalLink href="https://hermes-agent.nousresearch.com/docs/getting-started/installation">Hermes installation guide</DocsExternalLink> for per-user vs root layout and service-account installs.

## Troubleshooting

<Callout type="danger" title="Skill not found">
<p>Confirm <Badge text="~/.hermes/skills/openquok-core/SKILL.md" variant="path" /> exists and start a new session. Run <Badge text="/skills" variant="default" /> in the CLI to list loaded skills.</p>
</Callout>


<Callout type="note" title="Invalid or expired code">
<p>The user must open the exact <Badge text="verification_uri_complete" variant="param" /> link from <Badge text="auth:login --json" variant="default" /> while the CLI is still polling. Codes expire in about 15 minutes. Pre-login at openquok.com alone does not validate the device code.</p>
</Callout>

## Skill source on GitHub

<DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-core/SKILL.md">agent/skills/openquok-core/SKILL.md</DocsExternalLink> — authoritative instructions the skill installer copies.

## Related Section(s)

<CardGrid>
<LinkCard title="Introduction to Openquok CLI" description="General install and quick start" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI authentication" description="OAuth device flow, programmatic token (opo_), and self-hosted auth server" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="OpenClaw agent guide" description="Install openquok-core with npx skills add on OpenClaw hosts" href="/docs/agent-guides/openclaw" />
<LinkCard title="CLI Examples" description="Threads and Instagram recipes" href="/docs/cli-examples" />
</CardGrid>

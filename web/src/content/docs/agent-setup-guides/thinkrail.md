---
title: ThinkRail
description: Install the openquok-core skill and OpenQuok CLI in ThinkRail (worktree IDE for the pi coding agent).
order: 3
lastUpdated: 2026-08-29
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>


## Prerequisites

- <DocsExternalLink href="https://thinkrail.ai/">ThinkRail</DocsExternalLink> installed (CLI or desktop). You need <Badge text="git" variant="default" /> on PATH and an authenticated pi provider.
- A git repo opened as a ThinkRail project, with at least one worktree workspace.
- For OAuth device login: you can authorize the sign-in link on your phone when the agent asks you to log in.

<p class="not-prose flex justify-center">
  <img src="/docs/_assets/getting-started-for-cli/oauth-mobile-login.webp" alt="OAuth mobile login" />
</p>

## Installation

<Steps
	howToName="Installation for ThinkRail"
	howToDescription="Install OpenQuok CLI in ThinkRail (worktree IDE for the pi coding agent)."
>

### Install ThinkRail

Install the CLI (opens the IDE in your browser) or the desktop build. Then run <Badge text="thinkrail" variant="default" /> on a git repository.

<p>Official product page: <DocsExternalLink href="https://thinkrail.ai/">ThinkRail</DocsExternalLink>. Skills layout for the in-process agent: <DocsExternalLink href="https://pi.dev/docs/latest/skills">pi skills</DocsExternalLink>.</p>

macOS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/JetBrains/thinkrail/main/install.sh | bash
thinkrail
```

Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/JetBrains/thinkrail/main/install.ps1 | iex
```

### Install the global OpenQuok CLI

In a ThinkRail terminal scoped to the worktree:

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

Production auth uses the API at <Badge text="https://cli-auth.openquok.com" variant="new" /> and opens the browser on <Badge text="https://www.openquok.com/cli/device/verify" variant="new" />.

<Callout type="warning" title="CLI version update">
<p>Installing a skill or starting a new chat does <strong>not</strong> change <Badge text="openquok --version" variant="default"/>. Run <Badge text="npm install -g @openquok/auto-cli@latest" variant="default"/> in the worktree terminal when you need a newer CLI.</p>
</Callout>

<h3 id="install-the-openquok-core-skill">Install the openquok-core skill</h3>

The skill file lives at <Badge text="agent/skills/openquok-core/SKILL.md" variant="path" /> in the monorepo. ThinkRail runs pi in-process, so pi discovers skills from the usual locations. Choose one install path:

<Tabs items={["Global", "Worktree"]}>
<TabItem label="Global">

<p>Available to every ThinkRail project on this machine:</p>

```bash
mkdir -p ~/.pi/agent/skills/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o ~/.pi/agent/skills/openquok-core/SKILL.md
```

</TabItem>
<TabItem label="Worktree">

<p>Scoped to the active git worktree (good for client-isolated recipes). Run from the worktree cwd:</p>

```bash
mkdir -p .pi/skills/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o .pi/skills/openquok-core/SKILL.md
```

</TabItem>
</Tabs>

Start a <strong>new</strong> pi chat after install so the agent reloads skill instructions. You can also ask in chat: <em>Install the openquok-core skill and confirm openquok auth:status works.</em>

### Authenticate

**Recommended:** ask the agent to log in to OpenQuok. It runs device OAuth; open the link on your phone, sign in if needed, and tap <strong>Authorize</strong>.

**Alternative for headless or scripted runs:** rotate a programmatic token from the <a href="https://www.openquok.com">OpenQuok dashboard</a> (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />):

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

Credentials are stored on the machine that runs ThinkRail — not in the chat transcript.

### Confirm the agent can run commands

After auth, ask:

```bash
openquok integrations:list
```

</Steps>

## Verify in chat

Ask the agent something like:

> List my connected channels, then draft a TikTok post for tomorrow at 10am — do not publish until I approve on OpenQuok.

Posts should land as drafts or scheduled items in your OpenQuok workspace. Review on the calendar or kanban before anything goes live.

## ThinkRail + OpenQuok notes

- <strong>CLI-first:</strong> openquok-core teaches shell commands in the worktree terminal. ThinkRail is not a native OpenQuok MCP client like Cursor — prefer the skill for scheduling workflows.
- <strong>Worktrees:</strong> keep social experiments on a dedicated branch. Merge when the copy is approved; delete the rest.
- <strong>Pi vs ThinkRail:</strong> the same skill files work in a standalone pi CLI session. ThinkRail is the IDE host; you do not need a separate OpenQuok landing for pi.
- <strong>Human approval:</strong> the agent can queue volume; you approve quality on OpenQuok before publish.

## Troubleshooting

- Skill not loading: confirm <Badge text="SKILL.md" variant="path" /> is under <Badge text="~/.pi/agent/skills/openquok-core/" variant="path" /> or <Badge text=".pi/skills/openquok-core/" variant="path" /> and start a new chat.
- CLI not found: install <Badge text="@openquok/auto-cli" variant="experimental" /> in the same environment as the worktree terminal (not only on your laptop if ThinkRail runs elsewhere).
- Auth fails: run <Badge text="openquok auth:status" variant="default" /> in the worktree terminal and complete device login, or set <Badge text="OPENQUOK_API_KEY" variant="envBackend" />.

## Related

<CardGrid>
<LinkCard title="ThinkRail landing" description="Schedule from a worktree IDE and approve on OpenQuok" href="/agents/thinkrail" />
<LinkCard title="CLI getting started" description="Install the global CLI and authenticate" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI authentication" description="OAuth device flow and programmatic tokens" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="Grok Bot" description="Desktop teammate path with Plugins and a cloud computer" href="/docs/agent-setup-guides/grok-bot" />
<LinkCard title="Cursor MCP" description="Editor-native OpenQuok tools without the CLI skill" href="/docs/mcp-setup-guides/cursor" />
</CardGrid>

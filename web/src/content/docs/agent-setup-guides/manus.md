---
title: Manus
description: Import openquok-core in Manus 2.0 Studio (Skills, Cloud Computer, Automations). Manus path — not the separate Cue app.
order: 6
lastUpdated: 2026-09-30
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- A <DocsExternalLink href="https://manus.im/">Manus</DocsExternalLink> account on web, desktop (Manus Studio), or mobile.
- An OpenQuok workspace with at least one connected social channel.
- For OAuth device login: you can authorize the sign-in link on your phone when Manus opens a browser from a Cloud Computer.

<Callout type="note" title="Manus vs Cue">
<p><strong>Manus</strong> is the project platform with Skills, Studio, Cloud Computers, and Automations. <strong>Cue</strong> is a separate early-access app for personal agents on phone and desktop. This guide is for Manus and the openquok-core Skill — not for Cue-specific setup.</p>
</Callout>

<Callout type="note" title="Manus 2.0 workflows">
<p>Manus Studio includes professional surfaces such as <strong>Video Editor</strong> (timeline edits and Alchemy mode) and <strong>Game Dev</strong> (playable games and Cloud Computer multiplayer). <strong>Automations</strong> can start work when email, ads, Slack, Notion, or calendar events change. OpenQuok fits after that work: import <Badge text="openquok-core" variant="default" /> once, then draft and schedule launch posts from the same Manus project — you approve on OpenQuok. Overview: <DocsExternalLink href="https://manus.im/blog/introducing-manus-2-0">Introducing Manus 2.0</DocsExternalLink>.</p>
</Callout>

<p class="not-prose flex justify-center">
  <img src="/docs/_assets/getting-started-for-cli/oauth-mobile-login.webp" alt="OAuth mobile login" />
</p>

## Installation

<Steps
	howToName="Connect OpenQuok to Manus"
	howToDescription="Import or upload the openquok-core Skill, install the CLI on a Cloud Computer, and verify scheduling."
>

### Confirm you are on Manus

<p>Product overview: <DocsExternalLink href="https://manus.im/blog/introducing-manus-2-0">Manus 2.0</DocsExternalLink>. Skills sharing: <DocsExternalLink href="https://help.manus.im/en/articles/14753565-how-to-share-and-use-skills-in-manus">How to share and use Skills in Manus</DocsExternalLink>.</p>

### Add the openquok-core Skill

<p>Manus Skills are folders built around <Badge text="SKILL.md" variant="path" /> plus optional scripts. Choose one path:</p>

<Tabs items={["Import from GitHub", "Upload a skill", "Cloud Computer only"]}>
<TabItem label="Import from GitHub">

<p>Open the <strong>Skills</strong> tab → <strong>+ Add</strong> → <strong>Import from GitHub</strong>. Paste the public skill folder URL:</p>

```text
https://github.com/Ratimon/openquok-monorepo/tree/main/agent/skills/openquok-core
```

<p>Review community Skills before you run them — they may include executable code. OpenQuok publishes only the skill instructions and CLI examples in that folder.</p>

</TabItem>
<TabItem label="Upload a skill">

<p>Download <Badge text="SKILL.md" variant="path" /> into a folder, or package it as a <Badge text=".skill" variant="default" /> or zip file per Manus docs. Then <strong>Skills</strong> → <strong>+ Add</strong> → <strong>Upload a skill</strong>.</p>

```bash
mkdir -p ~/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o ~/openquok-core/SKILL.md
```

<p>Upload the folder or archive Manus accepts for Skills.</p>

</TabItem>
<TabItem label="Cloud Computer only">

<p>When Manus gives you a terminal on a Cloud Computer, you can rely on the skill instructions without importing first — install the CLI and fetch <Badge text="SKILL.md" variant="path" /> manually:</p>

```bash
npm install -g @openquok/auto-cli@latest
openquok --version

mkdir -p ~/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o ~/openquok-core/SKILL.md
```

<p>Ask Manus to follow the skill file when you want shell-based scheduling.</p>

</TabItem>
</Tabs>

<p>After import, type <Badge text="/" variant="default" /> in chat and select <strong>openquok-core</strong> when you want scheduling commands.</p>

### Install the global OpenQuok CLI

<p>Run this on the Cloud Computer or local shell Manus uses for your project:</p>

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

Production auth uses the API at <Badge text="https://cli-auth.openquok.com" variant="new" /> and opens the browser on <Badge text="https://www.openquok.com/cli/device/verify" variant="new" />.

<Callout type="warning" title="CLI version update">
<p>Importing a Skill does <strong>not</strong> upgrade <Badge text="openquok --version" variant="default"/>. Run <Badge text="npm install -g @openquok/auto-cli@latest" variant="default"/> when you need a newer CLI.</p>
</Callout>

### Authenticate

**Recommended:** ask Manus to log in to OpenQuok. It runs device OAuth; open the link on your phone, sign in if needed, and tap <strong>Authorize</strong>.

**Alternative for headless or scripted runs:** rotate a programmatic token from the <a href="https://www.openquok.com">OpenQuok dashboard</a> (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />):

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

Credentials are stored on the machine that runs openquok — not in the chat transcript.

### Confirm the agent can run commands

After auth, ask Manus:

```bash
openquok integrations:list
```

</Steps>

## Verify in chat

Ask Manus something like:

> List my connected OpenQuok channels and draft a post to X for tomorrow at 10am. Do not schedule until I approve on OpenQuok.

Then confirm the draft appears on your OpenQuok calendar or kanban before you move it to scheduled.

## Related

<CardGrid>
<LinkCard title="Introduction to OpenQuok CLI" description="Quick start and command overview" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI authentication" description="OAuth device flow and programmatic tokens" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="Managing posts" description="CLI commands for drafts, review, and schedule" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Manus integration" description="Landing page for Manus + OpenQuok" href="/agents/manus" />
<LinkCard title="MCP setup guides" description="Optional MCP path when you also use an IDE client" href="/docs/mcp-setup-guides" />
</CardGrid>

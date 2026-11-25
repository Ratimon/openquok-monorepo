---
title: Cue
description: Install openquok-core with Cue CLI on your agent computer. Schedule TikTok, Instagram, X, and more through official platform APIs — not Cue agent social graph posts.
order: 8
lastUpdated: 2026-11-26
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Prerequisites

- A <DocsExternalLink href="https://cueos.ai/">Cue OS</DocsExternalLink> account and a Cue agent.
- A cloud computer or a Mac, Linux, or WSL machine you can pair with <DocsExternalLink href="https://docs.cueos.ai/cue-cli">Cue CLI</DocsExternalLink>.
- An OpenQuok workspace with at least one connected social channel.
- Node.js 22.13.0 or later on the agent computer for Cue CLI and <Badge text="@openquok/auto-cli" variant="experimental" />.

<Callout type="note" title="Agent social vs brand channels">
<p><strong>Cue agent social</strong> is for posts among your Cue’s contacts on Cue OS — see <DocsExternalLink href="https://docs.cueos.ai/features/identity-social/social-graph">agent social</DocsExternalLink>. <strong>OpenQuok</strong> schedules the TikTok, Instagram, X, YouTube, and other accounts you connect in your workspace through <strong>official platform APIs</strong>. OpenQuok is <a href="/self-hosting">open source</a> — you can verify the integration paths. That path follows platform terms and reduces ban risk compared with password logins or browser automation.</p>
</Callout>

<Callout type="tip" title="Reach on TikTok and short-form video">
<p>After you publish through official APIs, quality and account health still affect views. See <a href="/blog/why-my-tiktok-videos-have-low-views-and-what-to-fix-first">why TikTok views stay low and what to fix first</a> for a practical checklist.</p>
</Callout>

<p class="not-prose flex justify-center">
  <img src="/docs/_assets/getting-started-for-cli/oauth-mobile-login.webp" alt="OAuth mobile login" />
</p>

## Installation

<Steps
	howToName="Connect OpenQuok to Cue"
	howToDescription="Pair an agent computer, install openquok-core with Cue CLI, and authenticate the OpenQuok CLI."
>

### Pair an agent computer

<p>Open <strong>Agent info → Computer</strong> in Cue OS. Choose a cloud computer or <strong>Your computer</strong>, then follow <DocsExternalLink href="https://docs.cueos.ai/cue-cli/setup">Connect an agent to your own computer</DocsExternalLink>. Keep Cue CLI running while the agent needs that machine.</p>

```bash
curl -fsSL https://cueos.ai/install.sh | bash
cue login
cue agent create <agent-name> --pair <one-time-code>
```

### Add the openquok-core skill

<p>Skills live on the agent computer. Fetch <Badge text="SKILL.md" variant="path" /> and install the folder:</p>

<Tabs items={["Local folder", "Publish (optional)", "CLI only"]}>
<TabItem label="Local folder">

```bash
mkdir -p ~/openquok-core
curl -fsSL "https://raw.githubusercontent.com/Ratimon/openquok-monorepo/main/agent/skills/openquok-core/SKILL.md" \
  -o ~/openquok-core/SKILL.md
cue skill install ./openquok-core
cue skill doctor openquok-core
```

<p>Read the skill before you run it: <Badge text="cue skill read openquok-core" variant="default" />.</p>

</TabItem>
<TabItem label="Publish (optional)">

```bash
cue skill create ./openquok-core
# cue skill upload <skill-id> ./openquok-core.tar.gz
# cue skill publish <skill-id>
```

<p>Publishing makes the skill visible on the Cue OS catalog. Installing does not publish automatically.</p>

</TabItem>
<TabItem label="CLI only">

<p>When your Cue already has shell access, install the global CLI and follow <Badge text="SKILL.md" variant="path" /> manually:</p>

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

</TabItem>
</Tabs>

### Connect social channels in OpenQuok

<p><a href="/sign-up">Sign up</a> for OpenQuok, open a workspace, and use <strong>Connect channel</strong> for each network you want the Cue to schedule — see the <a href="/docs/channels/connect">connect channels guide</a>. Do not use Cue agent social commands for brand publishing.</p>

### Install and authenticate the OpenQuok CLI

<p>On the same agent computer:</p>

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

Production auth uses the API at <Badge text="https://cli-auth.openquok.com" variant="new" /> and opens the browser on <Badge text="https://www.openquok.com/cli/device/verify" variant="new" />.

<Callout type="warning" title="CLI version update">
<p>Installing a skill does <strong>not</strong> upgrade <Badge text="openquok --version" variant="default"/>. Run <Badge text="npm install -g @openquok/auto-cli@latest" variant="default"/> when you need a newer CLI.</p>
</Callout>

### Authenticate

**Recommended:** ask your Cue to log in to OpenQuok. It runs device OAuth; open the link on your phone, sign in if needed, and tap <strong>Authorize</strong>.

**Alternative for headless or scripted runs:** rotate a programmatic token from the <a href="https://www.openquok.com">OpenQuok dashboard</a> (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />):

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

Credentials are stored on the agent computer — not in the chat transcript.

### Confirm the agent can run commands

After auth, ask your Cue:

```bash
openquok integrations:list
```

</Steps>

## Verify in chat

Ask your Cue something like:

> List my connected OpenQuok channels and draft a TikTok post for tomorrow at 10am. Use official scheduling only — do not post to Cue agent social.

Then confirm the draft appears on your OpenQuok calendar or kanban before you move it to scheduled.

## Related

<CardGrid>
<LinkCard title="Introduction to OpenQuok CLI" description="Quick start and command overview" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI authentication" description="OAuth device flow and programmatic tokens" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="Managing posts" description="CLI commands for drafts, review, and schedule" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Cue integration" description="Landing page for Cue + OpenQuok" href="/agents/cue" />
<LinkCard title="Manus agent guide" description="Studio Skills path when you also use Manus" href="/docs/agent-setup-guides/manus" />
<LinkCard title="MCP setup guides" description="Optional MCP path when you also use an IDE client" href="/docs/mcp-setup-guides" />
</CardGrid>
---
title: OpenClaw
description: Install the openquok-core skill and Openquok CLI on an OpenClaw host (eg. Telegram).
order: 0
lastUpdated: 2026-05-16
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>


## Prerequisites

- **Node.js 20.19+** (or 22.12+, or 23+) inside the container or host where OpenClaw runs bash.
- Shell access in the workspace directory.
- For OAuth device login: a user who can open a link on phone or desktop when authenticating (use <Badge text="auth:login --json" variant="default" />).

## Installation

<Steps>

### Open the OpenClaw workspace

Skills installed with <strong>project</strong> scope are written relative to the current directory. On typical OpenClaw Docker setups, that is the mounted workspace:

```bash
cd /data/workspace
```

If your deployment uses a different mount path, use the directory where OpenClaw stores project files and where you want <Badge text=".agents/skills/" variant="path" /> to live.

### Install the openquok-core skill

The skill file lives at <Badge text="agent/skills/openquok-core/SKILL.md" variant="path" /> in the monorepo. The <code>npx skills add</code> source must be the <strong>agent</strong> package root (<Badge text=".../tree/main/agent" variant="path" />), not <Badge text=".../agent/skills" variant="path" />.

<Callout type="warning">
<p>Paste the command below as a <strong>single line</strong> (do not press Enter after <code>npx skills add</code>).</p>
<pre class="my-3 max-w-full rounded-lg bg-base-200/80 p-3 text-sm break-all whitespace-pre-wrap"><code>npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-core -y</code></pre>
<p><code>-y</code> skips install prompts on headless hosts (Railway shell, OpenClaw container). Without <code>-y</code>, choose <strong>Project</strong> scope and <strong>Symlink</strong> when asked.</p>
</Callout>

You should see <Badge text="./.agents/skills/openquok-core" variant="path" /> in the install summary.

### Install or upgrade the global CLI

In the <strong>same</strong> environment (same container shell the agent uses):

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

Production auth uses the API at <Badge text="https://cli-auth.openquok.com" variant="new" /> and opens the browser on <Badge text="https://www.openquok.com/cli/device/verify" variant="new" /> — older CLIs rejected that split and failed with a <em>verification_uri … expected cli-auth.openquok.com</em> error.

<Callout type="warning" title="CLI version update">
<p>Running <code>npx skills add</code> or restarting the OpenClaw gateway does <strong>not</strong> change <code>openquok --version</code>. If you still see <strong>0.0.4</strong> (or anything below <strong>0.0.6</strong>), run <code>npm install -g @openquok/auto-cli@latest</code> in the <strong>same</strong> environment where the agent executes shell commands.</p>
</Callout>

### Authenticate

**Recommended for OpenClaw / Telegram (no browser on the host):** rotate a programmatic token from the <a href="https://www.openquok.com">Openquok dashboard</a> (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />):

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

**OAuth device flow** (user completes a browser step on another device):

```bash
openquok auth:login --json
```

Use only <Badge text="verification_uri_complete" variant="param" /> from the JSON output — never invent a code or URL. The user opens the prefilled link, signs in if needed, and approves the app; the CLI polls until credentials are stored in <Badge text="~/.openquok/credentials.json" variant="path" />.

Do <strong>not</strong> use bare <Badge text="auth:login" variant="default" /> without <Badge text="--json" variant="param" /> on headless agents; it targets an interactive terminal with optional browser open on the agent machine.

### Confirm the agent can run commands

From the workspace (after auth):

```bash
openquok integrations:list
```

</Steps>

## Host OpenClaw on Railway

You can run the OpenClaw Gateway on <DocsExternalLink href="https://docs.openclaw.ai/install/railway">Railway</DocsExternalLink> with a one-click template — no server terminal required for the gateway itself. After deploy, use Railway’s shell (or the Control UI at <Badge text="/openclaw" variant="path" /> on your service URL) to run the install steps below.

Typical Railway settings from the <DocsExternalLink href="https://docs.openclaw.ai/install/railway">Railway install guide</DocsExternalLink>:

- Attach a <strong>volume</strong> at <Badge text="/data" variant="path" /> (persists config and workspace across redeploys).
- Set <Badge text="OPENCLAW_WORKSPACE_DIR=/data/workspace" variant="envRuntime" /> so the project workspace matches the path used in this guide.
- Enable <strong>HTTP Proxy</strong> on port <Badge text="8080" variant="param" /> and set <Badge text="OPENCLAW_GATEWAY_PORT=8080" variant="envRuntime" /> (see OpenClaw docs for <Badge text="OPENCLAW_GATEWAY_TOKEN" variant="envRuntime" /> and other variables).

Then open a shell in the Railway service, <code>cd /data/workspace</code>, and continue with <strong>Installation</strong>.

## OpenClaw + Telegram notes

- Start a **new chat session** after installing the skill or upgrading the CLI so the agent reloads instructions and checks <Badge text="openquok --version" variant="default" /> once at session start (per the skill).
- If the agent reports an old CLI version after you upgraded, run <code>command -v openquok</code> and <code>which -a openquok</code> — another binary may be earlier on <Badge text="PATH" variant="param" />.
- For posting with images in chat, the user must provide a file on the host or a direct <code>https://</code> image URL for <Badge text="upload-from-url" variant="default" />; ask before calling <Badge text="posts:create" variant="default" /> with media.

## Troubleshooting

<Callout type="danger" title="Verification Url Mismatch">
<p>If <Badge text="auth:login --json" variant="default" /> fails because <Badge text="verification_uri" variant="param" /> is on <Badge text="www.openquok.com" variant="new" /> but the CLI expected <Badge text="cli-auth.openquok.com" variant="new" />, upgrade the global package (<code>npm install -g @openquok/auto-cli@latest</code>). That check was fixed in <strong>0.0.6+</strong>.</p>
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
<LinkCard title="CLI Examples" description="Threads and Instagram recipes" href="/docs/cli-examples" />
</CardGrid>

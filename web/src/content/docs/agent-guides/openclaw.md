---
title: OpenClaw
description: Install the openquok-core skill and Openquok CLI on an OpenClaw host (eg. Telegram).
order: 0
lastUpdated: 2026-06-24
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>


## Prerequisites

- **Node.js 20.19+** (or 22.12+, or 23+) inside the container or host where OpenClaw runs bash.
- Shell access in the workspace directory.
- For OAuth device login: you can authorize the sign-in link on your phone when the agent asks you to log in.

<p class="not-prose flex justify-center">
  <img src="/docs/getting-started-for-cli/oauth-mobile-login.webp" alt="OAuth mobile login" />
</p>

## Installation

<Steps>

### Open the OpenClaw workspace

Skills installed with <strong>project</strong> scope are written relative to the current directory. On typical OpenClaw Docker setups, that is the mounted workspace:

```bash
cd /data/workspace
```

If your deployment uses a different mount path, use the directory where OpenClaw stores project files and where you want <Badge text=".agents/skills/" variant="path" /> to live.

### Install the openquok-core skill

The skill file lives at <Badge text="agent/skills/openquok-core/SKILL.md" variant="path" /> in the monorepo. Choose one install path from your OpenClaw workspace (e.g. <Badge text="cd /data/workspace" variant="default" /> on Docker/Railway):

<Tabs items={["npx", "ClawHub"]}>
<TabItem label="npx">

<p>Install directly from GitHub. The <Badge text="npx skills add" variant="default" /> source must be the <strong>agent</strong> package root (<Badge text=".../tree/main/agent" variant="path" />), not <Badge text=".../agent/skills" variant="path" />.</p>

<Callout type="warning">
<p>Paste the command below:</p>

<pre class="my-3 max-w-full rounded-lg bg-base-200/80 p-3 text-sm break-all whitespace-pre-wrap"><code>npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent --skill openquok-core -y</code></pre>
<p><code>-y</code> skips install prompts on headless hosts (Railway shell, OpenClaw container). Without <code>-y</code>, choose <strong>Project</strong> scope and <strong>Symlink</strong> when asked.</p>
</Callout>

</TabItem>
<TabItem label="ClawHub">

<p>Install from the public registry after the skill is published on <DocsExternalLink href="https://clawhub.ai">ClawHub</DocsExternalLink>. Requires the <DocsExternalLink href="https://docs.openclaw.ai/clawhub/cli">clawhub CLI</DocsExternalLink> (<Badge text="npm i -g clawhub" variant="default" />).</p>

```bash
clawhub install openquok-core
```

<p>Equivalent: <Badge text="openclaw skills install openquok-core" variant="default" />. Update later with <Badge text="clawhub update openquok-core" variant="default" />.</p>

</TabItem>
</Tabs>

You should see <Badge text="./.agents/skills/openquok-core" variant="path" /> (npx) or <Badge text="./skills/openquok-core" variant="path" /> (ClawHub).

### Install or upgrade the global CLI

In the <strong>same</strong> environment (same container shell the agent uses):

```bash
npm install -g @openquok/auto-cli@latest
openquok --version
```

Production auth uses the API at <Badge text="https://cli-auth.openquok.com" variant="new" /> and opens the browser on <Badge text="https://www.openquok.com/cli/device/verify" variant="new" />.

<Callout type="warning" title="CLI version update">
<p>Installing a skill or restarting OpenClaw does <strong>not</strong> change <Badge text="openquok --version" variant="default"/>. You need to update it yourself by running <Badge text="npm install -g @openquok/auto-cli@latest" variant="default"/> </p>
</Callout>

### Authenticate

**Recommended:** ask the agent in chat to log in to Openquok. It sends you a sign-in link; open it on your phone, sign in if needed, and tap <strong>Authorize</strong>.

**Alternative for fully headless hosts:** rotate a programmatic token from the <a href="https://www.openquok.com">Openquok dashboard</a> (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" />):

```bash
export OPENQUOK_API_KEY=opo_your_programmatic_token
openquok auth:status
```

### Confirm the agent can run commands

From the workspace (after auth):

```bash
openquok integrations:list
```

</Steps>

## Host OpenClaw on Railway

You can run the OpenClaw Gateway on <DocsExternalLink href="https://docs.openclaw.ai/install/railway">Railway</DocsExternalLink> with a one-click template.

After deploy, use Railway’s shell (or the Control UI at <Badge text="/openclaw" variant="path" />) to run the install steps below.

Typical Railway settings from the <DocsExternalLink href="https://docs.openclaw.ai/install/railway">Railway install guide</DocsExternalLink>:

- Attach a <strong>volume</strong> at <Badge text="/data" variant="path" /> (persists config and workspace across redeploys).
- Set <Badge text="OPENCLAW_WORKSPACE_DIR=/data/workspace" variant="envRuntime" /> so the project workspace matches the path used in this guide.
- Enable <strong>HTTP Proxy</strong> on port <Badge text="8080" variant="param" /> and set <Badge text="OPENCLAW_GATEWAY_PORT=8080" variant="envRuntime" /> (see OpenClaw docs for <Badge text="OPENCLAW_GATEWAY_TOKEN" variant="envRuntime" /> and other variables).

Then open a shell in the Railway service, <code>cd /data/workspace</code>, and continue with <strong>Installation</strong>.

## OpenClaw + Telegram notes

- Start a **new chat session** after installing the skill or upgrading the CLI so the agent reloads instructions and checks <Badge text="openquok --version" variant="default" /> once at session start.
- If the agent reports an old CLI version after you upgraded, run <Badge text="command -v openquok" variant="default" /> and <Badge text="which -a openquok" variant="default" /> — another binary may be earlier on <Badge text="PATH" variant="param" />.
- For posting with images in chat, the user must provide a file  or a direct <code>https://</code> image URL for <Badge text="upload-from-url" variant="default" />; ask before calling <Badge text="posts:create" variant="default" /> with media.

## Real World Use case: Chat model vs image generation

OpenClaw uses <strong>two separate systems</strong>:

| Role | Configured via | Example |
| --- | --- | --- |
| Main chat (Telegram, Control UI, scheduling) | <Badge text="agents.defaults.model.primary" variant="param" /> in gateway config (<Badge text="openclaw.json" variant="path" />) or <Badge text="/model" variant="default" /> in chat | <Badge text="anthropic/claude-sonnet-4-6" variant="default" /> |
| Image generation (on demand) | <Badge text="agents.defaults.imageGenerationModel" variant="param" /> plus provider API keys | <Badge text="openai/gpt-image-2" variant="default" /> via the <Badge text="image_generate" variant="default" /> tool |

Do <strong>not</strong> set an image-only model (for example <Badge text="google/gemini-3-pro-image-preview" variant="default" /> or <Badge text="openrouter/google/gemini-3-pro-image-preview" variant="default" />) as your main Telegram or session model. Those models are built for image output, not general chat — the gateway may fail before it can run tools or answer questions.

<Callout type="warning" title="Capable chat + quality images">
<p>Pick a capable chat model for <Badge text="agents.defaults.model.primary" variant="param" /> (for example <Badge text="anthropic/claude-sonnet-4-6" variant="default" />). Configure image generation separately under <Badge text="imageGenerationModel" variant="param" /> — the agent calls <Badge text="image_generate" variant="default" /> when the user asks for a picture, without changing the main model. Image jobs run in the background; OpenClaw wakes the agent when the provider finishes.</p>
</Callout>

### Set the main chat model

Fastest path on a fresh host:

```bash
openclaw onboard
```

Or reconfigure models only:

```bash
openclaw configure --section model
```

Pick a <strong>chat</strong> model such as <Badge text="anthropic/claude-sonnet-4-6" variant="default" />. You can also set the default from the shell:

```bash
openclaw models set anthropic/claude-sonnet-4-6
openclaw models status
```

OpenClaw writes the result to gateway config (typically <Badge text="openclaw.json" variant="path" /> under your OpenClaw data directory):

```json5
{
  agents: {
    defaults: {
      model: { primary: "anthropic/claude-sonnet-4-6" },
    },
  },
}
```

In an existing Telegram or Control UI session, switch with <Badge text="/model anthropic/claude-sonnet-4-6" variant="default" /> or <Badge text="/model" variant="default" /> for the numbered picker. Use <Badge text="/model default" variant="default" /> to return to the configured primary.

See <DocsExternalLink href="https://docs.openclaw.ai/concepts/models">Models</DocsExternalLink> for fallbacks, allowlists, and provider auth.

### Configure image generation

Image generation is <strong>not</strong> part of the OpenQuok skill. Set it up once on the OpenClaw gateway host:

1. Add an API key for at least one image provider — for example <Badge text="OPENAI_API_KEY" variant="envBackend" />, <Badge text="GEMINI_API_KEY" variant="envBackend" />, <Badge text="FAL_KEY" variant="envBackend" />, or <Badge text="OPENROUTER_API_KEY" variant="envBackend" /> (OpenAI Codex OAuth also works for <Badge text="openai/gpt-image-2" variant="default" />).
2. Optionally set a default image model so <Badge text="image_generate" variant="default" /> does not rely on auto-detection alone.

```bash
openclaw config set agents.defaults.imageGenerationModel '{"primary":"openai/gpt-image-2","timeoutMs":180000}' --strict-json --merge
```

Example gateway config with fallbacks:

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: {
        primary: "openai/gpt-image-2",
        timeoutMs: 180_000,
        fallbacks: [
          "openrouter/google/gemini-3.1-flash-image-preview",
          "google/gemini-3.1-flash-image-preview",
          "fal/fal-ai/flux/dev",
        ],
      },
    },
  },
}
```

Common routes (see the <DocsExternalLink href="https://docs.openclaw.ai/tools/image-generation">OpenClaw image generation</DocsExternalLink> guide for the full provider table):

| Goal | Model ref | Auth |
| --- | --- | --- |
| OpenAI image generation | <Badge text="openai/gpt-image-2" variant="default" /> | <Badge text="OPENAI_API_KEY" variant="envBackend" /> or OpenAI Codex OAuth |
| Google Gemini images | <Badge text="google/gemini-3.1-flash-image-preview" variant="default" /> | <Badge text="GEMINI_API_KEY" variant="envBackend" /> |
| fal (Flux, Krea, Nano Banana) | <Badge text="fal/fal-ai/flux/dev" variant="default" /> | <Badge text="FAL_KEY" variant="envBackend" /> |
| OpenRouter image models | <Badge text="openrouter/google/gemini-3.1-flash-image-preview" variant="default" /> | <Badge text="OPENROUTER_API_KEY" variant="envBackend" /> |

The <Badge text="image_generate" variant="default" /> tool appears only when at least one image provider is available. Inspect registered providers at runtime with <Badge text="/tool image_generate action=list" variant="default" />.

Then ask in Telegram or the Control UI:

> Generate a square image of a product hero shot on a clean white background

OpenClaw routes that to <Badge text="image_generate" variant="default" /> using <Badge text="imageGenerationModel.primary" variant="param" /> (or the next fallback) — your main chat model stays on Sonnet.

Full model list, editing, aspect ratios, and provider deep dives: <DocsExternalLink href="https://docs.openclaw.ai/tools/image-generation">OpenClaw image generation</DocsExternalLink>.

## Troubleshooting

<Callout type="note" title="Invalid or expired code">
<p>The user must open the exact <Badge text="verification_uri_complete" variant="param" /> link from <Badge text="auth:login --json" variant="default" /> while the CLI is still polling. Codes expire in about 15 minutes. Pre-login at openquok.com alone does not validate the device code.</p>
</Callout>

<Callout type="warning">
<p>If Telegram chat fails while the Control UI works, the gateway may be on an image-only model (for example <Badge text="google/gemini-3-pro-image-preview" variant="default" />). Run <Badge text="openclaw models set anthropic/claude-sonnet-4-6" variant="default" /> or <Badge text="/model" variant="default" /> in chat and pick a chat model. Use <Badge text="imageGenerationModel" variant="param" /> for pictures — see <a href="#real-world-use-case-chat-model-vs-image-generation">Chat model vs image generation</a> above.</p>
</Callout>

## Skill source on GitHub

<DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-core/SKILL.md">agent/skills/openquok-core/SKILL.md</DocsExternalLink> — authoritative instructions the skill installer copies.

## Related Section(s)

<CardGrid>
<LinkCard title="Introduction to Openquok CLI" description="General install and quick start" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI authentication" description="OAuth device flow, programmatic token (opo_), and self-hosted auth server" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="Hermes agent guide" description="Install openquok-core for Hermes" href="/docs/agent-guides/hermes" />
<LinkCard title="CLI Examples" description="Threads and Instagram recipes" href="/docs/cli-examples" />
</CardGrid>

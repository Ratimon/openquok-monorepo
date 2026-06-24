---
title: Hermes Agent
description: Install the openquok-core skill and Openquok CLI on a Hermes Agent host (Telegram, Discord, Slack, and more).
order: 1
lastUpdated: 2026-06-23
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

<p>Or run <Badge text="hermes model" variant="default" /> to pick Anthropic, OpenRouter, OpenAI, Gemini, or a custom endpoint. See the <DocsExternalLink href="https://hermes-agent.nousresearch.com/docs/getting-started/quickstart">Hermes quickstart</DocsExternalLink> for provider tables and troubleshooting.</p>

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

<p>Run this in the <strong>Hermes terminal</strong> — the same environment Hermes uses for shell tools.</p>

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

**Recommended (Telegram / messaging):** device OAuth in **two CLI steps** — Hermes stops the shell after the first JSON from <Badge text="auth:login --json" variant="default" />, so credentials are never stored unless you use <Badge text="--no-poll" variant="param" /> and a follow-up poll:

```bash
openquok auth:login --json --no-poll
# open verification_uri_complete on your phone → Authorize → tell the agent you're done
openquok auth:login:poll --device-code "<device_code from stdout>"
openquok auth:status
```

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

- Start a **new chat session** after installing the skill or upgrading the CLI so Hermes reloads skills and checks <Badge text="openquok --version" variant="default" /> once at session start.
- If the agent reports an old CLI version after you upgraded, run <Badge text="command -v openquok" variant="default" /> and <Badge text="which -a openquok" variant="default" /> — another binary may be earlier on <Badge text="PATH" variant="param" />.
- Hermes separates secrets (<Badge text="~/.hermes/.env" variant="path" />) from config (<Badge text="~/.hermes/config.yaml" variant="path" />). export <Badge text="OPENQUOK_API_KEY" variant="envBackend" /> in your shell profile before starting <Badge text="hermes gateway" variant="default" />.
- On Telegram, use <Badge text="auth:login --json --no-poll" variant="default" /> then <Badge text="auth:login:poll" variant="default" /> after you authorize on your phone — not <Badge text="auth:login --json" variant="default" /> alone.
- For posting with images in chat, the user must provide a file  or an image URL for <Badge text="upload-from-url" variant="default" />.

## Real World Use case: Chat model vs image generation

Hermes uses <strong>two separate systems</strong>:

| Role | Configured via | Example |
| --- | --- | --- |
| Main chat (Telegram, CLI, scheduling) | <Badge text="hermes model" variant="default" /> → <Badge text="model.default" variant="param" /> in <Badge text="~/.hermes/config.yaml" variant="path" /> | <Badge text="claude-sonnet-4-6" variant="default" /> |
| Image generation (on demand) | <Badge text="hermes tools" variant="default" /> → <Badge text="image_gen" variant="param" /> in <Badge text="config.yaml" variant="path" /> | <Badge text="fal-ai/nano-banana-pro" variant="default" /> via the <Badge text="image_generate" variant="default" /> tool |

Do <strong>not</strong> set an image-only model (for example <Badge text="gemini-3-pro-image" variant="default" />) as your main Telegram model. Those models are not general chat backends — Hermes will fail with <strong>Provider authentication failed</strong> before it can run tools or answer questions.

<Callout type="warning" title="Capable chat + quality images">
<p>Pick a capable chat model for <Badge text="model.default" variant="param" /> (for example <Badge text="claude-sonnet-4-6" variant="default" /> on provider <Badge text="anthropic" variant="default" />). Configure image generation separately under <Badge text="image_gen" variant="param" /> — the agent calls <Badge text="image_generate" variant="default" /> when the user asks for a picture, without changing the main model.</p>
</Callout>

### Set the main chat model

```bash
hermes model
```

Pick <strong>Anthropic</strong> and a <strong>chat</strong> model such as <Badge text="claude-sonnet-4-6" variant="default" />. The terminal handles credentials for you:

- <strong>OAuth</strong> — Claude Max plan with extra usage credits (Hermes routes as Claude Code; see the <DocsExternalLink href="https://hermes-agent.nousresearch.com/docs/integrations/providers">AI Providers</DocsExternalLink> guide).
- <strong>API key</strong> — paste your key when prompted. You can also run <Badge text="hermes auth add anthropic --type api-key" variant="default" /> or <Badge text="hermes config set ANTHROPIC_API_KEY sk-ant-..." variant="default" /> (saved to <Badge text="~/.hermes/.env" variant="path" />).
- <strong>Claude Code</strong> — if you already use Claude Code on the host, Hermes can auto-detect those credentials.

Hermes writes the result to <Badge text="~/.hermes/config.yaml" variant="path" />:

```yaml
model:
  provider: anthropic
  default: claude-sonnet-4-6
```

If you use <Badge text="hermes setup --portal" variant="default" /> (Nous Portal) or OpenRouter instead, pick <Badge text="anthropic/claude-sonnet-4.6" variant="default" /> with <Badge text="provider: nous" variant="param" /> or <Badge text="provider: openrouter" variant="param" /> — no separate Anthropic API key needed on Portal.

In an existing session you can switch with <Badge text="/model claude-sonnet-4-6" variant="default" /> (native Anthropic) or <Badge text="/model anthropic/claude-sonnet-4.6" variant="default" /> (aggregator).

See <DocsExternalLink href="https://hermes-agent.nousresearch.com/docs/user-guide/configuring-models">Configuring models</DocsExternalLink> and <DocsExternalLink href="https://hermes-agent.nousresearch.com/docs/integrations/providers">AI Providers</DocsExternalLink> for provider tables and auxiliary overrides.

### Configure image generation

Image generation is <strong>not</strong> part of the OpenQuok skill. Set it up once:

```bash
hermes tools
```

Open <strong>Image Generation</strong>, choose a backend:

- <strong>Nous Subscription</strong> — if you use <Badge text="hermes setup --portal" variant="default" /> (no separate FAL key).
- <strong>FAL.ai</strong> — add <Badge text="FAL_KEY" variant="envBackend" /> to <Badge text="~/.hermes/.env" variant="path" /> (get a key at <DocsExternalLink href="https://fal.ai">fal.ai</DocsExternalLink>).

Pick your image model. For Gemini-class quality and text in images, a common choice is <Badge text="fal-ai/nano-banana-pro" variant="default" />. For speed and low cost, the default <Badge text="fal-ai/flux-2/klein/9b" variant="default" /> is fine.

Hermes saves the selection to <Badge text="config.yaml" variant="path" />:

```yaml
image_gen:
  model: fal-ai/nano-banana-pro
  use_gateway: false
```

Set <Badge text="use_gateway: true" variant="param" /> when using Nous Subscription instead of a direct FAL key.

Then ask in Telegram or the CLI:

```text
Generate a square image of a product hero shot on a clean white background
```

Hermes routes that to <Badge text="image_generate" variant="default" /> using the configured <Badge text="image_gen.model" variant="param" /> — your main chat model stays on Sonnet.

Full model list, aspect ratios, and editing: <DocsExternalLink href="https://hermes-agent.nousresearch.com/docs/user-guide/features/image-generation">Hermes image generation</DocsExternalLink>.

### Auxiliary models (optional)

Hermes can route side tasks (vision analysis, session titles, context compression) to a different model than main chat. Run <Badge text="hermes model" variant="default" /> → <strong>Configure auxiliary models</strong>, or edit the <Badge text="auxiliary:" variant="param" /> block in <Badge text="config.yaml" variant="path" />.

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

<Callout type="warning">
<p>If Telegram shows <strong>Provider authentication failed</strong> while CLI chat works, the gateway is usually on a model your provider does not expose for chat (for example <Badge text="gemini-3-pro-image" variant="default" />). Run <Badge text="hermes model" variant="default" /> and set a chat model such as <Badge text="claude-sonnet-4-6" variant="default" />. Use <Badge text="hermes tools" variant="default" /> → Image Generation for pictures — see <a href="#chat-model-vs-image-generation">Chat model vs image generation</a> above.</p>
</Callout>

## Skill source on GitHub

<DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/agent/skills/openquok-core/SKILL.md">agent/skills/openquok-core/SKILL.md</DocsExternalLink> — authoritative instructions the skill installer copies.

## Related Section(s)

<CardGrid>
<LinkCard title="Introduction to Openquok CLI" description="General install and quick start" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI authentication" description="OAuth device flow, programmatic token, and self-hosted auth server" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="OpenClaw agent guide" description="Install openquok-core for OpenClaw " href="/docs/agent-guides/openclaw" />
<LinkCard title="CLI Examples" description="Threads and Instagram recipes" href="/docs/cli-examples" />
</CardGrid>

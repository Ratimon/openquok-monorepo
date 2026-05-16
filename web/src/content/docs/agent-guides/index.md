---
title: Overview Agents
description: Platform-specific setup for running the Openquok CLI and openquok-core skill with AI agent hosts (OpenClaw, Telegram, and similar).
order: 0
lastUpdated: 2026-05-16
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

Guides for wiring <Badge text="@openquok/auto-cli" variant="experimental" /> into **agent runtimes** — not generic shell usage on your laptop. Each page covers where to install the skill, where the <Badge text="openquok" variant="default" /> binary must live, and auth patterns that work when the agent has no browser.

<Callout type="note" title="CLI docs vs agent guides">
<p>Install the CLI, OAuth device flow, and command reference live under <a href="/docs/getting-started-for-cli">Getting started for CLI</a>. Use this section when the agent runs inside <strong>Docker</strong>, <strong>OpenClaw</strong>, or another host where <code>npx skills add</code> and <code>openquok</code> share the same environment.</p>
</Callout>

<CardGrid>
<LinkCard title="OpenClaw" description="Install openquok-core under /data/workspace, upgrade the global CLI, and authenticate from Telegram or chat" href="/docs/agent-guides/openclaw" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Introduction to Openquok CLI" description="npm install, quick start, and overview" href="/docs/getting-started-for-cli" />
<LinkCard title="CLI authentication" description="OAuth device flow, API keys, and auth server URLs" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="CLI Usage" description="Command-by-command reference" href="/docs/cli-usages" />
</CardGrid>

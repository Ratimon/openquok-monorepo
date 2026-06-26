---
title: Agents Overview
description: Platform-specific setup for running the Openquok CLI and openquok-core skill with AI agent hosts (OpenClaw, Hermes Agent, Telegram, and similar).
order: 0
lastUpdated: 2026-05-16
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

Guides for wiring <Badge text="@openquok/auto-cli" variant="experimental" /> into **agent runtimes** — not generic shell usage on your laptop. Each page covers where to install the skill, where the <Badge text="openquok" variant="default" /> binary must live, and auth patterns that work when the agent has no browser.

For **native MCP clients** (Cursor, Claude Code, Codex, VS Code Copilot), you can skip the CLI skill and connect directly to OpenQuok HTTP streaming with your programmatic <Badge text="opo_" variant="default" /> token. See <a href="/docs/getting-started-for-mcp">MCP introduction</a>.

<CardGrid>
<LinkCard title="OpenClaw" description="Set up Openquok on an OpenClaw host and sign in from Telegram or chat" href="/docs/agent-guides/openclaw" />
<LinkCard title="Hermes Agent" description="Set up Openquok on Hermes Agent and sign in from Telegram, Discord, or Slack" href="/docs/agent-guides/hermes" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Introduction to Openquok CLI" description="Quick start, and overview" href="/docs/getting-started-for-cli" />
<LinkCard title="MCP" description="Connect Cursor, Claude Code, and Codex without the CLI skill" href="/docs/getting-started-for-mcp" />
<LinkCard title="CLI authentication" description="OAuth device flow, programmatic tokens, and auth server URLs" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="CLI Usage" description="Command-by-command reference" href="/docs/cli-usages" />
</CardGrid>

---
title: Overview - Setup Guides for different agents
description: Platform-specific setup for running the OpenQuok CLI and openquok-core skill with AI agent hosts (OpenClaw, Hermes Agent, Grok Bot, and ThinkRail).
order: 0
lastUpdated: 2026-09-21
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

The guide is for wiring <Badge text="@openquok/auto-cli" variant="experimental" /> into **agent runtimes**.

Each page covers where to install the skill, where the <Badge text="openquok" variant="default" /> must live, and auth patterns that work when the agent has no browser/desktop.

For **native MCP clients** (Cursor, Claude Code, Codex, VS Code Copilot), you can skip the CLI skill and connect directly to OpenQuok HTTP streaming with your programmatic <Badge text="opo_" variant="default" /> token. See <a href="/docs/getting-started-for-mcp">MCP introduction</a>.

<CardGrid>
<LinkCard title="OpenClaw" description="OpenClaw is a personal AI assistant you run on your own devices. Message it from Telegram, WhatsApp, or Slack." href="/docs/agent-setup-guides/openclaw" />
<LinkCard title="Hermes Agent" description="Hermes Agent runs on a laptop, a VPS, or serverless infrastructure. Talk to it from Telegram." href="/docs/agent-setup-guides/hermes" />
<LinkCard title="Grok Bot" description="Grok Bot teammates run on a persistent cloud computer. Message them from macOS, Windows, or iOS." href="/docs/agent-setup-guides/grok-bot" />
<LinkCard title="ThinkRail" description="ThinkRail is a worktree IDE. Install openquok-core as a pi skill. Schedule posts. You approve on OpenQuok." href="/docs/agent-setup-guides/thinkrail" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Introduction to OpenQuok CLI" description="Quick start, and overview" href="/docs/getting-started-for-cli" />
<LinkCard title="Other skills" description="Sibling skills (e.g. TikTok slideshow) that require openquok-core" href="/docs/other-skills" />
<LinkCard title="MCP setup guides" description="Step-by-step Cursor, Claude Code, Codex, and other client guides" href="/docs/mcp-setup-guides" />
<LinkCard title="MCP" description="Connect Cursor, Claude Code, and Codex without the CLI skill" href="/docs/getting-started-for-mcp" />
<LinkCard title="CLI authentication" description="OAuth device flow, programmatic tokens, and auth server URLs" href="/docs/getting-started-for-cli/authentication" />
<LinkCard title="CLI Usage" description="Command-by-command reference" href="/docs/cli-usages" />
</CardGrid>

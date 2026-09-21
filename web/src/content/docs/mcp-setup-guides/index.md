---
title: Overview - Setup Guides for different MCPs
description: Platform-specific setup for connecting OpenQuok MCP to Cursor, Claude Code, ChatGPT, Codex, VS Code Copilot, and other native MCP clients.
order: 0
lastUpdated: 2026-09-21
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is in this section

The guide is for OpenQuok into **native MCP clients** — the editors and terminals where you already chat with an AI agent.

Each page covers where to paste the config, which auth method to use, and how to confirm the connection.

For a quick copy-paste snippet, start at <a href="/docs/getting-started-for-mcp/setup">MCP client setup</a> in the dashboard (<Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" /> → <strong>MCP client configuration</strong>).

For **agent hosts** that run the CLI skill (OpenClaw, Hermes Agent, Grok Bot, ThinkRail), see <a href="/docs/agent-setup-guides">Agent setup guides</a> instead.

<CardGrid>
<LinkCard title="Antigravity CLI" description="Add OpenQuok in ~/.gemini/config/mcp_config.json for agy." href="/docs/mcp-setup-guides/antigravity-cli" />
<LinkCard title="ChatGPT" description="Add OpenQuok as a custom connector. Paste the MCP URL with your token." href="/docs/mcp-setup-guides/chatgpt" />
<LinkCard title="Codex" description="Add OpenQuok MCP servers in Codex config.toml." href="/docs/mcp-setup-guides/codex" />
<LinkCard title="Cursor" description="Add OpenQuok in .cursor/mcp.json. Use Agent and Composer." href="/docs/mcp-setup-guides/cursor" />
<LinkCard title="Claude Code" description="Add OpenQuok with claude mcp add over HTTP." href="/docs/mcp-setup-guides/claude-code" />
<LinkCard title="Claude Cowork" description="Add OpenQuok with custom connectors or managedMcpServers." href="/docs/mcp-setup-guides/claude-cowork" />
<LinkCard title="VS Code / Copilot" description="Add OpenQuok in .vscode/mcp.json for GitHub Copilot." href="/docs/mcp-setup-guides/vscode-copilot" />
<LinkCard title="Devin Desktop" description="Add OpenQuok in ~/.codeium/mcp_config.json for Devin Local." href="/docs/mcp-setup-guides/devin-desktop" />
<LinkCard title="Amp" description="Add OpenQuok with amp mcp add or Amp settings.json." href="/docs/mcp-setup-guides/amp" />
<LinkCard title="Warp" description="Warp is an AI-native terminal with built-in MCP. Ship code, debug deploys, and schedule social from one window." href="/docs/mcp-setup-guides/warp" />
<LinkCard title="Muse Code" description="Add OpenQuok in ~/.config/muse/settings.json with streamable HTTP MCP." href="/docs/mcp-setup-guides/muse-code" />
</CardGrid>

<Callout type="note" title="Server name">
<p>Every JSON config uses <Badge text="openquok" variant="default" /> as the MCP server key. Keep that name when merging with existing servers.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="MCP introduction" description="Endpoints, authentication, and v1 tool list" href="/docs/getting-started-for-mcp" />
<LinkCard title="MCP client setup" description="Dashboard snippet generator and auth methods" href="/docs/getting-started-for-mcp/setup" />
<LinkCard title="MCP examples" description="Agent workflows for scheduling posts by platform" href="/docs/mcp-examples" />
<LinkCard title="Tools reference" description="schedulePostTool input shape and provider settings" href="/docs/mcp-references/tools" />
</CardGrid>

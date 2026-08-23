---
title: Introduction
description: What OpenQuok is — a social scheduler with human review — and how to choose Cloud, self-hosting, or building on the API, CLI, and MCP.
order: 0
lastUpdated: 2026-08-23
sidebar:
  label: Overview
---

<script>
import { CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

OpenQuok is a social scheduler for teams that want **human approval** before content goes live. Connect channels to a workspace, compose or import drafts, pick a time, and track every post on the **calendar** and **kanban** from draft through published.

You can schedule by hand in the app, reuse templates and playbooks, or pipe drafts in from agents through the CLI, MCP, or public API. Everything still lands in the same review queue.

## Pick your path

The docs are split by how you run OpenQuok. Start with the path that matches you.

<CardGrid>
<LinkCard title="Quickstart" description="Connect a channel, compose a post, and confirm it on the calendar and kanban. Applies to everyone." href="/docs/getting-started/quickstart" />
<LinkCard title="Cloud" description="Plans, limits, 7-day trial, and Stripe billing for the hosted product" href="/docs/cloud" />
<LinkCard title="Self-hosting" description="Install it yourself, configure providers, and run it in production" href="/docs/installation" />
</CardGrid>

## Building on OpenQuok

<CardGrid>
<LinkCard title="Public API" description="Schedule posts, manage channels, and pull analytics over HTTP" href="/docs/getting-started-for-public-api" />
<LinkCard title="CLI and MCP" description="Drive OpenQuok from the terminal, or connect an AI agent through MCP" href="/docs/getting-started-for-cli" />
<LinkCard title="Contributing" description="Work on OpenQuok itself, or add a new social provider" href="/docs/developer-guidelines" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Quickstart" description="First channel and first scheduled post" href="/docs/getting-started/quickstart" />
<LinkCard title="Concepts" description="Workspace, channel, post group, calendar vs kanban" href="/docs/getting-started/concepts" />
<LinkCard title="Where things live" description="Sidebar, composer, settings, and marketing surfaces" href="/docs/getting-started/where-things-live" />
</CardGrid>

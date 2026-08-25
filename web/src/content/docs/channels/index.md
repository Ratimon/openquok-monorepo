---
title: Overview
description: What channels are in OpenQuok — one connected social account per channel, and where to connect, group, and maintain them.
order: 0
lastUpdated: 2026-08-24
sidebar:
  label: Overview
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is a channel?

A **channel** is one connected social account — one X profile, one LinkedIn Page, one Threads account, and so on. You connect channels inside a **workspace**. Everything you schedule, review on the calendar, or see on Home kanban hangs off those connections.

Connecting the same network twice (for example two different Instagram accounts) creates two separate channels.

<Callout type="note" title="Channel vs integration">
<p>The app says <strong>channel</strong>. The public API and CLI say <strong>integration</strong>. They mean the same thing — the UUID of a connected account.</p>
</Callout>

## Where channels show up

After you connect, the channel appears on <a href="/account">Home</a> with its avatar. You can also pick channels at the top of the post editor when you compose.

OpenQuok supports Meta Threads, Instagram (Business and Standalone), Facebook Page, YouTube, TikTok, LinkedIn profile and Page, X, and Dev.to. The public <a href="/channels">channel catalog</a> lists each network with setup links.

## In this section

<CardGrid>
<LinkCard title="Connect a channel" description="Add Channel, sign-in flows, API keys, and invite links for clients" href="/docs/channels/connect" />
<LinkCard title="Manage a channel" description="Reconnect, disable, or disconnect a connected account" href="/docs/channels/manage" />
<LinkCard title="Posting time slots" description="Set usual posting hours per channel and how suggestions use them" href="/docs/channels/time-slots" />
<LinkCard title="Channel groups" description="Bundle channels by client or brand and filter Home and the calendar" href="/docs/channels/channel-groups" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Quickstart" description="First channel and first scheduled post in five steps" href="/docs/getting-started/quickstart" />
<LinkCard title="Glossary" description="Workspace, channel groups, and calendar vs kanban" href="/docs/getting-started/glossary" />
<LinkCard title="Tour the app" description="Where Add Channel lives on Home and in the composer" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Social integrations" description="Operator setup for self-hosted installs — OAuth apps and env keys" href="/docs/social-integration" />
</CardGrid>

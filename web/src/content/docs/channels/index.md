---
title: Overview - Channels
description: Social posting channels and directory launch platforms in OpenQuok — connect accounts, schedule posts, or autofill directory submits from your business profile.
order: 0
lastUpdated: 2026-10-17
sidebar:
  label: Overview
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is a channel?

> One connected social account per channel — the foundation for scheduling, groups, and analytics.

A **channel** is one connected social account — one X profile, one LinkedIn Page, one Threads account, and so on. You connect channels inside a **workspace**. Everything you schedule, review on the calendar, or see on <strong>My Dashboard</strong> kanban hangs off those connections.

![Connected Channels](/docs/_assets/getting-started/2-add-channel.webp)

Connecting the same network twice (for example two different Instagram accounts) creates two separate channels.

<Callout type="note" title="Channel vs integration">
<p>The app says <strong>channel</strong>. The public API and CLI say <strong>integration</strong>. They mean the same thing — the UUID of a connected account.</p>
</Callout>

## Social channels vs directory launch

OpenQuok supports two families:

| Family | How you connect | What OpenQuok does |
| --- | --- | --- |
| **Social** | OAuth, API key, or extension session (for example Skool) | Schedule and publish posts from the composer, calendar, and agents |
| **Directory** | No OAuth to the directory site | Store a product profile on <a href="/account/products">My Products</a>, autofill directory forms with the <a href="/docs/installation/chrome-extension">browser extension</a>, and track submissions — **you** click submit on the directory |

Social channels use the guides in this section (connect, manage, time slots). Directory launches use <a href="/docs/directory-submission">Directory submission</a> and per-site notes under <a href="/docs/directory-integration">Directory integration</a>. The public <a href="/channels">Channels hub</a> lists both **Social media platforms** and **Directory launch platforms** (for example PeerPush and Uneed).

## Where channels show up

After you connect, the channel appears on <a href="/account">My Dashboard</a> with its avatar. You can also pick channels at the top of the post editor when you compose.

OpenQuok supports Meta Threads, Instagram (Business and Standalone), Facebook Page, YouTube, TikTok, LinkedIn profile and Page, X, Dev.to, and Bluesky. The public <a href="/channels">channel catalog</a> lists each network with setup links.

## In this section

### Social posting

<CardGrid>
<LinkCard title="Connect a channel" description="Add Channel, sign-in flows, API keys, and invite links for clients" href="/docs/channels/connect" />
<LinkCard title="Manage social and directory channels" description="Social actions on My Dashboard and directory launches on My Products" href="/docs/channels/manage" />
<LinkCard title="Posting time slots" description="Set usual posting hours per channel and how suggestions use them" href="/docs/channels/time-slots" />
<LinkCard title="Business profiles" description="Bundle channels by client or brand and filter My Dashboard and the calendar" href="/docs/channels/channel-groups" />
</CardGrid>

### Directory launch

<CardGrid>
<LinkCard title="Directory submission" description="My Products workflow — profile, extension autofill, mark submitted" href="/docs/directory-submission" />
<LinkCard title="Track submissions" description="Readiness, listing URL, and completion status" href="/docs/directory-submission/track-submissions" />
<LinkCard title="Directory integration" description="How directory destinations differ from OAuth social channels" href="/docs/directory-integration" />
<LinkCard title="PeerPush" description="Standard launch and free queue variants" href="/docs/directory-integration/peerpush" />
<LinkCard title="Uneed" description="Join the line, paid launch, and maker profile" href="/docs/directory-integration/uneed" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Creating posts" description="Post editor, channels, media, and scheduling" href="/docs/creating-posts" />
<LinkCard title="Quickstart" description="First channel and first scheduled post in five steps" href="/docs/getting-started/quickstart" />
<LinkCard title="Glossary" description="Workspace, business profiles, and calendar vs kanban" href="/docs/getting-started/glossary" />
<LinkCard title="Tour the app" description="Where Add Channel lives on My Dashboard and in the composer" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Social integrations" description="Operator setup for self-hosted installs — OAuth apps and env keys" href="/docs/social-integration" />
</CardGrid>

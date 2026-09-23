---
title: A post failed to publish
description: Red calendar ring, tooltips, reconnecting channels, and platform rules when OpenQuok cannot publish.
order: 4
lastUpdated: 2026-09-23
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## A post failed to publish

> A failed publish keeps the post on the calendar with a red ring. Hover the chip to read the error.

Full UI detail is in <a href="/docs/posts-management/actions-and-stats#failed-posts">Posts management → Actions and stats</a>. This page lists the usual causes in order.

## 1. Channel needs reconnecting

Access tokens expire. On Home, a channel with <Badge text="Refresh needed" variant="param" /> cannot publish until you click <Badge text="Refresh connection" variant="default" />.

See <a href="/docs/channels/manage">Manage a channel</a>.

## 2. Post broke an OpenQuok or platform rule

Examples: too many images, video where the network wanted photos only, caption over the character limit, or missing required settings (TikTok privacy, YouTube title, and similar).

- Open the post with <Badge text="Edit" variant="default" /> from **Post actions**.
- Compare your attachments and text with <a href="/docs/platforms">Platforms</a> and <a href="/docs/platforms/media-rules">Media rules</a>.

## 3. Network rejected the content

Duplicate text, blocked links, account restrictions, or policy strikes often come straight from the provider. The tooltip usually shows the network’s own message — quote that text when you ask for help.

## What to do next

1. Read the tooltip or open **Edit** for the full error.
2. Reconnect the channel if auth expired.
3. Fix copy or media, then schedule again.

<Callout type="tip">
<p>Agents and scripts can use <Badge text="posts:status" variant="default" /> and <Badge text="posts:reschedule" variant="default" /> after you fix the underlying issue — <a href="/docs/cli-usages/managing-posts">Managing posts (CLI)</a>.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Actions and stats" description="Post actions modal, delete scope, and Statistics" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Calendar" description="How post chips show draft, scheduled, and failed rows" href="/docs/posts-management/calendar" />
<LinkCard title="Troubleshooting overview" description="Connect, uploads, and login" href="/docs/troubleshooting" />
</CardGrid>

---
title: Workspace analytics
description: Account-level performance in the Analytics sidebar — targeted channels, window periods, trends plus per-channel metric cards.
order: 1
lastUpdated: 2026-09-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Workspace analytics

> How your connected channels performed over the last 7, 30, or 90 days.

**Where:** Choose <Badge text="Analytics" variant="default" /> in the account sidebar.

You see account-level numbers for channels that send stats back to OpenQuok. Each one appears as a chip under **Targeted channels**.

![Targeted Channels and Overview Analytics Panel](/docs/_assets/insights/targeted-chips-overview.webp)

<Callout type="warning">
<p>OpenQuok can only show what each network returns for your account. Names and fields differ by platform.</p>
</Callout>

Which channels qualify, and which date ranges each one allows (<Badge text="7" 
variant="param" />, <Badge text="30" 
variant="param" />, and <Badge text="90" 
variant="param" />) , are listed in <a href="/docs/platforms/analytics">Platforms → Analytics</a>.

## Targeted channels and date range

| Control | What it does |
| --- | --- |
| **Targeted channels** | Pick which connected channels to include. Use the platform filter to narrow the list. |
| **Date range** (e.g. <Badge text="7 Days" variant="param" />, <Badge text="30 Days" variant="param" />, sometimes <Badge text="90 Days" variant="param" />) | How far back the numbers go. The menu only shows ranges that work for <strong>every</strong> chip you selected. Changing the range reloads the page. |

<Callout type="note">
<p>Instagram, Threads, and TikTok do not offer 90 days of account stats. If you include any of them, you only see <Badge text="7 Days" variant="param" /> and <Badge text="30 Days" variant="param" />. <Badge text="90 Days" variant="param" /> appears when every selected channel supports it — for example Facebook Page, YouTube, or X on their own. See <a href="/docs/platforms/analytics#date-range-windows">Platforms → Analytics → Date range windows</a>.</p>
</Callout>

## Overview

Under the filters, the **Overview** block matches the app: **Trends** on top, then **metric cards** for each channel.

![Overview and Metrics Cards ](/docs/_assets/insights/overview-metric-cards.webp)

## Trends

**Trends** lines up channels side by side. Each network uses its own metric names, while OpenQuok groups the closest match under **Views**, **Engagement**, or **Followers**.

<Callout type="warning">
<p>Each headline total adds <strong>one stat per channel</strong>.Because different networks use different metric names, the total is for a quick glance only. Platforms do not agree on the same official stat.</p>
</Callout>

<Callout type="note">
<p>For example, under <strong>Views</strong>, OpenQuok might add Instagram <strong>Reach</strong>, Facebook <strong>Content views</strong>, and TikTok <strong>Views</strong>. One headline, three different definitions.</p>
</Callout>

| Piece | What it shows |
| --- | --- |
| **Summary row** | Three totals — **Views**, **Engagement**, **Followers** — and how many channels fed each total. You may see **mixed labels** when names differ across networks. |
| **Tabs** | Switch the chart between **Views**, **Engagement**, and **Followers**. |
| **Line chart** | One line per channel. The legend shows each network’s real label (for example **Reach** on Instagram). |

<Callout type="tip">
<p>Use <strong>Trends</strong> to compare channels at a glance. Open the <strong>metric cards</strong> below when you need the exact name and total for one channel.</p>
</Callout>

## Channel metric cards

Below **Trends**, each card is one stat for one channel.

<Callout type="warning">
<p>Cards stay separate per channel. Instagram <strong>Comments</strong> and LinkedIn <strong>Comments</strong> never merge into one card.</p>
</Callout>

![Series of Metrics Cards ](/docs/_assets/insights/metric-cards.webp)

When you target several channels, cards sit under a **channel header** (picture and name). A small row under each title shows the platform and channel.

Each card shows a mini chart over time, the **total** for your date range, and how that total compares to the previous period of the same length.

While numbers load, you see **Loading analytics…**. If the request fails, the error appears in red.

## Typical metrics by network

Titles on the cards come from the network. Platforms change these lists over time. The table is a guide, not a full catalog.

| Network | Typical account-level metrics |
| --- | --- |
| **Facebook Page** | Page impressions, post engagement, followers, media views |
| **Instagram** (Business or Standalone) | Followers, reach, likes, views, comments, shares, saves |
| **LinkedIn Page** | Page views, clicks, shares, engagement, comments, organic and paid followers |
| **TikTok** | Followers, video count, views, likes, comments, shares |
| **YouTube** | Watch time, average view duration, subscribers gained and lost, likes |
| **Threads** | Views, likes, replies, reposts, quotes |
| **X** | Impressions, likes, quotes, replies, reposts, bookmarks |
| **Dev.to** | Page views, reactions, comments |

## When charts are empty

| Situation | What to try |
| --- | --- |
| No supported channels connected | Connect a channel from <a href="/docs/platforms/analytics">Platforms → Analytics</a>, or use **Go to the calendar to add channels** on the empty screen. |
| Filter hides every channel | Clear the platform filter or connect a channel that matches. |
| **This channel needs to be refreshed** | Click **Refresh channel** and sign in again. Old tokens often break stats before posting stops. |
| **No analytics available for the selected channels** | The network returned nothing for this range. Try fewer days, wait if the channel is new, or check that your account type supports stats. |
| Self-hosted **X** | Your operator may have turned off X stats — see <a href="/docs/social-integration/x">Social integrations → X</a>. |

## Platform analytics over the API

Programmatic channel-level access uses the same windows as the dashboard:

- <a href="/docs/apis-analytics">Analytics APIs</a> — integration endpoint with <Badge text="date" variant="param" /> <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, or <Badge text="90" variant="param" />
- <a href="/docs/cli-usages/analytics">CLI</a> — <Badge text="analytics:platform" variant="default" />
- MCP — <Badge text="analyticsPlatform" variant="default" /> (see <a href="/docs/mcp-references/tools">MCP tools</a>)

Results are cached per organization, integration, and window on the backend to reduce provider rate limits.

Per-post metrics are documented in <a href="/docs/insights/per-post-metrics">Per-post metrics</a>.

## Related

<CardGrid>
<LinkCard title="Per-post metrics" description="Statistics on published posts from Home and the calendar" href="/docs/insights/per-post-metrics" />
<LinkCard title="Platforms → Analytics" description="Account vs per-post coverage by channel key" href="/docs/platforms/analytics" />
<LinkCard title="Connect rules" description="Full channel catalog and OAuth setup" href="/docs/platforms/connect-rules" />
</CardGrid>

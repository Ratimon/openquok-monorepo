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

> Account-level performance for connected channels that expose insights through their figures.

**Where:** Choose <Badge text="Analytics" variant="default" /> in the account sidebar.

The page shows account-level performance for connected channels that send insights through their APIs. Each qualifying connection appears as a chip under **Targeted channels**.

![Targeted Channels and Overview Analytics Panel](/docs/_assets/insights/targeted-chips-overview.webp)

<Callout type="warning">
<p>Not all platforms are supported. Metric names and availability only come from each supported platform’s API for your connected accounts.</p>
</Callout>

Which channels report account-level insights, and how <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, and <Badge text="90" variant="param" /> day windows apply per connection are in <a href="/docs/platforms/analytics">Platforms → Analytics</a>.

## Targeted channels and date range

| Control | What it does |
| --- | --- |
| **Targeted channels** | Chips for each connected channel whose provider supports analytics. Use the platform filter to narrow down. |
| **Date range** (e.g. <Badge text="7 Days" variant="param" />, <Badge text="30 Days" variant="param" />, sometimes <Badge text="90 Days" variant="param" />) | Lookback for every series on the page. The menu lists only windows **every** targeted channel supports. Changing the range reloads all targeted channels. |

<Callout type="note">
<p>Instagram, Threads, and TikTok do not support a 90-day account window. If <strong>any</strong> targeted chip is one of those networks, the menu offers <Badge text="7 Days" variant="param" /> and <Badge text="30 Days" variant="param" /> only. <Badge text="90 Days" variant="param" /> shows up when <strong>every</strong> targeted channel allows 90 days — for example you target only Facebook Page, YouTube, or X. See <a href="/docs/platforms/analytics#date-range-windows">Platforms → Analytics → Date range windows</a>.</p>
</Callout>

## Overview Panel

Below the filters, the **Overview** heading matches the app. It contains **Trends** first, then **metric cards** for each targeted channel.

![Overview and Metrics Cards ](/docs/_assets/insights/overview-metric-cards.webp)

## Trends

**Trends** compares channels using each network’s closest matching metric.

<Callout type="warning">
<p>Each headline total adds <strong>one number per channel</strong>. Networks use different metric names, so the total is a rough sum for comparison. It is not a single official stat every platform agrees on.</p>
</Callout>

<Callout type="note">
<p>For example, the <strong>Views</strong> headline might add Instagram <strong>Reach</strong>, Facebook <strong>Content views</strong>, and TikTok <strong>Views</strong>. You get one combined figure to scan quickly, but each network still counts views its own way.</p>
</Callout>


| Piece | What it shows |
| --- | --- |
| **Summary row** | Three totals — **Views**, **Engagement**, and **Followers** — with a channel count. Labels may show **mixed labels** when networks use different names for the same family. |
| **Metric tabs** | **Views**, **Engagement**, or **Followers** picks which family the line chart plots. |
| **Line chart** | One line per targeted channel. The legend lists the real API label per line (for example **Reach** on Instagram, **Content views** on Facebook). |

<Callout type="tip">
Use <strong>Trends</strong> for a quick cross-channel read. For each network’s exact label and total, use the metric cards below.
</Callout>


## Channel metric cards

Under **Trends**, the grid shows one **metric card** per API series **per targeted channel**.


<Callout type="warning">
<p>OpenQuok does not merge cards across channels, even when two networks share a name (for example **Comments** on Instagram and LinkedIn Page stay separate).</p>
</Callout>

![Series of Metrics Cards ](/docs/_assets/insights/metric-cards.webp)

With more than one channel targeted, cards group under a <strong>channel header</strong> (avatar and name). Each card has a <strong>source row</strong> under the title — platform icon, network name, and channel name.

Each card includes a **sparkline**, a **total** for the selected window, and a **trend** vs the previous period of the same length (percentage, or percentage points for average series).


## Typical metrics by network

Card titles mirror what each provider returns. The set can change when a platform updates its API. The table below is indicative, not exhaustive.

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
| No analytics-capable channels connected | Connect a channel listed under account insights in <a href="/docs/platforms/analytics">Platforms → Analytics</a>, or use **Go to the calendar to add channels** on the empty state. |
| Filter excludes every channel | Reset the platform filter or add a matching connection. |
| **This channel needs to be refreshed** | Re-authorize the channel (**Refresh channel**) — expired tokens often break analytics before posting stops. |
| **No analytics available for the selected channels** | The APIs returned no series for this window. Try a shorter range, wait if the connection is new, or confirm the account type supports insights. |
| Self-hosted **X** | Operators can turn off X insights with <Badge text="DISABLE_X_ANALYTICS" variant="envBackend" /> — see <a href="/docs/social-integration/x">Social integrations → X</a>. |

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

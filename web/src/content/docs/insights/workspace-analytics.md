---
title: Workspace analytics
description: Account-level performance in the Analytics sidebar — targeted channels, 7/30/90 day windows, Trends chart and summary row, per-channel overview cards with platform attribution, and empty states.
order: 1
lastUpdated: 2026-09-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Workspace analytics

> Account-level performance for connected channels that expose insights through their APIs.

**Where:** Choose <Badge text="Analytics" variant="default" /> in the account sidebar.

The page loads metrics for every **analytics-capable** channel in your workspace that matches the current platform filter. Channels without a backend insights implementation never appear under **Targeted channels**, even if you can publish to them from the composer. Which networks qualify is in <a href="/docs/platforms/analytics">Platforms → Analytics</a>.

<Callout type="warning">
<p>Metric names and availability come from each platform’s API for your account type. OpenQuok cannot show fields the network does not return for that connection.</p>
</Callout>

## Targeted channels and date range

| Control | What it does |
| --- | --- |
| **Targeted channels** | Chips for each connected channel whose provider supports account analytics. Use the platform filter to narrow the list. |
| **Date range** (e.g. **7 Days**, **30 Days**, sometimes **90 Days**) | Lookback for every series on the page. The menu lists only windows **every** targeted channel supports — **Threads-only** (or Instagram / TikTok / personal LinkedIn) shows **7** and **30** only; **90 Days** appears when no targeted network caps below 90 (see the table in <a href="/docs/platforms/analytics#date-range-windows">Platforms → Analytics → Date range windows</a>). Changing the range reloads all targeted channels. |

The **Overview** grid shows one card per metric **per targeted channel**. OpenQuok does not add up or merge series across channels, even when two networks use the same label (for example **Comments** on Instagram and LinkedIn Page each get their own card).

When you target more than one channel, cards are **grouped under a header** for that connection (avatar, channel name, and platform). Each card also shows a compact **source row** under the metric title — platform icon, network name, and truncated channel name — so you can scan the grid without matching chips mentally.

## Trends chart and summary row

Above the card grid, **Trends** adds a cross-channel view built only from the daily series already loaded for each targeted channel:

| Piece | What it shows |
| --- | --- |
| **Summary row** | Three headline totals — **Views**, **Engagement**, and **Followers** — each summing one primary metric per channel (the label that best matches that family on that network). |
| **Metric toggle** | **Views**, **Engagement**, or **Followers** selects which family the line chart plots. |
| **Line chart** | One line per targeted channel, using that channel’s best-matching series for the selected family. |

Networks name metrics differently (for example **Impressions** vs **Reach** vs **Page views**). OpenQuok maps labels into families heuristically; the legend shows which source metric each line uses. Summary totals are **approximate rollups** for quick comparison — per-card metrics below remain authoritative for each connection.

## Reading the overview cards

Each metric appears as a card with:

- A **source row** (platform icon, network label, channel name) tying the series to one connection
- A **sparkline** of daily values across the selected window
- A **total** for the period (formatted per metric)
- A **trend** vs the previous period of the same length — shown as a percentage, or percentage points when the backend marks the series as an average

Similar metric names from different platforms stay **separate** on individual cards. The optional **Trends** summary adds approximate cross-channel totals; use the card grid when you need each network’s exact label and total.

While data loads, the overview shows **Loading analytics…**. A hard failure surfaces the API error message in red.

## Typical metrics by network

Labels on the cards mirror what each provider returns. The set can change when a platform updates its API. The table below is indicative, not exhaustive.

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

<Callout type="note">
<p><strong>LinkedIn Page</strong> analytics require a Company Page you administer. Personal <strong>LinkedIn</strong> profiles do not expose the same insights API — see <a href="/docs/platforms/analytics">Platforms → Analytics</a>.</p>
</Callout>

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

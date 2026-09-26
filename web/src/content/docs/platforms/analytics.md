---
title: Analytics
description: Which OpenQuok channels report account-level and per-post insights in the workspace Analytics area and Statistics modal.
order: 4
lastUpdated: 2026-09-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Analytics by network

> Which connected channels return account-level and per-post metrics — and how to open each view in the app.

OpenQuok pulls **account-level insights** for connected channels in the workspace **Analytics** area. See <a href="/docs/insights/workspace-analytics">Insights → Workspace analytics</a>.

Some networks also expose **per-post metrics** on individual post cards and in the **Statistics** dialog. See <a href="/docs/insights/per-post-metrics">Insights → Per-post metrics</a>.

<Callout type="warning">
<p>Availability depends on what each platform's API returns for the connected account type. OpenQuok cannot show insights when the network does not expose them for that channel.</p>
</Callout>

## Account insights

OpenQuok supports <strong>eleven</strong> channel keys for posting (<a href="/docs/platforms/connect-rules">Connect rules</a>). <strong>Nine</strong> return account-level data in workspace <strong>Analytics</strong>. How the dashboard uses these connections is in <a href="/docs/insights/workspace-analytics">Insights → Workspace analytics</a>.

| Network | Channel key | Account insights |
| --- | --- | --- |
| **Facebook Page** | <Badge text="facebook" variant="param" /> | Yes |
| **Instagram (Business)** | <Badge text="instagram-business" variant="param" /> | Yes |
| **Instagram (Standalone)** | <Badge text="instagram-standalone" variant="param" /> | Yes |
| **LinkedIn Page** | <Badge text="linkedin-page" variant="param" /> | Yes |
| **LinkedIn** (personal profile) | <Badge text="linkedin" variant="param" /> | No |
| **TikTok** | <Badge text="tiktok" variant="param" /> | Yes |
| **YouTube** | <Badge text="youtube" variant="param" /> | Yes |
| **Threads** | <Badge text="threads" variant="param" /> | Yes |
| **X** | <Badge text="x" variant="param" /> | Yes |
| **Dev.to** | <Badge text="devto" variant="param" /> | Yes |
| **Bluesky** | <Badge text="bluesky" variant="param" /> | No |

<Callout type="tip">
<p>For Self-hosting, X charges you for every call you makr for analytics. You can disable X analytics with <Badge text="DISABLE_X_ANALYTICS" variant="envBackend" /> in backend environment. See <a href="/docs/social-integration/x">Social integrations → X</a>.</p>
</Callout>


## Date range windows

The workspace **Analytics** page and per-post **Statistics** dialog use a lookback picker whose options are <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, or <Badge text="90" variant="param" /> days.

| Network | Channel key | 7 days | 30 days | 90 days |
| --- | --- | --- | --- | --- |
| **Facebook Page** | <Badge text="facebook" variant="param" /> | Yes | Yes | Yes |
| **Instagram (Business)** | <Badge text="instagram-business" variant="param" /> | Yes | Yes | No |
| **Instagram (Standalone)** | <Badge text="instagram-standalone" variant="param" /> | Yes | Yes | No |
| **LinkedIn Page** | <Badge text="linkedin-page" variant="param" /> | Yes | Yes | Yes |
| **TikTok** | <Badge text="tiktok" variant="param" /> | Yes | Yes | No |
| **YouTube** | <Badge text="youtube" variant="param" /> | Yes | Yes | Yes |
| **Threads** | <Badge text="threads" variant="param" /> | Yes | Yes | No |
| **X** | <Badge text="x" variant="param" /> | Yes | Yes | Yes |
| **Dev.to** | <Badge text="devto" variant="param" /> | Yes | Yes | Yes |

<Callout type="note">
<p>Instagram, Threads, and TikTok insights APIs do not expose a full 90-day account window. If you mix those channels with networks that support 90 days, the dashboard keeps <Badge text="7" variant="param" /> and <Badge text="30" variant="param" /> only until you narrow <strong>Targeted channels</strong>.</p>
</Callout>

<Callout type="tip">
<p>CLI and public API calls still accept <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, or <Badge text="90" variant="param" /> for any integration; provider APIs may return shorter series when a window is not supported.</p>
</Callout>

## Per-post metrics

OpenQuok supports <strong>eleven</strong> channel keys for posting (<a href="/docs/platforms/connect-rules">Connect rules</a>). <strong>Nine</strong> return per-post data in the <strong>Statistics</strong> dialog. How to open it from Home and the calendar is in <a href="/docs/insights/per-post-metrics">Insights → Per-post metrics</a>.

| Network | Channel key | Per-post insights |
| --- | --- | --- |
| **LinkedIn Page** | <Badge text="linkedin-page" variant="param" /> | Yes |
| **LinkedIn** (personal profile) | <Badge text="linkedin" variant="param" /> | No |
| **Facebook Page** | <Badge text="facebook" variant="param" /> | Yes |
| **Instagram (Business)** | <Badge text="instagram-business" variant="param" /> | Yes |
| **Instagram (Standalone)** | <Badge text="instagram-standalone" variant="param" /> | Yes |
| **TikTok** | <Badge text="tiktok" variant="param" /> | Yes |
| **YouTube** | <Badge text="youtube" variant="param" /> | Yes |
| **Threads** | <Badge text="threads" variant="param" /> | Yes |
| **X** | <Badge text="x" variant="param" /> | Yes |
| **Dev.to** | <Badge text="devto" variant="param" /> | Yes |
| **Bluesky** | <Badge text="bluesky" variant="param" /> | No |

## Related

<CardGrid>
<LinkCard title="Workspace analytics" description="Targeted channels, Overview, Trends, and metric cards" href="/docs/insights/workspace-analytics" />
<LinkCard title="Per-post metrics" description="Statistics from Home and the calendar" href="/docs/insights/per-post-metrics" />
<LinkCard title="Actions and stats" description="Post card actions, failures, and the Statistics entry point" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Connect rules" description="Full channel catalog and connect methods" href="/docs/platforms/connect-rules" />
<LinkCard title="CLI Examples" description="CLI commands for analytics" href="/docs/cli-examples" />
</CardGrid>

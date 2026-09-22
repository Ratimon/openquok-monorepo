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

Self-hosted operators can disable X analytics with <Badge text="DISABLE_X_ANALYTICS" variant="envBackend" /> in backend environment. See <a href="/docs/social-integration/x">Social integrations → X</a>.

## Per-post metrics

Per-post stats follow the same split as account insights. When a row is **Yes**, OpenQuok shows numbers only if the platform API returns data for that post.

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

## Related

<CardGrid>
<LinkCard title="Workspace analytics" description="Targeted channels, date ranges, and overview cards" href="/docs/insights/workspace-analytics" />
<LinkCard title="Per-post metrics" description="Statistics from Home and the calendar" href="/docs/insights/per-post-metrics" />
<LinkCard title="Actions and stats" description="Post card actions, failures, and the Statistics entry point" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Connect rules" description="Full channel catalog and connect methods" href="/docs/platforms/connect-rules" />
<LinkCard title="CLI Examples" description="CLI commands for analytics" href="/docs/cli-examples" />
</CardGrid>

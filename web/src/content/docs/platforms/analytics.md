---
title: Analytics
description: Which OpenQuok channels report account-level and per-post insights in the workspace Analytics area.
order: 4
lastUpdated: 2026-09-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Analytics by network

> Which connected channels return account-level and per-post metrics in your workspace **Analytics** area.

OpenQuok pulls **account-level insights** for connected channels in the workspace **Analytics** area.

Some networks also expose **per-post metrics** on individual post cards and in post statistics.

<Callout type="warning">
Availability depends on what each platform's API returns for the connected account type. OpenQuok cannot show insights when the network does not expose them for that channel.
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

Open a published post from Home or the calendar to view post-level numbers where available. See <a href="/docs/posts-management/actions-and-stats">Actions and stats</a>.

## Related

<CardGrid>
<LinkCard title="Actions and stats" description="Post card actions, failures, and statistics modal" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Connect rules" description="Full channel catalog and connect methods" href="/docs/platforms/connect-rules" />
<LinkCard title="CLI examples" description="openquok analytics:platform and analytics:post" href="/docs/cli-examples" />
</CardGrid>

---
title: Analytics
description: Social channel insights in workspace Analytics and per-post Statistics — plus where directory launch uses Directory analytics.
order: 4
lastUpdated: 2026-10-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Analytics by network

> Social posting metrics in the workspace.

OpenQuok has **two analytics surfaces**:

| Product line | Where you work | What you measure |
| --- | --- | --- |
| **Social posting** | <a href="/account/analytics">Account → Analytics</a> (**Social** tab), post **Statistics** | Followers, impressions, engagement, per-post likes and shares |
| **Directory launch** | Same page (**Directory** tab) and <a href="/account/products">My Products</a> | Domain rating (DR) for your product site, competitors, submission status |

The tables below are **social channel keys** only. PeerPush, Uneed, and other directory destinations do not appear in **Targeted channels** or post **Statistics**.

## Social posting — account insights

OpenQuok supports <strong>eleven</strong> channel keys for posting (<a href="/docs/platforms/connect-rules">Connect rules</a>). <strong>Ten</strong> return account-level data in workspace <strong>Analytics</strong>. How the dashboard uses these connections is in <a href="/docs/insights/workspace-analytics">Insights → Workspace analytics</a>.

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
| **Bluesky** | <Badge text="bluesky" variant="param" /> | Yes |

<Callout type="tip">
<p>For Self-hosting, X charges you for every call you makr for analytics. You can disable X analytics with <Badge text="DISABLE_X_ANALYTICS" variant="envBackend" /> in backend environment. See <a href="/docs/social-integration/x">Social integrations → X</a>.</p>
</Callout>


<Callout type="warning">
<p>Availability depends on what each platform's API returns for the connected account type. OpenQuok cannot show insights when the network does not expose them for that channel.</p>
</Callout>

<h2 id="date-range-windows">Social posting — date range windows</h2>

The workspace **Analytics** page (**Social** tab) and per-post **Statistics** dialog use a lookback picker whose options are <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, or <Badge text="90" variant="param" /> days.

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
| **Bluesky** | <Badge text="bluesky" variant="param" /> | Yes | Yes | Yes |

<Callout type="note">
<p>Instagram, Threads, and TikTok insights APIs do not expose a full 90-day account window. If you mix those channels with networks that support 90 days, the dashboard keeps <Badge text="7" variant="param" /> and <Badge text="30" variant="param" /> only until you narrow <strong>Targeted channels</strong>.</p>
</Callout>

<Callout type="tip">
<p>CLI and public API calls still accept <Badge text="7" variant="param" />, <Badge text="30" variant="param" />, or <Badge text="90" variant="param" /> for any integration; provider APIs may return shorter series when a window is not supported.</p>
</Callout>

## Social posting — per-post metrics

OpenQuok supports <strong>eleven</strong> channel keys for posting (<a href="/docs/platforms/connect-rules">Connect rules</a>). <strong>Ten</strong> return per-post data in the <strong>Statistics</strong> dialog. How to open it from <strong>My Dashboard</strong> and the calendar is in <a href="/docs/insights/per-post-metrics">Insights → Per-post metrics</a>.

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
| **Bluesky** | <Badge text="bluesky" variant="param" /> | Yes |

## Directory launch — analytics

Directory destinations use **Directory analytics**, not social channel keys or post **Statistics**.

| Topic | Where |
| --- | --- |
| **DR and competitors** | <a href="/account/analytics">Account → Analytics</a> → **Directory** tab — see <a href="/docs/directory-submission/directory-analytics">Directory analytics</a> |
| **Listing readiness and submitted URLs** | <a href="/account/products">My Products</a> — see <a href="/docs/directory-submission/track-submissions">Track submissions</a> |
| **API / MCP** | <Badge text="/public/directory-seo/*" variant="path" /> and MCP <Badge text="directorySeo*" variant="default" /> tools (plan-gated) — see <a href="/docs/configuration-backend/directory-seo">Backend → Directory SEO</a> and <a href="/docs/mcp-references/tools#directory-launch">MCP tools reference</a> |

<Callout type="note">
<p>User-facing docs call this tab <strong>Directory analytics</strong>. API paths and MCP tools still use the <Badge text="directorySeo" variant="param" /> name. See <a href="/docs/getting-started/glossary#directory-analytics">Glossary → Directory analytics</a>.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Workspace analytics" description="Targeted channels, Overview, Trends, and metric cards" href="/docs/insights/workspace-analytics" />
<LinkCard title="Per-post metrics" description="Statistics from My Dashboard and the calendar" href="/docs/insights/per-post-metrics" />
<LinkCard title="Actions and stats" description="Post card actions, failures, and the Statistics entry point" href="/docs/posts-management/actions-and-stats" />
<LinkCard title="Connect rules" description="Social channel keys and directory launch platforms" href="/docs/platforms/connect-rules" />
<LinkCard title="Directory analytics" description="DR history and competitors on the Directory tab" href="/docs/directory-submission/directory-analytics" />
<LinkCard title="Track submissions" description="Listing readiness and live URLs on My Products" href="/docs/directory-submission/track-submissions" />
<LinkCard title="Platforms overview" description="Social vs directory rules and identifiers" href="/docs/platforms" />
<LinkCard title="CLI Examples" description="CLI commands for analytics" href="/docs/cli-examples" />
</CardGrid>

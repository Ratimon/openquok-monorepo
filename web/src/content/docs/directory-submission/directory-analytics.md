---
title: Directory analytics
description: Track domain rating for your product website and workspace competitors on paid OpenQuok plans.
order: 3
lastUpdated: 2026-10-19
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Where to find it

Open <a href="/account/analytics">Account → Analytics</a>. Use the <strong>Social</strong> | <strong>Directory</strong> toggle.

Directory analytics applies to **main** business profiles (not per-directory variants). Pick a product profile to see:

- **Domain rating (DR)** for the website on that profile
- **7 / 30 / 90 day** change vs earlier samples
- A **history chart** for the product domain
- **Competitor domains** you add for the workspace, each with current DR

<Callout type="warning">
<p><strong>Free</strong> workspaces do not include Directory analytics or competitor tracking. Upgrade to a paid plan to use this tab.</p>
</Callout>

## Product grid DR vs live DR

| Surface | Source | Purpose |
| --- | --- | --- |
| <a href="/account/products">My Products</a> directory grid — <strong>DR</strong> / <strong>DR updated</strong> | <a href="/build-backlinks">Build Backlinks</a> catalog metrics | Editorial site scores for each directory destination |
| <strong>Directory</strong> analytics tab | Live lookup cached globally | Your product’s real domain and competitors you track |

Catalog DR helps compare directory opportunities. Directory analytics tracks **your** hostname and **your** competitor list over time.

## Competitors

Paid plans include a workspace pool of competitor domains (limits depend on plan tier). Add domains you want to benchmark against your product site.

OpenQuok stores a label and sort order for each competitor. DR refreshes use the same global cache as your main site URL.

## Refresh and accuracy

- Opening the **Directory** tab loads domain rating from the global cache when possible, and fetches from DataForSEO when there is no snapshot yet or the cache is older than about **7 days**.
- **Refresh ratings** forces a new lookup for your product domain and competitors, but only when the cache is stale — at most about **once per week** per product domain (same window as the cache TTL).
- OpenQuok also refreshes stale domains on a schedule (see <a href="/docs/configuration-worker">Configuration - Worker</a>).
- **Link type** (dofollow / nofollow) on My Products comes from catalog and your submission notes — Directory analytics does not verify backlinks on every directory in v1.

Self-hosters: set <Badge text="DATAFORSEO_API_KEY" variant="envBackend" /> and Directory SEO env vars on the API and housekeeping worker. See <a href="/docs/configuration-backend/directory-seo">Directory SEO & DataForSEO</a>.

## Related

<CardGrid>
<LinkCard title="Tailor profiles per directory" description="Variants for site-specific copy before launch" href="/docs/directory-submission/profile-variants" />
<LinkCard title="Domain analytics (product guide)" description="Directory tab for end users — profiles, refresh, and My Products DR vs live DR" href="/docs/insights/domain-analytics" />
<LinkCard title="Workspace analytics (social)" description="Targeted channels and overview metrics for connected networks" href="/docs/insights/workspace-analytics" />
<LinkCard title="Directory SEO & DataForSEO" description="Backend env vars, cache tables, and housekeeping refresh" href="/docs/configuration-backend/directory-seo" />
<LinkCard title="Database & migrations" description="pg_cron vs housekeeping worker for scheduled jobs" href="/docs/configuration-backend/database" />
</CardGrid>

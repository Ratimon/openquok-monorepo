---
title: Domain analytics
description: Track domain rating for your product website and competitors on the Analytics Directory tab.
order: 3
lastUpdated: 2026-10-20
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Domain analytics

> How strong your product website looks next to domains you care about.

**Where:** Open <a href="/account/analytics">Analytics</a> in the account sidebar. Select the <strong>Directory</strong> tab.

<Callout type="warning">
<p><strong>Free</strong> workspaces do not include this tab. Upgrade to a paid plan to use domain analytics.</p>
</Callout>

## Before you start

1. Create a <strong>main</strong> business profile (not a per-directory variant).
2. Add your product <strong>website URL</strong> on that profile.
3. Pick the profile in the <strong>Product profile</strong> menu on the Directory tab.

Without a website URL, OpenQuok cannot look up a domain rating.

## What you see

| Area | Meaning |
| --- | --- |
| **Your domain DR** | A score for your website hostname, with change over **7**, **30**, and **90** days |
| **History** | A line chart for your domain over **7**, **30**, or **90** days |
| **Competitors** | Other domains you add to compare against your site |

Competitor limits depend on your plan (**2** / **3** / **5** / **10** per workspace on Solo / Team / Ultimate / Max). Each competitor shows a label and current DR. Use **Edit** in the competitor list to rename the label (charts and compare pills use the label). See <a href="/docs/cloud/plans">Plans and limits</a> and <a href="/docs/billing/limits">Limits</a>.

## History chart

The first time you open the Directory tab (or switch the history range) after a domain has no imported history, OpenQuok may pull **daily** domain-rating points from DataForSEO so the chart is not a single dot. Those points are stored and reused for about **one week** before a refresh import can run again.

After that, the chart blends:

- **Imported daily series** — past days from the provider backfill.
- **Live samples** — new points when OpenQuok refreshes your snapshot (about weekly via cache, or when you use **Refresh ratings**).

The score uses the same **0–100** scale as the headline DR. Gaps can appear when the provider has no rank for a day.

<Callout type="note">
<p>Paid workspaces need a configured DataForSEO key on the server for live DR and history import. Without it, the page shows cached or empty values only.</p>
</Callout>

## Refresh ratings

OpenQuok caches domain ratings for about **one week**. While the cache is fresh, the page reads stored values.

Use **Refresh ratings** when you want a new lookup. You can force a refresh about **once per week** per product domain. If the button is disabled, hover it to see when the next refresh is allowed.

## Not the same as My Products DR

On <a href="/account/products">My Products</a>, the directory grid shows **DR** for each <em>directory site</em> in the catalog. That helps you pick where to list.

<strong>Directory</strong> analytics tracks <strong>your</strong> website and <strong>your</strong> competitor list over time.

## Related

<CardGrid>
<LinkCard title="Insights overview" description="Social analytics, per-post stats, and how the tabs fit together" href="/docs/insights" />
<LinkCard title="Workspace analytics" description="Connected channel performance on the Social tab" href="/docs/insights/workspace-analytics" />
<LinkCard title="Business profiles" description="Main profiles, website URL, and directory variants" href="/docs/directory-submission/profile-variants" />
<LinkCard title="Limits" description="Directory competitor caps and upgrade paths" href="/docs/billing/limits" />
</CardGrid>

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
| **History** | A chart of recent samples for your domain |
| **Competitors** | Other domains you add to compare against your site |

Competitor limits depend on your plan. Each competitor shows a label and current DR.

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
</CardGrid>

---
title: Directory analytics
description: Track domain rating for your product website and workspace competitors on paid OpenQuok plans.
order: 3
lastUpdated: 2026-11-03
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Where to find it

Open <a href="/account/analytics">Account → Analytics</a>. Use the <strong>Social</strong> | <strong>Directory</strong> toggle.

![OpenQuok Directory Analytics](/docs/_assets/directory-submission/analytics-dashboard.webp)

Directory analytics applies to **main** business profiles (not directory variants). Pick a product profile to see:

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
| <strong>Directory</strong> analytics tab | Saved live DR lookups | Your product’s real domain and competitors you track |

<Callout type="note">
<p>Catalog DR helps compare directory opportunities. Directory analytics tracks <strong>your</strong> hostname and <strong>your</strong> competitor list over time.</p>
</Callout>

## Competitors

<p>Paid plans include a workspace pool of competitor domains — limits depend on plan tier. On <a href="/account/analytics">Account → Analytics</a> → <strong>Directory</strong>, pick a <strong>main</strong> product profile.</p>

<Steps
	howToName="Track competitor domain rating"
	howToDescription="Add competitors on the Directory tab, then compare DR on the bar chart and history chart."
>

### Add a competitor

<p>Scroll to <strong>Competitors</strong>. Enter a <strong>Domain</strong> and optional <strong>Display name</strong>, then click <strong>Add competitor</strong>. The counter (for example <strong>1/3</strong>) shows how many slots you use on this profile.</p>

![Add competitor domain and display name](/docs/_assets/directory-submission/add-competitor.webp)

### Compare ratings

<p>The horizontal bar chart compares <strong>You</strong> and each added competitor. Turn on <strong>Compare</strong> pills above the history chart to plot competitor DR lines next to your site over 7, 30, or 90 days.</p>

![Compare domain rating and history overlay](/docs/_assets/directory-submission/compare-ratings.webp)

### Manage the list

<p>Use <strong>Edit</strong> or <strong>Remove</strong> on each row beside the form. Click <strong>Refresh ratings</strong> at the top of the tab when the page says manual refresh is available.</p>

</Steps>

## Refresh and accuracy

<p>When you open the <strong>Directory</strong> tab, OpenQuok shows the last saved domain rating if it is less than about <strong>7 days</strong> old. If the rating is missing or older, OpenQuok fetches a new score from DataForSEO.</p>

<p><strong>Refresh ratings</strong> requests a new lookup for your product domain and competitors. You can use it about <strong>once per week</strong> per product domain when the page shows that manual refresh is available. OpenQuok also updates old ratings on a background schedule (see <a href="/docs/configuration-worker">Configuration - Worker</a>).</p>

<p><strong>Link type</strong> (dofollow / nofollow) on My Products comes from the catalog and your submission notes. Directory analytics does not check every directory backlink in v1.</p>

<p>Self-hosters: set <Badge text="DATAFORSEO_API_KEY" variant="envBackend" /> and Directory SEO env vars on the API and housekeeping worker. See <a href="/docs/configuration-backend/directory-seo">Directory SEO & DataForSEO</a>.</p>

## Related

<CardGrid>
<LinkCard title="Profile variants per directory" description="Site-specific copies before you launch" href="/docs/directory-submission/profile-variants" />
<LinkCard title="Domain analytics (product guide)" description="Directory tab for end users — profiles, refresh, and My Products DR vs live DR" href="/docs/insights/domain-analytics" />
<LinkCard title="Workspace analytics (social)" description="Targeted channels and overview metrics for connected networks" href="/docs/insights/workspace-analytics" />
<LinkCard title="Directory SEO & DataForSEO" description="Backend env vars, cache tables, and housekeeping refresh" href="/docs/configuration-backend/directory-seo" />
<LinkCard title="Database & migrations" description="pg_cron vs housekeeping worker for scheduled jobs" href="/docs/configuration-backend/database" />
</CardGrid>

---
title: Overview - Directory SEO APIs
description: Put OpenQuok domain rating and competitor benchmarks in your own dashboards, alerts, and client reports. Requires Directory SEO on your plan.
order: 0
lastUpdated: 2026-10-24
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Endpoints

<CardGrid>
<LinkCard title="Workspace overview" description="Snapshot domain rating for product and rivals" href="/docs/apis-directory-seo/workspace-overview" />
<LinkCard title="Workspace history" description="Trend charts over a date range" href="/docs/apis-directory-seo/workspace-history" />
<LinkCard title="Refresh workspace" description="Fresher metrics before a client review" href="/docs/apis-directory-seo/workspace-refresh" />
<LinkCard title="Add competitor" description="Track a rival domain beside a product" href="/docs/apis-directory-seo/competitors-add" />
<LinkCard title="Remove competitor" description="Drop a rival from charts and quota" href="/docs/apis-directory-seo/competitors-delete" />
<LinkCard title="Update competitor" description="Rename a rival in your UI only" href="/docs/apis-directory-seo/competitors-update" />
</CardGrid>

<Callout type="note" title="Cached metrics">
<p>Domain rating values are cached server-side. Read <Badge text="checkedAt" variant="param" /> on each metric row and <Badge text="manualRefreshAvailableAt" variant="param" /> on overview responses before calling refresh again.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="Directory launch APIs" description="Product profiles and listing summary used with directory SEO" href="/docs/apis-directory-launch" />
<LinkCard title="Public API" description="Authentication, base URL, and SDK quick start" href="/docs/getting-started-for-public-api" />
</CardGrid>

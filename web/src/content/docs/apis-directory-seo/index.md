---
title: Overview - Directory SEO APIs
description: 'Programmatic directory SEO: cached domain rating overview (`checkedAt`), history, manual refresh (`manualRefreshAvailableAt`), and competitor CRUD. Requires `directory_seo_enabled`.'
order: 0
lastUpdated: 2026-10-21
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Endpoints

<CardGrid>
<LinkCard title="Workspace overview" description="Product domain DR, competitors, `checkedAt`, and refresh cooldown" href="/docs/apis-directory-seo/workspace-overview" />
<LinkCard title="Workspace history" description="DR time series for product and competitors; `days` query (default 90)" href="/docs/apis-directory-seo/workspace-history" />
<LinkCard title="Refresh workspace" description="POST manual refresh for a `productProfileId`" href="/docs/apis-directory-seo/workspace-refresh" />
<LinkCard title="Add competitor" description="POST a competitor domain to track" href="/docs/apis-directory-seo/competitors-add" />
<LinkCard title="Remove competitor" description="DELETE a tracked competitor domain" href="/docs/apis-directory-seo/competitors-delete" />
<LinkCard title="Update competitor" description="PATCH competitor `label`" href="/docs/apis-directory-seo/competitors-update" />
</CardGrid>

<Callout type="note" title="Cached metrics">
<p>Domain rating values are cached server-side. Read <Badge text="checkedAt" variant="param" /> on each metric row and <Badge text="manualRefreshAvailableAt" variant="param" /> on overview responses before calling refresh again.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="Directory launch APIs" description="Product profiles and listing summary used with directory SEO" href="/docs/apis-directory-launch" />
<LinkCard title="Public API" description="Authentication, base URL, and SDK quick start" href="/docs/getting-started-for-public-api" />
</CardGrid>

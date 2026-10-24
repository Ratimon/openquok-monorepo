---
title: Overview - Directory launch APIs
description: Automate directory launch from your own product — sync listing copy, track progress, and read live URLs without opening My Products. Requires Directory launch on your plan.
order: 0
lastUpdated: 2026-10-24
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Endpoints

<CardGrid>
<LinkCard title="List destinations" description="Build a directory site picker or onboarding checklist" href="/docs/apis-directory-launch/destinations" />
<LinkCard title="List business profiles" description="Scope calls to the right client or brand bucket" href="/docs/apis-directory-launch/business-profiles" />
<LinkCard title="List profiles" description="Sync all products into your CRM or admin" href="/docs/apis-directory-launch/profiles-list" />
<LinkCard title="Get profile" description="Load one product's copy for an editor or handoff" href="/docs/apis-directory-launch/profiles-get" />
<LinkCard title="Create profile" description="Onboard a product from your import pipeline" href="/docs/apis-directory-launch/profiles-create" />
<LinkCard title="Update profile" description="Keep My Products aligned with your CMS" href="/docs/apis-directory-launch/profiles-update" />
<LinkCard title="Ensure variant" description="Per-directory pitch text without duplicating profiles" href="/docs/apis-directory-launch/variants-ensure" />
<LinkCard title="Listing summary" description="Launch progress and readiness per directory site" href="/docs/apis-directory-launch/listing-summary" />
<LinkCard title="List submissions" description="Live listing URLs and status for client reports" href="/docs/apis-directory-launch/submissions-list" />
</CardGrid>

<Callout type="note" title="Plan capability">
<p>Every route requires an organization API key with <Badge text="directory_launch_enabled" variant="param" /> on the subscription. Submission intent, completion, and listing URL writes are session-only in v1 — use the dashboard or browser extension for those steps.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="Directory SEO APIs" description="Domain rating overview, history, refresh, and competitors for the same product profiles" href="/docs/apis-directory-seo" />
<LinkCard title="Public API" description="Authentication, base URL, and SDK quick start" href="/docs/getting-started-for-public-api" />
</CardGrid>

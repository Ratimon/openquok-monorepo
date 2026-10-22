---
title: Overview - Directory launch APIs
description: 'Programmatic directory launch: destinations, product profiles, idempotent variants, listing summary, and read-only submissions. Requires `directory_launch_enabled` on the workspace plan.'
order: 0
lastUpdated: 2026-10-21
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Endpoints

<CardGrid>
<LinkCard title="List destinations" description="Published directory launch catalog (`providerSlug`, `startUrl`, extension fill steps)" href="/docs/apis-directory-launch/destinations" />
<LinkCard title="List business profiles" description="Channel-group ↔ product profile picker rows for the workspace" href="/docs/apis-directory-launch/business-profiles" />
<LinkCard title="List profiles" description="Main and variant product profiles; optional `integrationCustomerId` filter" href="/docs/apis-directory-launch/profiles-list" />
<LinkCard title="Get profile" description="Full profile including `profileData` and `similarityToMainPercent`" href="/docs/apis-directory-launch/profiles-get" />
<LinkCard title="Create profile" description="POST a main product profile (organization inferred from the API key)" href="/docs/apis-directory-launch/profiles-create" />
<LinkCard title="Update profile" description="PATCH main or variant copy and `profileData`" href="/docs/apis-directory-launch/profiles-update" />
<LinkCard title="Ensure variant" description="Idempotent POST variant for a `directorySiteKey` under a main profile" href="/docs/apis-directory-launch/variants-ensure" />
<LinkCard title="Listing summary" description="Per-destination submission status and launch readiness" href="/docs/apis-directory-launch/listing-summary" />
<LinkCard title="List submissions" description="Read-only submission rows; filter by profile and/or destination" href="/docs/apis-directory-launch/submissions-list" />
</CardGrid>

<Callout type="note" title="Plan capability">
<p>Every route requires an organization API key with <Badge text="directory_launch_enabled" variant="param" /> on the subscription. Submission intent, completion, and listing URL writes are session-only in v1 — use the dashboard or browser extension for those steps.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="Directory SEO APIs" description="Domain rating overview, history, refresh, and competitors for the same product profiles" href="/docs/apis-directory-seo" />
<LinkCard title="Public API" description="Authentication, base URL, and SDK quick start" href="/docs/getting-started-for-public-api" />
</CardGrid>

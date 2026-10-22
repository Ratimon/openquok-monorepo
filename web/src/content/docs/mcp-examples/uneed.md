---
title: Uneed
description: OpenQuok MCP examples for Uneed directory launch — profiles, uneed variants, listing readiness, and cached directory SEO.
order: 10
lastUpdated: 2026-10-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Directory launch quick reference

| Property | Value |
| --- | --- |
| Directory site key | <Badge text="uneed" variant="default" /> |
| Submit host | uneed.best (you click submit on Uneed — OpenQuok autofills) |
| Integration docs | <a href="/docs/directory-integration/uneed">Uneed directory integration</a> |
| Tools reference | <a href="/docs/mcp-references/tools#directory-launch">Directory launch tools</a> |

<Callout type="note" title="Not schedulePostTool">
<p>These tools manage <strong>product profiles</strong> and launch readiness. They do not publish to Uneed for you. After <Badge text="directoryVariantsEnsure" variant="default" /> tailors copy, use the browser extension to open uneed.best and submit.</p>
</Callout>

<Callout type="note" title="Plan capabilities">
<p>Directory launch tools need <Badge text="directory_launch_enabled" variant="param" /> on the workspace plan. Directory SEO tools need <Badge text="directory_seo_enabled" variant="param" />.</p>
</Callout>

## List Uneed destinations

> Which Uneed launch paths are in the OpenQuok catalog — join the line, paid launch, maker profile?

The agent calls <Badge text="directoryDestinationsList" variant="default" /> and filters rows where the provider slug is <Badge text="uneed" variant="default" />.

## Main profile and Uneed variant

> Create or open my Uneed-tailored product profile from my main business profile, and tell me how similar it is to the main profile.

Alternate wording (same tool chain):

> List my main product profile, ensure a Uneed variant exists, and tell me how similar the variant is to the main profile.

The agent should:

1. Call <Badge text="directoryProfilesList" variant="default" /> with <Badge text="mainOnly: true" variant="param" /> and read <Badge text="productProfileId" variant="param" /> from the first row.
2. Call <Badge text="directoryVariantsEnsure" variant="default" /> with that id and <Badge text="directorySiteKey: uneed" variant="param" />.

```json
{
  "mainProductProfileId": "<main-product-profile-id>",
  "directorySiteKey": "uneed"
}
```

<Callout type="tip" title="Idempotent variant">
<p><Badge text="directoryVariantsEnsure" variant="default" /> returns the existing variant with <Badge text="created: false" variant="param" /> when one already exists for <Badge text="uneed" variant="default" />.</p>
</Callout>

Use <Badge text="directoryProfilesGet" variant="default" /> on the main or variant id when you need full <Badge text="profileData" variant="param" /> or maker/pricing fields.

## Listing readiness before you open uneed.best

> For my main product profile, show Uneed readiness — submission status and any missing fields.

```json
{
  "productProfileId": "<main-product-profile-id>"
}
```

The agent calls <Badge text="directoryListingSummary" variant="default" /> and reads the <Badge text="uneed" variant="default" /> destination row.

> Update my Uneed variant with this maker bio and pricing copy.

Call <Badge text="directoryProfilesUpdate" variant="default" /> with the variant <Badge text="productProfileId" variant="param" /> and the fields to patch.

Logo and screenshots: <Badge text="logoUrl" variant="param" /> and <Badge text="profileData.gallery_urls" variant="param" /> — same as PeerPush; see <a href="/docs/cli-usages/directory-launch#logo-and-screenshots">Directory launch — logo and screenshots</a> and <a href="/docs/mcp-examples/peerpush#logo-and-screenshots">MCP examples — PeerPush (logo and screenshots)</a>.

## Submissions (read-only)

> List directory submissions recorded for my main product profile.

```json
{
  "productProfileId": "<main-product-profile-id>"
}
```

The agent calls <Badge text="directorySubmissionsList" variant="default" />.

## Directory SEO (cached metrics)

> What are my directory SEO ratings for my main profile, and when were they last checked?

```json
{
  "productProfileId": "<main-product-profile-id>"
}
```

The agent calls <Badge text="directorySeoOverview" variant="default" />. Read <Badge text="checkedAt" variant="param" /> on each metric and <Badge text="manualRefreshAvailableAt" variant="param" /> before <Badge text="directorySeoRefresh" variant="default" />.

> Add competitor domain rival.example to my directory SEO workspace and show history for the last 90 days.

The agent calls <Badge text="directorySeoCompetitorsAdd" variant="default" /> with <Badge text="domain" variant="param" /> and optional <Badge text="label" variant="param" />, then <Badge text="directorySeoHistory" variant="default" /> with <Badge text="days: 90" variant="param" />.

<Callout type="note" title="checkedAt">
<p>Domain rating and competitor metrics are cached. Responses include <Badge text="checkedAt" variant="param" /> and <Badge text="manualRefreshAvailableAt" variant="param" /> after <Badge text="directorySeoRefresh" variant="default" />.</p>
</Callout>

## End-to-end workflow

> Prepare my product for Uneed: ensure the uneed variant, show Uneed readiness on the listing summary, and give me the latest cached domain rating with checkedAt.

The agent chains <Badge text="directoryProfilesList" variant="default" /> → <Badge text="directoryVariantsEnsure" variant="default" /> (<Badge text="uneed" variant="default" />) → <Badge text="directoryListingSummary" variant="default" /> → <Badge text="directorySeoOverview" variant="default" />.

## Related

<CardGrid>
<LinkCard title="Uneed channel" description="Autofill, DR tracking, and launch paths on uneed.best" href="/channels/uneed" />
<LinkCard title="CLI examples — Uneed" description="The same flows with openquok directory:* commands" href="/docs/cli-examples/uneed" />
<LinkCard title="Directory launch CLI" description="Command-by-command directory:* reference" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Tools reference — Directory launch" description="Input tables for directoryProfilesList through directorySubmissionsList" href="/docs/mcp-references/tools#directory-launch" />
<LinkCard title="Tools reference — Directory SEO" description="directorySeoOverview, history, refresh, and competitors" href="/docs/mcp-references/tools#directory-seo" />
<LinkCard title="MCP overview" description="Cross-platform scheduling and directory launch prompts" href="/docs/mcp-examples" />
</CardGrid>

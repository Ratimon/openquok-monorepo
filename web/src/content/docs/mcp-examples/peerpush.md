---
title: PeerPush
description: OpenQuok MCP examples for PeerPush directory launch — profiles, peerpush variants, listing readiness, and cached directory SEO.
order: 9
lastUpdated: 2026-10-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Directory launch quick reference

| Property | Value |
| --- | --- |
| Directory site key | <Badge text="peerpush" variant="default" /> |
| Submit host | peerpush.com (you click submit on PeerPush — OpenQuok autofills) |
| Integration docs | <a href="/docs/directory-integration/peerpush">PeerPush directory integration</a> |
| Tools reference | <a href="/docs/mcp-references/tools#directory-launch">Directory launch tools</a> |

<Callout type="note">
<p>These tools manage <strong>product profiles</strong> and launch readiness. They do not publish to PeerPush for you. After <Badge text="directoryVariantsEnsure" variant="default" /> tailors copy, use the browser extension to open peerpush.com and submit.</p>
</Callout>

<Callout type="note" title="Plan capabilities">
<p>Directory launch tools need <Badge text="directory_launch_enabled" variant="param" /> on the workspace plan. Directory SEO tools need <Badge text="directory_seo_enabled" variant="param" />.</p>
</Callout>

## List PeerPush destinations

> Which PeerPush launch paths are in the OpenQuok catalog right now?

The agent calls <Badge text="directoryDestinationsList" variant="default" /> and filters rows where the provider slug is <Badge text="peerpush" variant="default" /> (Standard launch and free queue variants when published).

## Main profile and PeerPush variant

> Create or open my PeerPush-tailored product profile from my main business profile, and tell me how similar it is to the main profile.

Alternate wording (same tool chain):

> List my main product profile, ensure a PeerPush variant exists, and tell me how similar the variant is to the main profile.

The agent should:

1. Call <Badge text="directoryProfilesList" variant="default" /> with <Badge text="mainOnly: true" variant="param" /> and read <Badge text="productProfileId" variant="param" /> from the first row.
2. Call <Badge text="directoryVariantsEnsure" variant="default" /> with that id and <Badge text="directorySiteKey: peerpush" variant="param" />.

```json
{
  "mainProductProfileId": "<main-product-profile-id>",
  "directorySiteKey": "peerpush"
}
```

<Callout type="tip" title="Idempotent variant">
<p><Badge text="directoryVariantsEnsure" variant="default" /> returns the existing variant with <Badge text="created: false" variant="param" /> when one already exists for <Badge text="peerpush" variant="default" />.</p>
</Callout>

Use <Badge text="directoryProfilesGet" variant="default" /> on the main or variant id when you need full <Badge text="profileData" variant="param" /> or <Badge text="similarityToMainPercent" variant="param" />.

## Listing readiness before you open peerpush.com

> For my main product profile, show PeerPush readiness — submission status and any missing fields.

```json
{
  "productProfileId": "<main-product-profile-id>"
}
```

The agent calls <Badge text="directoryListingSummary" variant="default" /> and reads the <Badge text="peerpush" variant="default" /> destination row (counts, <Badge text="submissionStatus" variant="param" />, readiness gaps).

> Fill in my PeerPush profile tagline and description from this draft copy.

Call <Badge text="directoryProfilesUpdate" variant="default" /> with the variant <Badge text="productProfileId" variant="param" /> from <Badge text="directoryVariantsEnsure" variant="default" /> and the fields to patch (<Badge text="tagline" variant="param" />, <Badge text="description" variant="param" />, or <Badge text="profileData" variant="param" /> keys).

## Logo and screenshots

> Set my PeerPush profile logo and up to three screenshot URLs before I open peerpush.com.

The agent should call <Badge text="directoryProfilesUpdate" variant="default" /> on the main or variant <Badge text="productProfileId" variant="param" /> with <Badge text="logoUrl" variant="param" /> and <Badge text="profileData.gallery_urls" variant="param" /> (max **3** entries). Use public <Badge text="https://" variant="param" /> URLs directories and the extension can fetch.

Optional: <Badge text="uploadFromUrl" variant="default" /> imports a remote image into the **workspace media library** (same idea as CLI <Badge text="upload-from-url" variant="default" />). That does **not** attach the file to the product profile automatically — still patch <Badge text="logoUrl" variant="param" /> / <Badge text="gallery_urls" variant="param" /> with the public URLs you want on the listing. Local files need CLI <Badge text="openquok upload" variant="default" /> when the agent can run shell commands.

<Callout type="note" title="Profile media vs post media">
<p>Uploading logo and screenshots in <a href="/account/products">My Products</a> uses the profile-media flow in the app. MCP and CLI directory tools set URL fields on the profile row instead.</p>
</Callout>

CLI equivalent: <a href="/docs/cli-usages/directory-launch#logo-and-screenshots">Directory launch — logo and screenshots</a>.

## Submissions (read-only)

> List directory submissions recorded for my main product profile.

```json
{
  "productProfileId": "<main-product-profile-id>"
}
```

The agent calls <Badge text="directorySubmissionsList" variant="default" /> (optional <Badge text="destinationId" variant="param" /> filter when you care about one site).

## Directory SEO (cached metrics)

> What are my directory SEO ratings for my main profile, and when were they last checked?

```json
{
  "productProfileId": "<main-product-profile-id>"
}
```

The agent calls <Badge text="directorySeoOverview" variant="default" />. Read <Badge text="checkedAt" variant="param" /> on each metric and <Badge text="manualRefreshAvailableAt" variant="param" /> before <Badge text="directorySeoRefresh" variant="default" />.

> Show domain rating history for the last 90 days for my main product profile.

Call <Badge text="directorySeoHistory" variant="default" /> with <Badge text="productProfileId" variant="param" /> and <Badge text="days: 90" variant="param" />.

## End-to-end workflow

> Prepare my product for PeerPush: ensure the peerpush variant, show PeerPush readiness on the listing summary, and give me the latest cached domain rating with checkedAt.

The agent chains <Badge text="directoryProfilesList" variant="default" /> → <Badge text="directoryVariantsEnsure" variant="default" /> (<Badge text="peerpush" variant="default" />) → <Badge text="directoryListingSummary" variant="default" /> → <Badge text="directorySeoOverview" variant="default" />.

## Related

<CardGrid>
<LinkCard title="PeerPush channel" description="Autofill, DR tracking, and launch paths on peerpush.com" href="/channels/peerpush" />
<LinkCard title="CLI examples — PeerPush" description="The same flows with openquok directory:* commands" href="/docs/cli-examples/peerpush" />
<LinkCard title="Directory launch CLI" description="Command-by-command directory:* reference" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Tools reference — Directory launch" description="Input tables for directoryProfilesList through directorySubmissionsList" href="/docs/mcp-references/tools#directory-launch" />
<LinkCard title="Tools reference — Directory SEO" description="directorySeoOverview, history, refresh, and competitors" href="/docs/mcp-references/tools#directory-seo" />
<LinkCard title="MCP overview" description="Cross-platform scheduling and directory launch prompts" href="/docs/mcp-examples" />
</CardGrid>

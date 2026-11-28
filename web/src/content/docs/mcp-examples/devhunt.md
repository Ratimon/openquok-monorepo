---
title: DevHunt
description: OpenQuok MCP examples for DevHunt directory launch — profiles, devhunt variants, listing readiness, and cached directory SEO.
order: 14
lastUpdated: 2026-11-28
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Directory launch quick reference

| Property | Value |
| --- | --- |
| Directory site key | <Badge text="devhunt" variant="default" /> |
| Submit host | devhunt.org (you click submit on DevHunt — OpenQuok autofills) |
| Integration docs | <a href="/docs/directory-integration/devhunt">DevHunt directory integration</a> |
| Tools reference | <a href="/docs/mcp-references/tools#directory-launch">Directory launch tools</a> |

<Callout type="note">
<p>These tools manage <strong>product profiles</strong> and launch readiness. They do not publish to DevHunt for you. After <Badge text="directoryVariantsEnsure" variant="default" /> tailors copy, use the browser extension to open devhunt.org and submit.</p>
</Callout>

<Callout type="note" title="Plan capabilities">
<p>Directory launch tools need <Badge text="directory_launch_enabled" variant="param" /> on the workspace plan. Directory SEO tools need <Badge text="directory_seo_enabled" variant="param" />.</p>
</Callout>

## List DevHunt destinations

> Which DevHunt launch paths are in the OpenQuok catalog right now?

The agent calls <Badge text="directoryDestinationsList" variant="default" /> and filters rows where the provider slug starts with <Badge text="devhunt" variant="default" /> (free listing and paid launch week variants when they are live).

## Main profile and DevHunt variant

> Create or open my DevHunt-tailored product profile from my main business profile, and tell me how similar it is to the main profile.

The agent should:

1. Call <Badge text="directoryProfilesList" variant="default" /> with <Badge text="mainOnly: true" variant="param" /> and read <Badge text="productProfileId" variant="param" /> from the first row.
2. Call <Badge text="directoryVariantsEnsure" variant="default" /> with that id and <Badge text="directorySiteKey: devhunt" variant="param" />.

```json
{
  "mainProductProfileId": "<main-product-profile-id>",
  "directorySiteKey": "devhunt"
}
```

<Callout type="tip" title="Idempotent variant">
<p><Badge text="directoryVariantsEnsure" variant="default" /> returns the existing variant with <Badge text="created: false" variant="param" /> when one already exists for <Badge text="devhunt" variant="default" />.</p>
</Callout>

## Listing readiness before you open devhunt.org

> For my main product profile, show DevHunt readiness — submission status and any missing fields.

The agent calls <Badge text="directoryListingSummary" variant="default" /> and reads destinations whose <Badge text="providerSlug" variant="param" /> starts with <Badge text="devhunt" variant="default" />.

> Fill in my DevHunt profile tagline and description from this draft copy.

Call <Badge text="directoryProfilesUpdate" variant="default" /> on the variant <Badge text="productProfileId" variant="param" /> with the fields to patch.

## Profile fields wired to autofill

<Callout type="tip" title="Same paths as the extension">
<p><Badge text="directoryListingSummary" variant="default" /> mirrors missing <Badge text="profilePath" variant="param" /> values from <Badge text="DIRECTORY_EXTENSION_CONFIG_FIXTURES" variant="param" />. Call <Badge text="directoryProfilesUpdate" variant="default" /> on the variant <Badge text="productProfileId" variant="param" /> after <Badge text="directoryVariantsEnsure" variant="default" />.</p>
</Callout>

### Mapped `profilePath` values (all variants on this site)

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.categories" variant="path" />
<Badge text="profile_data.gallery_urls" variant="path" />
<Badge text="profile_data.launch_video_url" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.social_github" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

### Provider slugs on this site

<p>These launch paths share the same <Badge text="profilePath" variant="param" /> set: <Badge text="devhunt-paid-launch" variant="default" /> <Badge text="devhunt-standard-launch" variant="default" />.</p>

Operator guide: <a href="/docs/directory-integration/devhunt">DevHunt directory integration</a>.

### Example `directoryProfilesUpdate` payload fragment

> Patch my DevHunt variant with discovery and media fields from this draft before I open the submit form.

```json
{
  "profile_data": {
    "categories": [
      "Developer Tools",
      "APIs"
    ],
    "pricing_type": "freemium",
    "social_github": "https://github.com/org/repo",
    "launch_video_url": "https://www.youtube.com/watch?v=example",
    "gallery_urls": [
      "https://cdn.example.com/dh-1.png",
      "https://cdn.example.com/dh-2.png",
      "https://cdn.example.com/dh-3.png"
    ]
  }
}
```

<Callout type="note" title="Manual on DevHunt">
<p>Maker comment, launch week, $49 checkout, and maker name stay manual on devhunt.org. DevHunt expects at least three screenshots in the gallery.</p>
</Callout>

## Logo and screenshots

> Set my DevHunt profile logo and screenshot URLs before I open devhunt.org.

The agent calls <Badge text="directoryProfilesUpdate" variant="default" /> with <Badge text="logoUrl" variant="param" /> and <Badge text="profileData.gallery_urls" variant="param" /> (public <Badge text="https://" variant="param" /> URLs). Optional: <Badge text="uploadFromUrl" variant="default" /> for workspace media, then patch URLs on the profile.

## Submissions (read-only)

> List directory submissions recorded for my main product profile.

The agent calls <Badge text="directorySubmissionsList" variant="default" />.

## Directory SEO (cached metrics)

> What are my directory SEO ratings for my main profile, and when were they last checked?

The agent calls <Badge text="directorySeoOverview" variant="default" />. Read <Badge text="checkedAt" variant="param" /> before <Badge text="directorySeoRefresh" variant="default" />.

## End-to-end workflow

> Prepare my product for DevHunt: ensure the devhunt variant, show DevHunt readiness on the listing summary, and give me the latest cached domain rating with checkedAt.

The agent chains <Badge text="directoryProfilesList" variant="default" /> → <Badge text="directoryVariantsEnsure" variant="default" /> → <Badge text="directoryListingSummary" variant="default" /> → <Badge text="directorySeoOverview" variant="default" />.

## Related

<CardGrid>
<LinkCard title="DevHunt channel" description="Autofill, DR tracking, and launch paths on devhunt.org" href="/channels/devhunt" />
<LinkCard title="CLI examples — DevHunt" description="The same flows with openquok directory:* commands" href="/docs/cli-examples/devhunt" />
<LinkCard title="Directory launch CLI" description="Command-by-command directory:* reference" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Tools reference — Directory launch" description="Input tables for directoryProfilesList through directorySubmissionsList" href="/docs/mcp-references/tools#directory-launch" />
<LinkCard title="MCP overview" description="Cross-platform scheduling and directory launch prompts" href="/docs/mcp-examples" />
</CardGrid>

---
title: Open Launch
description: OpenQuok MCP examples for Open Launch directory launch — profiles, openlaunch variants, listing readiness, and cached directory SEO.
order: 11
lastUpdated: 2026-11-28
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Directory launch quick reference

| Property | Value |
| --- | --- |
| Directory site key | <Badge text="open-launch" variant="default" /> |
| Submit host | open-launch.com (you click submit on Open Launch — OpenQuok autofills) |
| Integration docs | <a href="/docs/directory-integration/open-launch">Open Launch directory integration</a> |
| Tools reference | <a href="/docs/mcp-references/tools#directory-launch">Directory launch tools</a> |

<Callout type="note">
<p>These tools manage <strong>product profiles</strong> and launch readiness. They do not publish to Open Launch for you. After <Badge text="directoryVariantsEnsure" variant="default" /> tailors copy, use the browser extension to open open-launch.com and submit.</p>
</Callout>

<Callout type="note" title="Plan capabilities">
<p>Directory launch tools need <Badge text="directory_launch_enabled" variant="param" /> on the workspace plan. Directory SEO tools need <Badge text="directory_seo_enabled" variant="param" />.</p>
</Callout>

## List Open Launch destinations

> Which Open Launch launch paths are in the OpenQuok catalog right now?

The agent calls <Badge text="directoryDestinationsList" variant="default" /> and filters rows where the provider slug starts with <Badge text="open-launch" variant="default" /> (premium launch and free queue variants when they are live).

## Main profile and Open Launch variant

> Create or open my Open Launch-tailored product profile from my main business profile, and tell me how similar it is to the main profile.

The agent should:

1. Call <Badge text="directoryProfilesList" variant="default" /> with <Badge text="mainOnly: true" variant="param" /> and read <Badge text="productProfileId" variant="param" /> from the first row.
2. Call <Badge text="directoryVariantsEnsure" variant="default" /> with that id and <Badge text="directorySiteKey: open-launch" variant="param" />.

```json
{
  "mainProductProfileId": "<main-product-profile-id>",
  "directorySiteKey": "open-launch"
}
```

<Callout type="tip" title="Idempotent variant">
<p><Badge text="directoryVariantsEnsure" variant="default" /> returns the existing variant with <Badge text="created: false" variant="param" /> when one already exists for <Badge text="open-launch" variant="default" />.</p>
</Callout>

## Listing readiness before you open open-launch.com

> For my main product profile, show Open Launch readiness — submission status and any missing fields.

The agent calls <Badge text="directoryListingSummary" variant="default" /> and reads destinations whose <Badge text="providerSlug" variant="param" /> starts with <Badge text="open-launch" variant="default" />.

> Fill in my Open Launch profile tagline and description from this draft copy.

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
<Badge text="profile_data.platforms" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.social_github" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.tech_stack" variant="path" />
<Badge text="website_url" variant="path" />

### Provider slugs on this site

<p>These launch paths share the same <Badge text="profilePath" variant="param" /> set: <Badge text="open-launch-free-launch" variant="default" /> <Badge text="open-launch-premium-launch" variant="default" />.</p>

Operator guide: <a href="/docs/directory-integration/open-launch">Open Launch directory integration</a>.

### Example `directoryProfilesUpdate` payload fragment

> Patch my Open Launch variant with discovery and media fields from this draft before I open the submit form.

```json
{
  "profile_data": {
    "categories": [
      "SaaS",
      "Developer Tools"
    ],
    "tech_stack": [
      "TypeScript",
      "PostgreSQL"
    ],
    "platforms": [
      "Web"
    ],
    "pricing_type": "freemium",
    "gallery_urls": [
      "https://cdn.example.com/product-shot.png"
    ]
  }
}
```

<Callout type="note" title="Manual on Open Launch">
<p>Premium checkout, free-queue placement, and wizard steps after Details stay on open-launch.com. Product image on the form uses only the first gallery URL.</p>
</Callout>

## Logo and screenshots

> Set my Open Launch profile logo and screenshot URLs before I open open-launch.com.

The agent calls <Badge text="directoryProfilesUpdate" variant="default" /> with <Badge text="logoUrl" variant="param" /> and <Badge text="profileData.gallery_urls" variant="param" /> (public <Badge text="https://" variant="param" /> URLs). Optional: <Badge text="uploadFromUrl" variant="default" /> for workspace media, then patch URLs on the profile.

## Submissions (read-only)

> List directory submissions recorded for my main product profile.

The agent calls <Badge text="directorySubmissionsList" variant="default" />.

## Directory SEO (cached metrics)

> What are my directory SEO ratings for my main profile, and when were they last checked?

The agent calls <Badge text="directorySeoOverview" variant="default" />. Read <Badge text="checkedAt" variant="param" /> before <Badge text="directorySeoRefresh" variant="default" />.

## End-to-end workflow

> Prepare my product for Open Launch: ensure the open-launch variant, show Open Launch readiness on the listing summary, and give me the latest cached domain rating with checkedAt.

The agent chains <Badge text="directoryProfilesList" variant="default" /> → <Badge text="directoryVariantsEnsure" variant="default" /> → <Badge text="directoryListingSummary" variant="default" /> → <Badge text="directorySeoOverview" variant="default" />.

## Related

<CardGrid>
<LinkCard title="Open Launch channel" description="Autofill, DR tracking, and launch paths on open-launch.com" href="/channels/open-launch" />
<LinkCard title="CLI examples — Open Launch" description="The same flows with openquok directory:* commands" href="/docs/cli-examples/open-launch" />
<LinkCard title="Directory launch CLI" description="Command-by-command directory:* reference" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Tools reference — Directory launch" description="Input tables for directoryProfilesList through directorySubmissionsList" href="/docs/mcp-references/tools#directory-launch" />
<LinkCard title="MCP overview" description="Cross-platform scheduling and directory launch prompts" href="/docs/mcp-examples" />
</CardGrid>

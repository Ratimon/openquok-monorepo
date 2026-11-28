---
title: Fazier
description: OpenQuok MCP examples for Fazier directory launch — profiles, fazier variants, listing readiness, and cached directory SEO.
order: 13
lastUpdated: 2026-11-28
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Directory launch quick reference

| Property | Value |
| --- | --- |
| Directory site key | <Badge text="fazier" variant="default" /> |
| Submit host | fazier.com (you click submit on Fazier — OpenQuok autofills) |
| Integration docs | <a href="/docs/directory-integration/fazier">Fazier directory integration</a> |
| Tools reference | <a href="/docs/mcp-references/tools#directory-launch">Directory launch tools</a> |

<Callout type="note">
<p>These tools manage <strong>product profiles</strong> and launch readiness. They do not publish to Fazier for you. After <Badge text="directoryVariantsEnsure" variant="default" /> tailors copy, use the browser extension to open fazier.com and submit.</p>
</Callout>

<Callout type="note" title="Plan capabilities">
<p>Directory launch tools need <Badge text="directory_launch_enabled" variant="param" /> on the workspace plan. Directory SEO tools need <Badge text="directory_seo_enabled" variant="param" />.</p>
</Callout>

## List Fazier destinations

> Which Fazier launch paths are in the OpenQuok catalog right now?

The agent calls <Badge text="directoryDestinationsList" variant="default" /> and filters rows where the provider slug starts with <Badge text="fazier" variant="default" /> (company page, free product listing, and paid product listing paths when published).

## Main profile and Fazier variant

> Create or open my Fazier-tailored product profile from my main business profile, and tell me how similar it is to the main profile.

The agent should:

1. Call <Badge text="directoryProfilesList" variant="default" /> with <Badge text="mainOnly: true" variant="param" /> and read <Badge text="productProfileId" variant="param" /> from the first row.
2. Call <Badge text="directoryVariantsEnsure" variant="default" /> with that id and <Badge text="directorySiteKey: fazier" variant="param" />.

```json
{
  "mainProductProfileId": "<main-product-profile-id>",
  "directorySiteKey": "fazier"
}
```

<Callout type="tip" title="Idempotent variant">
<p><Badge text="directoryVariantsEnsure" variant="default" /> returns the existing variant with <Badge text="created: false" variant="param" /> when one already exists for <Badge text="fazier" variant="default" />.</p>
</Callout>

## Listing readiness before you open fazier.com

> For my main product profile, show Fazier readiness — submission status and any missing fields.

The agent calls <Badge text="directoryListingSummary" variant="default" /> and reads destinations whose <Badge text="providerSlug" variant="param" /> starts with <Badge text="fazier" variant="default" />.

> Fill in my Fazier profile tagline and description from this draft copy.

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
<Badge text="profile_data.launch_date" variant="path" />
<Badge text="profile_data.platforms" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.slug" variant="path" />
<Badge text="profile_data.social_linkedin" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.target_audiences" variant="path" />
<Badge text="profile_data.tech_stack" variant="path" />
<Badge text="profile_data.use_cases" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

### By provider slug

<p>Use <Badge text="providerSlug" variant="param" /> on <Badge text="directory:listings" variant="default" /> rows when you prepare a specific variant — field requirements can differ per form.</p>

#### <Badge text="fazier-free-product-listing" variant="default" />

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.categories" variant="path" />
<Badge text="profile_data.gallery_urls" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.social_linkedin" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.use_cases" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

#### <Badge text="fazier-page" variant="default" />

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.categories" variant="path" />
<Badge text="profile_data.launch_date" variant="path" />
<Badge text="profile_data.platforms" variant="path" />
<Badge text="profile_data.slug" variant="path" />
<Badge text="profile_data.social_linkedin" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.target_audiences" variant="path" />
<Badge text="profile_data.tech_stack" variant="path" />
<Badge text="profile_data.use_cases" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

#### <Badge text="fazier-paid-product-listing" variant="default" />

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.categories" variant="path" />
<Badge text="profile_data.gallery_urls" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.social_linkedin" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.use_cases" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

Operator guide: <a href="/docs/directory-integration/fazier">Fazier directory integration</a>.

### Example `directoryProfilesUpdate` payload fragment

> Patch my Fazier variant with discovery and media fields from this draft before I open the submit form.

```json
{
  "profile_data": {
    "slug": "my-product",
    "categories": [
      "SaaS"
    ],
    "use_cases": [
      "Automation",
      "Analytics"
    ],
    "target_audiences": [
      "Startups"
    ],
    "platforms": [
      "Web"
    ],
    "tech_stack": [
      "TypeScript"
    ],
    "launch_date": "2026-12-01",
    "pricing_type": "freemium",
    "social_linkedin": "https://www.linkedin.com/company/example",
    "social_x": "https://x.com/example"
  }
}
```

<Callout type="note" title="Manual on Fazier">
<p>Maker comments, badge embed, Lite Plan checkout, and moderation after the product wizard stay manual on fazier.com. Company page social rows beyond LinkedIn and X are manual.</p>
</Callout>

## Logo and screenshots

> Set my Fazier profile logo and screenshot URLs before I open fazier.com.

The agent calls <Badge text="directoryProfilesUpdate" variant="default" /> with <Badge text="logoUrl" variant="param" /> and <Badge text="profileData.gallery_urls" variant="param" /> (public <Badge text="https://" variant="param" /> URLs). Optional: <Badge text="uploadFromUrl" variant="default" /> for workspace media, then patch URLs on the profile.

## Submissions (read-only)

> List directory submissions recorded for my main product profile.

The agent calls <Badge text="directorySubmissionsList" variant="default" />.

## Directory SEO (cached metrics)

> What are my directory SEO ratings for my main profile, and when were they last checked?

The agent calls <Badge text="directorySeoOverview" variant="default" />. Read <Badge text="checkedAt" variant="param" /> before <Badge text="directorySeoRefresh" variant="default" />.

## End-to-end workflow

> Prepare my product for Fazier: ensure the fazier variant, show Fazier readiness on the listing summary, and give me the latest cached domain rating with checkedAt.

The agent chains <Badge text="directoryProfilesList" variant="default" /> → <Badge text="directoryVariantsEnsure" variant="default" /> → <Badge text="directoryListingSummary" variant="default" /> → <Badge text="directorySeoOverview" variant="default" />.

## Related

<CardGrid>
<LinkCard title="Fazier channel" description="Autofill, DR tracking, and launch paths on fazier.com" href="/channels/fazier" />
<LinkCard title="CLI examples — Fazier" description="The same flows with openquok directory:* commands" href="/docs/cli-examples/fazier" />
<LinkCard title="Directory launch CLI" description="Command-by-command directory:* reference" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Tools reference — Directory launch" description="Input tables for directoryProfilesList through directorySubmissionsList" href="/docs/mcp-references/tools#directory-launch" />
<LinkCard title="MCP overview" description="Cross-platform scheduling and directory launch prompts" href="/docs/mcp-examples" />
</CardGrid>

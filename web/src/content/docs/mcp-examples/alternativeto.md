---
title: AlternativeTo
description: OpenQuok MCP examples for AlternativeTo directory launch — profiles, alternativeto variants, listing readiness, and cached directory SEO.
order: 17
lastUpdated: 2026-11-28
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Directory launch quick reference

| Property | Value |
| --- | --- |
| Directory site key | <Badge text="alternativeto" variant="default" /> |
| Submit host | alternativeto.net (you click submit on AlternativeTo — OpenQuok autofills) |
| Integration docs | <a href="/docs/directory-integration/alternativeto">AlternativeTo directory integration</a> |
| Tools reference | <a href="/docs/mcp-references/tools#directory-launch">Directory launch tools</a> |

<Callout type="note">
<p>These tools manage <strong>product profiles</strong> and launch readiness. They do not publish to AlternativeTo for you. After <Badge text="directoryVariantsEnsure" variant="default" /> tailors copy, use the browser extension to open alternativeto.net and submit.</p>
</Callout>

<Callout type="note" title="Plan capabilities">
<p>Directory launch tools need <Badge text="directory_launch_enabled" variant="param" /> on the workspace plan. Directory SEO tools need <Badge text="directory_seo_enabled" variant="param" />.</p>
</Callout>

## List AlternativeTo destinations

> Which AlternativeTo launch paths are in the OpenQuok catalog right now?

The agent calls <Badge text="directoryDestinationsList" variant="default" /> and filters rows where the provider slug starts with <Badge text="alternativeto" variant="default" /> (free listing, paid review tiers, finish listing, and user profile paths when published).

## Main profile and AlternativeTo variant

> Create or open my AlternativeTo-tailored product profile from my main business profile, and tell me how similar it is to the main profile.

The agent should:

1. Call <Badge text="directoryProfilesList" variant="default" /> with <Badge text="mainOnly: true" variant="param" /> and read <Badge text="productProfileId" variant="param" /> from the first row.
2. Call <Badge text="directoryVariantsEnsure" variant="default" /> with that id and <Badge text="directorySiteKey: alternativeto" variant="param" />.

```json
{
  "mainProductProfileId": "<main-product-profile-id>",
  "directorySiteKey": "alternativeto"
}
```

<Callout type="tip" title="Idempotent variant">
<p><Badge text="directoryVariantsEnsure" variant="default" /> returns the existing variant with <Badge text="created: false" variant="param" /> when one already exists for <Badge text="alternativeto" variant="default" />.</p>
</Callout>

## Listing readiness before you open alternativeto.net

> For my main product profile, show AlternativeTo readiness — submission status and any missing fields.

The agent calls <Badge text="directoryListingSummary" variant="default" /> and reads destinations whose <Badge text="providerSlug" variant="param" /> starts with <Badge text="alternativeto" variant="default" />.

> Fill in my AlternativeTo profile tagline and description from this draft copy.

Call <Badge text="directoryProfilesUpdate" variant="default" /> on the variant <Badge text="productProfileId" variant="param" /> with the fields to patch.

## Profile fields wired to autofill

<Callout type="tip" title="Same paths as the extension">
<p><Badge text="directoryListingSummary" variant="default" /> mirrors missing <Badge text="profilePath" variant="param" /> values from <Badge text="DIRECTORY_EXTENSION_CONFIG_FIXTURES" variant="param" />. Call <Badge text="directoryProfilesUpdate" variant="default" /> on the variant <Badge text="productProfileId" variant="param" /> after <Badge text="directoryVariantsEnsure" variant="default" />.</p>
</Callout>

### Mapped `profilePath` values (all variants on this site)

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.gallery_urls" variant="path" />
<Badge text="profile_data.is_open_source" variant="path" />
<Badge text="profile_data.launch_video_url" variant="path" />
<Badge text="profile_data.platforms" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.social_github" variant="path" />
<Badge text="profile_data.social_instagram" variant="path" />
<Badge text="profile_data.social_linkedin" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.social_youtube" variant="path" />
<Badge text="profile_data.tags" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

### By provider slug

<p>Use <Badge text="providerSlug" variant="param" /> on <Badge text="directory:listings" variant="default" /> rows when you prepare a specific variant — field requirements can differ per form.</p>

#### <Badge text="alternativeto-finish-listing" variant="default" />

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.gallery_urls" variant="path" />
<Badge text="profile_data.is_open_source" variant="path" />
<Badge text="profile_data.launch_video_url" variant="path" />
<Badge text="profile_data.platforms" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.tags" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

#### <Badge text="alternativeto-free-listing" variant="default" />

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.gallery_urls" variant="path" />
<Badge text="profile_data.is_open_source" variant="path" />
<Badge text="profile_data.launch_video_url" variant="path" />
<Badge text="profile_data.platforms" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.tags" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

#### <Badge text="alternativeto-priority-review" variant="default" />

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.gallery_urls" variant="path" />
<Badge text="profile_data.is_open_source" variant="path" />
<Badge text="profile_data.launch_video_url" variant="path" />
<Badge text="profile_data.platforms" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.tags" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

#### <Badge text="alternativeto-user-profile" variant="default" />

<Badge text="profile_data.social_github" variant="path" />
<Badge text="profile_data.social_instagram" variant="path" />
<Badge text="profile_data.social_linkedin" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.social_youtube" variant="path" />

Operator guide: <a href="/docs/directory-integration/alternativeto">AlternativeTo directory integration</a>.

### Example `directoryProfilesUpdate` payload fragment

> Patch my AlternativeTo variant with discovery and media fields from this draft before I open the submit form.

```json
{
  "profile_data": {
    "tags": [
      "project-management",
      "collaboration"
    ],
    "platforms": [
      "Web",
      "Windows",
      "macOS"
    ],
    "pricing_type": "freemium",
    "is_open_source": false,
    "social_x": "https://x.com/example"
  }
}
```

<Callout type="note" title="Manual on AlternativeTo">
<p>Features, supported languages, suggest-as-alternative flows, Stripe upsell tiers, final Submit, and Reddit on user profile stay manual on alternativeto.net.</p>
</Callout>

## Logo and screenshots

> Set my AlternativeTo profile logo and screenshot URLs before I open alternativeto.net.

The agent calls <Badge text="directoryProfilesUpdate" variant="default" /> with <Badge text="logoUrl" variant="param" /> and <Badge text="profileData.gallery_urls" variant="param" /> (public <Badge text="https://" variant="param" /> URLs). Optional: <Badge text="uploadFromUrl" variant="default" /> for workspace media, then patch URLs on the profile.

## Submissions (read-only)

> List directory submissions recorded for my main product profile.

The agent calls <Badge text="directorySubmissionsList" variant="default" />.

## Directory SEO (cached metrics)

> What are my directory SEO ratings for my main profile, and when were they last checked?

The agent calls <Badge text="directorySeoOverview" variant="default" />. Read <Badge text="checkedAt" variant="param" /> before <Badge text="directorySeoRefresh" variant="default" />.

## End-to-end workflow

> Prepare my product for AlternativeTo: ensure the alternativeto variant, show AlternativeTo readiness on the listing summary, and give me the latest cached domain rating with checkedAt.

The agent chains <Badge text="directoryProfilesList" variant="default" /> → <Badge text="directoryVariantsEnsure" variant="default" /> → <Badge text="directoryListingSummary" variant="default" /> → <Badge text="directorySeoOverview" variant="default" />.

## Related

<CardGrid>
<LinkCard title="AlternativeTo channel" description="Autofill, DR tracking, and launch paths on alternativeto.net" href="/channels/alternativeto" />
<LinkCard title="CLI examples — AlternativeTo" description="The same flows with openquok directory:* commands" href="/docs/cli-examples/alternativeto" />
<LinkCard title="Directory launch CLI" description="Command-by-command directory:* reference" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Tools reference — Directory launch" description="Input tables for directoryProfilesList through directorySubmissionsList" href="/docs/mcp-references/tools#directory-launch" />
<LinkCard title="MCP overview" description="Cross-platform scheduling and directory launch prompts" href="/docs/mcp-examples" />
</CardGrid>

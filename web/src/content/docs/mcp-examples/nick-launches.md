---
title: Nick Launches
description: OpenQuok MCP examples for Nick Launches directory launch — profiles, nicklaunches variants, listing readiness, and cached directory SEO.
order: 15
lastUpdated: 2026-11-28
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Directory launch quick reference

| Property | Value |
| --- | --- |
| Directory site key | <Badge text="nick-launches" variant="default" /> |
| Submit host | nicklaunches.com (you click submit on Nick Launches — OpenQuok autofills) |
| Integration docs | <a href="/docs/directory-integration/nick-launches">Nick Launches directory integration</a> |
| Tools reference | <a href="/docs/mcp-references/tools#directory-launch">Directory launch tools</a> |

<Callout type="note">
<p>These tools manage <strong>product profiles</strong> and launch readiness. They do not publish to Nick Launches for you. After <Badge text="directoryVariantsEnsure" variant="default" /> tailors copy, use the browser extension to open nicklaunches.com and submit.</p>
</Callout>

<Callout type="note" title="Plan capabilities">
<p>Directory launch tools need <Badge text="directory_launch_enabled" variant="param" /> on the workspace plan. Directory SEO tools need <Badge text="directory_seo_enabled" variant="param" />.</p>
</Callout>

## List Nick Launches destinations

> Which Nick Launches launch paths are in the OpenQuok catalog right now?

The agent calls <Badge text="directoryDestinationsList" variant="default" /> and filters rows where the provider slug starts with <Badge text="nick-launches" variant="default" /> (free launch, paid tiers, and maker profile paths when published).

## Main profile and Nick Launches variant

> Create or open my Nick Launches-tailored product profile from my main business profile, and tell me how similar it is to the main profile.

The agent should:

1. Call <Badge text="directoryProfilesList" variant="default" /> with <Badge text="mainOnly: true" variant="param" /> and read <Badge text="productProfileId" variant="param" /> from the first row.
2. Call <Badge text="directoryVariantsEnsure" variant="default" /> with that id and <Badge text="directorySiteKey: nick-launches" variant="param" />.

```json
{
  "mainProductProfileId": "<main-product-profile-id>",
  "directorySiteKey": "nick-launches"
}
```

<Callout type="tip" title="Idempotent variant">
<p><Badge text="directoryVariantsEnsure" variant="default" /> returns the existing variant with <Badge text="created: false" variant="param" /> when one already exists for <Badge text="nick-launches" variant="default" />.</p>
</Callout>

## Listing readiness before you open nicklaunches.com

> For my main product profile, show Nick Launches readiness — submission status and any missing fields.

The agent calls <Badge text="directoryListingSummary" variant="default" /> and reads destinations whose <Badge text="providerSlug" variant="param" /> starts with <Badge text="nick-launches" variant="default" />.

> Fill in my Nick Launches profile tagline and description from this draft copy.

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
<Badge text="profile_data.is_open_source" variant="path" />
<Badge text="profile_data.launch_video_url" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.social_github" variant="path" />
<Badge text="profile_data.social_linkedin" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.social_youtube" variant="path" />
<Badge text="profile_data.use_cases" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

### By provider slug

<p>Use <Badge text="providerSlug" variant="param" /> on <Badge text="directory:listings" variant="default" /> rows when you prepare a specific variant — field requirements can differ per form.</p>

#### <Badge text="nick-launches-free-launch" variant="default" />

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.categories" variant="path" />
<Badge text="profile_data.gallery_urls" variant="path" />
<Badge text="profile_data.is_open_source" variant="path" />
<Badge text="profile_data.launch_video_url" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.use_cases" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

#### <Badge text="nick-launches-maker-profile" variant="default" />

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.social_github" variant="path" />
<Badge text="profile_data.social_linkedin" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.social_youtube" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

#### <Badge text="nick-launches-paid-launch" variant="default" />

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.categories" variant="path" />
<Badge text="profile_data.gallery_urls" variant="path" />
<Badge text="profile_data.is_open_source" variant="path" />
<Badge text="profile_data.launch_video_url" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.use_cases" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

Operator guide: <a href="/docs/directory-integration/nick-launches">Nick Launches directory integration</a>.

### Example `directoryProfilesUpdate` payload fragment

> Patch my Nick Launches variant with discovery and media fields from this draft before I open the submit form.

```json
{
  "profile_data": {
    "categories": [
      "SaaS",
      "AI"
    ],
    "use_cases": [
      "Product discovery"
    ],
    "pricing_type": "freemium",
    "is_open_source": false,
    "launch_video_url": "https://www.youtube.com/watch?v=example",
    "social_x": "https://x.com/example"
  }
}
```

<Callout type="note" title="Manual on Nick Launches">
<p>Target keyword, discount, first comment, launch date, slug, and plan checkout on /submit/plan/ stay manual on nicklaunches.com.</p>
</Callout>

## Logo and screenshots

> Set my Nick Launches profile logo and screenshot URLs before I open nicklaunches.com.

The agent calls <Badge text="directoryProfilesUpdate" variant="default" /> with <Badge text="logoUrl" variant="param" /> and <Badge text="profileData.gallery_urls" variant="param" /> (public <Badge text="https://" variant="param" /> URLs). Optional: <Badge text="uploadFromUrl" variant="default" /> for workspace media, then patch URLs on the profile.

## Submissions (read-only)

> List directory submissions recorded for my main product profile.

The agent calls <Badge text="directorySubmissionsList" variant="default" />.

## Directory SEO (cached metrics)

> What are my directory SEO ratings for my main profile, and when were they last checked?

The agent calls <Badge text="directorySeoOverview" variant="default" />. Read <Badge text="checkedAt" variant="param" /> before <Badge text="directorySeoRefresh" variant="default" />.

## End-to-end workflow

> Prepare my product for Nick Launches: ensure the nick-launches variant, show Nick Launches readiness on the listing summary, and give me the latest cached domain rating with checkedAt.

The agent chains <Badge text="directoryProfilesList" variant="default" /> → <Badge text="directoryVariantsEnsure" variant="default" /> → <Badge text="directoryListingSummary" variant="default" /> → <Badge text="directorySeoOverview" variant="default" />.

## Related

<CardGrid>
<LinkCard title="Nick Launches channel" description="Autofill, DR tracking, and launch paths on nicklaunches.com" href="/channels/nick-launches" />
<LinkCard title="CLI examples — Nick Launches" description="The same flows with openquok directory:* commands" href="/docs/cli-examples/nick-launches" />
<LinkCard title="Directory launch CLI" description="Command-by-command directory:* reference" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Tools reference — Directory launch" description="Input tables for directoryProfilesList through directorySubmissionsList" href="/docs/mcp-references/tools#directory-launch" />
<LinkCard title="MCP overview" description="Cross-platform scheduling and directory launch prompts" href="/docs/mcp-examples" />
</CardGrid>

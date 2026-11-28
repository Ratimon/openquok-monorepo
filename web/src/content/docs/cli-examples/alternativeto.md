---
title: AlternativeTo
description: OpenQuok CLI examples for AlternativeTo directory launch — profiles, variants, listing readiness, and cached directory SEO.
order: 21
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
| Command reference | <a href="/docs/cli-usages/directory-launch">Directory launch CLI</a> |

<Callout type="note" title="Not social posts:create">
<p>These commands manage <strong>product profiles</strong> and launch readiness. They do not publish to AlternativeTo for you. After <Badge text="directory:variants:ensure" variant="default" /> tailors copy, use the browser extension to open alternativeto.net and submit.</p>
</Callout>

<Callout type="note" title="Plan capabilities">
<p>Directory launch commands need <Badge text="directory_launch_enabled" variant="param" /> and a programmatic token with <Badge text="public_api" variant="param" />. Directory SEO commands need <Badge text="directory_seo_enabled" variant="param" />.</p>
</Callout>

## List AlternativeTo destinations

Published catalog rows include free listing, paid review tiers, finish listing, and user profile paths when published:

```bash
openquok directory:destinations:list | jq '.data[] | select(.providerSlug | startswith("alternativeto"))'
```

## Main profile and AlternativeTo variant

```bash
MAIN_ID=$(openquok directory:profiles:list --main-only | jq -r '.data[0].id')

openquok directory:variants:ensure "$MAIN_ID" --site-key alternativeto
openquok directory:profiles:get "$MAIN_ID" | jq '.data.similarityToMainPercent'
```

<Callout type="tip" title="Idempotent variant">
<p><Badge text="directory:variants:ensure" variant="default" /> returns the existing variant with <Badge text="200" variant="param" /> when one already exists for <Badge text="alternativeto" variant="default" />.</p>
</Callout>

## Listing readiness before you open alternativeto.net

```bash
openquok directory:listings "$MAIN_ID" | jq '.data | {submittedDirectorySiteCount, unsubmittedDirectorySiteCount}'
openquok directory:listings "$MAIN_ID" | jq '.data.destinations[] | select(.providerSlug | startswith("alternativeto")) | {destinationName, submissionStatus, readiness}'
```

## Profile fields wired to autofill

<Callout type="tip" title="Same paths as the extension">
<p><Badge text="directory:listings" variant="default" /> readiness gaps use the same <Badge text="profilePath" variant="param" /> keys as <Badge text="DIRECTORY_EXTENSION_CONFIG_FIXTURES" variant="param" /> in <Badge text="common/src/auto-launch/destination-configs/" variant="path" />. Patch the <strong>variant</strong> id from <Badge text="directory:variants:ensure" variant="default" /> when JSON lists missing fields.</p>
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

Full operator context: <a href="/docs/directory-integration/alternativeto">AlternativeTo directory integration</a>.

### Example `directory:profiles:update` patch

Use after <Badge text="directory:variants:ensure" variant="default" /> when readiness lists missing discovery or media fields:

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

```bash
openquok directory:profiles:update <profile-id> \
  --logo-url "https://cdn.example.com/logo.png" \
  --profile-data '{"gallery_urls":["https://cdn.example.com/s1.png","https://cdn.example.com/s2.png"]}'
```

Optional workspace media import (then still set public https URLs on the profile): `openquok upload-from-url` or `openquok upload`. Full notes: <a href="/docs/cli-usages/directory-launch#logo-and-screenshots">Directory launch — logo and screenshots</a>.

## Submissions (read-only)

```bash
openquok directory:submissions:list --profile "$MAIN_ID"
```

## Directory SEO (cached metrics)

```bash
openquok directory:analytics:overview --profile "$MAIN_ID" | jq '.data.productDomain.checkedAt'
openquok directory:analytics:history --profile "$MAIN_ID" -d 90
openquok directory:analytics:refresh --profile "$MAIN_ID"
```

<Callout type="note" title="checkedAt">
<p>Domain rating and competitor metrics are cached. Responses include <Badge text="checkedAt" variant="param" /> and <Badge text="manualRefreshAvailableAt" variant="param" /> after <Badge text="directory:analytics:refresh" variant="default" />.</p>
</Callout>

## End-to-end script

```bash
MAIN_ID=$(openquok directory:profiles:list --main-only | jq -r '.data[0].id')
openquok directory:variants:ensure "$MAIN_ID" --site-key alternativeto
openquok directory:listings "$MAIN_ID" | jq '.data.destinations[] | select(.providerSlug | startswith("alternativeto"))'
openquok directory:analytics:overview --profile "$MAIN_ID" | jq '.data.productDomain | {domain, checkedAt}'
```

## Related

<CardGrid>
<LinkCard title="AlternativeTo channel" description="Autofill, DR tracking, and launch paths on alternativeto.net" href="/channels/alternativeto" />
<LinkCard title="Directory launch CLI" description="Full directory:* command reference" href="/docs/cli-usages/directory-launch" />
<LinkCard title="AlternativeTo directory integration" description="Operator and member workflow for AlternativeTo" href="/docs/directory-integration/alternativeto" />
<LinkCard title="Directory launch APIs" description="REST reference for profiles and listing summary" href="/docs/apis-directory-launch" />
<LinkCard title="MCP examples — AlternativeTo" description="Agent prompts for the same directory launch flows" href="/docs/mcp-examples/alternativeto" />
</CardGrid>

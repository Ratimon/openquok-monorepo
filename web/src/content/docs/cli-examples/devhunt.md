---
title: DevHunt
description: OpenQuok CLI examples for DevHunt directory launch — profiles, variants, listing readiness, and cached directory SEO.
order: 18
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
| Command reference | <a href="/docs/cli-usages/directory-launch">Directory launch CLI</a> |

<Callout type="note" title="Not social posts:create">
<p>These commands manage <strong>product profiles</strong> and launch readiness. They do not publish to DevHunt for you. After <Badge text="directory:variants:ensure" variant="default" /> tailors copy, use the browser extension to open devhunt.org and submit.</p>
</Callout>

<Callout type="note" title="Plan capabilities">
<p>Directory launch commands need <Badge text="directory_launch_enabled" variant="param" /> and a programmatic token with <Badge text="public_api" variant="param" />. Directory SEO commands need <Badge text="directory_seo_enabled" variant="param" />.</p>
</Callout>

## List DevHunt destinations

Published catalog rows include free listing and paid launch week variants when they are live:

```bash
openquok directory:destinations:list | jq '.data[] | select(.providerSlug | startswith("devhunt"))'
```

## Main profile and DevHunt variant

```bash
MAIN_ID=$(openquok directory:profiles:list --main-only | jq -r '.data[0].id')

openquok directory:variants:ensure "$MAIN_ID" --site-key devhunt
openquok directory:profiles:get "$MAIN_ID" | jq '.data.similarityToMainPercent'
```

<Callout type="tip" title="Idempotent variant">
<p><Badge text="directory:variants:ensure" variant="default" /> returns the existing variant with <Badge text="200" variant="param" /> when one already exists for <Badge text="devhunt" variant="default" />.</p>
</Callout>

## Listing readiness before you open devhunt.org

```bash
openquok directory:listings "$MAIN_ID" | jq '.data | {submittedDirectorySiteCount, unsubmittedDirectorySiteCount}'
openquok directory:listings "$MAIN_ID" | jq '.data.destinations[] | select(.providerSlug | startswith("devhunt")) | {destinationName, submissionStatus, readiness}'
```

## Profile fields wired to autofill

<Callout type="tip" title="Same paths as the extension">
<p><Badge text="directory:listings" variant="default" /> readiness gaps use the same <Badge text="profilePath" variant="param" /> keys as <Badge text="DIRECTORY_EXTENSION_CONFIG_FIXTURES" variant="param" /> in <Badge text="common/src/auto-launch/destination-configs/" variant="path" />. Patch the <strong>variant</strong> id from <Badge text="directory:variants:ensure" variant="default" /> when JSON lists missing fields.</p>
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

Full operator context: <a href="/docs/directory-integration/devhunt">DevHunt directory integration</a>.

### Example `directory:profiles:update` patch

Use after <Badge text="directory:variants:ensure" variant="default" /> when readiness lists missing discovery or media fields:

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
openquok directory:variants:ensure "$MAIN_ID" --site-key devhunt
openquok directory:listings "$MAIN_ID" | jq '.data.destinations[] | select(.providerSlug | startswith("devhunt"))'
openquok directory:analytics:overview --profile "$MAIN_ID" | jq '.data.productDomain | {domain, checkedAt}'
```

## Related

<CardGrid>
<LinkCard title="DevHunt channel" description="Autofill, DR tracking, and launch paths on devhunt.org" href="/channels/devhunt" />
<LinkCard title="Directory launch CLI" description="Full directory:* command reference" href="/docs/cli-usages/directory-launch" />
<LinkCard title="DevHunt directory integration" description="Operator and member workflow for DevHunt" href="/docs/directory-integration/devhunt" />
<LinkCard title="Directory launch APIs" description="REST reference for profiles and listing summary" href="/docs/apis-directory-launch" />
<LinkCard title="MCP examples — DevHunt" description="Agent prompts for the same directory launch flows" href="/docs/mcp-examples/devhunt" />
</CardGrid>

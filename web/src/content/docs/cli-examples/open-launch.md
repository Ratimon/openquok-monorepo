---
title: Open Launch
description: OpenQuok CLI examples for Open Launch directory launch — profiles, variants, tech stack readiness, and cached directory SEO.
order: 15
lastUpdated: 2026-11-09
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
| Command reference | <a href="/docs/cli-usages/directory-launch">Directory launch CLI</a> |

<Callout type="note" title="Not social posts:create">
<p>These commands manage <strong>product profiles</strong> and launch readiness. They do not publish to Open Launch for you. After <Badge text="directory:variants:ensure" variant="default" /> tailors copy, use the browser extension to open open-launch.com and submit.</p>
</Callout>

<Callout type="note" title="Plan capabilities">
<p>Directory launch commands need <Badge text="directory_launch_enabled" variant="param" /> and a programmatic token with <Badge text="public_api" variant="param" />. Directory SEO commands need <Badge text="directory_seo_enabled" variant="param" />.</p>
</Callout>

## List Open Launch destinations

Published catalog rows include premium launch and free queue variants when they are live:

```bash
openquok directory:destinations:list | jq '.data[] | select(.providerSlug | startswith("open-launch"))'
```

## Main profile and Open Launch variant

```bash
MAIN_ID=$(openquok directory:profiles:list --main-only | jq -r '.data[0].id')

openquok directory:variants:ensure "$MAIN_ID" --site-key open-launch
openquok directory:profiles:get "$MAIN_ID" | jq '.data.similarityToMainPercent'
```

<Callout type="tip" title="Idempotent variant">
<p><Badge text="directory:variants:ensure" variant="default" /> returns the existing variant with <Badge text="200" variant="param" /> when one already exists for <Badge text="open-launch" variant="default" />.</p>
</Callout>

## Listing readiness before you open open-launch.com

```bash
openquok directory:listings "$MAIN_ID" | jq '.data | {submittedDirectorySiteCount, unsubmittedDirectorySiteCount}'
openquok directory:listings "$MAIN_ID" | jq '.data.destinations[] | select(.providerSlug | startswith("open-launch")) | {destinationName, submissionStatus, readiness}'
```

Patch discovery fields when readiness lists missing paths (for example tech stack):

```bash
openquok directory:profiles:update <profile-id> --json ./open-launch-variant-patch.json
```

Example patch fragment:

```json
{
  "profile_data": {
    "categories": ["SaaS", "Developer Tools"],
    "tech_stack": ["TypeScript", "PostgreSQL"],
    "platforms": ["Web"],
    "pricing_type": "freemium"
  }
}
```

## Logo and screenshots

```bash
openquok directory:profiles:update <profile-id> \
  --logo-url "https://cdn.example.com/logo.png" \
  --profile-data '{"gallery_urls":["https://cdn.example.com/product-shot.png"]}'
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
openquok directory:variants:ensure "$MAIN_ID" --site-key open-launch
openquok directory:listings "$MAIN_ID" | jq '.data.destinations[] | select(.providerSlug | startswith("open-launch"))'
openquok directory:analytics:overview --profile "$MAIN_ID" | jq '.data.productDomain | {domain, checkedAt}'
```

## Related

<CardGrid>
<LinkCard title="Open Launch channel" description="Autofill, DR tracking, and launch paths on open-launch.com" href="/channels/open-launch" />
<LinkCard title="Directory launch CLI" description="Full directory:* command reference" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Open Launch directory integration" description="Premium vs free queue in the dashboard" href="/docs/directory-integration/open-launch" />
<LinkCard title="Directory launch APIs" description="REST reference for profiles and listing summary" href="/docs/apis-directory-launch" />
</CardGrid>

---
title: Trustpilot
description: OpenQuok CLI examples for Trustpilot directory launch — profiles, variants, listing readiness, and cached directory SEO.
order: 22
lastUpdated: 2026-11-28
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Directory launch quick reference

| Property | Value |
| --- | --- |
| Directory site key | <Badge text="trustpilot" variant="default" /> |
| Submit host | businessapp.b2b.trustpilot.com (you click submit on Trustpilot — OpenQuok autofills) |
| Integration docs | <a href="/docs/directory-integration/trustpilot">Trustpilot directory integration</a> |
| Command reference | <a href="/docs/cli-usages/directory-launch">Directory launch CLI</a> |

<Callout type="note" title="Not social posts:create">
<p>These commands manage <strong>product profiles</strong> and launch readiness. They do not publish to Trustpilot for you. After <Badge text="directory:variants:ensure" variant="default" /> tailors copy, use the browser extension to open businessapp.b2b.trustpilot.com and submit.</p>
</Callout>

<Callout type="note" title="Plan capabilities">
<p>Directory launch commands need <Badge text="directory_launch_enabled" variant="param" /> and a programmatic token with <Badge text="public_api" variant="param" />. Directory SEO commands need <Badge text="directory_seo_enabled" variant="param" />.</p>
</Callout>

## List Trustpilot destinations

Published catalog rows include company profile on trustpilot business when published:

```bash
openquok directory:destinations:list | jq '.data[] | select(.providerSlug | startswith("trustpilot"))'
```

## Main profile and Trustpilot variant

```bash
MAIN_ID=$(openquok directory:profiles:list --main-only | jq -r '.data[0].id')

openquok directory:variants:ensure "$MAIN_ID" --site-key trustpilot
openquok directory:profiles:get "$MAIN_ID" | jq '.data.similarityToMainPercent'
```

<Callout type="tip" title="Idempotent variant">
<p><Badge text="directory:variants:ensure" variant="default" /> returns the existing variant with <Badge text="200" variant="param" /> when one already exists for <Badge text="trustpilot" variant="default" />.</p>
</Callout>

## Listing readiness before you open businessapp.b2b.trustpilot.com

```bash
openquok directory:listings "$MAIN_ID" | jq '.data | {submittedDirectorySiteCount, unsubmittedDirectorySiteCount}'
openquok directory:listings "$MAIN_ID" | jq '.data.destinations[] | select(.providerSlug | startswith("trustpilot")) | {destinationName, submissionStatus, readiness}'
```

## Profile fields wired to autofill

<Callout type="tip" title="Same paths as the extension">
<p><Badge text="directory:listings" variant="default" /> readiness gaps use the same <Badge text="profilePath" variant="param" /> keys as <Badge text="DIRECTORY_EXTENSION_CONFIG_FIXTURES" variant="param" /> in <Badge text="common/src/auto-launch/destination-configs/" variant="path" />. Patch the <strong>variant</strong> id from <Badge text="directory:variants:ensure" variant="default" /> when JSON lists missing fields.</p>
</Callout>

### Mapped `profilePath` values (all variants on this site)

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="website_url" variant="path" />

Full operator context: <a href="/docs/directory-integration/trustpilot">Trustpilot directory integration</a>.

### Example `directory:profiles:update` patch

Use after <Badge text="directory:variants:ensure" variant="default" /> when readiness lists missing discovery or media fields:

```json
{
  "description": "Official company description for Trustpilot Business settings."
}
```

<Callout type="note" title="Manual on Trustpilot">
<p>Contact info (email, phone, address), Save and publish, homepage screenshot updates, and business-email verification stay manual on Trustpilot Business.</p>
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
openquok directory:variants:ensure "$MAIN_ID" --site-key trustpilot
openquok directory:listings "$MAIN_ID" | jq '.data.destinations[] | select(.providerSlug | startswith("trustpilot"))'
openquok directory:analytics:overview --profile "$MAIN_ID" | jq '.data.productDomain | {domain, checkedAt}'
```

## Related

<CardGrid>
<LinkCard title="Trustpilot channel" description="Autofill, DR tracking, and launch paths on businessapp.b2b.trustpilot.com" href="/channels/trustpilot" />
<LinkCard title="Directory launch CLI" description="Full directory:* command reference" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Trustpilot directory integration" description="Operator and member workflow for Trustpilot" href="/docs/directory-integration/trustpilot" />
<LinkCard title="Directory launch APIs" description="REST reference for profiles and listing summary" href="/docs/apis-directory-launch" />
<LinkCard title="MCP examples — Trustpilot" description="Agent prompts for the same directory launch flows" href="/docs/mcp-examples/trustpilot" />
</CardGrid>

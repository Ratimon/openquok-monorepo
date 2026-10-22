---
title: Uneed
description: OpenQuok CLI examples for Uneed directory launch — profiles, uneed variants, listing readiness, and cached directory SEO.
order: 14
lastUpdated: 2026-10-21
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Directory launch quick reference

| Property | Value |
| --- | --- |
| Directory site key | <Badge text="uneed" variant="default" /> |
| Submit host | uneed.best (you click submit on Uneed — OpenQuok autofills) |
| Integration docs | <a href="/docs/directory-integration/uneed">Uneed directory integration</a> |
| Command reference | <a href="/docs/cli-usages/directory-launch">Directory launch CLI</a> |

<Callout type="note" title="Not social posts:create">
<p>These commands manage <strong>product profiles</strong> and launch readiness. They do not publish to Uneed for you. After <Badge text="directory:variants:ensure" variant="default" /> tailors copy, use the browser extension to open uneed.best and submit.</p>
</Callout>

<Callout type="note" title="Plan capabilities">
<p>Directory launch commands need <Badge text="directory_launch_enabled" variant="param" /> and a programmatic token with <Badge text="public_api" variant="param" />. Directory SEO commands need <Badge text="directory_seo_enabled" variant="param" />.</p>
</Callout>

## List Uneed destinations

Filter Join the line, paid launch, and maker profile rows when they are published:

```bash
openquok directory:destinations:list | jq '.data[] | select(.providerSlug=="uneed")'
```

## Main profile and Uneed variant

```bash
MAIN_ID=$(openquok directory:profiles:list --main-only | jq -r '.data[0].id')

openquok directory:variants:ensure "$MAIN_ID" --site-key uneed
openquok directory:profiles:get "$MAIN_ID" | jq '.data.similarityToMainPercent'
```

<Callout type="tip" title="Idempotent variant">
<p><Badge text="directory:variants:ensure" variant="default" /> returns the existing variant with <Badge text="200" variant="param" /> when one already exists for <Badge text="uneed" variant="default" />.</p>
</Callout>

## Listing readiness before you open uneed.best

```bash
openquok directory:listings "$MAIN_ID" | jq '.data | {submittedDirectorySiteCount, unsubmittedDirectorySiteCount}'
openquok directory:listings "$MAIN_ID" | jq '.data.destinations[] | select(.providerSlug=="uneed") | {destinationName, submissionStatus, readiness}'
```

Patch maker or pricing fields on the variant when readiness lists gaps:

```bash
openquok directory:profiles:update <profile-id> --json ./uneed-variant-patch.json
```

Logo and screenshots: <a href="/docs/cli-usages/directory-launch#logo-and-screenshots">Directory launch — logo and screenshots</a>.

## Submissions (read-only)

```bash
openquok directory:submissions:list --profile "$MAIN_ID"
```

## Directory SEO (cached metrics)

```bash
openquok directory:analytics:overview --profile "$MAIN_ID" | jq '.data.productDomain.checkedAt'
openquok directory:analytics:history --profile "$MAIN_ID" -d 90
openquok directory:analytics:competitors:add --domain rival.example --label "Rival"
```

<Callout type="note" title="checkedAt">
<p>Domain rating and competitor metrics are cached. Responses include <Badge text="checkedAt" variant="param" /> and <Badge text="manualRefreshAvailableAt" variant="param" /> after <Badge text="directory:analytics:refresh" variant="default" />.</p>
</Callout>

## End-to-end script

```bash
MAIN_ID=$(openquok directory:profiles:list --main-only | jq -r '.data[0].id')
openquok directory:variants:ensure "$MAIN_ID" --site-key uneed
openquok directory:listings "$MAIN_ID" | jq '.data.destinations[] | select(.providerSlug=="uneed")'
openquok directory:analytics:overview --profile "$MAIN_ID" | jq '.data.productDomain | {domain, checkedAt}'
```

## Related

<CardGrid>
<LinkCard title="Uneed channel" description="Autofill, DR tracking, and launch paths on uneed.best" href="/channels/uneed" />
<LinkCard title="Directory launch CLI" description="Full directory:* command reference" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Uneed directory integration" description="Join the line, paid launch, and maker profile" href="/docs/directory-integration/uneed" />
<LinkCard title="Directory launch APIs" description="REST reference for profiles and listing summary" href="/docs/apis-directory-launch" />
<LinkCard title="MCP examples — Uneed" description="Agent prompts for directoryProfilesList, variants, and listing summary" href="/docs/mcp-examples/uneed" />
</CardGrid>

---
title: Directory launch
description: Manage product profiles, directory variants, listing readiness, and cached directory SEO metrics from the CLI.
order: 5
lastUpdated: 2026-10-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';

const directoryLaunchApiPaths = {
	patchProfile: 'PATCH /public/directory-launch/profiles/{id}'
};
</script>

## Overview

The <Badge text="directory:*" variant="default" /> commands wrap the <a href="/docs/apis-directory-launch">Directory launch APIs</a> and <a href="/docs/apis-directory-seo">Directory SEO APIs</a>. Use them to prepare product copy for launch directories (PeerPush, Uneed, …), inspect per-destination readiness, and read  domain-rating metrics.

<Callout type="warning">
<p>Directory launch routes require <Badge text="directory_launch_enabled" variant="param" /> on your workspace plan. Directory SEO commands require <Badge text="directory_seo_enabled" variant="param" />. Both still need a programmatic API token with <Badge text="public_api" variant="param" />.</p>
</Callout>

<Callout type="note">
<p>Directory SEO responses include <Badge text="checkedAt" variant="param" /> on domain metrics and <Badge text="manualRefreshAvailableAt" variant="param" /> after a manual refresh. Values are cached — use <Badge text="directory:analytics:refresh" variant="default" /> when the cooldown allows.</p>
</Callout>

## Destinations and profiles

**Published launch catalog:**

```bash
openquok directory:destinations:list
```

**Channel-group ↔ product rows:**

```bash
openquok directory:business-profiles:list
```

**List profiles (optional filters):**

```bash
openquok directory:profiles:list
openquok directory:profiles:list --main-only
openquok directory:profiles:list --customer-group-id <customer-group-id>
```

| Flag | Description |
| --- | --- |
| <Badge text="--customer-group-id" variant="param" /> | Maps to API <Badge text="integrationCustomerId" variant="param" /> |
| <Badge text="--main-only" variant="param" /> | Client-side filter: rows without <Badge text="parentProfileId" variant="param" /> |

**Get, create, and update:**

```bash
openquok directory:profiles:get <profile-id>
openquok directory:profiles:create --name "Acme" --website-url "https://acme.example"
openquok directory:profiles:update <profile-id> --json ./profile-patch.json
```

| Flag | Description |
| --- | --- |
| <Badge text="-j" variant="param" /> <Badge text="--json" variant="param" /> | Path to JSON matching <Badge text="POST /public/directory-launch/profiles" variant="path" /> or <Badge text={directoryLaunchApiPaths.patchProfile} variant="path" /> (omit <Badge text="organizationId" variant="param" />) |
| <Badge text="--profile-data" variant="param" /> | <Badge text="profileData" variant="param" /> object as a JSON string |
| <Badge text="--logo-url" variant="param" /> | Public <Badge text="logoUrl" variant="param" /> (https URL or a storage key the API resolves) |

### Logo and screenshots

Directory launch does **not** upload into the **profile media** bucket for you.

Set images with **public https URLs** on the profile (or upload in the web UI).

For automation, patch <Badge text="logoUrl" variant="param" /> and up to **three** screenshot URLs in <Badge text="profileData.gallery_urls" variant="param" /> on create or update — on the **main** profile or a **variant** id after <Badge text="directory:variants:ensure" variant="default" />.

**Direct URLs (simplest):**

```bash
openquok directory:profiles:update <profile-id> \
  --logo-url "https://cdn.example.com/logo.png" \
  --profile-data '{"gallery_urls":["https://cdn.example.com/s1.png","https://cdn.example.com/s2.png"]}'
```

**Optional — workspace media library:**

```bash
openquok upload-from-url "https://cdn.example.com/logo.png"
# or: openquok upload ./logo.png
```

Upload responses include <Badge text="data.id" variant="param" /> and <Badge text="data.filePath" variant="param" /> for <Badge text="posts:create --media" variant="default" />. They do **not** automatically bind to a product profile. After upload, still set <Badge text="logoUrl" variant="param" /> and <Badge text="gallery_urls" variant="param" /> to **https** URLs your directories and the extension can fetch (your CDN, or the same URL you imported).

<Callout type="note" title="Extension autofill">
<p>Readiness and autofill expect resolvable image URLs on the profile row. If a logo does not appear on a directory form, confirm <Badge text="logoUrl" variant="param" /> / <Badge text="gallery_urls" variant="param" /> are public https links, or add media in <a href="/account/products">My Products</a>. See <a href="/docs/directory-submission">Directory submission overview</a> and <a href="/docs/installation/chrome-extension">Browser extension</a> for the handoff flow.</p>
</Callout>

## Variants and listing summary

**Idempotent variant for a site key:**

```bash
openquok directory:variants:ensure <main-profile-id> --site-key peerpush
```

**Readiness and submission status per destination:**

```bash
openquok directory:listings <profile-id>
```

**Read-only submissions:**

```bash
openquok directory:submissions:list --profile <profile-id>
openquok directory:submissions:list --profile <profile-id> --destination <destination-id>
```

## Directory SEO (analytics)

```bash
openquok directory:analytics:overview --profile <profile-id>
openquok directory:analytics:history --profile <profile-id> -d 90
openquok directory:analytics:refresh --profile <profile-id>
```

| Flag | Description |
| --- | --- |
| <Badge text="--profile" variant="param" /> | <Badge text="productProfileId" variant="param" /> query or body field |
| <Badge text="-d" variant="param" /> <Badge text="--days" variant="param" /> | History window: integer <Badge text="1" variant="param" />–<Badge text="366" variant="param" /> (default <Badge text="90" variant="param" />) |
| <Badge text="--force" variant="param" /> | Optional force refresh when the plan allows it |

**Competitors (workspace-scoped):**

```bash
openquok directory:analytics:competitors:add --domain rival.example --label "Rival Co"
openquok directory:analytics:competitors:update --domain rival.example --label "Rival (EU)"
openquok directory:analytics:competitors:remove --domain rival.example
```

## Example workflow

```bash
openquok directory:profiles:list --main-only | jq '.data[0].id'
openquok directory:variants:ensure <main-profile-id> --site-key peerpush
openquok directory:listings <main-profile-id> | jq '.data.destinations[] | {providerSlug, readiness}'
openquok directory:analytics:overview --profile <main-profile-id> | jq '.data.productDomain.checkedAt'
```

## Related

<CardGrid>
<LinkCard title="Directory launch APIs" description="REST reference for profiles, variants, and listing summary" href="/docs/apis-directory-launch" />
<LinkCard title="Directory SEO APIs" description="Overview, history, refresh, and competitors" href="/docs/apis-directory-seo" />
<LinkCard title="CLI Examples — PeerPush" description="PeerPush-oriented directory launch recipes" href="/docs/cli-examples/peerpush" />
<LinkCard title="CLI Examples — Uneed" description="Uneed-oriented directory launch recipes" href="/docs/cli-examples/uneed" />
<LinkCard title="Public API overview" description="Auth and plan capabilities for programmatic access" href="/docs/getting-started-for-public-api" />
</CardGrid>

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
openquok directory:destinations:list | jq '.data[] | select(.providerSlug | startswith("uneed"))'
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
openquok directory:listings "$MAIN_ID" | jq '.data.destinations[] | select(.providerSlug | startswith("uneed")) | {destinationName, submissionStatus, readiness}'
```

## Profile fields wired to autofill

<Callout type="tip" title="Same paths as the extension">
<p><Badge text="directory:listings" variant="default" /> readiness gaps use the same <Badge text="profilePath" variant="param" /> keys as <Badge text="DIRECTORY_EXTENSION_CONFIG_FIXTURES" variant="param" /> in <Badge text="common/src/auto-launch/destination-configs/" variant="path" />. Patch the <strong>variant</strong> id from <Badge text="directory:variants:ensure" variant="default" /> when JSON lists missing fields.</p>
</Callout>

### Mapped `profilePath` values (all variants on this site)

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.acquisition_listed" variant="path" />
<Badge text="profile_data.asking_price_usd" variant="path" />
<Badge text="profile_data.category" variant="path" />
<Badge text="profile_data.gallery_urls" variant="path" />
<Badge text="profile_data.included_assets" variant="path" />
<Badge text="profile_data.is_open_source" variant="path" />
<Badge text="profile_data.launch_date" variant="path" />
<Badge text="profile_data.launch_video_url" variant="path" />
<Badge text="profile_data.monthly_profit_usd" variant="path" />
<Badge text="profile_data.monthly_revenue_usd" variant="path" />
<Badge text="profile_data.paid_tier_note" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.repository_url" variant="path" />
<Badge text="profile_data.selling_reason" variant="path" />
<Badge text="profile_data.slug" variant="path" />
<Badge text="profile_data.social_bluesky" variant="path" />
<Badge text="profile_data.social_facebook" variant="path" />
<Badge text="profile_data.social_github" variant="path" />
<Badge text="profile_data.social_instagram" variant="path" />
<Badge text="profile_data.social_linkedin" variant="path" />
<Badge text="profile_data.social_tiktok" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.social_youtube" variant="path" />
<Badge text="profile_data.tags" variant="path" />
<Badge text="profile_data.ttm_profit_usd" variant="path" />
<Badge text="profile_data.ttm_revenue_usd" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

### By provider slug

<p>Use <Badge text="providerSlug" variant="param" /> on <Badge text="directory:listings" variant="default" /> rows when you prepare a specific variant — field requirements can differ per form.</p>

#### <Badge text="uneed-join-line" variant="default" />

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.acquisition_listed" variant="path" />
<Badge text="profile_data.asking_price_usd" variant="path" />
<Badge text="profile_data.category" variant="path" />
<Badge text="profile_data.gallery_urls" variant="path" />
<Badge text="profile_data.included_assets" variant="path" />
<Badge text="profile_data.is_open_source" variant="path" />
<Badge text="profile_data.launch_video_url" variant="path" />
<Badge text="profile_data.monthly_profit_usd" variant="path" />
<Badge text="profile_data.monthly_revenue_usd" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.repository_url" variant="path" />
<Badge text="profile_data.selling_reason" variant="path" />
<Badge text="profile_data.slug" variant="path" />
<Badge text="profile_data.social_bluesky" variant="path" />
<Badge text="profile_data.social_facebook" variant="path" />
<Badge text="profile_data.social_github" variant="path" />
<Badge text="profile_data.social_instagram" variant="path" />
<Badge text="profile_data.social_linkedin" variant="path" />
<Badge text="profile_data.social_tiktok" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.social_youtube" variant="path" />
<Badge text="profile_data.tags" variant="path" />
<Badge text="profile_data.ttm_profit_usd" variant="path" />
<Badge text="profile_data.ttm_revenue_usd" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

#### <Badge text="uneed-maker-profile" variant="default" />

<Badge text="name" variant="path" />
<Badge text="profile_data.social_bluesky" variant="path" />
<Badge text="profile_data.social_facebook" variant="path" />
<Badge text="profile_data.social_github" variant="path" />
<Badge text="profile_data.social_instagram" variant="path" />
<Badge text="profile_data.social_linkedin" variant="path" />
<Badge text="profile_data.social_tiktok" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.social_youtube" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

#### <Badge text="uneed-paid-launch" variant="default" />

<Badge text="description" variant="path" />
<Badge text="logo_url" variant="path" />
<Badge text="name" variant="path" />
<Badge text="profile_data.acquisition_listed" variant="path" />
<Badge text="profile_data.asking_price_usd" variant="path" />
<Badge text="profile_data.category" variant="path" />
<Badge text="profile_data.gallery_urls" variant="path" />
<Badge text="profile_data.included_assets" variant="path" />
<Badge text="profile_data.is_open_source" variant="path" />
<Badge text="profile_data.launch_date" variant="path" />
<Badge text="profile_data.launch_video_url" variant="path" />
<Badge text="profile_data.monthly_profit_usd" variant="path" />
<Badge text="profile_data.monthly_revenue_usd" variant="path" />
<Badge text="profile_data.paid_tier_note" variant="path" />
<Badge text="profile_data.pricing_type" variant="path" />
<Badge text="profile_data.repository_url" variant="path" />
<Badge text="profile_data.selling_reason" variant="path" />
<Badge text="profile_data.slug" variant="path" />
<Badge text="profile_data.social_bluesky" variant="path" />
<Badge text="profile_data.social_facebook" variant="path" />
<Badge text="profile_data.social_github" variant="path" />
<Badge text="profile_data.social_instagram" variant="path" />
<Badge text="profile_data.social_linkedin" variant="path" />
<Badge text="profile_data.social_tiktok" variant="path" />
<Badge text="profile_data.social_x" variant="path" />
<Badge text="profile_data.social_youtube" variant="path" />
<Badge text="profile_data.tags" variant="path" />
<Badge text="profile_data.ttm_profit_usd" variant="path" />
<Badge text="profile_data.ttm_revenue_usd" variant="path" />
<Badge text="tagline" variant="path" />
<Badge text="website_url" variant="path" />

Full operator context: <a href="/docs/directory-integration/uneed">Uneed directory integration</a>.

### Example `directory:profiles:update` patch

Use after <Badge text="directory:variants:ensure" variant="default" /> when readiness lists missing discovery or media fields:

```json
{
  "tagline": "Short tagline for Uneed (max 80 characters)",
  "profile_data": {
    "tags": [
      "SaaS",
      "Productivity",
      "AI"
    ],
    "pricing_type": "freemium",
    "launch_date": "2026-12-01",
    "gallery_urls": [
      "https://cdn.example.com/uneed-1.png",
      "https://cdn.example.com/uneed-2.png",
      "https://cdn.example.com/uneed-3.png"
    ],
    "social_x": "https://x.com/example"
  }
}
```

<Callout type="note" title="Manual on Uneed">
<p>Join-the-line timing, paid slot checkout, maker-profile-only fields, and final submit stay on uneed.best. Tagline on Uneed is capped at 80 characters (`BUSINESS_PROFILE_DIRECTORY_TAGLINE_MAX`).</p>
</Callout>

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
openquok directory:listings "$MAIN_ID" | jq '.data.destinations[] | select(.providerSlug | startswith("uneed"))'
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

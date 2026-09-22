---
title: LinkedIn Page Settings
description: OpenQuok public API provider settings for LinkedIn company Pages — same carousel and plug shape as personal LinkedIn, with Page analytics.
order: 4
lastUpdated: 2026-09-14
sidebar:
  label: LinkedIn Page Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="linkedin-page" variant="default" /> |
| Connect | <Badge text="GET /api/v1/public/social/linkedin-page" variant="path" /> (+ Page picker) |
| Setup guide | <a href="/docs/social-integration/linkedin-page">LinkedIn Page</a> |
| Character cap | **3,000** |
| Main-post media | Text-only OK; one video <strong>or</strong> image carousel (**≥2** images, no video) |
| Analytics | Account and per-post insights via <Badge text="GET /api/v1/analytics/:integrationId" variant="path" /> |

<Callout type="note">
<p><Badge text="linkedin-page" variant="default" /> uses the <strong>same</strong> <Badge text="providerSettingsByIntegrationId" variant="param" /> shape as personal <Badge text="linkedin" variant="default" /> — including the <Badge text="linkedin" variant="default" /> nested bucket for follow-ups and cross-account plugs. Field tables and JSON examples live on <a href="/docs/public-api-providers/linkedin">LinkedIn Settings</a>; this page covers Page-specific connect and analytics.</p>
</Callout>

## Settings on create post

| Flat CLI / API key | Nested composer bucket | Purpose |
| --- | --- | --- |
| <Badge text="post_as_images_carousel" variant="param" /> | <Badge text="linkedin.postAsImagesCarousel" variant="param" /> | Image → PDF document carousel |
| <Badge text="carousel_name" variant="param" /> | <Badge text="linkedin.carouselName" variant="param" /> | PDF title |
| — | <Badge text="linkedin.replies" variant="param" /> | Text follow-up comments |
| — | <Badge text="linkedin.crossAccountPlugs" variant="param" /> | Cross-account comment or reshare |

```json
{
  "providerSettingsByIntegrationId": {
    "<linkedin-page-integration-id>": {
      "linkedin": {
        "postAsImagesCarousel": true,
        "carouselName": "Q2 update",
        "replies": [
          { "message": "Questions? Drop them in the comments.", "delaySeconds": 120 }
        ]
      }
    }
  }
}
```

## Field reference

See <a href="/docs/public-api-providers/linkedin#field-reference">LinkedIn Settings → Field reference</a> for the full table. Page posts accept the same keys; follow-up comments remain **text only**.

## Follow-up comments

Use <Badge text="linkedin.replies" variant="param" /> on the Page channel UUID — the bucket name is <Badge text="linkedin" variant="default" />, not <Badge text="linkedin-page" variant="default" />.

## Cross-account plugs

| Plug id | Action |
| --- | --- |
| <Badge text="linkedin-add-comment" variant="param" /> | Comment from other LinkedIn channels |
| <Badge text="linkedin-repost-post-users" variant="param" /> | Reshare from other LinkedIn channels |

See <a href="/docs/public-api-providers/linkedin#cross-account-plugs">LinkedIn Settings → Cross-account plugs</a> and <a href="/docs/automations/cross-account-plugs">Cross-account plugs</a>.

## Complete example

Page document carousel:

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Our Q2 product slides — swipe through the deck.",
    "scheduledAt": "2026-06-22T10:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<linkedin-page-integration-id>"],
    "isGlobal": true,
    "media": [
      { "id": "slide-1", "path": "FILE_PATH_FROM_UPLOAD_1" },
      { "id": "slide-2", "path": "FILE_PATH_FROM_UPLOAD_2" }
    ],
    "providerSettingsByIntegrationId": {
      "<linkedin-page-integration-id>": {
        "linkedin": {
          "postAsImagesCarousel": true,
          "carouselName": "Q2 update"
        }
      }
    }
  }'
```

After publish, fetch Page insights with <Badge text="GET /api/v1/analytics/&lt;integration-id&gt;" variant="path" /> (see <a href="/docs/apis-analytics/platform">Platform analytics</a>).

## Related

<CardGrid>
<LinkCard title="LinkedIn Settings" description="Full field table for carousel, replies, and plugs" href="/docs/public-api-providers/linkedin" />
<LinkCard title="Provider settings overview" description="Hub catalog and authentication" href="/docs/public-api-providers" />
<LinkCard title="LinkedIn CLI examples" description="openquok recipes shared with personal LinkedIn" href="/docs/cli-examples/linkedin" />
<LinkCard title="LinkedIn Page setup" description="Two-step OAuth and Page picker" href="/docs/social-integration/linkedin-page" />
<LinkCard title="Media rules" description="Carousel and media rules" href="/docs/platforms/media-rules" />
<LinkCard title="Analytics APIs" description="Account and post metrics for supported channels" href="/docs/apis-analytics" />
</CardGrid>

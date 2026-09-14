---
title: LinkedIn Settings
description: OpenQuok public API provider settings for personal LinkedIn — image carousel, carousel name, follow-up comments, and cross-account plugs.
order: 3
lastUpdated: 2026-09-14
sidebar:
  label: LinkedIn Settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Quick reference

| Property | Value |
| --- | --- |
| Identifier | <Badge text="linkedin" variant="default" /> |
| Connect | <Badge text="GET /api/v1/public/social/linkedin" variant="path" /> |
| Setup guide | <a href="/docs/social-integration/linkedin">LinkedIn</a> |
| Character cap | **3,000** |
| Main-post media | Text-only OK; one video <strong>or</strong> images — carousel mode needs **≥2 images**, no video |

<Callout type="note">
<p>Personal LinkedIn channels do <strong>not</strong> expose account or post analytics in OpenQuok. For Page insights, connect <Badge text="linkedin-page" variant="default" /> — see <a href="/docs/public-api-providers/linkedin-page">LinkedIn Page Settings</a>.</p>
</Callout>

## Settings on create post

Flat keys merge into <Badge text="providerSettingsByIntegrationId[&lt;integration-id&gt;]" variant="param" />. Follow-ups and cross-account plugs use the <Badge text="linkedin" variant="default" /> bucket (same key for <Badge text="linkedin-page" variant="default" /> integrations).

| Flat CLI / API key | Nested composer bucket | Purpose |
| --- | --- | --- |
| <Badge text="post_as_images_carousel" variant="param" /> | <Badge text="linkedin.postAsImagesCarousel" variant="param" /> | Convert **≥2** images to a PDF document carousel |
| <Badge text="carousel_name" variant="param" /> | <Badge text="linkedin.carouselName" variant="param" /> | Optional PDF title (default <Badge text="slides" variant="default" />) |
| — | <Badge text="linkedin.replies" variant="param" /> | Text follow-up comments after publish |
| — | <Badge text="linkedin.crossAccountPlugs" variant="param" /> | Cross-account comment or reshare |

```json
{
  "providerSettingsByIntegrationId": {
    "<linkedin-integration-id>": {
      "post_as_images_carousel": true,
      "carousel_name": "June deck",
      "linkedin": {
        "replies": [
          { "message": "Swipe through the full deck in the carousel.", "delaySeconds": 60 }
        ],
        "crossAccountPlugs": [
          {
            "plugName": "linkedin-add-comment",
            "enabled": true,
            "delayMs": 60000,
            "integrationIds": ["<other-linkedin-integration-id>"],
            "fields": { "comment": "Great update!" }
          }
        ]
      }
    }
  }
}
```

## Field reference

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| <Badge text="post_as_images_carousel" variant="param" /> / <Badge text="linkedin.postAsImagesCarousel" variant="param" /> | boolean | No | Requires **≥2** images and **no** video on the main post |
| <Badge text="carousel_name" variant="param" /> / <Badge text="linkedin.carouselName" variant="param" /> | string | No | Document carousel title |
| <Badge text="linkedin.replies" variant="param" /> | array | No | Same-account comments on the main post |
| <Badge text="linkedin.replies[].message" variant="param" /> | string | Yes (per row) | Comment text — **no media** on follow-ups |
| <Badge text="linkedin.replies[].delaySeconds" variant="param" /> | number | Yes (per row) | Delay after previous part |
| <Badge text="linkedin.crossAccountPlugs" variant="param" /> | array | No | Comments or reshares from other LinkedIn channels |

## Follow-up comments

LinkedIn follow-ups are **text only** — nest under <Badge text="linkedin.replies" variant="param" />, not <Badge text="threads.replies" variant="param" />. Omit <Badge text="media" variant="param" /> on reply rows.

## Cross-account plugs

| Plug id | Action |
| --- | --- |
| <Badge text="linkedin-add-comment" variant="param" /> | Comment from other LinkedIn channels (<Badge text="fields.comment" variant="param" />) |
| <Badge text="linkedin-repost-post-users" variant="param" /> | Reshare from other LinkedIn channels |

Both <Badge text="linkedin" variant="default" /> and <Badge text="linkedin-page" variant="default" /> publishing channels use the <Badge text="linkedin" variant="default" /> settings bucket. See <a href="/docs/automations/cross-account-plugs">Cross-account plugs</a>.

## Complete example

Document carousel with two images:

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: Bearer opo_your_programmatic_token" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Swipe through our latest slides.",
    "scheduledAt": "2026-06-22T10:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["<linkedin-integration-id>"],
    "isGlobal": true,
    "media": [
      { "id": "slide-1", "path": "FILE_PATH_FROM_UPLOAD_1" },
      { "id": "slide-2", "path": "FILE_PATH_FROM_UPLOAD_2" }
    ],
    "providerSettingsByIntegrationId": {
      "<linkedin-integration-id>": {
        "post_as_images_carousel": true,
        "carousel_name": "June deck"
      }
    }
  }'
```

## Related

<CardGrid>
<LinkCard title="LinkedIn Page Settings" description="Same settings shape — Page connect, analytics, and insights" href="/docs/public-api-providers/linkedin-page" />
<LinkCard title="Provider settings overview" description="Hub catalog and multi-channel examples" href="/docs/public-api-providers" />
<LinkCard title="LinkedIn CLI examples" description="openquok recipes for carousels and follow-up comments" href="/docs/cli-examples/linkedin" />
<LinkCard title="LinkedIn setup" description="OAuth app and redirect URI" href="/docs/social-integration/linkedin" />
<LinkCard title="Cross-account plugs" description="Acting channels and plug catalog ids" href="/docs/automations/cross-account-plugs" />
<LinkCard title="Platform limits" description="Carousel and video rules" href="/docs/platforms" />
</CardGrid>

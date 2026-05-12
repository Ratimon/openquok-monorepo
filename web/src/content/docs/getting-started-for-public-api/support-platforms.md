---
title: Supported platforms
description: Providers Openquok currently supports — Meta Threads and Instagram (Business + Standalone) — plus the per-channel settings shape.
order: 1
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Openquok currently ships with **3 social provider integrations** behind a single create-post API. Unlike some other social schedulers, our post payload does **not** carry a `__type` discriminator on each post — instead, every integration UUID inside `integrationIds` already identifies its provider, and any per-channel tuning lives under `providerSettingsByIntegrationId` keyed by that same UUID. The provider's short identifier is only used at OAuth start time, when you tell <a href="/docs/apis-integrations/connect">Connect Channel</a> *which* platform to authorize.

## Providers (3 total)

| Provider | Identifier | OAuth start route | Setup guide |
| --- | --- | --- | --- |
| Meta Threads | <Badge text="threads" variant="default" /> | <Badge text="GET /api/v1/public/social/threads" variant="default" /> | <a href="/docs/social-integration/threads">Threads</a> |
| Instagram (Business, FB-linked) | <Badge text="instagram-business" variant="default" /> | <Badge text="GET /api/v1/public/social/instagram-business" variant="default" /> | <a href="/docs/social-integration/instagram">Instagram</a> |
| Instagram (Standalone, IG Login) | <Badge text="instagram-standalone" variant="default" /> | <Badge text="GET /api/v1/public/social/instagram-standalone" variant="default" /> | <a href="/docs/social-integration/instagram">Instagram</a> |

The **Identifier** column matches the `:integration` path parameter on <a href="/docs/apis-integrations/connect">Connect Channel (OAuth)</a> and the `identifier` field returned by <a href="/docs/apis-integrations/integration-settings">Channel settings &amp; tools</a> for each connected channel. When you reference a channel inside a post payload, use the channel's **UUID** — not its short identifier — in `integrationIds` and as the keys of `providerSettingsByIntegrationId`.

<Callout type="note" title="More providers will land in the same shape">
<p>The provider catalog is sourced from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/integrations/integrationManager.ts"><Badge text="backend/integrations/integrationManager.ts" variant="path" /></DocsExternalLink>. Re-fetching <Badge text="GET /api/v1/public/integrations" variant="default" /> is the safest way to see what's available in any given Openquok deployment.</p>
</Callout>

## Per-channel settings

`providerSettingsByIntegrationId` is a JSON map keyed by integration UUID. Each value is an object whose shape depends on the provider behind that channel.

To make it easy to scan what each platform needs — and to keep this page maintainable as we add more providers — the rest of this section splits providers into two groups: those that **need** provider-specific fields, and those that don't. When a new provider ships, add a row to whichever table it belongs in (and an `####` field reference below if it has custom settings) — no new tabs, no per-provider sub-pages.

### Platforms with custom settings (2)

These providers accept (or require) a per-channel `providerSettingsByIntegrationId[<channel-uuid>]` object with provider-specific fields:

| Platform | Identifier | Key settings |
| --- | --- | --- |
| Instagram (Business, FB-linked) | <Badge text="instagram-business" variant="default" /> | `post_type`, `collaborators`, `is_trial_reel`, `graduation_strategy` |
| Instagram (Standalone, IG Login) | <Badge text="instagram-standalone" variant="default" /> | `post_type`, `collaborators`, `is_trial_reel`, `graduation_strategy` |

#### Instagram (Business + Standalone)

Both Instagram variants accept the **same** per-channel settings; pick the variant that matches how the channel was originally connected.

| Field | Type | Notes |
| --- | --- | --- |
| `post_type` | string | Set to `"story"` to publish as a Stories item. Omit (or any other value) for a regular feed post / reel. |
| `is_trial_reel` | boolean | When `true`, the upload is created as a Trial Reel (videos only). |
| `graduation_strategy` | string | Used only with `is_trial_reel: true`. Defaults to `"MANUAL"`. |
| `collaborators` | array of objects | IG usernames invited as collaborators (feed posts and reels only — **not** stories). Each item carries a `label` (string) field with the username. |

Instagram requires **at least one** image or video for any post with `status: "scheduled"` — see <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/integrations/providers/instagramStandaloneProvider.ts"><Badge text="instagramStandaloneProvider.ts" variant="path" /></DocsExternalLink>. Captions are capped at <Badge text="2200 chars" variant="default" />.

### Platforms without custom settings (1)

These providers don't need a `providerSettingsByIntegrationId` entry — just include the channel UUID in `integrationIds` and send a top-level `body` (plus optional `media`):

| Platform | Identifier |
| --- | --- |
| Meta Threads | <Badge text="threads" variant="default" /> |

Threads is hard-capped at <Badge text="500 chars" variant="default" /> per item — see <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/integrations/providers/threadsProvider.ts"><Badge text="backend/integrations/providers/threadsProvider.ts" variant="path" /></DocsExternalLink>.

### Cross-provider features

Some optional features apply across **multiple** providers without being a "platform setting" of any one of them. They live on the same `providerSettingsByIntegrationId[<channel-uuid>]` object, but their shape is the same wherever they're supported.

#### Follow-up replies

Both Threads and Instagram support an optional **follow-up reply / comment** chain that is posted from the same channel after the original goes live. The bucket key on `providerSettingsByIntegrationId[<channel-uuid>]` differs per platform, but the item shape is identical (see <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/posts/CreateSocialPost.presenter.svelte.ts"><Badge text="CreateSocialPost.presenter.svelte.ts" variant="path" /></DocsExternalLink>).

| Provider | Bucket key | Item shape |
| --- | --- | --- |
| Meta Threads | `threads.replies` | array of objects with `message` (string) and `delaySeconds` (number) — replies on the original thread |
| Instagram (Business + Standalone) | `instagram.replies` | array of objects with `message` (string) and `delaySeconds` (number) — comments threaded under the published media |

See [Schedule a Threads post with a follow-up reply](#schedule-a-threads-post-with-a-follow-up-reply) below for the exact JSON.

<Callout type="note" title="Discover the exact shape with the Payload Wizard">
<p>Rather than memorizing field names, fill out a real post in the <a href="/account/payload-wizard">Payload Wizard</a>, click <strong>Copy scheduled payload</strong>, and inspect the <code>providerSettingsByIntegrationId</code> object — it is always the source of truth for what the backend currently accepts (and the cleanest way to spot the difference between platform-specific settings and cross-provider features like follow-up replies).</p>
</Callout>

## Quick examples

All examples target <Badge text="POST /api/v1/public/posts" variant="default" />, sent with the <Badge text="Authorization" variant="default" /> header described in <a href="/docs/getting-started-for-public-api#authentication">Authentication</a>. Replace each `YOUR_..._UUID` placeholder with a real channel UUID from <Badge text="GET /api/v1/public/integrations" variant="default" />.

### Schedule a text post to Threads

```bash
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: opo_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Hello from the Openquok API!",
    "scheduledAt": "2026-05-15T10:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["YOUR_THREADS_CHANNEL_UUID"],
    "isGlobal": true
  }'
```

### Upload an image and post it to Instagram

Instagram needs publicly reachable media, so first upload through <Badge text="POST /api/v1/public/upload" variant="default" /> and reuse the returned `filePath` in the `media` array of the post call.

```bash
# 1) Upload the image (multipart field name: file)
curl -X POST https://api.openquok.com/api/v1/public/upload \
  -H "Authorization: opo_your_api_key" \
  -F "file=@photo.jpg"

# Response:
# {
#   "success": true,
#   "data": { "id": "img-123", "filePath": "...", "publicUrl": "..." },
#   "message": "Media uploaded successfully"
# }

# 2) Schedule a feed post that references the upload
curl -X POST https://api.openquok.com/api/v1/public/posts \
  -H "Authorization: opo_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Beautiful sunset 🌅 #photography",
    "scheduledAt": "2026-05-15T18:00:00.000Z",
    "status": "scheduled",
    "integrationIds": ["YOUR_INSTAGRAM_CHANNEL_UUID"],
    "isGlobal": true,
    "media": [{ "id": "img-123", "path": "FILE_PATH_FROM_UPLOAD" }]
  }'
```

### Publish an Instagram story with collaborators

```json
{
  "body": "",
  "scheduledAt": "2026-05-15T18:00:00.000Z",
  "status": "scheduled",
  "integrationIds": ["YOUR_INSTAGRAM_CHANNEL_UUID"],
  "isGlobal": true,
  "media": [{ "id": "img-123", "path": "FILE_PATH_FROM_UPLOAD" }],
  "providerSettingsByIntegrationId": {
    "YOUR_INSTAGRAM_CHANNEL_UUID": {
      "post_type": "story",
      "collaborators": [{ "label": "openquok" }]
    }
  }
}
```

### Multi-channel post with per-channel body override

```json
{
  "body": "Same announcement everywhere.",
  "bodiesByIntegrationId": {
    "YOUR_INSTAGRAM_CHANNEL_UUID": "Same announcement everywhere — but with #hashtags for the gram"
  },
  "scheduledAt": "2026-05-15T18:00:00.000Z",
  "status": "scheduled",
  "integrationIds": ["YOUR_THREADS_CHANNEL_UUID", "YOUR_INSTAGRAM_CHANNEL_UUID"],
  "isGlobal": false
}
```

When `isGlobal` is `false`, channels listed in `bodiesByIntegrationId` use their override; the rest fall back to the top-level `body`.

### Schedule a Threads post with a follow-up reply

```json
{
  "body": "Big thread incoming 🧵",
  "scheduledAt": "2026-05-15T10:00:00.000Z",
  "status": "scheduled",
  "integrationIds": ["YOUR_THREADS_CHANNEL_UUID"],
  "isGlobal": true,
  "providerSettingsByIntegrationId": {
    "YOUR_THREADS_CHANNEL_UUID": {
      "threads": {
        "replies": [
          { "message": "1/ here is the actual hot take", "delaySeconds": 60 },
          { "message": "2/ and here is the receipt", "delaySeconds": 300 }
        ]
      }
    }
  }
}
```

## Related Section(s)

<CardGrid>
<LinkCard title="Public API Overview" description="Authentication, base URL, rate limits, and the Payload Wizard" href="/docs/getting-started-for-public-api" />
<LinkCard title="Integrations APIs" description="Connect / inspect / trigger endpoints around connected channels" href="/docs/apis-integrations" />
<LinkCard title="Social integration" description="Backend env vars and Meta dashboard setup for each provider" href="/docs/social-integration" />
</CardGrid>

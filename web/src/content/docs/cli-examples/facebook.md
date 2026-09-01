---
title: Facebook Page
description: CLI examples for Facebook Page publishing in OpenQuok
order: 1
lastUpdated: 2026-09-01
---

<script>
import { Badge, Callout } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Text-only Page post

```bash
openquok posts:create \
  -c "Hello from our Page" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>"
```

## With image

At publish time the backend resolves each stored object key to a public <Badge text="https://" variant="new" /> URL for Meta to fetch.

```bash
test -f ./hero.jpg && test -s ./hero.jpg
IMAGE=$(openquok upload ./hero.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Photo update" \
  -m "$IMAGE" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>"
```

## Link post

Pass an optional URL in <Badge text="providerSettingsByIntegrationId" variant="param" />:

```bash
openquok posts:create \
  -c "Read more on our site" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>" \
  --providerSettingsByIntegrationId '{"<facebook-page-integration-id>":{"url":"https://example.com/article"}}'
```

## Multi-photo carousel

```bash
MEDIA=$(jq -s 'add' \
  <(openquok upload ./a.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]') \
  <(openquok upload ./b.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]'))
openquok posts:create \
  -c "Two photos, one post" \
  -m "$MEDIA" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>"
```

## Story (image or MP4)

Stories require at least one attachment. Set <Badge text="post_type: story" variant="param" /> on <Badge text="--settings" variant="param" /> or inside <Badge text="providerSettingsByIntegrationId" variant="param" />. Each attachment publishes as its own Story.

```bash
test -f ./story.jpg && test -s ./story.jpg
MEDIA=$(openquok upload ./story.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "" \
  -m "$MEDIA" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>" \
  --settings '{"post_type":"story"}'
```

Nested web-composer bucket (same behavior):

```bash
openquok posts:create \
  -c "" \
  -m "$MEDIA" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>" \
  --providerSettingsByIntegrationId '{"<facebook-page-integration-id>":{"facebook":{"postType":"story"}}}'
```

<Callout type="note" title="Stories vs feed posts">
<p>Link <Badge text="url" variant="param" /> and follow-up <Badge text="facebook.replies" variant="param" /> apply to feed posts only. For Stories, omit both.</p>
</Callout>

## Scheduled follow-up comments

<Badge text="providerSettings.facebook.replies[]" variant="param" /> carries follow-up replies that publish as comments on the Page post after a fixed delay. Pass them on <Badge text="posts:create" variant="default" /> with <Badge text="--providerSettingsByIntegrationId" variant="param" />:

```bash
openquok posts:create \
  -c "Main post" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "<facebook-page-integration-id>" '
    {
      ($id): {
        facebook: {
          replies: [
            { message: "First comment on the post", delaySeconds: 60 }
          ]
        }
      }
    }
  ')"
```

### Follow-up with one image

Upload first, then attach at most one image per reply row (no video):

```bash
REPLY_MEDIA=$(openquok upload ./comment-image.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -c "Main post" \
  -s "2026-01-01T12:00:00Z" \
  -i "<facebook-page-integration-id>" \
  --providerSettingsByIntegrationId "$(jq -nc \
    --arg id "<facebook-page-integration-id>" \
    --argjson media "$REPLY_MEDIA" '
    {
      ($id): {
        facebook: {
          replies: [
            { message: "See the chart in this comment", delaySeconds: 60, media: $media }
          ]
        }
      }
    }
  ')"
```

<Callout type="note" title="Follow-up media limits">
<p>Each reply supports at most <strong>one image</strong> — no video. Omit <Badge text="media" variant="param" /> for text-only comments.</p>
</Callout>

## Resolve integration UUID

```bash
FB_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="facebook") | .id')
openquok integrations:settings "$FB_ID"
openquok analytics:platform "$FB_ID" -d 30
```

## Platform-specific settings

Configure per integration in the web composer **Settings** panel, or pass flat keys on the CLI with <Badge text="--settings" variant="param" /> (merged into <Badge text="providerSettingsByIntegrationId" variant="param" />).

| Setting | CLI / API key | Web composer (`facebook.*`) | Values |
| --- | --- | --- | --- |
| Post type | `post_type` | `postType` | `post` (feed/Reel) or `story` |
| Link preview URL | `url` | `url` | `https://…` (text-only feed posts) |
| Follow-up comments | `replies` (nested under `facebook`) | `replies` | `[{ "message": "…", "delaySeconds": 60 }]` (feed posts only) |

<Callout type="note" title="App mode">
If media posts appear without images for non-testers, set your Meta app to <strong>Live</strong> mode. See <a href="/docs/social-integration/facebook#troubleshooting">Facebook troubleshooting</a>.
</Callout>

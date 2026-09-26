---
title: Bluesky
description: OpenQuok CLI examples for Bluesky — text, images, video, and follow-up replies with an app-password channel.
order: 11
lastUpdated: 2026-09-26
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="bluesky" variant="default" /> |
| Max content length | **300** graphemes (main post and each follow-up) |
| Required attachments | None — text-only posts publish |
| Connect | Dashboard app password — <a href="/docs/social-integration/bluesky">Bluesky setup</a> |

```bash
BLUESKY_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="bluesky") | .id')
```

## Simple text post

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Hello from OpenQuok on Bluesky." \
  -i "$BLUESKY_ID"
```

## Post with images

Up to four images per post. Upload each file, then pass the media array:

```bash
MEDIA=$(openquok upload ./photo-a.png ./photo-b.png | jq -c '[.data | {id, path: (.path // .filePath)}]')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Two photos in one post." \
  -i "$BLUESKY_ID" \
  -m "$MEDIA"
```

## Post with video

One MP4 per post — do not attach images in the same post.

```bash
MEDIA=$(openquok upload ./clip.mp4 | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Short video update." \
  -i "$BLUESKY_ID" \
  -m "$MEDIA"
```

<Callout type="note">
<p>Bluesky caps scheduled text at <strong>300</strong> graphemes for the main <Badge text="-c" variant="param" /> caption and each <Badge text="bluesky.replies[].message" variant="param" /> row. Use <Badge text="-t draft" variant="param" /> to store longer copy until you shorten it.</p>
</Callout>

## Follow-up reply

<Badge text="bluesky.replies" variant="param" /> carries same-account replies after the main post publishes:

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Part one of the update." \
  -i "$BLUESKY_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$BLUESKY_ID" '
    {
      ($id): {
        bluesky: {
          replies: [
            { id: "reply-1", message: "Part two — details below.", delaySeconds: 300 }
          ]
        }
      }
    }
  ')"
```

### Follow-up with media

Upload attachments first, then nest <Badge text="media" variant="param" /> on the matching reply row:

```bash
REPLY_MEDIA=$(openquok upload ./reply-image.png | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Launch post." \
  -i "$BLUESKY_ID" \
  --providerSettingsByIntegrationId "$(jq -nc \
    --arg id "$BLUESKY_ID" \
    --argjson media "$REPLY_MEDIA" '
    {
      ($id): {
        bluesky: {
          replies: [
            { id: "reply-1", message: "Screenshot attached.", delaySeconds: 60, media: $media }
          ]
        }
      }
    }
  ')"
```

## JSON file examples

Agent-ready payloads live in the OpenQuok Core skill:

```bash
openquok posts:create --json ./examples/bluesky-text-only.json
```

See <a href="/docs/public-api-providers/bluesky">Bluesky Settings</a> for the full <Badge text="bluesky.replies" variant="param" /> field table.

## Related

<CardGrid>
<LinkCard title="Bluesky setup" description="App password and service URL in Add Channel" href="/docs/social-integration/bluesky" />
<LinkCard title="Threads and comments" description="Follow-up comments in the composer" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="Media rules" description="Image count and video limits" href="/docs/platforms/media-rules" />
<LinkCard title="CLI Usage" description="posts:create flags and conventions" href="/docs/cli-usages/managing-posts" />
</CardGrid>

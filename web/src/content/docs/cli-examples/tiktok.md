---
title: TikTok
description: CLI examples for TikTok publishing in Openquok
order: 5
lastUpdated: 2026-06-16
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="tiktok" variant="default" /> |
| Max caption length | 2,000 characters (<Badge text="-c" variant="param" /> body) |
| Required attachments | Either **one** video or **one+** images (no mixing) |
| OAuth setup | <a href="/docs/social-integration/tiktok">TikTok</a> |

```bash
TIKTOK_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="tiktok") | .id')
```

## Video with privacy + DIRECT_POST

```bash
test -f ./clip.mp4 && test -s ./clip.mp4
VIDEO=$(openquok upload ./clip.mp4 | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -c "Vertical clip — scheduled from the CLI." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TIKTOK_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TIKTOK_ID" '
    {
      ($id): {
        privacy_level: "PUBLIC_TO_EVERYONE",
        content_posting_method: "DIRECT_POST",
        comment: true,
        duet: false,
        stitch: false
      }
    }
  ')"
```

## Photo carousel with title

TikTok photo posts support a separate short title field (often capped around 90 characters). Upload one or more images and pass them as media:

```bash
MEDIA=$(jq -s 'add' \
  <(openquok upload ./a.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]') \
  <(openquok upload ./b.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]'))

openquok posts:create \
  -c "Carousel caption — links in bio." \
  -m "$MEDIA" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TIKTOK_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TIKTOK_ID" '
    {
      ($id): {
        title: "A short photo title",
        privacy_level: "PUBLIC_TO_EVERYONE",
        content_posting_method: "DIRECT_POST"
      }
    }
  ')"
```

## UPLOAD (send to user inbox)

When you set <Badge text="content_posting_method=UPLOAD" variant="param" />, TikTok can return a status that indicates the post was sent to the user inbox for final action.

```bash
openquok posts:create \
  -c "Send to inbox instead of direct publish." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TIKTOK_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TIKTOK_ID" '
    { ($id): { privacy_level: "PUBLIC_TO_EVERYONE", content_posting_method: "UPLOAD" } }
  ')"
```

## Platform analytics

```bash
openquok analytics:platform "$TIKTOK_ID" -d 30
```

## Post insights

```bash
POST_ID=$(openquok posts:list | jq -r '.items[] | select(.identifier=="tiktok") | .id' | head -1)
openquok analytics:post "$POST_ID" -d 7
```

Returns views, likes, comments, and shares when the post row has a linked TikTok video id. Inbox uploads store <Badge text="releaseId=missing" variant="param" /> until you connect the live id — see <a href="/docs/cli-usages/managing-posts#connecting-missing-posts">Connecting missing posts</a>.

## Missing release id (inbox uploads)

```bash
POST_ID=$(openquok posts:list | jq -r '.items[] | select(.identifier=="tiktok" and .releaseId=="missing") | .id' | head -1)
openquok posts:missing "$POST_ID" | jq '.data.items[] | {id, url}'
openquok posts:connect "$POST_ID" -r "<tiktok-video-id>"
```

<Callout type="warning" title="Media must be publicly fetchable (HTTPS)">
<p>TikTok publishes by pulling media from a public HTTPS URL. If publish fails with media URL errors, verify your storage public base URL and TikTok domain verification. See <a href="/docs/social-integration/tiktok">TikTok setup</a>.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="TikTok setup" description="TikTok developer app, OAuth redirect URI, scopes, and media domain verification" href="/docs/social-integration/tiktok" />
<LinkCard title="Managing Posts" description="Create, list, and schedule posts with the full flag reference" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Media Upload" description="Upload from disk or mirror a public URL before attaching media" href="/docs/cli-usages/media-upload" />
<LinkCard title="Analytics" description="Review channel and post performance after content goes live" href="/docs/cli-usages/analytics" />
</CardGrid>


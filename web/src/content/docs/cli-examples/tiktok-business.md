---
title: TikTok (Business)
description: CLI examples for TikTok Business publishing in the OpenQuok social scheduler — custom covers, commercial audio, and inbox upload.
order: 6
lastUpdated: 2026-09-01
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="tiktok-business" variant="default" /> |
| Max caption length | 2,200 characters (<Badge text="-c" variant="param" /> body) |
| Required attachments | Either **one** video or **one+** images (no mixing) |
| OAuth setup | <a href="/docs/social-integration/tiktok-business">TikTok (Business)</a> |

```bash
TIKTOK_BUSINESS_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="tiktok-business") | .id')
```

<Callout type="note">
<p>This is a <strong>separate</strong> channel from Content API TikTok (<Badge text="tiktok" variant="default" />). Do not reuse a Content API integration UUID here. Before you schedule carousels or post at volume, warm the account <strong>7–14 days</strong>: <a href="/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience">How to warm up a TikTok account to reach a US audience</a>.</p>
</Callout>

## Video with DIRECT_POST and optional audio

Video posts follow the connected account’s default privacy. Do not send <Badge text="privacy_level" variant="param" /> on Business videos.

```bash
test -f ./clip.mp4 && test -s ./clip.mp4
VIDEO=$(openquok upload ./clip.mp4 | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -c "Vertical clip — scheduled from the CLI." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TIKTOK_BUSINESS_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TIKTOK_BUSINESS_ID" '
    {
      ($id): {
        content_posting_method: "DIRECT_POST",
        comment: true,
        duet: false,
        stitch: false,
        music_sound_id: "<music-sound-id>"
      }
    }
  ')"
```

A stored video poster on the first media item is sent as a public cover URL. If you only set a frame timestamp in Media details, OpenQuok sends that offset instead.

## Photo carousel with title

Photo posts support a short title (often capped around 90 characters) and can set privacy on direct post.

```bash
MEDIA=$(jq -s 'add' \
  <(openquok upload ./a.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]') \
  <(openquok upload ./b.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]'))

openquok posts:create \
  -c "Carousel caption — links in bio." \
  -m "$MEDIA" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TIKTOK_BUSINESS_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TIKTOK_BUSINESS_ID" '
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

When you set <Badge text="content_posting_method=UPLOAD" variant="param" />, TikTok can return a status that indicates the post was sent to the user inbox for final action. Commercial audio and location apply to **direct** posts only.

```bash
openquok posts:create \
  -c "Send to inbox instead of direct publish." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TIKTOK_BUSINESS_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TIKTOK_BUSINESS_ID" '
    { ($id): { content_posting_method: "UPLOAD" } }
  ')"
```

## Missing release id (inbox uploads)

```bash
POST_ID=$(openquok posts:list | jq -r '.items[] | select(.identifier=="tiktok-business" and .releaseId=="missing") | .id' | head -1)
openquok posts:missing "$POST_ID" | jq '.data.items[] | {id, url}'
openquok posts:connect "$POST_ID" -r "<tiktok-video-id>"
```

<Callout type="warning" title="Media must be publicly fetchable (HTTPS)">
<p>TikTok publishes by pulling media from a public HTTPS URL. If publish fails with media URL errors, verify your storage public base URL and domain verification on the <strong>Business</strong> app. See <a href="/docs/social-integration/tiktok-business">TikTok (Business) setup</a>.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="TikTok (Business) setup" description="Marketing API app, trailing-slash OAuth redirect, scopes, and media domain verification" href="/docs/social-integration/tiktok-business" />
<LinkCard title="TikTok (Content API) CLI" description="Frame-timestamp covers and privacy on the Content Posting API channel" href="/docs/cli-examples/tiktok" />
<LinkCard title="Warm up a TikTok account" description="Step-by-step warm-up before scaling posts" href="/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience" />
<LinkCard title="Managing Posts" description="Create, list, and schedule posts with the full flag reference" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Media Upload" description="Upload from disk or mirror a public URL before attaching media" href="/docs/cli-usages/media-upload" />
</CardGrid>

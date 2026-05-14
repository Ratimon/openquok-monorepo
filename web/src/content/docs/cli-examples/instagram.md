---
title: Instagram
description: Openquok CLI examples for Instagram (Business and Standalone) — feed posts, auto-detected reels, carousels, and scheduled reply chains.
order: 2
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Business | Standalone |
| --- | --- | --- |
| Provider identifier | <Badge text="instagram-business" variant="default" /> | <Badge text="instagram-standalone" variant="default" /> |
| Max content length | 2200 characters | 2200 characters |
| Required attachments | At least 1 (rejected at <code>scheduled</code> if missing) | At least 1 |
| Reel / carousel detection | Auto (1 video → Reel, &gt;1 image → carousel) | Auto |
| OAuth setup | <a href="/docs/social-integration/instagram">Instagram</a> | <a href="/docs/social-integration/instagram">Instagram</a> |

Both providers expose the **same CLI surface** — the only difference is which integration id you target. Capture the id from <Badge text="integrations:list" variant="param" />:

```bash
INSTAGRAM_ID=$(openquok integrations:list \
  | jq -r '.[] | select(.identifier | startswith("instagram")) | .id')
```

If you have both variants connected, pin the specific one:

```bash
IG_BUSINESS_ID=$(openquok integrations:list \
  | jq -r '.[] | select(.identifier=="instagram-business") | .id')
IG_STANDALONE_ID=$(openquok integrations:list \
  | jq -r '.[] | select(.identifier=="instagram-standalone") | .id')
```

## Feed image post

Instagram requires at least one attachment, so always upload first:

```bash
MEDIA=$(openquok upload ./photo.jpg | jq -c '[{id: .data.id, path: .data.filePath}]')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Beautiful day! #photography" \
  -i "$INSTAGRAM_ID" \
  -m "$MEDIA"
```

<Callout type="warning" title="Scheduled posts need media">
<p>The Instagram provider rejects <code>scheduled</code> posts with zero attachments at validation time. Save as <Badge text="-t draft" variant="param" /> if you want to compose a caption first and attach the asset later from the web UI.</p>
</Callout>

## Reel (single video)

A single video attachment is automatically published as a Reel:

```bash
MEDIA=$(openquok upload ./reel.mp4 | jq -c '[{id: .data.id, path: .data.filePath}]')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "New reel — drop a 🔥 if you like it!" \
  -i "$INSTAGRAM_ID" \
  -m "$MEDIA"
```

<Callout type="note" title="MP4 only">
<p>The provider routes any media whose URL ends in <code>.mp4</code> through Meta's <Badge text="media_type=REELS" variant="default" /> endpoint. Other video extensions fall back to <Badge text="media_type=VIDEO" variant="default" />. Convert to MP4 server-side (e.g. with <code>ffmpeg</code>) before uploading if you need the Reels surface.</p>
</Callout>

## Carousel (multi-image)

Pass more than one image and the provider publishes a carousel. The single <Badge text="-c" variant="param" /> caption is used for the carousel:

```bash
MEDIA=$(jq -nc \
  --arg id1 "$(openquok upload ./slide1.jpg | jq -r '.data.id')" \
  --arg p1  "$(openquok upload ./slide1.jpg | jq -r '.data.filePath')" \
  --arg id2 "$(openquok upload ./slide2.jpg | jq -r '.data.id')" \
  --arg p2  "$(openquok upload ./slide2.jpg | jq -r '.data.filePath')" \
  --arg id3 "$(openquok upload ./slide3.jpg | jq -r '.data.id')" \
  --arg p3  "$(openquok upload ./slide3.jpg | jq -r '.data.filePath')" \
  '[
    {id: $id1, path: $p1},
    {id: $id2, path: $p2},
    {id: $id3, path: $p3}
  ]')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Three sides of the same story 1/3 → 3/3" \
  -i "$INSTAGRAM_ID" \
  -m "$MEDIA"
```

Or, more idiomatically, loop over a directory and build the JSON in one pass:

```bash
MEDIA=$(for f in ./slides/*.jpg; do
  openquok upload "$f" | jq -c '{id: .data.id, path: .data.filePath}'
done | jq -s .)

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Slides from today's talk" \
  -i "$INSTAGRAM_ID" \
  -m "$MEDIA"
```

## Scheduled reply chain

<Badge text="providerSettings.instagram.replies[]" variant="param" /> carries follow-up replies that publish from the same account after the root post. Pass them on <Badge text="posts:create" variant="param" /> with <Badge text="--providerSettingsByIntegrationId" variant="param" />:

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Caption first, context in the replies 👇" \
  -i "$INSTAGRAM_ID" \
  -m "$MEDIA" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$INSTAGRAM_ID" '
    {
      ($id): {
        instagram: {
          replies: [
            { message: "1/ Why this matters", delaySeconds: 60 },
            { message: "2/ How we built it",  delaySeconds: 180 },
            { message: "3/ What is next",     delaySeconds: 300 }
          ]
        }
      }
    }
  ')"
```

<Callout type="note" title="Reply chain limits">
<p>The provider caps reply chains at 25 entries and silently drops any reply whose <Badge text="message" variant="param" /> is empty after trimming. <Badge text="delaySeconds" variant="param" /> is floored to a non-negative integer; the first reply is gated on the root post's <Badge text="release_id" variant="param" /> resolving (not <Badge text="missing" variant="default" />).</p>
</Callout>

## Cross-post to Threads in a single command

Both providers accept the same <Badge text="-c" variant="param" /> caption and <Badge text="-m" variant="param" /> payload. Pass both integration ids to fan out:

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Same post, two networks" \
  -i "$INSTAGRAM_ID,$THREADS_ID" \
  -m "$MEDIA"
```

Override the caption per channel if Threads needs a shorter version:

```bash
openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Fallback caption" \
  -i "$INSTAGRAM_ID,$THREADS_ID" \
  -m "$MEDIA" \
  --bodiesByIntegrationId "$(jq -nc \
    --arg ig "$INSTAGRAM_ID" \
    --arg th "$THREADS_ID" '
      {
        ($ig): "Long Instagram-only caption with #hashtags and emoji 📸",
        ($th): "Short Threads-only caption."
      }
  ')"
```

## Per-channel analytics

```bash
openquok analytics:platform "$INSTAGRAM_ID" -d 30 \
  | jq '.[] | {label, percentageChange}'
```

```bash
openquok analytics:post <post-id> -d 30 \
  | jq '.[] | {label, latest: .data[-1].total}'
```

## Limitations of the public API today

The Instagram provider supports stories, trial reels, collaborator tags, and graduation strategies, but the corresponding flags (e.g. <Badge text="post_type=story" variant="param" />, <Badge text="is_trial_reel" variant="param" />, <Badge text="collaborators[]" variant="param" />) currently live in the web settings and are **not** writable through the public API. Until they are surfaced as first-class fields on <Badge text="posts:create" variant="param" />:

- **Stories** — schedule from the web UI.
- **Trial reels / collaborators** — same.
- **Reels** — work via the CLI (single MP4 attachment auto-routes to Reels), just not the trial-reel variant.

## Related

<CardGrid>
<LinkCard title="Instagram setup" description="Configure the Meta app, OAuth redirects, scopes, and tester roles for Business or Standalone" href="/docs/social-integration/instagram" />
<LinkCard title="Managing Posts" description="Create, list, and schedule posts with attachments and per-channel overrides" href="/docs/cli-usages/managing-posts" />
<LinkCard title="Media Upload" description="Upload from disk or mirror a public URL before attaching media to a post" href="/docs/cli-usages/media-upload" />
<LinkCard title="Analytics" description="Review channel and post performance after content goes live" href="/docs/cli-usages/analytics" />
</CardGrid>

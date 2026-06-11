---
title: YouTube
description: CLI examples for YouTube video scheduling in Openquok
order: 4
lastUpdated: 2026-06-10
---

<script>
import { Badge, Callout } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Channel quick reference

| Property | Value |
| --- | --- |
| Provider identifier | <Badge text="youtube" variant="default" /> |
| Max description length | 5,000 characters (<Badge text="-c" variant="param" /> body) |
| Required attachments | Exactly **one** <Badge text=".mp4" variant="param" /> video |
| OAuth setup | <a href="/docs/social-integration/youtube">YouTube</a> |

```bash
YT_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="youtube") | .id')
```

## Video with title and privacy

The post body becomes the YouTube **description**. Set **title** and **privacy** in <Badge text="providerSettingsByIntegrationId" variant="param" />:

```bash
test -f ./walkthrough.mp4 && test -s ./walkthrough.mp4
VIDEO=$(openquok upload ./walkthrough.mp4 | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Full product walkthrough — links in description." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "<youtube-integration-id>" \
  --providerSettingsByIntegrationId '{"<youtube-integration-id>":{"title":"OpenQuok walkthrough","type":"public","selfDeclaredMadeForKids":"no"}}'
```

## With tags and nested youtube bucket

The backend accepts **flat** keys and a nested <Badge text="youtube" variant="default" /> bucket (same shape as the web composer):

```bash
openquok posts:create \
  -c "Scheduled from the CLI." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "<youtube-integration-id>" \
  --providerSettingsByIntegrationId '{"<youtube-integration-id>":{"youtube":{"title":"Weekly update","type":"unlisted","selfDeclaredMadeForKids":"no","tags":[{"value":"update","label":"update"},{"value":"product","label":"product"}]}}}'
```

## With custom thumbnail

Upload a still image, then pass its storage path in settings:

```bash
test -f ./thumb.jpg && test -s ./thumb.jpg
THUMB_PATH=$(openquok upload ./thumb.jpg | jq -r '.data.path // .data.filePath')
openquok posts:create \
  -c "See chapters in the description." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "<youtube-integration-id>" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "<youtube-integration-id>" --arg thumb "$THUMB_PATH" '{($id):{title:"Launch recap",type:"public",selfDeclaredMadeForKids:"no",thumbnail:{path:$thumb}}}')"
```

## Flat settings on a single channel

When <Badge text="-i" variant="param" /> lists one integration, <Badge text="--settings" variant="param" /> merges the same keys:

```bash
openquok posts:create \
  -c "Private draft upload for review." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "<youtube-integration-id>" \
  --settings '{"title":"Internal review cut","type":"private","selfDeclaredMadeForKids":"no"}'
```

## Resolve integration UUID

```bash
YT_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="youtube") | .id')
openquok integrations:settings "$YT_ID"
openquok analytics:platform "$YT_ID" -d 30
```

## Post insights

```bash
POST_ID=$(openquok posts:list | jq -r '.items[] | select(.identifier=="youtube") | .id' | head -1)
openquok analytics:post "$POST_ID" -d 7
```

<Callout type="note" title="Validation">
<p>YouTube rejects posts with zero or multiple videos, non-MP4 files, or titles shorter than 2 or longer than 100 characters. Run <Badge text="integrations:settings" variant="default" /> for <code>output.rules</code> before batch scripts.</p>
</Callout>

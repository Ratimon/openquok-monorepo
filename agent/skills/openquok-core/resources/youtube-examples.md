# YouTube — CLI examples

```bash
YT_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="youtube") | .id')
openquok integrations:settings "$YT_ID"
```

Run `integrations:settings` for `output.rules`, `output.maxLength`, and allow-listed `output.tools`. Publish keys below are stable for the YouTube provider.

Settings mechanics: [provider-settings.md](./provider-settings.md).

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| MP4 video upload | Yes | Exactly **one** `-m` attachment per scheduled post |
| Title | Yes | 2–100 chars in provider settings (`title`) |
| Description | Yes | Root `-c` caption (up to 5,000 characters) |
| Privacy | Yes | `type`: `public`, `private`, or `unlisted` |
| Tags | Yes | `tags`: `[{ "value": "…", "label": "…" }]` or string labels |
| Custom thumbnail | Yes | `thumbnail.path` from a prior `upload` |
| Made for kids | Yes | `selfDeclaredMadeForKids`: `yes` or `no` |
| Channel analytics | Yes | `analytics:platform` — views, watch time, subscribers, likes, … |
| Per-video snapshot | Yes | `analytics:post` — views, likes, comments, favorites |
| Text-only post | No | Video required |
| Follow-up comments | No | `comments: false` on this provider |
| Playlists / categories | No | Not implemented |
| YouTube-native schedule | No | Openquok schedules; API publishes with privacy status |

## Agent tasks

| User wants to… | Do this |
| --- | --- |
| Schedule a video upload | [Video with title and privacy](#video-with-title-and-privacy) |
| Set tags or unlisted/private | [With tags](#with-tags-and-nested-youtube-bucket) |
| Add a custom thumbnail | [With custom thumbnail](#with-custom-thumbnail) |
| Use flat settings on one channel | [Flat `--settings`](#flat-settings-on-a-single-channel) |
| See what the channel supports | `openquok integrations:settings "$YT_ID"` |
| Track channel performance | [Discover integration](#discover-integration) → `analytics:platform` |
| Inspect a published video | [Post insights](#post-insights) |

## Provider settings

Flat JSON on `--settings` or inside `--providerSettingsByIntegrationId` for the YouTube UUID. Nested `youtube.*` matches the web composer bucket.

| Key | Values | When |
| --- | --- | --- |
| `title` | string (2–100 chars) | Required for valid publish |
| `type` | `public` \| `private` \| `unlisted` | Privacy status (default `public`) |
| `selfDeclaredMadeForKids` | `yes` \| `no` | COPPA made-for-kids declaration |
| `tags` | `[{ "value": "…", "label": "…" }]` or strings | Optional snippet tags |
| `thumbnail` | `{ "path": "composer-media/…" }` | Optional custom thumbnail after upload |
| `thumbnailPath` | storage path string | Alias for thumbnail path (flat CLI) |
| `youtube.title` | string | Same as `title` (composer bucket) |
| `youtube.type` | privacy enum | Same as `type` |
| `youtube.tags` | tag array | Same as `tags` |
| `youtube.thumbnail` | `{ "path": "…" }` | Same as `thumbnail` |

**Rules:** Attach exactly one MP4 via `-m`. Description comes from the root `-c` segment. Title validation runs at publish time.

## Video with title and privacy

```bash
test -f ./walkthrough.mp4 && test -s ./walkthrough.mp4
VIDEO=$(openquok upload ./walkthrough.mp4 | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Full product walkthrough — links in description." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "$YT_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$YT_ID" '{($id):{title:"OpenQuok walkthrough",type:"public",selfDeclaredMadeForKids:"no"}}')"
```

## With tags and nested youtube bucket

```bash
openquok posts:create \
  -c "Scheduled from the CLI." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "$YT_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$YT_ID" '{($id):{youtube:{title:"Weekly update",type:"unlisted",selfDeclaredMadeForKids:"no",tags:[{value:"update",label:"update"},{value:"product",label:"product"}]}}}')"
```

## With custom thumbnail

```bash
test -f ./thumb.jpg && test -s ./thumb.jpg
THUMB_PATH=$(openquok upload ./thumb.jpg | jq -r '.data.path // .data.filePath')
openquok posts:create \
  -c "See chapters in the description." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "$YT_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$YT_ID" --arg thumb "$THUMB_PATH" '{($id):{title:"Launch recap",type:"public",selfDeclaredMadeForKids:"no",thumbnail:{path:$thumb}}}')"
```

## Flat settings on a single channel

```bash
openquok posts:create \
  -c "Private draft upload for review." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "$YT_ID" \
  --settings '{"title":"Internal review cut","type":"private","selfDeclaredMadeForKids":"no"}'
```

## Discover integration

```bash
openquok integrations:settings "$YT_ID"
openquok analytics:platform "$YT_ID" -d 30
```

## Post insights

```bash
POST_ID=$(openquok posts:list | jq -r '.items[] | select(.identifier=="youtube") | .id' | head -1)
openquok analytics:post "$POST_ID" -d 7
```

# YouTube — CLI examples

```bash
YT_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="youtube") | .id')
openquok integrations:settings "$YT_ID"
```

Run `integrations:settings` for `output.rules`, `output.maxLength`, and allow-listed `output.tools`. Publish keys below are stable for the YouTube provider.

Settings mechanics: [provider-settings.md](./provider-settings.md). JSON recipes: [examples/EXAMPLES.md](./examples/EXAMPLES.md#youtube).

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

| User wants to… | JSON example |
| --- | --- |
| Schedule a video upload | [youtube-video-title-privacy.json](./examples/youtube-video-title-privacy.json) |
| Set tags or unlisted/private | [youtube-with-tags.json](./examples/youtube-with-tags.json) |
| Add a custom thumbnail | [youtube-with-thumbnail.json](./examples/youtube-with-thumbnail.json) |
| Use flat settings on one channel | [youtube-flat-settings.json](./examples/youtube-flat-settings.json) |
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

## Run an example

```bash
openquok posts:create --json ./examples/youtube-video-title-privacy.json
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

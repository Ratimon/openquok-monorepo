# TikTok — CLI examples

```bash
TT_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="tiktok") | .id')
openquok integrations:settings "$TT_ID"
```

Run `integrations:settings` for `output.rules`, `output.maxLength`, and allow-listed `output.tools`. Settings mechanics: [provider-settings.md](./provider-settings.md).

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| Video publish | Yes | Exactly **one** video attachment |
| Photo carousel publish | Yes | One or more images; no mixed video + images |
| Caption length | Yes | Up to 2,000 characters |
| Privacy | Yes | `privacy_level` (availability depends on account) |
| Posting method | Yes | `DIRECT_POST` or `UPLOAD` (send to inbox) |
| Comments / Duet / Stitch toggles | Yes | Booleans per post |
| Brand disclosure toggles | Yes | `brand_content_toggle`, `brand_organic_toggle` |
| Platform analytics | Yes | `analytics:platform` and `analytics:post` (when enabled) |
| Direct binary upload to TikTok | No | TikTok pulls from public HTTPS URLs |

## Agent tasks

| User wants to… | Do this |
| --- | --- |
| Schedule a TikTok video | [Video with privacy + DIRECT_POST](#video-with-privacy--direct-post) |
| Schedule a photo carousel | [Photo carousel with title](#photo-carousel-with-title) |
| Send content to inbox instead of direct publish | [UPLOAD inbox flow](#upload-inbox-flow) |
| Check limits, tools, and rules | `openquok integrations:settings "$TT_ID"` |
| Review channel performance | [Analytics](#analytics) |

## Provider settings

Flat JSON on `--settings` or inside `--providerSettingsByIntegrationId` for the TikTok UUID. Nested `tiktok.*` matches the web composer bucket when used.

| Key | Values | When |
| --- | --- | --- |
| `privacy_level` | `PUBLIC_TO_EVERYONE` \| `MUTUAL_FOLLOW_FRIENDS` \| `FOLLOWER_OF_CREATOR` \| `SELF_ONLY` | Post privacy |
| `content_posting_method` | `DIRECT_POST` \| `UPLOAD` | Direct publish vs inbox |
| `title` | string (short) | Photo posts (carousel title) |
| `comment` | boolean | Allow comments |
| `duet` | boolean | Allow duets |
| `stitch` | boolean | Allow stitches |
| `autoAddMusic` | boolean | Auto add music (if supported by account) |
| `brand_content_toggle` | boolean | Branded content disclosure |
| `brand_organic_toggle` | boolean | Brand organic disclosure |
| `video_made_with_ai` | boolean | AI label (if applicable) |
| `tiktok.privacy_level` | same | Composer bucket form |
| `tiktok.content_posting_method` | same | Composer bucket form |
| `tiktok.title` | same | Composer bucket form |
| `tiktok.comment` | same | Composer bucket form |
| `tiktok.duet` | same | Composer bucket form |
| `tiktok.stitch` | same | Composer bucket form |

**Rules:** Provide either one video or one+ images. Media must be publicly fetchable via HTTPS so TikTok can pull it from storage.

## Video with privacy + DIRECT_POST

```bash
test -f ./clip.mp4 && test -s ./clip.mp4
VIDEO=$(openquok upload ./clip.mp4 | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -c "Vertical clip — scheduled from the CLI." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TT_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TT_ID" '
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

```bash
MEDIA=$(jq -s 'add' \
  <(openquok upload ./a.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]') \
  <(openquok upload ./b.jpg | jq '[{id: .data.id, path: (.data.path // .data.filePath)}]'))

openquok posts:create \
  -c "Carousel caption — links in bio." \
  -m "$MEDIA" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TT_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TT_ID" '
    {
      ($id): {
        title: "A short photo title",
        privacy_level: "PUBLIC_TO_EVERYONE",
        content_posting_method: "DIRECT_POST"
      }
    }
  ')"
```

## UPLOAD inbox flow

```bash
openquok posts:create \
  -c "Send to inbox instead of direct publish." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TT_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TT_ID" '
    { ($id): { privacy_level: "PUBLIC_TO_EVERYONE", content_posting_method: "UPLOAD" } }
  ')"
```

## Analytics

```bash
openquok analytics:platform "$TT_ID" -d 30
POST_ID=$(openquok posts:list | jq -r '.items[] | select(.identifier=="tiktok") | .id' | head -1)
openquok analytics:post "$POST_ID" -d 7
```


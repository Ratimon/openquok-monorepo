# TikTok Business — CLI examples (`tiktok-business`)

```bash
TT_BUSINESS_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="tiktok-business") | .id')
openquok integrations:settings "$TT_BUSINESS_ID"
```

Separate channel from Content API TikTok (`tiktok`). Confirm keys with `integrations:settings`. Settings mechanics: [provider-settings.md](./provider-settings.md). JSON recipes: [examples/EXAMPLES.md](./examples/EXAMPLES.md#tiktok-business).

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| Video publish | Yes | Exactly **one** video attachment |
| Photo carousel publish | Yes | One or more images; no mixed video + images; PNG converted to JPEG |
| Caption length | Yes | Up to 2,200 characters |
| Privacy | Photos only | Direct **photo** posts can set `privacy_level`. **Videos** follow the account default — do not send `privacy_level` on videos |
| Posting method | Yes | `DIRECT_POST` or `UPLOAD` (send to inbox) |
| Video cover | Yes | Stored poster image URL when present; otherwise frame timestamp |
| Comments / Duet / Stitch toggles | Yes | Booleans per post |
| Brand disclosure toggles | Yes | `brand_content_toggle`, `brand_organic_toggle` |
| Commercial audio | Yes | `music_sound_id` on **DIRECT_POST** only |
| Location | Yes | `poi_id` on **DIRECT_POST** only |
| Platform analytics | No | Use Content API `tiktok` for account insights |
| Direct binary upload to TikTok | No | TikTok pulls from public HTTPS URLs |

## Agent tasks

| User wants to… | JSON example |
| --- | --- |
| Schedule a TikTok Business video | [tiktok-business-video-direct-post.json](./examples/tiktok-business-video-direct-post.json) |
| Schedule a photo carousel | [tiktok-business-photo-carousel.json](./examples/tiktok-business-photo-carousel.json) |
| Send content to inbox instead of direct publish | Same `UPLOAD` pattern as [tiktok-upload-inbox.json](./examples/tiktok-upload-inbox.json) with a `tiktok-business` UUID |
| Check limits and tools | `openquok integrations:settings "$TT_BUSINESS_ID"` |
| Link inbox uploads to TikTok video ids | [Missing release id](#missing-release-id) |

## Provider settings

Flat JSON on `--settings` or inside `--providerSettingsByIntegrationId` for the TikTok Business UUID. Nested `tiktok-business.*` matches the web composer bucket when used.

| Key | Values | When |
| --- | --- | --- |
| `content_posting_method` | `DIRECT_POST` \| `UPLOAD` | `DIRECT_POST` = publish to profile; `UPLOAD` = TikTok creator inbox |
| `privacy_level` | `PUBLIC_TO_EVERYONE` \| `MUTUAL_FOLLOW_FRIENDS` \| `FOLLOWER_OF_CREATOR` \| `SELF_ONLY` | **Direct photo posts only** — omitted on videos |
| `title` | string (short) | Photo posts (carousel title) |
| `comment` | boolean | Allow comments |
| `duet` | boolean | Allow duets |
| `stitch` | boolean | Allow stitches |
| `autoAddMusic` | boolean | Auto add music on photo posts when the account allows it |
| `brand_content_toggle` | boolean | Branded content disclosure |
| `brand_organic_toggle` | boolean | Brand organic disclosure |
| `video_made_with_ai` | boolean | Disclose AI-generated or AI-edited content |
| `music_sound_id` | string | Commercial / trending audio on **DIRECT_POST** |
| `poi_id` | string | Location / POI on **DIRECT_POST** |
| `tiktok-business.content_posting_method` | same | Composer bucket form |
| `tiktok-business.music_sound_id` | same | Composer bucket form |
| `tiktok-business.poi_id` | same | Composer bucket form |

**Rules:** Provide either one video or one+ images. Media must be publicly fetchable via HTTPS on a domain verified **on the Business app**.

## Run an example

```bash
openquok posts:create --json ./examples/tiktok-business-video-direct-post.json
```

## Missing release id

Inbox uploads (`content_posting_method: "UPLOAD"`) store `release_id = "missing"` until you link the live TikTok video id.

```bash
POST_ID=$(openquok posts:list | jq -r '.items[] | select(.identifier=="tiktok-business" and .releaseId=="missing") | .id' | head -1)
openquok posts:missing "$POST_ID" | jq '.data.items[] | {id, url}'
openquok posts:connect "$POST_ID" -r "<tiktok-video-id>"
```

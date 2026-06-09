# Facebook Page — CLI examples

```bash
FB_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="facebook") | .id')
openquok integrations:settings "$FB_ID"
```

Run `integrations:settings` for `output.rules`, `output.maxLength`, and allow-listed `output.tools`. Publish keys below are stable for the Facebook Page provider.

Settings mechanics: [provider-settings.md](./provider-settings.md).

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| Text feed post | Yes | `-c` only |
| Link preview | Yes | Optional `url` in settings; **ignored when photos or video are attached** |
| Single photo | Yes | One uploaded image via `-m` |
| Multi-photo carousel | Yes | Multiple `-m` attachments in one post |
| Reel (MP4 video) | Yes | Single `.mp4` → Page video API; Facebook surfaces eligible uploads as Reels |
| Follow-up comments | Yes | Extra `-c` segments or nested reply settings where supported |
| Page analytics | Yes | `analytics:platform` and `analytics:post` |
| Facebook Stories | No | Feed, photos, video/Reels, and comments only |
| Personal profile / Groups | No | Pages you manage via Graph API only |

## Agent tasks

| User wants to… | Do this |
| --- | --- |
| Post text to the Page | [Text-only Page post](#text-only-page-post) |
| Share a link with preview card | [Link post](#link-post-link-preview) — text-only; set `url` |
| Post a photo | [With image](#with-image) |
| Post multiple photos | [Multi-photo carousel](#multi-photo-carousel) |
| Publish a Reel from MP4 | [Reel from MP4](#reel-from-mp4) |
| Add a comment after the post goes live | [Follow-up comment](#follow-up-comment) |
| See what the Page supports | `openquok integrations:settings "$FB_ID"` |
| Track Page performance | [Discover integration](#discover-integration) → `analytics:platform` |

## Provider settings

Flat JSON on `--settings` or inside `--providerSettingsByIntegrationId` for the Page UUID.

| Key | Values | When |
| --- | --- | --- |
| `url` | `https://…` string | Text-only post with link-preview card |
| `facebook.url` | `https://…` | Same as `url` (web composer bucket; API accepts both) |

**Rules:** Link `url` applies only when **no** media is attached. With `-m`, the post uses attached photos or video instead of a link card.

## Text-only Page post

```bash
openquok posts:create \
  -c "Hello from our Page" \
  -s "2026-01-01T12:00:00Z" \
  -i "$FB_ID"
```

## With image

At publish time the backend resolves each stored object key to a public `https://` URL for Meta to fetch.

```bash
test -f ./hero.jpg && test -s ./hero.jpg
IMAGE=$(openquok upload ./hero.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "Photo update" \
  -m "$IMAGE" \
  -s "2026-01-01T12:00:00Z" \
  -i "$FB_ID"
```

## Link post (link preview)

Text-only — do not attach `-m` when you want the preview card.

```bash
openquok posts:create \
  -c "Read more on our site" \
  -s "2026-01-01T12:00:00Z" \
  -i "$FB_ID" \
  --settings '{"url":"https://example.com/article"}'
```

Per-UUID map (multi-channel JSON):

```bash
openquok posts:create \
  -c "Read more on our site" \
  -s "2026-01-01T12:00:00Z" \
  -i "$FB_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$FB_ID" '{($id):{url:"https://example.com/article"}}')"
```

## Reel from MP4

Attach a single MP4. Caption becomes the video description. Do not set `url` on video posts.

```bash
test -f ./reel.mp4 && test -s ./reel.mp4
VIDEO=$(openquok upload ./reel.mp4 | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')
openquok posts:create \
  -c "New Reel on our Page" \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "$FB_ID"
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
  -i "$FB_ID"
```

## Follow-up comment

Extra `-c` segments schedule comments on the Page post after publish. `-d` is **milliseconds** between segments (default 5000).

```bash
openquok posts:create \
  -c "Main post" \
  -c "First comment on the post" \
  -s "2026-01-01T12:00:00Z" \
  -d 60000 \
  -i "$FB_ID"
```

## Discover integration

```bash
openquok integrations:settings "$FB_ID"
openquok analytics:platform "$FB_ID" -d 30
```

## Post insights

```bash
POST_ID=$(openquok posts:list | jq -r '.items[0].id')
openquok analytics:post "$POST_ID" -d 7
```

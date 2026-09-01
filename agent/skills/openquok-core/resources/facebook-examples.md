# Facebook Page — CLI examples

```bash
FB_ID=$(openquok integrations:list | jq -r '.[] | select(.identifier=="facebook") | .id')
openquok integrations:settings "$FB_ID"
```

Run `integrations:settings` for `output.rules`, `output.maxLength`, and allow-listed `output.tools`. Publish keys below are stable for the Facebook Page provider.

Settings mechanics: [provider-settings.md](./provider-settings.md). JSON recipes: [examples/EXAMPLES.md](./examples/EXAMPLES.md#facebook-page).

## Supported features

| Feature | Supported | Notes |
| --- | --- | --- |
| Text feed post | Yes | `-c` only |
| Link preview | Yes | Optional `url` in settings; **ignored when photos or video are attached** |
| Single photo | Yes | One uploaded image via `-m` |
| Multi-photo carousel | Yes | Multiple `-m` attachments in one post |
| Reel (MP4 video) | Yes | Single `.mp4` → Page video API; Facebook surfaces eligible uploads as Reels |
| Facebook Stories | Yes | `post_type: story` or `facebook.postType: story`; image or MP4 required; each attachment → its own Story |
| Follow-up comments | Yes | `facebook.replies` — optional one image per reply (feed posts only; not Stories) |
| Page analytics | Yes | `analytics:platform` and `analytics:post` |
| Personal profile / Groups | No | Pages you manage via Graph API only |

## Agent tasks

| User wants to… | JSON example |
| --- | --- |
| Post text to the Page | [facebook-text-only.json](./examples/facebook-text-only.json) |
| Share a link with preview card | [facebook-link-preview.json](./examples/facebook-link-preview.json) |
| Post a photo | [facebook-with-image.json](./examples/facebook-with-image.json) |
| Post multiple photos | [facebook-multi-photo.json](./examples/facebook-multi-photo.json) |
| Publish a Reel from MP4 | [facebook-reel.json](./examples/facebook-reel.json) |
| Publish a Story (image or MP4) | [facebook-story.json](./examples/facebook-story.json) |
| Add a comment after the post goes live | [facebook-follow-up-comment.json](./examples/facebook-follow-up-comment.json) |
| See what the Page supports | `openquok integrations:settings "$FB_ID"` |
| Track Page performance | [Discover integration](#discover-integration) → `analytics:platform` |

## Provider settings

Flat JSON on `--settings` or inside `--providerSettingsByIntegrationId` for the Page UUID.

| Key | Values | When |
| --- | --- | --- |
| `post_type` / `postType` | `post` (default) or `story` | Feed/Reel vs Story surface |
| `facebook.postType` | `post` or `story` | Same as `post_type` (web composer bucket; API accepts both) |
| `url` | `https://…` string | Text-only post with link-preview card |
| `facebook.url` | `https://…` | Same as `url` (web composer bucket; API accepts both) |
| `facebook.replies` | `[{ "id": "…", "message": "…", "delaySeconds": 60, "media": [...] }]` | Follow-up comments after publish (feed posts only; nested bucket in JSON) |

**Rules:** Link `url` applies only when **no** media is attached and post type is `post`. With `-m`, the post uses attached photos or video instead of a link card. **Stories** require at least one image or MP4; each attachment publishes as its own Story. Follow-up `replies` are not supported for Stories.

### Follow-up comments (`facebook.replies`)

Same-account comments on the main post use the **`facebook`** bucket — not `threads.replies`.

Each reply row:

```json
{
  "id": "reply-1",
  "message": "First comment on the post",
  "delaySeconds": 60,
  "media": [{ "id": "<media-id>", "path": "https://cdn.example.com/reply.jpg" }]
}
```

- `delaySeconds` — wait after the previous part publishes (`0` = immediately after the prior step).
- `media` — optional. Max **one image** per reply; **no video**. Upload first (Rule 2) before referencing `id` / `path`. Omit `media` for text-only comments.

Text-only recipe: [facebook-follow-up-comment.json](./examples/facebook-follow-up-comment.json). Mechanics: [provider-settings.md](./provider-settings.md#scheduled-follow-up-replies).

**Follow-up with one image** (upload first, then nest under `facebook.replies`):

```bash
REPLY_MEDIA=$(openquok upload ./comment-image.jpg | jq -c '[{id: .data.id, path: (.data.path // .data.filePath)}]')

openquok posts:create \
  -s "2026-01-01T12:00:00Z" \
  -c "Main post" \
  -i "$FB_ID" \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$FB_ID" --argjson media "$REPLY_MEDIA" '
    { ($id): { facebook: { replies: [
      { id: "reply-1", message: "See the chart in this comment", delaySeconds: 60, media: $media }
    ] } } }
  ')"
```

## Run an example

```bash
openquok posts:create --json ./examples/facebook-link-preview.json
```

At publish time the backend resolves each stored object key to a public `https://` URL for Meta to fetch.

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

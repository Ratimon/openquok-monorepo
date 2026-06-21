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
| Follow-up comments | Yes | See [facebook-follow-up-comment.json](./examples/facebook-follow-up-comment.json) |
| Page analytics | Yes | `analytics:platform` and `analytics:post` |
| Facebook Stories | No | Feed, photos, video/Reels, and comments only |
| Personal profile / Groups | No | Pages you manage via Graph API only |

## Agent tasks

| User wants to… | JSON example |
| --- | --- |
| Post text to the Page | [facebook-text-only.json](./examples/facebook-text-only.json) |
| Share a link with preview card | [facebook-link-preview.json](./examples/facebook-link-preview.json) |
| Post a photo | [facebook-with-image.json](./examples/facebook-with-image.json) |
| Post multiple photos | [facebook-multi-photo.json](./examples/facebook-multi-photo.json) |
| Publish a Reel from MP4 | [facebook-reel.json](./examples/facebook-reel.json) |
| Add a comment after the post goes live | [facebook-follow-up-comment.json](./examples/facebook-follow-up-comment.json) |
| See what the Page supports | `openquok integrations:settings "$FB_ID"` |
| Track Page performance | [Discover integration](#discover-integration) → `analytics:platform` |

## Provider settings

Flat JSON on `--settings` or inside `--providerSettingsByIntegrationId` for the Page UUID.

| Key | Values | When |
| --- | --- | --- |
| `url` | `https://…` string | Text-only post with link-preview card |
| `facebook.url` | `https://…` | Same as `url` (web composer bucket; API accepts both) |

**Rules:** Link `url` applies only when **no** media is attached. With `-m`, the post uses attached photos or video instead of a link card.

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

# LinkedIn (`linkedin`)

Personal professional profile channel. Single-step OAuth.

JSON recipes: [examples/EXAMPLES.md](./examples/EXAMPLES.md#linkedin). Settings mechanics: [provider-settings.md](./provider-settings.md).

## Supported features

| Feature | Supported |
| --- | --- |
| Text posts (3,000 chars) | Yes |
| Single / multi-image | Yes |
| MP4 video (one attachment) | Yes |
| Image → PDF document carousel | Yes (≥2 images, no video) |
| Follow-up text comments | Yes |
| Cross-account comment / reshare (internal plugs) | Yes (`linkedin.crossAccountPlugs`) |
| Account / post analytics | No (Page only) |

## Agent tasks

| User intent | JSON example |
| --- | --- |
| Connect personal LinkedIn | Setup in human docs; identifier `linkedin` |
| Schedule a text post | [linkedin-text-post.json](./examples/linkedin-text-post.json) |
| Post with video | [linkedin-with-video.json](./examples/linkedin-with-video.json) |
| Image → PDF document carousel | [linkedin-document-carousel.json](./examples/linkedin-document-carousel.json) |
| Add a comment after publish | [linkedin-follow-up-comment.json](./examples/linkedin-follow-up-comment.json) |
| Comment or reshare from other LinkedIn channels (internal plug) | `linkedin.crossAccountPlugs` — see [plugs.md](./plugs.md) |

For Page document carousels and analytics, use `linkedin-page` — see [linkedin-page-examples.md](./linkedin-page-examples.md).

## Provider settings

| Key (flat CLI) | Nested web bucket | Purpose |
| --- | --- | --- |
| `post_as_images_carousel` | `linkedin.postAsImagesCarousel` | Convert ≥2 images to PDF document (no video) |
| `carousel_name` | `linkedin.carouselName` | PDF title (default `slides`) |
| `linkedin.crossAccountPlugs` | `linkedin.crossAccountPlugs` | Cross-account comment (`linkedin-add-comment`) or reshare (`linkedin-repost-post-users`) |

Flat keys work on `--settings` or inside `--providerSettingsByIntegrationId`. Prefer the nested `linkedin.*` bucket in JSON files (matches composer).

Cross-account shape: [provider-settings.md](./provider-settings.md#internal-plugs). Plug catalog: [plugs.md](./plugs.md).

## Run an example

Replace `<integration-id>` and media paths with values from `openquok integrations:list` and `openquok upload`.

```bash
openquok integrations:list --provider linkedin
openquok posts:create --json ./examples/linkedin-document-carousel.json
```

Flat CLI equivalent for document carousel:

```bash
openquok posts:create \
  -i "<integration-id>" \
  -c "Swipe through our latest slides." \
  -s "2026-06-22T10:00:00.000Z" \
  --settings '{"post_as_images_carousel":true,"carousel_name":"June deck"}' \
  -m '[{"id":"<media-id-1>","path":"https://cdn.example.com/slide-1.jpg"},{"id":"<media-id-2>","path":"https://cdn.example.com/slide-2.jpg"}]'
```

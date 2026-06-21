# LinkedIn Page (`linkedin-page`)

Company Page channel. Two-step OAuth (login, then Page picker).

JSON recipes: [examples/EXAMPLES.md](./examples/EXAMPLES.md#linkedin). Settings mechanics: [provider-settings.md](./provider-settings.md).

## Supported features

| Feature | Supported |
| --- | --- |
| Text posts (3,000 chars) | Yes |
| Single / multi-image | Yes |
| MP4 video (one attachment) | Yes |
| Image → PDF document carousel | Yes (≥2 images, no video) |
| Follow-up text comments | Yes |
| Account analytics | Yes |
| Per-post analytics | Yes |

## Agent tasks

| User intent | JSON example |
| --- | --- |
| Connect a company Page | OAuth `linkedin-page` + Page picker |
| Schedule slide deck / carousel | [linkedin-page-document-carousel.json](./examples/linkedin-page-document-carousel.json) |
| Pull Page insights | `analytics:platform` (see below) |

## Provider settings

| Key (flat CLI) | Nested web bucket | Purpose |
| --- | --- | --- |
| `post_as_images_carousel` | `linkedin.postAsImagesCarousel` | Convert images to PDF document |
| `carousel_name` | `linkedin.carouselName` | PDF title (default `slides`) |

## Run an example

```bash
openquok integrations:list --provider linkedin-page
openquok posts:create --json ./examples/linkedin-page-document-carousel.json
openquok analytics:platform -i "<integration-id>" -d 30
```

Flat CLI equivalent:

```bash
openquok posts:create \
  -i "<integration-id>" \
  -c "Our Q2 product slides — swipe through the deck." \
  -s "2026-06-22T10:00:00.000Z" \
  -j '{"providerSettingsByIntegrationId":{"<integration-id>":{"linkedin":{"postAsImagesCarousel":true,"carouselName":"Q2 update"}}}}'
```

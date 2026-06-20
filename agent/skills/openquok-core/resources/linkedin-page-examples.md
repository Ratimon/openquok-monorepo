# LinkedIn Page (`linkedin-page`)

Company Page channel. Two-step OAuth (login, then Page picker).

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

| User intent | Section |
| --- | --- |
| Connect a company Page | OAuth `linkedin-page` + Page picker |
| Schedule slide deck / carousel | Provider settings + Recipes |
| Pull Page insights | `analytics:platform` |

## Provider settings

| Key (flat CLI) | Nested web bucket | Purpose |
| --- | --- | --- |
| `post_as_images_carousel` | `linkedin.postAsImagesCarousel` | Convert images to PDF document |
| `carousel_name` | `linkedin.carouselName` | PDF title (default `slides`) |

## Recipes

```bash
openquok integrations:list --provider linkedin-page

openquok posts:create \
  -i "<integration-id>" \
  -c "Swipe through our latest slides." \
  -t schedule \
  -s "2026-06-22T10:00:00.000Z" \
  -j '{"providerSettingsByIntegrationId":{"<integration-id>":{"linkedin":{"postAsImagesCarousel":true,"carouselName":"June deck"}}}}'

openquok analytics:platform -i "<integration-id>" -d 30
```

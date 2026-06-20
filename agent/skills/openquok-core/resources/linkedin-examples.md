# LinkedIn (`linkedin`)

Personal professional profile channel. Single-step OAuth.

## Supported features

| Feature | Supported |
| --- | --- |
| Text posts (3,000 chars) | Yes |
| Single / multi-image | Yes |
| MP4 video (one attachment) | Yes |
| Follow-up text comments | Yes |
| Document carousel (PDF) | No (Page only) |
| Account / post analytics | No |

## Agent tasks

| User intent | Section |
| --- | --- |
| Connect personal LinkedIn | Setup in human docs; identifier `linkedin` |
| Schedule a post | Recipes below |
| Add a comment thread | `posts:create` with reply rows; comments are text-only |

## Provider settings

| Key (flat CLI) | Nested web bucket | Purpose |
| --- | --- | --- |
| — | `linkedin.postAsImagesCarousel` | Not used on personal profile |
| — | `linkedin.carouselName` | Not used on personal profile |

## Recipes

```bash
openquok integrations:list --provider linkedin
openquok posts:create -i "<integration-id>" -c "Post body" -t schedule -s "2026-06-20T14:00:00.000Z"
```

For Page document carousels and analytics, use `linkedin-page` — see [linkedin-page-examples.md](./linkedin-page-examples.md).

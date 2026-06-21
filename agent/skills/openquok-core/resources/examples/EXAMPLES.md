# Openquok CLI — JSON post examples

Copy-paste payloads for `openquok posts:create --json ./examples/<file>.json`. Each file uses the **POST /public/posts** shape (`scheduledAt`, `status`, `body`, `integrationIds`, optional `media`, `providerSettingsByIntegrationId`, …).

## Before you post

1. Replace `<integration-id>` with a UUID from `openquok integrations:list`.
2. Replace `<media-id>` and `https://cdn.example.com/…` paths with `{id, path}` from `openquok upload` or `openquok upload-from-url` (Rule 2 in [SKILL.md](../../SKILL.md)).
3. Run `openquok integrations:settings <integration-id>` for `maxLength`, `rules`, and allow-listed `integrations:trigger` methods.

```bash
openquok posts:create --json ./examples/threads-text-only.json
```

## Threads

| File | Scenario |
| --- | --- |
| [threads-text-only.json](./threads-text-only.json) | Text-only scheduled post |
| [threads-with-image.json](./threads-with-image.json) | Single image |
| [threads-media-carousel.json](./threads-media-carousel.json) | Multi-image carousel |
| [threads-follow-up-replies.json](./threads-follow-up-replies.json) | `threads.replies` chain |
| [threads-thread-finisher.json](./threads-thread-finisher.json) | Finisher + follow-ups |
| [threads-engagement-plug.json](./threads-engagement-plug.json) | `threads.internalEngagementPlug` |

## Facebook Page

| File | Scenario |
| --- | --- |
| [facebook-text-only.json](./facebook-text-only.json) | Text feed post |
| [facebook-with-image.json](./facebook-with-image.json) | Single photo |
| [facebook-link-preview.json](./facebook-link-preview.json) | Link preview (`url`) |
| [facebook-reel.json](./facebook-reel.json) | Reel from MP4 |
| [facebook-multi-photo.json](./facebook-multi-photo.json) | Multi-photo carousel |
| [facebook-follow-up-comment.json](./facebook-follow-up-comment.json) | Follow-up comments via `replies` |

## Instagram

Shared recipes — use the same JSON with `instagram-standalone` or `instagram-business` integration UUIDs.

| File | Scenario |
| --- | --- |
| [instagram-feed-post.json](./instagram-feed-post.json) | Feed image |
| [instagram-carousel.json](./instagram-carousel.json) | Multi-image carousel |
| [instagram-reel.json](./instagram-reel.json) | Reel (MP4) |
| [instagram-story.json](./instagram-story.json) | Story |
| [instagram-trial-reel.json](./instagram-trial-reel.json) | Trial Reel + collaborators |
| [instagram-follow-up-comments.json](./instagram-follow-up-comments.json) | Text follow-ups via `instagram.replies` |

## YouTube

| File | Scenario |
| --- | --- |
| [youtube-video-title-privacy.json](./youtube-video-title-privacy.json) | Video + title + privacy |
| [youtube-with-tags.json](./youtube-with-tags.json) | Nested `youtube.*` + tags |
| [youtube-with-thumbnail.json](./youtube-with-thumbnail.json) | Custom thumbnail |
| [youtube-flat-settings.json](./youtube-flat-settings.json) | Flat `--settings`-style keys |

## TikTok

| File | Scenario |
| --- | --- |
| [tiktok-video-direct-post.json](./tiktok-video-direct-post.json) | Direct publish + privacy |
| [tiktok-photo-carousel.json](./tiktok-photo-carousel.json) | Photo carousel + title |
| [tiktok-upload-inbox.json](./tiktok-upload-inbox.json) | Creator inbox (`UPLOAD`) |
| [tiktok-private-draft.json](./tiktok-private-draft.json) | Private draft (`SELF_ONLY`) |

## LinkedIn

| File | Scenario |
| --- | --- |
| [linkedin-text-post.json](./linkedin-text-post.json) | Personal profile text |
| [linkedin-document-carousel.json](./linkedin-document-carousel.json) | Image → PDF document carousel (`post_as_images_carousel`, `carousel_name`) |
| [linkedin-with-video.json](./linkedin-with-video.json) | Single MP4 video |
| [linkedin-follow-up-comment.json](./linkedin-follow-up-comment.json) | Text follow-up comments |
| [linkedin-page-document-carousel.json](./linkedin-page-document-carousel.json) | Page document carousel (`linkedin.postAsImagesCarousel`) |

## Multi-channel

| File | Scenario |
| --- | --- |
| [multi-platform-campaign.json](./multi-platform-campaign.json) | Per-channel bodies + settings |

Per-channel feature matrices and CLI flags: `../{identifier}-examples.md` and [provider-settings.md](../provider-settings.md).

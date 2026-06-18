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
| Privacy | Yes | `privacy_level` on **direct post** only (see [Inbox vs private draft](#inbox-vs-private-draft)) |
| Posting method | Yes | `DIRECT_POST` or `UPLOAD` (send to inbox) |
| Comments / Duet / Stitch toggles | Yes | Booleans per post |
| Brand disclosure toggles | Yes | `brand_content_toggle`, `brand_organic_toggle` |
| Platform analytics | Yes | `analytics:platform` (account + recent video engagement) and `analytics:post` |
| Missing release id recovery | Yes | `posts:missing` → `posts:connect` (inbox uploads and unresolved publish ids) |
| Direct binary upload to TikTok | No | TikTok pulls from public HTTPS URLs |

## Agent tasks

| User wants to… | Do this |
| --- | --- |
| Schedule a TikTok video | [Video with privacy + DIRECT_POST](#video-with-privacy--direct-post) |
| Schedule a photo carousel | [Photo carousel with title](#photo-carousel-with-title) |
| Send content to inbox instead of direct publish | [UPLOAD inbox flow](#upload-inbox-flow) |
| Queue a private slideshow draft (finish in TikTok app) | [Private draft for manual music](#private-draft-for-manual-music) |
| Find inbox/private drafts on the kanban board | [Kanban after upload](#kanban-after-upload) |
| Leave a human checklist for manual TikTok steps | [Review notes (`--note`)](#review-notes-note) |
| Check limits, tools, and rules | `openquok integrations:settings "$TT_ID"` |
| Review channel performance | [Analytics](#analytics) |
| Link inbox uploads to TikTok video ids | [Missing release id](#missing-release-id) |

## Provider settings

Flat JSON on `--settings` or inside `--providerSettingsByIntegrationId` for the TikTok UUID. Nested `tiktok.*` matches the web composer bucket when used.

| Key | Values | When |
| --- | --- | --- |
| `privacy_level` | `PUBLIC_TO_EVERYONE` \| `MUTUAL_FOLLOW_FRIENDS` \| `FOLLOWER_OF_CREATOR` \| `SELF_ONLY` | **Direct post only** — not sent when `content_posting_method` is `UPLOAD` |
| `content_posting_method` | `DIRECT_POST` \| `UPLOAD` | `DIRECT_POST` = publish to profile; `UPLOAD` = TikTok creator inbox (finish in app) |
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

## Inbox vs private draft

Do **not** treat `UPLOAD` (inbox) and `SELF_ONLY` (private direct post) as the same workflow.

| Goal | Set | TikTok result |
| --- | --- | --- |
| Send video to creator inbox (warm phone, add sound, publish in app) | `content_posting_method: "UPLOAD"` | Creator inbox (`SEND_TO_USER_INBOX`) — **no** `privacy_level` is sent |
| Private slideshow on profile (add trending audio, then switch to public) | `privacy_level: "SELF_ONLY"` + `content_posting_method: "DIRECT_POST"` | Private draft on the profile |

`privacy_level` and `content_posting_method` are independent in the web composer. Inbox upload does **not** force or imply `SELF_ONLY`.

Unaudited TikTok developer apps may restrict **direct** posts to `SELF_ONLY` until Content Posting API review — that is a platform limit, not inbox upload behavior.

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

Use when the creator will finish on a mobile device (add trending audio, pick cover, then publish from the TikTok app). Set **`content_posting_method: "UPLOAD"` only** — do not set `SELF_ONLY` for this path.

```bash
openquok posts:create \
  -c "Send to inbox instead of direct publish." \
  -m "$VIDEO" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TT_ID" \
  --note "Finish in TikTok app: open inbox, add trending audio, pick cover, then publish." \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TT_ID" '
    { ($id): { content_posting_method: "UPLOAD" } }
  ')"
```

## Private draft for manual music

Use `privacy_level: "SELF_ONLY"` with `DIRECT_POST` when you want a private TikTok draft (e.g. slideshow) so the creator can add trending music before switching to public.

```bash
openquok posts:create \
  -c "Carousel — add trending audio in TikTok before publishing." \
  -m "$MEDIA" \
  -s "2026-01-01T12:00:00Z" \
  -i "$TT_ID" \
  --note "Finish in TikTok app: add trending audio, set privacy to public, then publish." \
  --providerSettingsByIntegrationId "$(jq -nc --arg id "$TT_ID" '
    {
      ($id): {
        title: "Beach day",
        privacy_level: "SELF_ONLY",
        content_posting_method: "DIRECT_POST"
      }
    }
  ')"
```

## Review notes (`--note`)

For inbox upload or private-draft workflows, **always** pass `--note` with the post-create checklist so humans see it on the kanban card (double-click the note area to edit). Works on `draft` or `scheduled` creates.

| Workflow | Example `--note` |
| --- | --- |
| `UPLOAD` (inbox) | `Finish in TikTok app: open inbox, add trending audio, pick cover, then publish.` |
| `SELF_ONLY` + `DIRECT_POST` | `Finish in TikTok app: add trending audio, set privacy to public, then publish.` |

After TikTok accepts the upload, update the checklist if needed:

```bash
POST_ID=$(openquok posts:list | jq -r '.items[] | select(.identifier=="tiktok") | .id' | head -1)
openquok posts:review-todo "$POST_ID" --note "Posted from warmed phone — confirm live URL."
```

If `--note` is omitted, the dashboard still shows a **Next:** hint on the kanban card for these TikTok rows until someone saves a real note.

## Kanban after upload

OpenQuok marks the row `PUBLISHED` once TikTok accepts the upload, but these workflows are **not** live on the profile yet:

| `content_posting_method` | `privacy_level` | Kanban column | Card label |
| --- | --- | --- | --- |
| `UPLOAD` | any | **Scheduled posts** | In TikTok inbox |
| `DIRECT_POST` | `SELF_ONLY` | **Scheduled posts** | Private on TikTok |
| `DIRECT_POST` | public / friends / followers | **Published posts** | Published |

Tell the user to open the **Scheduled posts** column (not Published) to read the review **note** (or **Next:** hint), mark reviewed, or open post actions after inbox/private uploads. Use the **Past posts** time filter when the scheduled time has already passed.

## Analytics

```bash
openquok analytics:platform "$TT_ID" -d 30
POST_ID=$(openquok posts:list | jq -r '.items[] | select(.identifier=="tiktok") | .id' | head -1)
openquok analytics:post "$POST_ID" -d 7
```

Platform analytics include account totals (followers, likes, video count) plus aggregated views/likes/comments/shares from your most recent videos. Per-post analytics return views, likes, comments, and shares for published rows with a linked TikTok video id.

## Missing release id

Inbox uploads (`content_posting_method: "UPLOAD"`) store `release_id = "missing"` until you link the live TikTok video id.

```bash
POST_ID=$(openquok posts:list | jq -r '.items[] | select(.identifier=="tiktok" and .releaseId=="missing") | .id' | head -1)
openquok posts:missing "$POST_ID" | jq '.data.items[] | {id, url}'
openquok posts:connect "$POST_ID" -r "<tiktok-video-id>"
openquok analytics:post "$POST_ID" -d 7
```


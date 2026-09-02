---
title: Overview
description: Posting rules for the OpenQuok social scheduler — character limits, media requirements, follow-ups, and per-network settings for every shipped channel.
order: 0
lastUpdated: 2026-09-01
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

Every network disagrees on caption length, attachment count, and extra fields. This page is the **composer and publish reference** for channels OpenQuok ships today — not marketing <strong>coming soon</strong> badges on channel landing pages.

Use it with <a href="/docs/creating-posts/writing-the-post">Writing the post</a>, <a href="/docs/creating-posts/media">Media</a>, and <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a> when you schedule from the dashboard. Programmatic field shapes for API keys live in <a href="/docs/getting-started-for-public-api/supported-social-channels">Supported social channels</a>.

## Every platform

Connect each channel once per workspace account — see <a href="/docs/channels/connect">Connect a channel</a>. Self-hosted operators register developer apps per network — see <a href="/docs/social-integration">Social integrations</a>.

| Display name | API identifier | Connect | Self-host developer app | Character cap |
| --- | --- | --- | --- | --- |
| **Threads** | <Badge text="threads" variant="param" /> | OAuth redirect | Yes | **500** |
| **Facebook Page** | <Badge text="facebook" variant="param" /> | OAuth redirect | Yes | **63,206** |
| **Instagram (Business)** | <Badge text="instagram-business" variant="param" /> | OAuth redirect (+ Page picker) | Yes | **2,200** |
| **Instagram (Standalone)** | <Badge text="instagram-standalone" variant="param" /> | OAuth redirect | Yes | **2,200** |
| **LinkedIn** | <Badge text="linkedin" variant="param" /> | OAuth redirect | Yes | **3,000** |
| **LinkedIn Page** | <Badge text="linkedin-page" variant="param" /> | OAuth redirect (+ Page picker) | Yes | **3,000** |
| **YouTube** | <Badge text="youtube" variant="param" /> | OAuth redirect (+ channel picker) | Yes | **5,000** (description) |
| **TikTok** | <Badge text="tiktok" variant="param" /> | OAuth redirect | Yes | **2,000** |
| **TikTok (Business)** | <Badge text="tiktok-business" variant="param" /> | OAuth redirect | Yes | **2,200** |
| **X** | <Badge text="x" variant="param" /> | OAuth redirect | Yes | **280** or **4,000** |
| **Dev.to** | <Badge text="devto" variant="param" /> | Credentials in Add Channel | No | **100,000** (body) |

<Callout type="note">
<p><strong>X</strong> uses a <strong>280</strong>-character cap on standard accounts. Verified accounts connected through OpenQuok can post up to <strong>4,000</strong> characters. The composer counter is <strong>weighted</strong> — links and mentions can cost more than one character. See <a href="/docs/creating-posts/writing-the-post#character-count">Character count</a>.</p>
</Callout>

## Names that differ

The dashboard and marketing site use short labels. APIs, CLI filters, and integration rows use the identifier column above.

| You see in the app | Backend identifier(s) |
| --- | --- |
| **Instagram** | <Badge text="instagram-business" variant="param" /> or <Badge text="instagram-standalone" variant="param" /> |
| **Facebook** / **Facebook Page** | <Badge text="facebook" variant="param" /> |
| **LinkedIn Page** | <Badge text="linkedin-page" variant="param" /> |
| **TikTok (Business)** | <Badge text="tiktok-business" variant="param" /> |
| **Dev.to** | <Badge text="devto" variant="param" /> |

Composer launch rules treat both Instagram identifiers and both LinkedIn identifiers as one family each — validation in <a href="/docs/creating-posts/media">Media</a> follows the stricter network in your selection. TikTok and TikTok (Business) share the same media rules but are separate connect options.

## Media rules

Rules below come from composer <Badge text="checkValidity" variant="param" /> helpers and backend publish validation. Upload limits (file size, MIME) are in <a href="/docs/creating-posts/media#limits-and-formats">Media → Limits and formats</a>.

| Network | Main-post media |
| --- | --- |
| **X** | Text-only OK; **≤4 images** <strong>or</strong> **one video** (never mixed); video **≤140 seconds** |
| **LinkedIn** / **LinkedIn Page** | Text-only OK; **one video** attachment; **image carousel** = **≥2 images**, **no video** (published as a PDF document — you attach images, not a PDF file) |
| **Instagram (Business)** / **Instagram (Standalone)** | **≥1** attachment required; **story** or **trial reel** = **1** item; **carousel ≤10**; story video **≤60 s**; reel video **≤180 s** |
| **Facebook Page** | Text-only OK; photos and/or video; optional link URL in Settings (text posts) |
| **YouTube** | Exactly **one MP4** video |
| **TikTok** | **≥1** attachment; **one MP4** <strong>or</strong> **1–35** JPEG/PNG/WEBP photos (never mixed) |
| **TikTok (Business)** | Same media rules; PNG converted to JPEG; video cover from stored poster or frame timestamp |
| **Threads** | Text-only OK; one attachment or a carousel |
| **Dev.to** | Markdown body; optional **cover image** in Settings (not required on the media strip) |

<Callout type="tip">
<p>When several networks are selected in <strong>Global</strong> mode, one shared media list must satisfy every row above. Unlock a channel to give it its own attachments — see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.</p>
</Callout>

## Threads and comments

Scheduled **follow-up replies** after the main post are supported on some networks only.

| Network | Follow-ups in composer | Notes |
| --- | --- | --- |
| **Threads** | Yes | Same-account thread replies; media on follow-ups |
| **X** | Yes | Quote-less replies; media on follow-ups |
| **Instagram** (both) | Yes | Comments on the root post; **text only** on follow-ups |
| **LinkedIn** / **LinkedIn Page** | Yes | Comments on the main post; **text only** on follow-ups |
| **Facebook Page** | Yes | Comments on the main post; **one image** per follow-up (no video) |
| **YouTube** | No | — |
| **TikTok** | No | — |
| **TikTok (Business)** | No | — |
| **Dev.to** | No | — |

Delays, thread finisher, and cross-account plugs are documented in <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a>.

## Editors

Each channel uses a caption editor mode when you unlock it in per-channel mode. **Global** mode always uses the **Standard** plain textarea.

| Editor | Used by |
| --- | --- |
| **Standard** | Threads, Facebook, Instagram (both), LinkedIn (both), YouTube, TikTok, TikTok (Business) |
| **Markdown** | Dev.to |
| **HTML** | X (published as plain text) |

Toolbar details and the full **Editor | Toolbar | Used by** table are in <a href="/docs/creating-posts/writing-the-post#editor-by-platform">Writing the post → Editor by platform</a>.

## Platform details

### X

Open **Settings** while **X** is focused:

| Setting | Purpose |
| --- | --- |
| **Who can reply** | Limit replies to following, mentioned users, subscribers, or verified accounts |
| **Community** | Post into an X community (paste the community URL) |
| **Made with AI** | Disclosure flag when content was AI-generated |
| **Paid partnership** | Paid partnership disclosure |
| **Thread finisher** | Optional closing reply after all scheduled follow-ups |

Media rules and character caps are in the tables above. OpenQuok does **not** ship long-form **article** mode on X.

### TikTok

Open **Settings** while **TikTok** is focused:

| Setting | Purpose |
| --- | --- |
| **Content posting method** | <Badge text="DIRECT_POST" variant="param" /> publishes to the profile; <Badge text="UPLOAD" variant="param" /> sends a draft to the TikTok inbox for in-app review |
| **Privacy level** | Who can view the post |
| **Photo title** | Required for photo carousels; **≤90** characters |
| **Duet / Stitch / Comment** | Interaction toggles on the published post |
| **Brand content** | Organic and paid brand toggles when applicable |
| **Made with AI** | Video disclosure when required |

TikTok does **not** support scheduled follow-up comments in the composer.

### TikTok (Business)

Open **Settings** while **TikTok (Business)** is focused. Connect this channel separately from Content API TikTok — two developer apps, two env pairs.

| Setting | Purpose |
| --- | --- |
| **Content posting method** | Direct post publishes to the profile; inbox upload sends a draft to the TikTok inbox |
| **Privacy level** | Who can view **photo** posts on direct publish. **Videos** follow the account default — OpenQuok does not send a video privacy level |
| **Photo title** | Required for photo carousels; **≤90** characters |
| **Duet / Stitch / Comment** | Interaction toggles on the published post |
| **Brand content** | Organic and paid brand toggles when applicable |
| **Made with AI** | Video disclosure when required |
| **Trending audio sound ID** | Optional commercial audio on **direct** posts |
| **Location POI ID** | Optional location pin on **direct** posts |

Video covers use a stored poster image when you save one in Media details; otherwise OpenQuok sends the frame timestamp. See <a href="/docs/creating-posts/media">Media</a>.

TikTok (Business) does **not** support scheduled follow-up comments in the composer.

### Instagram (Business and Standalone)

Open **Settings** while an Instagram channel is focused:

| Setting | Purpose |
| --- | --- |
| **Post type** | Feed post or **Story** |
| **Trial reel** | Single-video trial reel (not combinable with Story) |
| **Graduation strategy** | How a trial reel graduates when performance thresholds are met |
| **Collaborators** | Invite collaborators on feed posts (not on Story or carousel) |

Stories and trial reels allow **one** attachment. Carousels allow up to **ten** images or videos.

### LinkedIn and LinkedIn Page

Open **Settings** while a LinkedIn channel is focused:

| Setting | Purpose |
| --- | --- |
| **Post as images carousel** | **≥2 images**, no video — OpenQuok builds a PDF document carousel at publish time |
| **Carousel name** | Optional document title for the carousel |

Follow-up comments are text-only. **LinkedIn Page** exposes account and per-post analytics; personal **LinkedIn** profile channels do not.

### YouTube

Open **Settings** while **YouTube** is focused:

| Setting | Purpose |
| --- | --- |
| **Title** | **2–100** characters (required) |
| **Privacy** | Public, unlisted, or private |
| **Made for kids** | COPPA self-declaration |
| **Tags** | Optional video tags |
| **Custom thumbnail** | Optional still image (Settings — not the media strip) |

The caption field is the video **description** (up to **5,000** characters). Exactly **one MP4** belongs on the media strip.

### Facebook Page

Open **Settings** while **Facebook** is focused:

| Setting | Purpose |
| --- | --- |
| **Embedded URL** | Optional link preview on **text-only** posts (ignored when photos or video are attached) |

Follow-up comments support **one image** each (no video). OpenQuok does **not** ship coloured background text posts.

### Dev.to

Open **Settings** while **Dev.to** is focused:

| Setting | Purpose |
| --- | --- |
| **Title** | **≥2** characters (required) |
| **Tags** | Up to **four** tags |
| **Cover image** | Optional hero image |
| **Canonical URL** | Optional canonical link |
| **Series** | Optional series name |
| **Organization** | Post under a Dev.to organization when applicable |

Connect with a **personal API key** in Add Channel — no operator developer app. The body uses the **Markdown** editor (up to **100,000** characters).

## Analytics

Account-level insights in the workspace **Analytics** area are available for:

| Network | Account insights |
| --- | --- |
| **Facebook Page** | Yes |
| **Instagram (Business)** | Yes |
| **Instagram (Standalone)** | Yes |
| **LinkedIn Page** | Yes |
| **LinkedIn** (personal) | No |
| **TikTok** | Yes |
| **TikTok (Business)** | No |
| **YouTube** | Yes |
| **Threads** | Yes |
| **X** | Yes |
| **Dev.to** | Yes |

Per-post metrics follow the same split — **LinkedIn Page** includes post-level stats; personal **LinkedIn** does not expose the same insights API.

## Related Section(s)

<CardGrid>
<LinkCard title="Creating posts" description="Composer flow, save options, and cross-links" href="/docs/creating-posts" />
<LinkCard title="Media" description="Attach images and video — upload limits and per-channel lists" href="/docs/creating-posts/media" />
<LinkCard title="Connect a channel" description="OAuth redirect and credentials flows" href="/docs/channels/connect" />
<LinkCard title="Social integrations" description="Operator developer apps and backend env for self-hosting" href="/docs/social-integration" />
<LinkCard title="Threads and comments" description="Follow-up replies, delays, and thread finisher" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="Writing the post" description="Editor modes, toolbar, and character count" href="/docs/creating-posts/writing-the-post" />
<LinkCard title="Supported social channels" description="Public API identifier and payload reference" href="/docs/getting-started-for-public-api/supported-social-channels" />
<LinkCard title="CLI examples" description="Copy-paste openquok recipes by network" href="/docs/cli-examples" />
</CardGrid>

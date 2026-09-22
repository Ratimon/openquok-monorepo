---
title: Per-channel settings
description: Composer Settings per network — privacy, post type, titles, disclosures, and publish options in OpenQuok.
order: 3
lastUpdated: 2026-09-22
sidebar:
  label: Per-channel settings
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Per-channel settings

> Extra fields in the composer **Settings** panel that a network needs before you can schedule or publish.

Open **Settings** in the purple accordion while that channel is focused. Required fields block save until you fill them. API and CLI payloads use <Badge text="providerSettingsByIntegrationId" variant="param" /> — field names are in <a href="/docs/public-api-providers">Provider settings</a>. Media and character caps are in <a href="/docs/platforms/media-rules">Media rules</a>.

### X

Channel key: <Badge text="x" variant="param" />

| Setting | Purpose |
| --- | --- |
| **Who can reply** | Limit replies to following, mentioned users, subscribers, or verified accounts |
| **Community** | Post into an X community (paste the community URL) |
| **Made with AI** | Disclosure when content was AI-generated |
| **Paid partnership** | Paid partnership disclosure |
| **Thread finisher** | Optional closing reply after all scheduled follow-ups |

### TikTok

Channel key: <Badge text="tiktok" variant="param" />

| Setting | Purpose |
| --- | --- |
| **Content posting method** | <Badge text="DIRECT_POST" variant="param" /> publishes to the profile; <Badge text="UPLOAD" variant="param" /> sends a draft to the TikTok inbox for in-app review |
| **Privacy level** | Who can view the post |
| **Photo title** | Required for photo carousels; **≤90** characters |
| **Duet / Stitch / Comment** | Interaction toggles on the published post |
| **Brand content** | Organic and paid brand toggles when applicable |
| **Made with AI** | Video disclosure when required |

<Callout type="warning">
<p><strong>UPLOAD</strong> does not publish to the profile. You must finish and publish in the TikTok app within 24 hours. In upload mode, TikTok ignores privacy and interaction settings except the title.</p>
</Callout>

TikTok does not support scheduled follow-up comments.

### Instagram (Business and Standalone)

Channel keys: <Badge text="instagram-business" variant="param" />, <Badge text="instagram-standalone" variant="param" />

| Setting | Purpose |
| --- | --- |
| **Post type** | Feed post or **Story** |
| **Trial reel** | Single-video trial reel (not combinable with Story) |
| **Graduation strategy** | How a trial reel graduates when performance thresholds are met |
| **Collaborators** | Invite collaborators on feed posts (not on Story or carousel) |

<Callout type="warning">
Instagram (Business) connects through Meta and requires a linked Facebook Page during OAuth. Instagram (Standalone) uses Instagram Login with a separate developer app on self-host.
</Callout>

### LinkedIn and LinkedIn Page

Channel keys: <Badge text="linkedin" variant="param" />, <Badge text="linkedin-page" variant="param" />

| Setting | Purpose |
| --- | --- |
| **Post as images carousel** | **≥2 images**, no video — OpenQuok builds a PDF document carousel at publish time |
| **Carousel name** | Optional document title for the carousel |

<Callout type="note">
<p>Follow-up comments are text-only. <strong>LinkedIn Page</strong> exposes account and per-post analytics, while personal <strong>LinkedIn</strong> does not. See <a href="/docs/platforms/analytics">Platforms → Analytics</a>.</p>
</Callout>


### YouTube

Channel key: <Badge text="youtube" variant="param" />

| Setting | Purpose |
| --- | --- |
| **Title** | **2–100** characters (required) |
| **Privacy** | Public, unlisted, or private |
| **Made for kids** | COPPA self-declaration |
| **Tags** | Optional video tags |
| **Custom thumbnail** | Optional still image (Settings — not the media strip) |

<Callout type="note">
<p>The caption field is the video <strong>description</strong> (up to <strong>5,000</strong> characters). Exactly <strong>one MP4</strong> belongs on the media strip.</p>
</Callout>

### Facebook Page

Channel key: <Badge text="facebook" variant="param" />

| Setting | Purpose |
| --- | --- |
| **Embedded URL** | Optional link preview on **text-only** posts (ignored when photos or video are attached) |
| **Post type** | Feed post or **Story** |

<Callout type="note">
Follow-up comments support <strong>one image</strong> each (no video). OpenQuok does <strong>not</strong>  ship coloured background text posts.
</Callout>

### Threads

Channel key: <Badge text="threads" variant="param" />

Thread finisher, delayed engagement reply, and plug options live in Settings. See <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a>.

### Dev.to

Channel key: <Badge text="devto" variant="param" />

| Setting | Purpose |
| --- | --- |
| **Title** | **≥2** characters (required) |
| **Tags** | Up to **four** tags |
| **Cover image** | Optional hero image |
| **Canonical URL** | Optional canonical link |
| **Series** | Optional series name |
| **Organization** | Post under a Dev.to organization when applicable |

## Platform details

Most platforms behave as you expect. These rules catch people out often.

### LinkedIn: carousels are PDFs

A LinkedIn carousel needs **at least two images and no video**. OpenQuok combines your images into a PDF and uploads it as a document share.

<Callout type="warning">
You do not upload a PDF yourself. Comments on LinkedIn are <strong>text-only</strong>.
</Callout>

### TikTok: direct post vs upload

- **Direct post** publishes to the account and applies your privacy and interaction settings.

- **Upload** sends media to the TikTok app inbox only. Duet, stitch, and AI disclosure apply to video; some photo-only settings apply to carousels. Settings that do not match your attachment type are dropped.

### Instagram: stories and trial reels

- A scheduled Instagram post needs **at least one** attachment.

- A story or trial reel must be **exactly one** video or image.

- Carousels allow up to **ten** items.

## Related

<CardGrid>
<LinkCard title="Media rules" description="Attachments and character caps" href="/docs/platforms/media-rules" />
<LinkCard title="Provider settings" description="API field names and JSON examples" href="/docs/public-api-providers" />
<LinkCard title="Links and validation" description="Save-time errors when a required field is missing" href="/docs/creating-posts/links-and-validation" />
</CardGrid>

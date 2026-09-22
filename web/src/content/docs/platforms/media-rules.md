---
title: Media rules
description: Per-network media, character caps, follow-up attachments, and caption editors for the OpenQuok composer.
order: 2
lastUpdated: 2026-09-22
sidebar:
  label: Media rules
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Media rules

> What each network accepts for attachments, caption length, and follow-up media before OpenQuok publishes.

The composer blocks a post that breaks these rules before it reaches the platform. File size and MIME limits are separate. See <a href="/docs/creating-posts/media#limits-and-formats">Media → Limits and formats</a>.

## Media and character caps

The **Characters** column is the main caption or body. The same cap applies to each follow-up row and to thread finisher text where that feature is supported.

| Display name | Channel key | Main-post media | Characters |
| --- | --- | --- | --- |
| **X** | <Badge text="x" variant="param" /> | Text-only OK; **≤4 images** <strong>or</strong> **one video** (never mixed); video **≤140 seconds** | **280** or **4,000** |
| **Threads** | <Badge text="threads" variant="param" /> | Text-only OK; one attachment or a carousel | **500** |
| **Facebook Page** | <Badge text="facebook" variant="param" /> | Text-only OK; photos and/or video; optional link URL in Settings on text-only posts | **63,206** |
| **Instagram (Business)** | <Badge text="instagram-business" variant="param" /> | **≥1** attachment required when scheduled; **story** or **trial reel** = **1** item; **carousel ≤10**; story video **≤60 s**; reel video **≤180 s** | **2,200** |
| **Instagram (Standalone)** | <Badge text="instagram-standalone" variant="param" /> | Same media rules as Instagram (Business) | **2,200** |
| **LinkedIn** | <Badge text="linkedin" variant="param" /> | Text-only OK; **one video** attachment; **image carousel** = **≥2 images**, **no video** (published as a PDF document — you attach images, not a PDF file) | **3,000** |
| **LinkedIn Page** | <Badge text="linkedin-page" variant="param" /> | Same media rules as LinkedIn | **3,000** |
| **YouTube** | <Badge text="youtube" variant="param" /> | Exactly **one MP4** video | **5,000** (description) |
| **TikTok** | <Badge text="tiktok" variant="param" /> | **≥1** attachment; **one MP4** <strong>or</strong> **1–35** JPEG/PNG/WEBP photos (never mixed) | **2,000** |
| **Dev.to** | <Badge text="devto" variant="param" /> | Markdown body; optional **cover image** in Settings (not required on the media strip) | **100,000** (body) |

<Callout type="note">
<p> On X, the limit depends on the post type: <strong>280</strong> characters for a standard post, <strong>4,000</strong> when the connected account is verified, and up to <strong>100,000</strong> in long-form <strong>article</strong> mode on the platform. OpenQuok schedules standard and verified posts only — it uses the <strong>280</strong> or <strong>4,000</strong> cap from the table.</p>
</Callout>

<Callout type="warning">
<p>OpenQuok does not ship article mode. The post editor uses <strong>weighted</strong> counting, while links and mentions can cost more than one character. See <a href="/docs/creating-posts/writing-the-post#character-count">Writing the post → Character count</a>.</p>
</Callout>

<Callout type="tip">
<p>In <strong>Global</strong> mode, one shared media list must satisfy every selected network. Unlock a channel to give it its own attachments. See <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.</p>
</Callout>

Connect methods are in <a href="/docs/platforms/connect-rules">Connect rules</a>. Extra length limits in **Settings** are in <a href="/docs/platforms/per-channel-settings">Per-channel settings</a> — for example YouTube **title** (**2–100** characters), Dev.to **title** (at least **2** characters), and TikTok photo carousel **title** (up to **90** characters).

| Where you work | Length check |
| --- | --- |
| **Dashboard** | The counter blocks over-limit text when you schedule. Drafts may save longer copy until you shorten it. |
| **API, CLI, MCP** | <Badge text="status: scheduled" variant="param" /> / <Badge text="-t schedule" variant="param" /> uses the same caps. <Badge text="status: draft" variant="param" /> / <Badge text="-t draft" variant="param" /> may store longer text until you schedule. |

### Media on follow-up comments

| Channel key | Media on follow-ups |
| --- | --- |
| <Badge text="threads" variant="param" />, <Badge text="x" variant="param" /> | Yes |
| <Badge text="instagram-business" variant="param" />, <Badge text="instagram-standalone" variant="param" />, <Badge text="linkedin" variant="param" />, <Badge text="linkedin-page" variant="param" /> | Text only |
| <Badge text="facebook" variant="param" /> | One image per follow-up (no video) |
| <Badge text="youtube" variant="param" />, <Badge text="tiktok" variant="param" />, <Badge text="devto" variant="param" /> | Follow-ups not supported |

Terminology for thread replies vs comments is in <a href="/docs/platforms">Platforms overview</a>. Composer steps are in <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a>.

### Settings-only media

| Channel key | Setting | Purpose |
| --- | --- | --- |
| <Badge text="youtube" variant="param" /> | Custom thumbnail | Optional still image for the video |
| <Badge text="devto" variant="param" /> | Cover image | Optional hero image for the article |

## Caption editors

Each channel uses one caption editor mode when you unlock it in per-channel mode. **Global** mode always uses the **Standard** plain textarea.

| Editor | Channel keys |
| --- | --- |
| **Standard** | <Badge text="threads" variant="param" />, <Badge text="facebook" variant="param" />, <Badge text="instagram-business" variant="param" />, <Badge text="instagram-standalone" variant="param" />, <Badge text="linkedin" variant="param" />, <Badge text="linkedin-page" variant="param" />, <Badge text="youtube" variant="param" />, <Badge text="tiktok" variant="param" /> |
| **Markdown** | <Badge text="devto" variant="param" /> |
| **HTML** | <Badge text="x" variant="param" /> (published as plain text after strip) |

<Callout type="note">
Toolbar details are in <a href="/docs/creating-posts/writing-the-post#editor-by-platform">Writing the post → Editor by platform</a>.
</Callout>

## Related

<CardGrid>
<LinkCard title="Platforms overview" description="Naming, follow-ups, and how rules apply" href="/docs/platforms" />
<LinkCard title="Per-channel settings" description="Composer Settings fields per network" href="/docs/platforms/per-channel-settings" />
<LinkCard title="Media" description="Upload, library, and the media strip" href="/docs/creating-posts/media" />
<LinkCard title="Links and validation" description="Save-time errors in the composer" href="/docs/creating-posts/links-and-validation" />
</CardGrid>

---
title: Media details
description: Set alt text and video poster frames for files in the workspace media library.
order: 3
lastUpdated: 2026-09-23
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Media details

> Describe images for accessibility and pick a cover frame for videos — once per library file.

Open **Media details** from the library in any of these ways:

| Entry point | How |
| --- | --- |
| **File manager** | Open a file, or right-click → <strong>Media settings</strong> |
| **Gallery view** | Use the settings control on a tile |

The same dialog is available from the post composer when you click a thumbnail or the gear on an attachment. Changes save to the **workspace media library** and apply wherever that file is reused.

## Alt text

| Field | Rule |
| --- | --- |
| **Alt text** | Up to **2000** characters. Describes the image for screen readers and previews. |

Alt text is most useful for images. It is stored with the file in OpenQuok. At publish time, OpenQuok does not send alt text to every network API — platform behavior varies.

## Video poster

For **video** files you can set a **poster** (thumbnail image):

1. Choose **Create thumbnail** (or open the thumbnail editor).
2. Move the slider to the frame you want.
3. Click **Use current frame as thumbnail**.
4. **Clear thumbnail** removes a poster you set earlier.

The poster is saved with the media record. For some channels (for example Instagram reels), publish settings may use the poster **timestamp** for cover offset. Network-specific publish fields stay in composer **Settings** — see <a href="/docs/platforms/per-channel-settings">Per-channel settings</a>.

<Callout type="note">
<p>If you edit the same file from the composer and from <strong>/account/media</strong>, you see one shared <strong>Media details</strong> form. Saving in either place updates the library copy.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Media in the composer" description="Attachments, reorder, and per-channel media" href="/docs/creating-posts/media#media-settings" />
<LinkCard title="Media library overview" description="Where files live and how to add them" href="/docs/media" />
<LinkCard title="Media rules" description="What each network allows at publish time" href="/docs/platforms/media-rules" />
</CardGrid>

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

> Describe images for accessibility and pick a cover frame for videos.

Open **Media details** from the library in any of these ways:

| Entry point | How |
| --- | --- |
| **File manager** | Open a file, or right-click → <strong>Media settings</strong> |

![Click file manager's Media Settings](/docs/_assets/media/file-actions.webp)

| **Gallery view** | Use the settings control (<strong>Gear</strong> Icon) on a tile |

![Open Gallery's Media Settings Modal](/docs/_assets/media/gallery-media-gear-icon.webp)

The same dialog is available from the post editor when you click a thumbnail or the gear on an attachment. Changes save to the **workspace media library** and apply wherever that file is reused.

## Alt text

| Field | Rule |
| --- | --- |
| **Alt text** | Up to **2000** characters. Describes the image for screen readers and previews. |

Alt text is most useful for images. It is stored with the file in OpenQuok. At publish time, OpenQuok does not send alt text to every network API — platform behavior varies.

## Video poster

For **video** files you can set a **thumbnail image**:

1. Choose **Create thumbnail** (**or Edit thumbnail**).
2. Move the slider to the frame you want.
3. Click **Use current frame as thumbnail**.
4. **Clear thumbnail** removes a poster you set earlier.

![Edit Gallery's Media Thumbnail](/docs/_assets/media/gallery-media-settings.webp)


<Callout type="tip">
<p>On some channels (for example <strong>Instagram Reels</strong>), the frame you pick here can become the video cover when the post goes live. You choose the frame in Media details — not in per-channel Settings.</p>
</Callout>

<Callout type="note">
<p>Captions, tags, link previews, and other publish-only options stay in composer <strong>Settings</strong>, not in Media details. See <a href="/docs/platforms/per-channel-settings">Per-channel settings</a>.</p>
</Callout>

<Callout type="note">
<p>If you edit the same file from the post editor and from <strong>/account/media</strong>, you see one shared <strong>Media details</strong>. Saving in either place updates the library copy.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Media in the composer" description="Attachments, reorder, and per-channel media" href="/docs/creating-posts/media#media-settings" />
<LinkCard title="Media library overview" description="Where files live and how to add them" href="/docs/media" />
<LinkCard title="Media rules" description="What each network allows at publish time" href="/docs/platforms/media-rules" />
</CardGrid>

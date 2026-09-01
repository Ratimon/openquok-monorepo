---
title: Media
description: Attach images and video in the post editor — device upload, library, Design Media, limits, and Global vs per-channel lists.
order: 4
lastUpdated: 2026-09-01
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

The composer attaches **images and video** below the caption. Use the **toolbar** to add files and the **drag & drop** section to review thumbnails.

In **Global** mode, one attachment list is copied to every channel selected. You can unlock that channel — see <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.

![Post editor with media toolbar and media drag&drop](/docs/_assets/creating-posts/editor-media.webp)

## Ways to add media

| Method | What happens |
| --- | --- |
| **Add media** | First toolbar button opens a device picker. Choose one or more images or videos from your computer. Files upload to your workspace. |
| **Drag and drop** | Drop images or videos onto the area. Same upload rules as **Add media**. |
| **Media library** | Second toolbar button — attach files already stored at <a href="/account/media">/account/media</a>. See <a href="/docs/getting-started/tour-the-app">Tour the app</a> for where the library lives in the sidebar. |
| **Design Media** | Canvas toolbar button — open the **Photo Editor**, create or edit a visual, then choose **Use this media** to attach the export. Same canvas as the public <a href="/tools/photo-editor">Photo Editor</a> tool. |

<Callout type="note">
<p>Sign in to attach from the <strong>media library</strong> or <strong>Design Media</strong>. The public Photo Editor tool can export without a workspace.</p>
</Callout>

## Limits and formats

| | Limit |
| --- | --- |
| Image | 10 MB each |
| Video | 1 GB each |
| Accepted | JPEG, PNG, GIF, WebP, SVG, AVIF, MP4, MOV, WebM, M4V, MPEG |

<Callout type="note">
<p>The browser blocks an image over <strong>30 MB</strong> before upload. The server rejects an image over <strong>10 MB</strong>. One drop or multi-select cannot exceed <strong>1 GB</strong> total.</p>
</Callout>

The composer accepts images and videos only. The media library, CLI, and Uploads API also accept audio and PDF.

Platform rules are stricter than these and vary a lot: YouTube wants exactly one video, Instagram needs at least one attachment, and TikTok does not mix photos and video. See <a href="/docs/platforms">Posting rules by platform</a>. The **Post Preview** column and the validation under the media strip warn you before save.

## Reorder and remove

Each thumbnail has **Move up** and **Move down** chevrons and a **Remove** control. Order in the strip is **publish order** — the first file is the lead attachment.

## Media settings

In the post editor, click a strip thumbnail or the **gear** icon on hover to open **Media details**.

| Field | What you can set |
| --- | --- |
| **Alt text** | Up to **2000** characters. Describes the image for accessibility( eg. SEO) and preview. |
| **Video poster** | Choose **Create thumbnail**, drag the slider to the frame you want, then **Use current frame as thumbnail**. That image is the video cover. **Clear thumbnail** removes it. |

Changes save to the **workspace media library** and on each scheduled <Badge text="media[]" variant="param" /> item for that attachment. The same **Media details** dialog is available on <a href="/account/media">/account/media</a>.

At publish time, Instagram uses the video poster **timestamp** for reel cover offset. OpenQuok does not send alt text to Meta or X APIs.

Channel-specific visuals that are part of publish settings stay in **Settings** beside the preview — for example a **YouTube custom thumbnail** or a **Dev.to cover image**. See <a href="/docs/platforms">Posting rules by platform</a>.

## Photo Editor

**Design Media** in the composer opens the same Konva canvas as <a href="/tools/photo-editor">/tools/photo-editor</a>. Draw, add text, or start from a template, then export with **Use this media** to add the image to the post.

Cloud save requires a signed-in workspace. If workspace storage is full, save is blocked — see <a href="/docs/cloud/limits">Cloud limits</a>.

## Global mode (default)

Open the composer and you are already in Global mode. Whatever you attach in the media strip is scheduled on **every** selected channel.

## Per-channel attachments

Sometimes one channel needs a different image or video — a square crop for Instagram, a shorter clip for TikTok, or no media at all.

The flow mirrors per-channel captions:

<Steps howToName="Attach different media on one channel">

### Focus the channel

Click that channel’s avatar at the top of the composer. The caption and media strip are locked behind the same overlay.

### Click Edit content

Unlock the channel. The media strip shows a **copy of the current Global list** — change it without affecting channels you have not customized yet.

### Edit attachments for that channel only

Add, remove, or reorder files in the media strip. Switch to another customized channel by clicking its avatar; each keeps its own list until you save.

### Save as usual

OpenQuok stores per-channel lists only for channels you edited while unlocked. Everyone else keeps the shared Global attachments.

</Steps>

<p>Channels you never unlock still receive the Global media list. Going back to Global with <strong>← Back to global</strong> drops <strong>all</strong> per-channel caption and attachment overrides — the confirm dialog is irreversible. See <a href="/docs/creating-posts/global-vs-per-channel#go-back-to-global">Go back to Global</a>.</p>

<Callout type="note" title="Templates and sets">
<p>When you define a reusable <a href="/docs/creating-posts/templates">template</a> or workspace set, authoring stays in Global mode — per-channel media overrides are not saved in the preset.</p>
</Callout>

## Preview column

The **Post Preview** on the right reflects the attachment list for the channel you are focused on in custom mode, or the shared Global list when every selected channel still uses it. If previews look wrong for one network, focus that channel and check its media strip (or unlock and adjust).

## When an upload fails

<Callout type="warning" title="Unsupported file type">
<p>The composer rejects files that are not <code>image/*</code> or <code>video/*</code>. The library and API also allow <code>audio/*</code> and <code>application/pdf</code>. You see an error toast when the type is not allowed.</p>
</Callout>

<Callout type="warning" title="File too large">
<p>Images over <strong>30 MB</strong> are blocked in the browser before upload. Images over <strong>10 MB</strong> are rejected on the server. Videos over <strong>1 GB</strong> are rejected. A multi-file batch over <strong>1 GB</strong> total is rejected.</p>
</Callout>

<Callout type="warning" title="Platform rules after upload">
<p>Upload can succeed and save-time validation still fails — for example too many images on X, mixed photos and video on TikTok, or no media on Instagram. Fix the strip or unlock that channel and adjust. See <a href="/docs/platforms">Posting rules by platform</a>.</p>
</Callout>

<Callout type="warning" title="Workspace storage full">
<p>On OpenQuok Cloud, uploads stop when the workspace hits its media storage cap. Delete files in the library or upgrade — see <a href="/docs/cloud/limits">Cloud limits</a>.</p>
</Callout>

## Public API and CLI

Outside the dashboard, pass shared attachments in <Badge text="media" variant="param" /> and channel-specific lists in <Badge text="mediaByIntegrationId" variant="param" /> (keyed by integration UUID). Channels omitted from the map inherit the top-level <Badge text="media" variant="param" /> array.

Upload assets first with <Badge text="openquok upload" variant="default" /> or <Badge text="upload-from-url" variant="param" />, or <Badge text="POST /public/uploads" variant="path" />, then reference the returned <code>id</code> and <code>path</code> values. Step-by-step commands are in <a href="/docs/cli-usages/media-upload">Media upload</a>; HTTP details are in <a href="/docs/apis-uploads">Uploads APIs</a>.

## Related

<CardGrid>
<LinkCard title="Creating posts overview" description="Editor layout, flow, and save options" href="/docs/creating-posts" />
<LinkCard title="Global vs per-channel" description="One caption or a version per network" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="Tour the app" description="Sidebar, media library, and composer entry points" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Photo Editor" description="Public Photo Editor — same canvas as Design Media in the composer" href="/tools/photo-editor" />
<LinkCard title="Posting rules by platform" description="Image, video, and carousel limits per network" href="/docs/platforms" />
<LinkCard title="Media upload (CLI)" description="openquok upload and upload-from-url recipes" href="/docs/cli-usages/media-upload" />
<LinkCard title="Uploads APIs" description="Attach media via the public API" href="/docs/apis-uploads" />
</CardGrid>

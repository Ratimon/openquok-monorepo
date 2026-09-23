---
title: Add media
description: Upload images and videos, save designs, import from connectors, and understand size and storage limits.
order: 2
lastUpdated: 2026-09-23
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Add media

> Put new images and videos into the workspace library from **Upload**, **Canvas**, or drag-and-drop on <a href="/account/media">/account/media</a>.

<Callout type="warning">
<p>All paths respect your <strong>workspace storage quota</strong>. When storage is full, the page shows a warning and limit your new adds until you delete files or <a href="/docs/billing/limits">upgrade your plan</a>.</p>
</Callout>

## Upload

| Method | Steps |
| --- | --- |
| **Upload button** | Click <strong>Upload</strong>, then browse or drop files in the dialog. Upload starts when files are added. |

![Upload Media in File Manager](/docs/_assets/media/view-modes.webp)

| Method | Steps |
| --- | --- |
| **Drag and drop** | Drop images or videos onto the file manager or onto the gallery grid (including the empty library state). |

<Callout type="warning">
<p>Only <strong>images and videos</strong> are accepted on this page. Other types are rejected with an error message..</p>
</Callout>

### Size limits

| Rule | Limit |
| --- | --- |
| Image (browser check) | 30 MB per file before upload |
| Image (server) | 10 MB per file |
| Video | 1 GB per file |
| One batch (multi-select or drop) | 1 GB combined |

<Callout type="note">
<p>Accepted types match the composer: JPEG, PNG, GIF, WebP, SVG, AVIF, MP4, MOV, WebM, M4V, MPEG. See <a href="/docs/creating-posts/media#limits-and-formats">Creating posts → Media → Limits and formats</a> for the full table.</p>
</Callout>

<Callout type="warning">
<p>The page subtitle shows the per-file hint (for example <strong>10 MB per image, 1 GB per video</strong>). Limits are per file, not per workspace.</p>
</Callout>

### Destination folder

In list, grid, or panels view, uploads go to the **folder you have open**. The page shows that path under the title. Change folder before you upload, or move files afterward — see <a href="/docs/media/browse-and-organize">Browse and organize</a>.

## Canvas Editor

Click **Canvas** to open the canvas editor (templates, text, and shapes — same family of tools as <a href="/tools/photo-editor">Photo Editor</a> and **Design Media** in the post editor).

![Click to Open Canvas Editor](/docs/_assets/media/view-modes.webp)

When you finish, choose **Save this for later**. The export is stored in the library like an upload. Design is disabled when storage is full or no workspace is selected.

![USe Canvas Editor and Save](/docs/_assets/media/canvas-editor.webp)

## Import

When your workspace has at least one connector scoped to the media library, an **Import** button appears in the **same toolbar row as Upload and Design** (top right of the Media library page).

Open **Import**, choose the connected source, then select files to copy into OpenQuok. Import is blocked when storage is full.

<Callout type="note">
<p>If you only see <strong>Upload</strong> and <strong>Design</strong>, no <strong>media-library</strong> connector is enabled for that workspace yet — Import stays hidden until one is configured on the server.</p>
</Callout>

## Storage banner

Below the title, OpenQuok shows **workspace media storage** used versus your hosted cloud plan per workspace.

| State | What you see |
| --- | --- |
| Under the cap | Used and total size |
| At the cap | A warning, <strong>Storage full</strong> on Upload, and an <Badge text="Upgrade plan" variant="experimental" /> link |

## After you add files

Reuse them in the composer via **Media library**, or open **Media details** on the file to set alt text or a video poster — <a href="/docs/media/media-details">Media details</a>.

## Deleting files

<Callout type="note">
<p>Deleting removes the file from workspace storage and from the media library, meaning the the network already has its own copy of the image or video. It does <strong>not</strong> unpublish or edit posts that already went live.</p>
</Callout>

| Situation | What happens |
| --- | --- |
| **Already published** | The live post on the network stays as it was. OpenQuok keeps the post record, but calendar thumbnails, composer previews, and shared preview pages may show **broken media**. |
| **Scheduled or draft** | Publish can **fail** if the post still references a deleted file. |


## Related

<CardGrid>
<LinkCard title="Browse and organize" description="Folders, views, and file actions" href="/docs/media/browse-and-organize" />
<LinkCard title="Media in the composer" description="Attach library files while writing a post" href="/docs/creating-posts/media" />
<LinkCard title="Cloud limits" description="Storage caps by plan" href="/docs/billing/limits" />
<LinkCard title="Media upload (CLI)" description="Upload from scripts and agents" href="/docs/cli-usages/media-upload" />
</CardGrid>

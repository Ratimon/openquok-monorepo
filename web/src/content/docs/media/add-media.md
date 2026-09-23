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

> Put new images and videos into the workspace library from Upload, Design, drag-and-drop, or Import.

All paths respect your **workspace storage quota**. When storage is full, the page shows a warning and blocks new adds until you delete files or <a href="/docs/cloud/limits">upgrade your plan</a>.

## Upload

| Method | Steps |
| --- | --- |
| **Upload button** | Click <strong>Upload</strong>, then browse or drop files in the dialog. Upload starts when files are added. |
| **Drag and drop** | Drop images or videos onto the file manager or onto the gallery grid (including the empty library state). |

Only **images and videos** are accepted on this page. Other types are rejected with an error message.

While files upload, a **progress overlay** shows encoding (for images) and upload progress. You cannot start another batch until it finishes.

### Size limits

| Rule | Limit |
| --- | --- |
| Image (browser check) | 30 MB per file before upload |
| Image (server) | 10 MB per file |
| Video | 1 GB per file |
| One batch (multi-select or drop) | 1 GB combined |

Accepted types match the composer: JPEG, PNG, GIF, WebP, SVG, AVIF, MP4, MOV, WebM, M4V, MPEG. See <a href="/docs/creating-posts/media#limits-and-formats">Creating posts → Media → Limits and formats</a> for the full table.

<Callout type="note">
<p>The page subtitle shows the per-file hint (for example <strong>10 MB per image, 1 GB per video</strong>). Limits are per file, not per workspace.</p>
</Callout>

### Destination folder

In list, grid, or panels view, uploads go to the **folder you have open**. The page shows that path under the title. Change folder before you upload, or move files afterward — see <a href="/docs/media/browse-and-organize">Browse and organize</a>.

## Design

Click **Design** to open the canvas editor (templates, text, and shapes — same family of tools as <a href="/tools/photo-editor">Photo Editor</a> and **Design Media** in the composer).

When you finish, choose **Save this for later**. The export is stored in the library like an upload. Design is disabled when storage is full or no workspace is selected.

## Import

If your workspace has a **media-library** connector configured, an **Import** button appears. Open it, pick the source, then select files to copy into OpenQuok.

Import is blocked when storage is full. If no connector is set up, the button does not show.

## Storage banner

Below the title, OpenQuok shows **workspace media storage** used versus your plan cap (per workspace on hosted cloud).

| State | What you see |
| --- | --- |
| Under the cap | Used and total size |
| At the cap | A warning, <strong>Storage full</strong> on Upload, and an **Upgrade plan** link to <Badge text="/account/billing" variant="path" /> when billing is available |

Self-hosted installs may not show a quota bar; server limits still apply.

## After you add files

Reuse them in the composer via **Media library**, or open **Media details** on the file to set alt text or a video poster — <a href="/docs/media/media-details">Media details</a>.

## Deleting files you added

Deleting removes the file from the workspace library. **Published** posts are not changed — networks keep their own copy. **Scheduled** posts that still reference a deleted file can fail at publish time. Check the calendar before you delete recent assets.

## Related

<CardGrid>
<LinkCard title="Browse and organize" description="Folders, views, and file actions" href="/docs/media/browse-and-organize" />
<LinkCard title="Media in the composer" description="Attach library files while writing a post" href="/docs/creating-posts/media" />
<LinkCard title="Cloud limits" description="Storage caps by plan" href="/docs/cloud/limits" />
<LinkCard title="Media upload (CLI)" description="Upload from scripts and agents" href="/docs/cli-usages/media-upload" />
</CardGrid>

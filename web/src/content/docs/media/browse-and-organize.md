---
title: Browse and organize
description: Navigate folders, switch layouts, search, preview, and move or delete files in the workspace media library.
order: 1
lastUpdated: 2026-09-23
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Browse and organize

> Use the folder tree, breadcrumbs, and layout buttons to find files and keep each workspace tidy.

The main browser is a **file manager**.

![Open OpenQuok Media Tab on the Left Sidebar](/docs/_assets/media/file-manager.webp)

- a navigation tree on the left
- the current folder in the center
- a toolbar for search and display options

## View modes

Use the four buttons next to the page title. **Grid view** is the default.

![Select Your View Modes](/docs/_assets/media/view-modes.webp)

| Mode | Best for |
| --- | --- |
| **List view** | File size and dates in a table; sort by clicking column headers |
| **Grid view** | Thumbnails in a card layout (default) |
| **Panels view** | Two folders side by side — useful when you copy or move between locations |
| **Gallery view** | A flat, paginated grid of every file in the workspace (no folder tree on this mode) |

In list, grid, or panels mode, turn the **preview** control (eye icon) on or off to show file details beside the list.

See **Gallery view** below for the workspace-wide thumbnail grid, pagination, and tile actions.

## Folders

Every workspace includes two top-level folders:

| Folder | What goes here |
| --- | --- |
| **General** | Uploads, designs, and imports from the <a href="/account/media">Media library</a> page. This is the default when you upload from that page. |
| **Posts** | Media you attach from the post ediotor — see <a href="/docs/creating-posts/media">Media</a>. |

![OpenQuok 's Parent Folder in Grid View](/docs/_assets/media/my-files.webp)

| Folder | What goes here |
| --- | --- |
| **Posts/unscheduled** | Composer attachments when the post has no publish date yet. |
| **Posts/YYYY-MM-DD** | Composer attachments for scheduled posts (UTC calendar day). |

<Callout type="tip">
<p>You can create additional folders with <strong>New folder</strong>.</p>
</Callout>

<Callout type="warning">
<p>You can create additional folders with <strong>New folder</strong>. <strong>General</strong>, <strong>Posts</strong>, and <strong>Posts/unscheduled</strong> are built in and cannot be deleted.</p>
</Callout>

| Action | How |
| --- | --- |
| **Open a folder** | Click it in the tree or in the main pane |
| **Open the parent folder** | Click a breadcrumb segment, or choose **Back to parent folder** |
| **Create a folder** | In the navigation pane, choose <strong>Add New</strong> → <strong>New folder</strong>, enter a name, confirm |
| **Delete a folder** | Select the folder, then delete from the context menu or keyboard (see below) |

<Callout type="tip">
<p>Uploads and designs from <a href="/docs/media/add-media">Add media</a> save to the folder you have open in the file manager at that moment. Move them later if needed.</p>
</Callout>

## File actions

Select one or more files or folders, then use the **right-click menu** or shortcuts.

| Action | Shortcut (where supported) |
| --- | --- |
| **Copy** | Ctrl+C |
| **Cut** (move) | Ctrl+X |
| **Paste** | Ctrl+V |
| **Rename** | Ctrl+R (one item at a time) |
| **Delete** | Del or Backspace |
| **Download** | Ctrl+D (files only) |
| **Search** | Ctrl+F in the toolbar search box |
| **Open file location** from search results | Ctrl+Alt+O |
| **Select all** in the current folder | Ctrl+A |

![OpenQuok file manager 's file actions](/docs/_assets/media/file-actions.webp)

<Callout type="note">
<p>See more regarding <a href="/docs/media/media-details">Media details</a>.</p>
</Callout>

<Callout type="tip">
<p>You can copy and paste work across folders in <strong>panels view</strong> by opening source and destination in each panel, then cut or copy and paste..</p>
</Callout>

![OpenQuok 's Panel View](/docs/_assets/media/panel-view.webp)

## Gallery view

Gallery mode hides the folder tree and file-manager layout. You get one paginated thumbnail grid of **every file in the workspace**, across **General**, **Posts**, and any custom folders.

It is the fastest way to scan the whole library when you are not sure which folder holds an asset. Page through results at the bottom — page sizes are **12**, **24**, **48**, or **96** items.

![OpenQuok Gallery View](/docs/_assets/media/gallery-view.webp)

Each tile offers **preview**, **settings**, and **delete**:
- **Preview** opens a larger view
- **Settings** opens **Media details** for alt text and video posters
- **Delete** asks you to confirm. You can still **upload** by dragging files onto the grid.

<Callout type="note">
<p>Copy, move, rename, and folder actions live in <strong>list</strong>, <strong>grid</strong>, or <strong>panels</strong> view. Switch back when you need the full file manager. See <a href="/docs/media/media-details">Media details</a>.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Media library overview" description="What the library stores and how it connects to posts" href="/docs/media" />
<LinkCard title="Add media" description="Upload, Design, and Import" href="/docs/media/add-media" />
<LinkCard title="Media details" description="Alt text and video thumbnails" href="/docs/media/media-details" />
</CardGrid>

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

- a navigation tree on the left
- the current folder in the center
- a toolbar for search and display options

## View modes

Use the four buttons next to the page title.

| Mode | Best for |
| --- | --- |
| **List view** | File size and dates in a table; sort by clicking column headers |
| **Grid view** | Thumbnails in a card layout (default) |
| **Panels view** | Two folders side by side — useful when you copy or move between locations |
| **Gallery view** | A flat, paginated grid of every file in the workspace (no folder tree on this mode) |

In list, grid, or panels mode, turn the **preview** control (eye icon) on or off to show file details beside the list.

Gallery view uses **pagination** at the bottom. Change page size (12, 24, 48, or 96 items) when you have many files.

<Callout type="tip">
<p>In gallery view you can still upload by dragging files onto the grid or the empty-state drop zone.</p>
</Callout>

## Folders

Virtual folders group files inside a workspace. They do not change where files are stored on the server; they are labels you use to stay organized.

| Action | How |
| --- | --- |
| **Open a folder** | Click it in the tree or in the main pane |
| **Go up** | Use breadcrumbs or **back to parent folder** |
| **Create a folder** | In the navigation pane, choose <strong>Add New</strong> → <strong>New folder</strong>, enter a name, confirm |
| **Delete a folder** | Select the folder, then delete from the context menu or keyboard (see below) |

New uploads and designs from <a href="/docs/media/add-media">Add media</a> go into the folder that is open when you add them.

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

Copy and paste work across folders. In **panels view**, open source and destination in each panel, then cut or copy and paste.

Open a **file** (not a folder) to open **Media details** when the item is a library asset — see <a href="/docs/media/media-details">Media details</a>. You can also pick **Media settings** from the context menu.

## Gallery view actions

Each tile has controls to **preview**, open **settings**, or **delete**. Preview opens a larger view; delete asks you to confirm.

## While uploads run

The file manager is **read-only** until the current upload batch finishes. Wait for the progress overlay to clear before you move or delete files.

## Related

<CardGrid>
<LinkCard title="Media library overview" description="What the library stores and how it connects to posts" href="/docs/media" />
<LinkCard title="Add media" description="Upload, Design, and Import" href="/docs/media/add-media" />
<LinkCard title="Media details" description="Alt text and video thumbnails" href="/docs/media/media-details" />
</CardGrid>

---
title: Overview - Media library
description: Store images and videos per workspace, organize them in folders, and reuse them in the post composer.
order: 0
lastUpdated: 2026-09-23
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Media library

> Every image and video you upload for a workspace lives in one place — ready for posts, channel art, and designs.

Open the library from the account sidebar: <Badge text="Media" variant="default" /> at <Badge text="/account/media" variant="path" />. The page title shows the **current workspace**. Switch workspaces in the header to manage another team’s files.

![Open OpenQuok Media Tab on the Left Sidebar](/docs/_assets/media/my-files.webp)

<Callout type="note">
<p>You must select a workspace before the library loads. If the page is empty, pick a workspace from the header switcher.</p>
</Callout>

## What you can store here

| Source | What lands in the library |
| --- | --- |
| **Upload** on this page | Images and videos from your device |
| **Design** on this page | Exports from the built-in canvas (same editor as <strong>Design Media</strong> in the composer) |
| **Import** | Files copied from a connected third-party source (when your workspace has that connector) |
| **Post Editor** | Uploads and designs you attach while composing a post |

The library page accepts **images and videos only**. Other file types may work through the <a href="/docs/cli-usages/media-upload">CLI</a> or <a href="/docs/apis-uploads">Uploads API</a> — see <a href="/docs/creating-posts/media">Media in the composer</a> for how those attach to posts.

## How the page is laid out

| Area | Role |
| --- | --- |
| **View controls** | Switch between list, grid, split panels, and gallery layouts — see <a href="/docs/media/browse-and-organize">Browse and organize</a> |
| **Upload**, **Design**, **Import** | Add new files — see <a href="/docs/media/add-media">Add media</a> |
| **Storage banner** | Shows how much of your workspace media quota is in use. When the cap is full, new uploads are blocked until you free space or upgrade — see <a href="/docs/cloud/limits">Cloud limits</a> |
| **Main pane** | Folder tree, file list, or gallery grid depending on the view you chose |

Uploads and new designs save to the **folder you have open** in list, grid, or panels view (often **General**). Composer attachments are filed under **Posts** automatically. You can move files to another folder later — see <a href="/docs/media/browse-and-organize#folders">Browse and organize → Folders</a>.

## Use files in posts

In the composer, open **Media library** from the toolbar to attach files you already stored. You do not need to upload the same asset twice. Step-by-step attachment, reorder, and per-channel lists are in <a href="/docs/creating-posts/media">Creating posts → Media</a>.

## In this section

<CardGrid>
<LinkCard title="Browse and organize" description="Views, folders, search, preview, and file actions" href="/docs/media/browse-and-organize" />
<LinkCard title="Add media" description="Upload, Design, Import, limits, and storage" href="/docs/media/add-media" />
<LinkCard title="Media details" description="Alt text and video poster for library files" href="/docs/media/media-details" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Media in the composer" description="Attach, reorder, and per-channel attachments" href="/docs/creating-posts/media" />
<LinkCard title="Tour the app" description="Where Media lives in the sidebar" href="/docs/getting-started/tour-the-app" />
<LinkCard title="Cloud limits" description="Workspace media storage caps on hosted plans" href="/docs/cloud/limits" />
<LinkCard title="Media rules" description="Per-network image and video limits at publish time" href="/docs/platforms/media-rules" />
</CardGrid>

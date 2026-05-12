---
title: Overview - Uploads APIs
description: Programmatic media uploads. Returns the storage `id` + `path` you pass back as `media[]` when creating or updating a post group.
order: 0
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Endpoints

<CardGrid>
<LinkCard title="Upload File" description="Multipart upload (field name `file`) for images, video, audio, and PDF — returns the media id and storage path" href="/docs/apis-uploads/upload" />
<LinkCard title="Upload from URL" description="Server-side fetches a public URL and stores it — same return shape as Upload File" href="/docs/apis-uploads/upload-from-url" />
</CardGrid>

<Callout type="note" title="How uploads chain into posts">
<p>Upload an asset first, keep the returned <code>id</code> and <code>path</code>, then pass them as <code>media: [{ id, path }]</code> inside the <Badge text="POST /public/posts" variant="default" /> body (or the <Badge text={"PUT /public/posts/group/{postGroup}"} variant="default" /> body).</p>
</Callout>

## Constraints

| Constraint | Value |
| --- | --- |
| Multipart field name | <Badge text="file" variant="default" /> |
| Allowed mime types | image/<em>*</em>, video/<em>*</em>, audio/<em>*</em>, <Badge text="application/pdf" variant="default" /> |
| Per-file size cap | <Badge text="MAX_MEDIA_UPLOAD_BYTES" variant="envBackend" /> (shared with the session uploader) |
| Auth header | <Badge text="Authorization: opo_..." variant="default" /> (API key or OAuth app token) |

## Related Section(s)

<CardGrid>
<LinkCard title="Posts APIs" description="Pass the returned `id` and `path` as `media[]` when creating or updating a post group" href="/docs/apis-posts" />
<LinkCard title="Integrations APIs" description="List, connect, and inspect the channels you'll publish the uploaded media to" href="/docs/apis-integrations" />
<LinkCard title="Public API" description="Authentication, base URL, payload wizard, and SDK quick start" href="/docs/getting-started-for-public-api" />
</CardGrid>

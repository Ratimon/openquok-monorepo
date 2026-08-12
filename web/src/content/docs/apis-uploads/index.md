---
title: Overview - Uploads APIs
description: Programmatic media uploads. Returns the storage `id` + `filePath` you pass back as `media[]` when creating or updating a post group.
order: 0
lastUpdated: 2026-08-11
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Endpoints

<CardGrid>
<LinkCard title="Upload File" description="Multipart upload (field name `file`) for images and short clips under the hosted inbound body limit" href="/docs/apis-uploads/upload" />
<LinkCard title="Upload from URL" description="Server-side fetches a public URL and stores it — same return shape as Upload File" href="/docs/apis-uploads/upload-from-url" />
<LinkCard title="Create Multipart Upload" description="Start a direct-to-storage upload for videos larger than ~4 MB" href="/docs/apis-uploads/create-multipart" />
<LinkCard title="Sign Multipart Parts" description="Presign PUT URLs so the client uploads bytes straight to object storage" href="/docs/apis-uploads/sign-parts" />
<LinkCard title="Complete Multipart Upload" description="Assemble parts and persist a media row — same id/filePath as Upload File" href="/docs/apis-uploads/complete-multipart" />
<LinkCard title="Abort Multipart Upload" description="Cancel an in-flight multipart session and discard uploaded parts" href="/docs/apis-uploads/abort-multipart" />
</CardGrid>

<Callout type="note" title="How uploads chain into posts">
<p>Upload an asset first. The API returns <code>data.id</code> and <code>data.filePath</code>. Pass them as <code>media: [{ id, path }]</code> inside the <Badge text="POST /public/posts" variant="default" /> body — <code>path</code> is the post field and must be the upload <code>filePath</code>.</p>
</Callout>

<Callout type="warning" title="Hosted inbound body limit">
<p><Badge text="POST /public/upload" variant="path" /> on OpenQuok Cloud is capped at about <strong>4.5 MB</strong> by the function gateway (HTTP 413). The application video cap is still 1 GB. For larger files use the multipart endpoints below, or call <Badge text="openquok upload" variant="default" /> / <Badge text="Openquok.upload()" variant="default" /> — both switch automatically. Do not compress a TikTok or Reels clip to 3.5 MB just to squeeze through the simple upload.</p>
</Callout>

## Constraints

| Constraint | Value |
| --- | --- |
| Multipart field name | <Badge text="file" variant="default" /> |
| Allowed mime types | image/<em>*</em>, video/<em>*</em>, audio/<em>*</em>, <Badge text="application/pdf" variant="default" /> |
| Simple upload (hosted) | About 4 MB inbound (leave headroom under the 4.5 MB gateway) |
| Multipart part size | 5 MiB minimum except the last part |
| Per-file size cap | <Badge text="MAX_MEDIA_UPLOAD_BYTES" variant="envBackend" /> (1 GB for video; shared with the session uploader) |
| Auth header | <Badge text="Authorization: Bearer opo_..." variant="default" /> (workspace programmatic token or third-party OAuth app token) |

## Related Section(s)

<CardGrid>
<LinkCard title="Posts APIs" description="Pass the returned `id` and `path` as `media[]` when creating or updating a post group" href="/docs/apis-posts" />
<LinkCard title="Integrations APIs" description="List, connect, and inspect the channels you'll publish the uploaded media to" href="/docs/apis-integrations" />
<LinkCard title="Public API" description="Authentication, base URL, payload wizard, and SDK quick start" href="/docs/getting-started-for-public-api" />
</CardGrid>

---
title: Uploads and media
description: File size limits, allowed types, upload-from-url, workspace storage, and API payload size in OpenQuok.
order: 2
lastUpdated: 2026-09-23
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Uploads and media

> Images and videos must pass OpenQuok checks before they attach to a post or land in the library.

Dashboard limits match <a href="/docs/media/add-media">Add media</a> and <a href="/docs/creating-posts/media">Media in the composer</a>. This page adds API and automation notes.

## Size limits (dashboard)

| Rule | Limit |
| --- | --- |
| Image (browser check) | 30 MB per file before upload |
| Image (server) | 10 MB per file |
| Video | 1 GB per file |
| One batch (multi-select or drop) | 1 GB combined |

The media library page accepts **images and videos only**. The post composer accepts the same. Audio and PDF can upload through the API and CLI when your workflow needs them.

## Allowed types

**Library and composer:** JPEG, PNG, GIF, WebP, SVG, AVIF, and common video containers (MP4, MOV, WebM, M4V, MPEG) — full table in <a href="/docs/creating-posts/media#limits-and-formats">Creating posts → Media</a>.

**Public API and programmatic upload:** images, video, audio, and PDF. The server infers type from the file name and content type. Other types return an unsupported-media error.

## Workspace storage full

On OpenQuok Cloud, each workspace has a media storage cap. When you hit it, new uploads are blocked until you delete files or upgrade. See the banner on <a href="/account/media">Media</a> and <a href="/docs/billing/limits">Cloud limits</a>.

## Upload succeeded but publish failed

OpenQuok can store a file and still reject the post at save or publish time — for example too many images on X, mixed photo and video on TikTok, or Instagram with no media. Fix the attachment list or per-channel media. See <a href="/docs/platforms/media-rules">Media rules</a>.

## Public API: large JSON bodies

Most API routes accept JSON bodies up to about **10 MB** by default (<Badge text="server.bodyLimit" variant="envBackend" /> in backend config). Do not embed huge base64 files inside <Badge text="POST /public/posts" variant="path" />.

**Fix:** upload first with <Badge text="POST /public/upload" variant="path" /> or <Badge text="POST /public/upload-from-url" variant="path" />, then pass the returned <Badge text="id" variant="param" /> and <Badge text="path" variant="param" /> in the post body <Badge text="media" variant="param" /> array. CLI: <Badge text="openquok upload" variant="default" /> — see <a href="/docs/cli-usages/media-upload">Media upload</a>.

## upload-from-url fails

OpenQuok fetches the URL from the server. The request fails when:

- The URL is not public <Badge text="http://" variant="param" /> or <Badge text="https://" variant="param" />.
- The host is slow, returns an error status, or blocks automated fetch.
- The link needs login, or a signed URL already expired.

**What to try**

- Use a direct HTTPS link with no auth.
- Download the file locally and use multipart <Badge text="POST /public/upload" variant="path" /> or <Badge text="openquok upload" variant="default" /> instead.
- For dashboard library imports, use <Badge text="Upload" variant="default" /> on <a href="/account/media">Media</a>.

## Video metadata errors

OpenQuok inspects videos before publish. Providers often expect **MP4** with **H.264** video and **AAC** audio, 30 fps or less, and reasonable resolution (for example 1920×1080 landscape or 1080×1920 portrait for short-form networks). Exotic codecs may upload but fail on the network later.

## Multipart and cancel

Large direct-to-storage uploads support <Badge text="POST /public/uploads/abort-multipart" variant="path" /> to cancel an in-flight multipart session. Simple dashboard uploads do not always stop cleanly if you click away mid-transfer — wait for completion or refresh, then delete the asset if needed.

## Related

<CardGrid>
<LinkCard title="Add media" description="Upload, Design, Import, and storage banner" href="/docs/media/add-media" />
<LinkCard title="Media in the composer" description="Attach, reorder, and per-channel lists" href="/docs/creating-posts/media" />
<LinkCard title="Uploads API" description="OpenAPI reference for upload and upload-from-url" href="/docs/apis-uploads" />
<LinkCard title="Troubleshooting overview" description="Connect errors, login, and failed posts" href="/docs/troubleshooting" />
</CardGrid>

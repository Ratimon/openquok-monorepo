---
title: Media Upload
description: Upload local files or mirror a public URL into the Openquok media library, then reference the returned id and path in `posts:create`.
order: 5
lastUpdated: 2026-05-12
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Tabs, TabItem } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The <Badge text="upload" variant="param" /> and <Badge text="upload-from-url" variant="param" /> commands wrap the <a href="/docs/apis-uploads">Uploads APIs</a>:

- <Badge text="upload" variant="param" /> — multipart upload of a local file.
- <Badge text="upload-from-url" variant="param" /> — instructs the backend to fetch a public http(s) URL and store it.

Both return the same JSON envelope so downstream code (especially <Badge text="posts:create" variant="default" /> <Badge text="-m" variant="param" />) is identical regardless of the source.

<Callout type="warning" title="Why uploads are mandatory">
<p>Most providers (Instagram, Threads, TikTok, YouTube, …) require the asset to live on a verified URL controlled by Openquok. External links — even <code>https://</code> — are rejected at publish time. Upload first, then pass the returned <code>data.id</code> and <code>data.filePath</code> to <code>posts:create</code>.</p>
</Callout>

## Upload a local file

```bash
openquok upload ./image.png
openquok upload /tmp/clip.mp4
```

| Argument | Description |
| --- | --- |
| <Badge text="<filePath>" variant="param" /> (positional) | Local path to the media file (image, video, audio, PDF, …). |

### Response shape

```json
{
  "success": true,
  "data": {
    "id": "1a2b3c4d-5e6f-7081-9192-a3b4c5d6e7f8",
    "filePath": "uploads/2026/05/hero.png",
    "originalName": "hero.png",
    "publicUrl": "https://cdn.openquok.example/uploads/2026/05/hero.png"
  },
  "message": "Media uploaded successfully"
}
```

<p><Badge text="data.publicUrl" variant="param" />{' '}is only present when the workspace's storage provider exposes a public URL. The pair you need for{' '}<Badge text="posts:create" variant="param" />{' '}is{' '}<Badge text="data.id" variant="param" />{' '}+{' '}<Badge text="data.filePath" variant="param" />.</p>

## Upload from a public URL

```bash
openquok upload-from-url "https://cdn.example.com/banner.png"
openquok upload-from-url "https://cdn.example.com/clip.mp4"
```

<p>The backend fetches the URL server-side, derives the MIME type from the response <Badge text="Content-Type" variant="param" /> (or the URL extension when the header is generic), and stores the bytes in the same media bucket as <Badge text="openquok upload" variant="param" />. The response shape is identical, so any script that consumes <Badge text="upload" variant="default" /> works unchanged against <Badge text="upload-from-url" variant="default" />.</p>

<Callout type="note" title="Only http(s)">
<p>The backend validates the URL up front and rejects any scheme other than <code>http:</code> / <code>https:</code>. Authentication, redirects, and request bodies are not supported — host the asset on a publicly reachable URL or use <code>openquok upload</code> for files behind auth.</p>
</Callout>

## Upload-and-post workflow

```bash
RESULT=$(openquok upload ./photo.jpg)
MEDIA_ID=$(echo "$RESULT" | jq -r '.data.id')
MEDIA_PATH=$(echo "$RESULT" | jq -r '.data.filePath')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Check out this photo!" \
  -i "<integration-id>" \
  -m "[{\"id\":\"${MEDIA_ID}\",\"path\":\"${MEDIA_PATH}\"}]"
```

Or, more compactly, build the media JSON in one `jq` step:

```bash
MEDIA=$(openquok upload ./photo.jpg | jq -c '[{id: .data.id, path: .data.filePath}]')

openquok posts:create \
  -s "2026-01-15T10:00:00Z" \
  -t schedule \
  -c "Check out this photo!" \
  -i "<integration-id>" \
  -m "$MEDIA"
```

## Supported file types

<Tabs items={["Images", "Videos", "Audio", "Documents"]}>
<TabItem label="Images">

<p><code>png</code>, <code>jpg</code> / <code>jpeg</code>, <code>gif</code>, <code>webp</code>, <code>svg</code>, <code>bmp</code>, <code>ico</code></p>

</TabItem>
<TabItem label="Videos">

<p><code>mp4</code>, <code>mov</code>, <code>avi</code>, <code>mkv</code>, <code>webm</code>, <code>flv</code>, <code>wmv</code>, <code>m4v</code>, <code>mpeg</code>, <code>3gp</code></p>

</TabItem>
<TabItem label="Audio">

<p><code>mp3</code>, <code>wav</code>, <code>ogg</code>, <code>aac</code>, <code>flac</code>, <code>m4a</code></p>

</TabItem>
<TabItem label="Documents">

<p><code>pdf</code>, <code>doc</code>, <code>docx</code></p>

</TabItem>
</Tabs>

Per-file size is capped by <Badge text="MAX_MEDIA_UPLOAD_BYTES" variant="envBackend" /> on the backend.

## Related

<CardGrid>
<LinkCard title="Managing Posts" description="Use returned upload ids and paths when you create or schedule posts" href="/docs/cli-usages/managing-posts" />
<LinkCard title="CLI Examples — Instagram" description="Walk through reels, carousels, and stories once media is on disk or mirrored" href="/docs/cli-examples/instagram" />
<LinkCard title="Uploads APIs" description="Call the API for the same file and URL copy workflows as the CLI" href="/docs/apis-uploads" />
</CardGrid>

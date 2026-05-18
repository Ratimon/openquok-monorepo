# Threads publish behavior (server)

Summary of how the Openquok API publishes to Threads when a scheduled post runs. Use this when debugging vague Meta / Graph errors after the CLI and upload steps look correct.

## Media path → public URL

- Composer media stores an **object key** (or bucket path) in `path`.
- Before calling Meta, the server resolves each path to a **public `https://` URL** via workspace storage (`publicUrlForObjectKey`).
- If the path is already `http://` or `https://`, it is used as-is.
- If no public base URL is configured for object storage, publish fails with a clear configuration error.

## Format and reachability

- **SVG is blocked** before any Graph call — convert to PNG or JPEG.
- For each resolved URL, the server checks **reachability** (HEAD, or GET with `Range: bytes=0-0` if HEAD is not allowed). Meta must be able to fetch the URL from their servers; localhost, 403, or private URLs cause vague Graph failures.
- When debugging “unknown” Meta errors, confirm the public URL returns **non-empty** image bytes (not `Content-Length: 0`).

## Publish flow

1. **No media** — create a TEXT media container, then publish.
2. **One image or video** — create a single media container (`image_url` or `video_url` from the public URL), then publish.
3. **Multiple items** — create one container per item (carousel children), wait until each container status is `FINISHED`, assemble a CAROUSEL container, then publish.
4. **Publish** — `threads_publish` with the creation id; poll container status until `FINISHED` or surface `ERROR` with processing details.

## Errors

- Graph errors are formatted with message, optional user-facing title/msg, and raw JSON snippet for “unknown” failures.
- Media container `ERROR` status includes processing hints (JPEG/PNG, size, public URL, sRGB).
- Comments and threaded replies use the same two-step flow (TEXT container with `reply_to_id`, then publish).

## Limits

- Max post text length: **500** characters (provider default).

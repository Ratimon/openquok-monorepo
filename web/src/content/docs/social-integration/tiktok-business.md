---
title: TikTok (Business)
description: How to configure TikTok Business for the OpenQuok social scheduler — Marketing API app, OAuth redirect URI with a trailing slash, scopes, and backend env vars.
order: 6
lastUpdated: 2026-09-01
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

You need a TikTok Business / Marketing developer app, with the **API for Business** (Marketing API), with backend env vars <Badge text="TIKTOK_BUSINESS_CLIENT_ID" variant="envBackend" /> and <Badge text="TIKTOK_BUSINESS_CLIENT_SECRET" variant="envBackend" />.

For personal **TikTok** — Login Kit, Share Kit, and Content Posting API — see <a href="/docs/social-integration/tiktok">TikTok</a>. Do not reuse these Business API credentials there.

TikTok servers fetch media from your storage via <strong>HTTPS</strong> URLs. Verify the media host on <strong>this</strong> Business app (ownership is per app).

CLI walkthroughs: <a href="/docs/cli-examples/tiktok-business">CLI Examples — TikTok (Business)</a>. Content API setup: <a href="/docs/social-integration/tiktok">TikTok</a>.

<Callout type="note">
<p>Connecting TikTok (Business) in OpenQuok does not replace account warm-up. For new or barely used accounts, follow <a href="/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience">How to warm up a TikTok account to reach a US audience</a> before you rely on reach or schedule heavy posting.</p>
</Callout>

<Callout type="note" title="Two TikTok apps">
<p>Content API (<Badge text="TIKTOK_CLIENT_ID" variant="envBackend" />) and Business (<Badge text="TIKTOK_BUSINESS_CLIENT_ID" variant="envBackend" />) are <strong>different</strong> developer products. Do not reuse Content API credentials here.</p>
</Callout>

## Features

### Supported

| Feature | Details |
| --- | --- |
| Video publish | Exactly **one** video attachment |
| Photo carousel publish | One or more images (no mixed video + images); PNG is converted to JPEG before publish |
| Caption length | Up to 2,200 characters |
| Posting method | Direct post (publish immediately) or inbox upload (finish in the TikTok app) |
| Video cover | Stored poster image (public HTTPS URL) when present; otherwise the frame timestamp from Media details |
| Photo cover | First image in the strip |
| Privacy (photos) | Direct photo posts can set privacy. **Videos** follow the account default — OpenQuok does not send a video privacy level |
| Duet / Stitch / Comments toggles | Optional per post |
| Brand disclosure toggles | Optional per post (brand/organic) |
| Commercial audio | Optional sound id on **direct** posts |
| Location | Optional point-of-interest id on **direct** posts |

### Not supported

| Feature | Notes |
| --- | --- |
| Mixed media (video + images) | Publish requires either a single video or an image carousel |
| Custom JPEG cover on Content API TikTok | That channel uses a frame timestamp on direct posts instead — see <a href="/docs/social-integration/tiktok">TikTok</a> |
| Scheduled follow-up comments | Same as Content API TikTok |
| Binary upload from OpenQuok | OpenQuok publishes via public HTTPS URLs |

## Backend environment

OpenQuok reads TikTok Business credentials only through <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/config/GlobalConfig.ts"><Badge text="backend/config/GlobalConfig.ts" variant="path" /></DocsExternalLink>. Set:

- <Badge text="TIKTOK_BUSINESS_CLIENT_ID" variant="envBackend" /> — client key from the Business / Marketing developer portal
- <Badge text="TIKTOK_BUSINESS_CLIENT_SECRET" variant="envBackend" /> — client secret

Copy from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envBackend" /></DocsExternalLink> into <Badge text="backend/.env.development.local" variant="envBackend" />, fill values, then **restart** the backend.

The frontend base URL used for OAuth redirects comes from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> and must be **HTTPS** for TikTok in typical setups (local dev: <Badge text="https://localhost:5173" variant="new" />).

<h2 id="oauth-redirect-uri-register-in-tiktok-business">OAuth redirect URI (register in TikTok Business)</h2>

TikTok redirects the **browser** back to your **web app** after consent—not to <Badge text="/api/v1" variant="path" />. The Business portal requires the registered URI to **end with a trailing slash**.

The backend builds the redirect from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> plus:

```text
/integration/oauth/tiktok-business/
```

- **Production**: register

```text
https://YOUR-FRONTEND-DOMAIN/integration/oauth/tiktok-business/
```

- **Local development**:

```text
https://localhost:5173/integration/oauth/tiktok-business/
```

<Callout type="warning" title="Trailing slash">
<p>A redirect without the final <code>/</code> is rejected by the Business portal. Register the URI exactly as shown, including the slash.</p>
</Callout>

## Public media URLs

TikTok fetches media server-side via **HTTPS** URLs. Before you can publish reliably, ensure OpenQuok can resolve each attachment to a public URL and that TikTok accepts that domain **on the Business app**.

Choose one media storage strategy:

- **Cloudflare R2 (recommended for production)** — set <Badge text="STORAGE_PROVIDER=r2" variant="envBackend" /> and <Badge text="STORAGE_R2_PUBLIC_BASE_URL" variant="envBackend" /> so objects have a stable public hostname.
  - See <a href="/docs/configuration-backend/cloudflare-r2">R2 or local storage</a>.
- **Local disk (development or self-host)** — set <Badge text="STORAGE_PROVIDER=local" variant="envBackend" /> and ensure your deployment serves <code>/uploads/*</code> on your public HTTPS origin.

<Callout type="warning">
<p>TikTok can reject URL-pull publishing if your media host is not verified on this app. Verify the exact hostname you use for public media (for example, your R2 custom domain or your app origin serving <code>/uploads</code>).</p>
</Callout>

## TikTok Business app setup

Follow the Business / Marketing developer portal, then apply the OpenQuok-specific details below. Creators typically connect a **Business** or **Creator** TikTok account.

<Steps
	howToName="TikTok Business app setup"
	howToDescription="Create a Marketing / Business developer app, register a trailing-slash OAuth redirect, and verify your media domain."
>

### Create an app in the Business portal

Open the <DocsExternalLink href="https://business-api.tiktok.com/">TikTok API for Business portal</DocsExternalLink> and create a **separate** app from your Content Posting API app.

### Copy client credentials

Paste the client key and secret into <Badge text="TIKTOK_BUSINESS_CLIENT_ID" variant="envBackend" /> and <Badge text="TIKTOK_BUSINESS_CLIENT_SECRET" variant="envBackend" />. Restart the backend.

### Register the redirect URI

Add the redirect URI from the <a href="/docs/social-integration/tiktok-business#oauth-redirect-uri-register-in-tiktok-business">OAuth redirect URI</a> section. It must end with <code>/</code>.

### Request publish scopes

Configure the scopes your app needs. They include:

<ul class="not-prose list-disc pl-6">
<li><Badge text="user.info.basic" variant="default" /></li>
<li><Badge text="user.info.username" variant="default" /></li>
<li><Badge text="user.info.profile" variant="default" /></li>
<li><Badge text="user.info.stats" variant="default" /></li>
<li><Badge text="video.publish" variant="default" /></li>
<li><Badge text="video.upload" variant="default" /></li>
<li><Badge text="video.list" variant="default" /></li>
</ul>

### Verify your media domain

Verify the hostname that serves your media (R2 public host or your app origin that serves <code>/uploads/*</code>) on **this** Business app so TikTok can pull URLs during publish.

</Steps>

## Troubleshooting

### Redirect URI mismatch

Confirm the registered URI matches <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> and ends with <code>/integration/oauth/tiktok-business/</code> including the trailing slash.

### Unverified URL

Verify the media hostname on the Business app and ensure public URLs are **HTTPS**. Domain verification does not carry over from a Content API app.

### Publish fails to fetch media

Confirm the attachment resolves to a public URL (no auth, no signed URLs that expire too quickly) and that the URL is reachable by TikTok’s servers.

## Related

<CardGrid>
<LinkCard title="TikTok (Content API)" description="Login Kit and Content Posting API — frame-timestamp covers on direct posts" href="/docs/social-integration/tiktok" />
<LinkCard title="CLI examples" description="openquok posts:create recipes for TikTok (Business)" href="/docs/cli-examples/tiktok-business" />
<LinkCard title="Connect a channel" description="OAuth redirect in Add Channel" href="/docs/channels/connect" />
<LinkCard title="Media" description="Video poster, frame timestamp, and per-channel attachments" href="/docs/creating-posts/media" />
<LinkCard title="Posting rules by platform" description="Caption caps, media rules, and Settings fields" href="/docs/platforms" />
</CardGrid>

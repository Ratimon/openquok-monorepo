---
title: TikTok
description: How to configure TikTok publishing for Openquok — TikTok Developer app, OAuth redirect URI, scopes, and backend env vars.
order: 6
lastUpdated: 2026-06-18
---

<script>
import { Badge, Callout, DocsExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

TikTok publishing uses **TikTok OAuth 2.0** (with PKCE).

You need a TikTok Developer, with **Login Kit**, **Share Kit** and **Content Posting API**, with backend env vars <Badge text="TIKTOK_CLIENT_ID" variant="envBackend" /> and <Badge text="TIKTOK_CLIENT_SECRET" variant="envBackend" />.

TikTok servers fetch media from your storage via **HTTPS** URLs (“pull from URL” flow). That makes your **public media base URL** and TikTok **domain verification** critical for successful publish.

CLI walkthroughs: <a href="/docs/cli-examples/tiktok">CLI Examples — TikTok</a>.

## Features

### Supported

| Feature | Details |
| --- | --- |
| Video publish | Exactly **one** video attachment |
| Photo carousel publish | One or more images (no mixed video + images) |
| Caption length | Up to 2,000 characters (TikTok provider limit) |
| Privacy | `PUBLIC_TO_EVERYONE`, `MUTUAL_FOLLOW_FRIENDS`, `FOLLOWER_OF_CREATOR`, `SELF_ONLY` (availability depends on account) |
| Posting method | `DIRECT_POST` (publish immediately) or `UPLOAD` (send to user inbox) |
| Duet / Stitch / Comments toggles | Optional per post |
| Brand disclosure toggles | Optional per post (brand/organic) |
| Platform analytics | Account metrics (followers, following, likes, video count) plus aggregated recent-video engagement (views, likes, comments, shares) via <Badge text="user.info.stats" variant="default" /> and <Badge text="video.list" variant="default" /> |
| Per-post analytics | Views, likes, comments, and shares on a published video when the post row has a linked TikTok video id |
| Missing release id recovery | List recent TikTok videos and link inbox uploads (<Badge text="releaseId=missing" variant="param" />) via <Badge text="posts:missing" variant="default" /> → <Badge text="posts:connect" variant="default" /> — see <a href="/docs/cli-examples/tiktok">CLI Examples — TikTok</a> |

### Not supported

| Feature | Notes |
| --- | --- |
| Mixed media (video + images) | TikTok publish requires either a single video or an image carousel |
| Binary upload from Openquok | Openquok publishes via public HTTPS URLs; it does not stream bytes directly to TikTok |

<Callout type="warning">
<p>When your TikTok app is not audited/approved for broader access, TikTok can restrict publishing to <code>SELF_ONLY</code> (private). If you see privacy-level errors or unexpected private posts, complete the relevant TikTok review steps for your app.</p>
</Callout>

## Backend environment

Openquok reads TikTok credentials only through <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/config/GlobalConfig.ts"><Badge text="backend/config/GlobalConfig.ts" variant="path" /></DocsExternalLink>. Set:

- <Badge text="TIKTOK_CLIENT_ID" variant="envBackend" /> — TikTok **Client key** from your TikTok app <strong>Credentials</strong> section
- <Badge text="TIKTOK_CLIENT_SECRET" variant="envBackend" /> — TikTok **Client secret**

Copy from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envBackend" /></DocsExternalLink> into <Badge text="backend/.env.development.local" variant="envBackend" />, fill values, then **restart** the backend.

<Callout type="tip">
<p>For self-host or development, on <DocsExternalLink href="https://developers.tiktok.com/apps/">TikTok Developer — My Apps</DocsExternalLink>, switch the toggle to <strong>Sandbox</strong>, create a sandbox, configure products (Login Kit, Share Kit, Content Posting API), then click <strong>Apply changes</strong>. Copy the <strong>Sandbox</strong> client key and client secret into the env vars above. For production deployments, use <strong>Production</strong> credentials instead — they do not work interchangeably.</p>
</Callout>

The frontend base URL used for OAuth redirects comes from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> and must be **HTTPS** for TikTok in typical setups (local dev: <Badge text="https://localhost:5173" variant="new" />).

<h2 id="oauth-redirect-uri-register-in-tiktok">OAuth redirect URI (register in TikTok)</h2>

TikTok redirects the **browser** back to your **web app** after consent—not to <Badge text="/api/v1" variant="path" />. The backend builds the redirect from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> plus:

```text
/integration/oauth/tiktok
```

- **Production**: register

```text
https://YOUR-FRONTEND-DOMAIN/integration/oauth/tiktok
```

- **Local development**:

```text
https://localhost:5173/integration/oauth/tiktok
```

## Public media URLs

TikTok fetches media server-side via **HTTPS** URLs. Before you can publish reliably, ensure Openquok can resolve each attachment to a public URL and that TikTok accepts that domain.

Choose one media storage strategy:

- **Cloudflare R2 (recommended for production)** — set <Badge text="STORAGE_PROVIDER=r2" variant="envBackend" /> and <Badge text="STORAGE_R2_PUBLIC_BASE_URL" variant="envBackend" /> so objects have a stable public hostname.
  - See <a href="/docs/configuration-backend/cloudflare-r2">R2 or local storage</a>.
- **Local disk (development or self-host)** — set <Badge text="STORAGE_PROVIDER=local" variant="envBackend" /> and ensure your deployment serves <code>/uploads/*</code> on your public HTTPS origin.

<Callout type="note">
<p>In local development, Vite can proxy <code>/uploads</code> to the backend. The key requirement for TikTok is that the URL TikTok fetches is <strong>HTTPS</strong>.</p>
</Callout>

<Callout type="warning" >
<p>TikTok can reject <code>PULL_FROM_URL</code> publishing if your media host is not verified(common error: <code>url_ownership_unverified</code>). Verify the exact hostname you use for public media (for example, your R2 custom domain or your app origin serving <code>/uploads</code>).</p>
</Callout>

## TikTok Developer app setup

Follow TikTok’s developer portal flow, then apply the Openquok-specific details below.

<Steps>

### Create an app in TikTok Developer

Open <DocsExternalLink href="https://developers.tiktok.com/apps/">TikTok Developer — My Apps</DocsExternalLink> and create a new app.

![Create New Tiktok App](/docs/social-integration/tiktok/create-new-tiktok-app.webp)

<Callout type="tip">
You may also choose to create an organization first, then create an app in that organization rather than individually.
</Callout>

![Create New Organization](/docs/social-integration/tiktok/create-new-organization.webp)

### Configure the App Details

In **App Details → Basic Information**:

Fill required app information (app name, category, description).

![Configure Basic Info](/docs/social-integration/tiktok/configure-basic-info.webp)

Fill required urls (term of service, privacy policy, web urls).

For Openquok-hosted deployments, register your public <strong>Terms</strong> and <strong>Privacy Policy</strong> URLs (for example <code>https://www.openquok.com/terms</code> and <code>https://www.openquok.com/privacy-policy</code>). TikTok app review requires these links to be active and visible on your official website without opening a menu.

![Configure App Urls](/docs/social-integration/tiktok/configure-urls.webp)

<Callout type="note">
TikTok typically requires publicly reachable HTTPS URLs. If you are self host, you can fill up with own info/urls.
</Callout>

### Enable Web + Login Kit + Add redirect URI

In **Product → + Add products**:

![Add Product](/docs/social-integration/tiktok/add-product.webp)

Add the **Login Kit** product for OAuth.

![Add Login Kit](/docs/social-integration/tiktok/add-login-kit.webp)

For **Product → Login Kit → Web**, add the redirect URI from the <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/social-integration/tiktok#oauth-redirect-uri-register-in-tiktok">OAuth redirect URI</a> section to your app’s valid redirect list.

For production url, we can add as web url:

![Add Web Redirect Url](/docs/social-integration/tiktok/add-web-redirect-url.webp)

<Callout type="note" title="Local redirect URI">
<p>TikTok <strong>Web</strong> Login Kit does not accept <code>localhost</code> redirect URIs, even in Sandbox. For local Openquok, register a <strong>Desktop</strong> redirect URI (see above) or connect against your deployed frontend, for example <Badge text="https://www.openquok.com/integration/oauth/tiktok" variant="new" /> with <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> set to match.</p>
</Callout>

![Add Desktop Redirect Url](/docs/social-integration/tiktok/add-desktop-redirect-url.webp)


### Enable Content Posting API (Direct Post)

In **Product → + Add products**:

![Add Product](/docs/social-integration/tiktok/add-product.webp)

Add both **Share Kit**  and **Content Posting API**

![Add Share Kit](/docs/social-integration/tiktok/add-share-kit.webp)

In **Content Posting API**, ensure **Direct Post** is allowed for your app.

![Allow Direct Post](/docs/social-integration/tiktok/allow-direct-post.webp)

### Add required scopes

In **Scopes**, configure the scopes your app needs. They include:

<ul class="not-prose list-disc pl-6">
<li><Badge text="user.info.basic" variant="default" /></li>
<li><Badge text="user.info.profile" variant="default" /></li>
<li><Badge text="user.info.stats" variant="default" /></li>
<li><Badge text="video.publish" variant="default" /></li>
<li><Badge text="video.upload" variant="default" /></li>
<li><Badge text="video.list" variant="default" /></li>
</ul>

### Verify your media domain

Verify the hostname that serves your media (R2 public host or your app origin that serves <code>/uploads/*</code>) so TikTok can pull URLs during publish.

### Add target users (Sandbox mode)

In <strong>Sandbox settings</strong> → <strong>Target users</strong>, click <strong>Add account</strong> and sign in with each TikTok account that will connect a channel during development.

<Callout type="warning" title="Sandbox vs Prod">
<p>While the app is in <strong>Sandbox</strong>, only listed target users can complete OAuth. Switch to <strong>Production</strong> and submit for app review when you are ready for public access.</p>
</Callout>

<Callout type="warning" title="Sandbox API limits">
<p>TikTok Sandbox can restrict Content Posting API behavior (for example public video publish).</p>
</Callout>

<Callout type="tip" title="Revoke OAuth">
<ul>
<li>On mobile: TikTok → Profile → Menu → <strong>Settings and privacy</strong> → <strong>Security</strong> → <strong>Manage app permissions</strong>, then remove Openquok.</li>
</ul>
</Callout>

</Steps>

## Troubleshooting

### Unverified URL

Verify the media hostname in TikTok developer settings and ensure your public URLs are **HTTPS**.

### Only Private Publish for Unverified APp

For unaudited developer apps, TikTok enforces **two** requirements on **direct post** (not inbox upload):

1. **Post privacy** in Openquok: <code>Only me (private)</code> / <code>SELF_ONLY</code>.
2. **Account privacy** in the TikTok app: set the connected profile to <strong>Private</strong> (TikTok → Settings and privacy → Privacy → Private account) at publish time.

Inbox upload (<code>UPLOAD</code>) sends media to the creator’s TikTok inbox and is not subject to the private-account rule. To publish directly to a public profile without these limits, submit your app for Content Posting API review in the TikTok developer portal.

### Publish fails to fetch media

Confirm the attachment resolves to a public URL (no auth, no signed URLs that expire too quickly) and that the URL is reachable by TikTok’s servers.

## References

<ul class="list-disc pl-6">
<li><DocsExternalLink href="https://developers.tiktok.com/doc/login-kit-web/">TikTok Login Kit (Web)</DocsExternalLink></li>
<li><DocsExternalLink href="https://developers.tiktok.com/doc/content-posting-api-get-started/">TikTok Content Posting API</DocsExternalLink></li>
<li><DocsExternalLink href="https://developers.tiktok.com/doc/add-a-sandbox/">TikTok — Add a Sandbox</DocsExternalLink></li>
</ul>


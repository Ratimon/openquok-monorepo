---
title: R2 or local storage
description: Choose Cloudflare R2 (S3-compatible) or local disk for workspace media uploads; configure env vars and optional browser direct uploads.
order: 4
lastUpdated: 2026-04-18
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Storage backends

OpenQuok can store **workspace media** (account media library, composer attachments, and similar) in one of two ways:

| Option | Best for | Notes |
| --- | --- | --- |
| **Cloudflare R2** | Production and teams that want durable object storage | S3-compatible API; optional public hostname and bucket CORS if the browser uploads **directly** to R2. |
| **Local disk** | Local development or a single-machine deploy without object storage | Files live under **`UPLOAD_DIRECTORY`** on the API host; the API serves them at **`/uploads/*`**. No R2 credentials. |

Avatars and blog inline images still use **Supabase Storage** (separate buckets), regardless of this choice.

Pick **one** <Badge text="STORAGE_PROVIDER" variant="envBackend" /> value for the API (<code>r2</code> or <code>local</code>). The web app separately sets <Badge text="VITE_STORAGE_PROVIDER" variant="envWeb" /> so the account media uploader matches: use <code>cloudflare</code> for direct multipart uploads to R2, or <code>local</code> for API-backed uploads to disk (see [Web environment variables](#web-environment-variables)).

## Cloudflare R2

<Steps>

### Create account and open R2

Sign in to the <DocsExternalLink href="https://dash.cloudflare.com/">Cloudflare dashboard</DocsExternalLink>, then open <strong>R2 Object Storage</strong>. If this is your first time using Cloudflare for this domain, finish the domain onboarding and DNS setup first so you can later attach a custom hostname such as <code>media.yourdomain.com</code>.

![Setup Domain](/docs/configuration-backend/cloudflare-r2/setup-domain.webp)


### Create a bucket

Create a new R2 bucket. For OpenQuok, this bucket stores user-uploaded or generated files in R2.

![Create a Bucket](/docs/configuration-backend/cloudflare-r2/create-a-bucket.webp)

Copy your <strong>Bucket Name</strong> for later.

### Create your R2 token

- In Cloudflare, go to <Badge text="Storage & Database" variant="default" /> → <Badge text="R2 Object Storage" variant="default" /> → <Badge text="Overview" variant="default" />. Then look at <Badge text="Account Details" variant="default" />

![R2 Object Storage](/docs/configuration-backend/cloudflare-r2/r2-object-storage.webp)

Copy your <strong>Account ID</strong> for later, then choose <strong>Create API token</strong> and create an <strong>Account API token</strong>.

![Create account api Token](/docs/configuration-backend/cloudflare-r2/create-account-api-token.webp)

Under <strong>Permissions</strong>, grant <strong>Object Read &amp; Write</strong>. Under bucket scope, choose only the bucket you created for OpenQuok media uploads.

![Set permissions](/docs/configuration-backend/cloudflare-r2/set-permissions.webp)

Copy these values for the backend:

- <Badge text="STORAGE_R2_ACCOUNT_ID" variant="envBackend" />
- <Badge text="STORAGE_R2_ACCESS_KEY_ID" variant="envBackend" />
- <Badge text="STORAGE_R2_SECRET_ACCESS_KEY" variant="envBackend" />
- <Badge text="STORAGE_R2_BUCKET" variant="envBackend" />

### Add backend keys

Set the R2 credentials in <Badge text="backend/.env.development.local" variant="envFile" /> (or your production secret store). Use <Badge text="STORAGE_R2_REGION" variant="envBackend" /> = <code>APAC</code>.

```bash
STORAGE_PROVIDER=r2
STORAGE_R2_ACCOUNT_ID=your_account_id
STORAGE_R2_ACCESS_KEY_ID=your_r2_access_key_id
STORAGE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
STORAGE_R2_BUCKET=your_bucket_name
STORAGE_R2_REGION=APAC
```

Restart the backend after changing these values.

### Configure Custom Domain and CORS policies

Go to configuration and connect a custom domain. If you do not have one yet, you can use the Cloudflare-managed public URL first. If you are still setting up the zone in Cloudflare, follow the earlier <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/configuration-backend/cloudflare-r2#create-account-and-open-r2">Create account and open R2</a> step before attaching a hostname.

Add the public hostname to your env file:

```bash
STORAGE_R2_PUBLIC_BASE_URL=https://customdomain.com
```

<Callout type="warning" title="Do not use the S3 API endpoint as a public image URL">
<p><code>https://&lt;accountId&gt;.r2.cloudflarestorage.com</code> is the R2 S3 API endpoint used by the backend SDK. It is not the recommended browser-facing public origin for media previews. Use a custom subdomain such as <code>media.yourdomain.com</code> for production.</p>
</Callout>


### Add backend and web public URL envs

Set both apps to the same public origin (no trailing slash):

```bash
VITE_STORAGE_R2_PUBLIC_BASE_URL=https://customdomain.com
```

Use <Badge text="backend/.env.development.local" variant="envFile" /> for the backend value and <Badge text="web/.env.development.local" variant="envFile" /> for the web value. Restart both the backend and Vite after changes.

### Web uploader (account media library)

When the API uses <Badge text="STORAGE_PROVIDER" variant="envBackend" /> = <code>r2</code>, set the web app so the media library uses **direct multipart uploads** to R2 (presigned URLs from the API):

```bash
VITE_STORAGE_PROVIDER=cloudflare
```

If you **omit** <Badge text="VITE_STORAGE_PROVIDER" variant="envWeb" />, or set it to any value **other than** <code>local</code>, the uploader uses the same R2 multipart flow as <code>cloudflare</code>.


### Configure bucket CORS

Click to edit the CORS policy and add the following JSON if you plan to upload **directly from the browser** to R2 (multipart presigned URLs):

```json
[
  {
    "AllowedOrigins": [
      "https://localhost:5173",
      "http://localhost:5173",
      "https://www.openquok.com"
    ],
    "AllowedMethods": [
      "GET",
      "POST",
      "HEAD",
      "PUT",
      "DELETE"
    ],
    "AllowedHeaders": [
      "Authorization",
      "content-type",
      "x-amz-*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Location"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

If uploads go **only** through the backend API (XHR to the API), bucket CORS is optional for that path.

![Cors](/docs/configuration-backend/cloudflare-r2/cors.webp)

</Steps>

## Local disk storage

Use this when you do not want to configure R2 (typical local development).

### Backend

1. Set an **absolute** directory on the machine running the API. The process must be able to create and write files there.

```bash
STORAGE_PROVIDER=local
UPLOAD_DIRECTORY=/absolute/path/to/openquok-uploads
```

2. Set <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> (or <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />) so public URLs for saved media resolve correctly. The API builds public URLs as <code>&lt;origin&gt;/uploads/&lt;storage-key&gt;</code> (same origin as the app in dev is fine, e.g. <code>https://localhost:5173</code>).

3. Restart the API. When <Badge text="STORAGE_PROVIDER" variant="envBackend" /> is <code>local</code>, the server exposes files under **`/uploads`** from <Badge text="UPLOAD_DIRECTORY" variant="envBackend" />.

<Callout type="note" title="Reverse proxy">
<p>If the API sits behind a proxy, ensure <code>/uploads</code> is forwarded to the backend so browsers can load images.</p>
</Callout>

### Web app (account media)

For **direct-to-R2** multipart uploads, the browser must talk to R2 (bucket CORS). For **local** storage, uploads should go **through the API** instead.

Set a web env var so the account media uploader uses the server upload flow (XHR to the API) instead of presigned R2 URLs:

```bash
VITE_STORAGE_PROVIDER=local
```

<Callout type="note" title="Local HTTPS dev: proxy /uploads">
<p>In local disk mode, the backend serves files at <code>/uploads/*</code>. When you run the web app on <code>https://localhost:5173</code> with the Vite proxy, ensure <code>/uploads</code> is proxied to the backend the same way as <code>/api</code>, otherwise previews will show broken images.</p>
</Callout>

### When local storage is not enough

Local disk is a single-host solution. For production scale, redundancy, and CDN-friendly URLs, use **R2** (or another object store) and keep **`STORAGE_PROVIDER=r2`**.

## Overview

**OpenQuok** stores workspace media objects in **Cloudflare R2** when <Badge text="STORAGE_PROVIDER" variant="envBackend" /> is <code>r2</code> and the R2 variables are set. With <Badge text="STORAGE_PROVIDER" variant="envBackend" /> = <code>local</code>, objects are stored on disk under <Badge text="UPLOAD_DIRECTORY" variant="envBackend" /> and served at <code>/uploads/*</code>.

Avatars and blog inline images continue to use **Supabase Storage** (<Badge text="avatars" variant="default" />, <Badge text="blog_images" variant="default" />).

<Callout type="note" title="Dashboard setup (R2)">
<p>Create an R2 bucket and an <strong>Account API token</strong> with object read and write access to that bucket in the <DocsExternalLink href="https://dash.cloudflare.com/">Cloudflare dashboard</DocsExternalLink>. Attach a <strong>public access</strong> hostname (prefer a custom subdomain; use <code>r2.dev</code> only for development) if you want browsers to load images directly without going through the API download route.</p>
</Callout>

## Backend environment variables

Set these in <Badge text="backend/.env.development.local" variant="envFile" /> (or your host secret store). Restart the API after changes.

### R2 (`STORAGE_PROVIDER=r2`)

| Variable | Purpose |
| --- | --- |
| <Badge text="STORAGE_PROVIDER" variant="envBackend" /> | Set to <code>r2</code> (default in many setups). |
| <Badge text="STORAGE_R2_ACCOUNT_ID" variant="envBackend" /> | Cloudflare account id (R2 overview). |
| <Badge text="STORAGE_R2_ACCESS_KEY_ID" variant="envBackend" /> | R2 API token access key id. |
| <Badge text="STORAGE_R2_SECRET_ACCESS_KEY" variant="envBackend" /> | R2 API token secret. |
| <Badge text="STORAGE_R2_BUCKET" variant="envBackend" /> | Bucket name. |
| <Badge text="STORAGE_R2_REGION" variant="envBackend" /> | Optional; default <code>APAC</code> (S3 client region for R2). |
| <Badge text="STORAGE_R2_PUBLIC_BASE_URL" variant="envBackend" /> | Optional; public origin for objects (no trailing slash). Use your bucket custom domain or <code>r2.dev</code> URL, not the S3 API endpoint <code>https://&lt;accountId&gt;.r2.cloudflarestorage.com</code>. |

```bash
STORAGE_PROVIDER=r2
STORAGE_R2_ACCOUNT_ID=your_account_id
STORAGE_R2_ACCESS_KEY_ID=your_r2_access_key_id
STORAGE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
STORAGE_R2_BUCKET=your_bucket_name
STORAGE_R2_REGION=APAC
STORAGE_R2_PUBLIC_BASE_URL=https://media.yourdomain.com
```

### Local disk (`STORAGE_PROVIDER=local`)

| Variable | Purpose |
| --- | --- |
| <Badge text="STORAGE_PROVIDER" variant="envBackend" /> | Set to <code>local</code>. |
| <Badge text="UPLOAD_DIRECTORY" variant="envBackend" /> | Absolute path where uploaded files are written. |
| <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> | Used to build public <code>/uploads/...</code> URLs (no trailing slash). |

```bash
STORAGE_PROVIDER=local
UPLOAD_DIRECTORY=/absolute/path/to/openquok-uploads
FRONTEND_DOMAIN_URL=https://localhost:5173
```

## Web environment variables

Set these in <Badge text="web/.env.development.local" variant="envFile" /> (or your production web env). Restart Vite after changes. See also <a href="/docs/configuration-web/environment">Environment variables</a>.

| Variable | When to use | Value |
| --- | --- | --- |
| <Badge text="VITE_STORAGE_PROVIDER" variant="envWeb" /> | Account media library upload path | <code>cloudflare</code> — direct multipart to R2 (matches <Badge text="STORAGE_PROVIDER=r2" variant="envBackend" />). Omit or any non-<code>local</code> value behaves like <code>cloudflare</code>. |
| <Badge text="VITE_STORAGE_PROVIDER" variant="envWeb" /> | Local disk uploads | <code>local</code> — XHR to the API (<Badge text="STORAGE_PROVIDER=local" variant="envBackend" />). |
| <Badge text="VITE_STORAGE_R2_PUBLIC_BASE_URL" variant="envWeb" /> | Public URLs for R2-hosted objects | Same origin as your bucket custom domain (no trailing slash). |

Example for **R2**:

```bash
VITE_STORAGE_PROVIDER=cloudflare
VITE_STORAGE_R2_PUBLIC_BASE_URL=https://media.yourdomain.com
```

Example for **local disk** (with backend <Badge text="STORAGE_PROVIDER=local" variant="envBackend" />):

```bash
VITE_STORAGE_PROVIDER=local
```

## Related

<CardGrid>
<LinkCard title="Configuration - Backend (index)" description="Env overview, Supabase, and related services" href="/docs/configuration-backend" />
<LinkCard title="Web environment" description="Vite variables and frontend origin alignment" href="/docs/configuration-web/environment" />
</CardGrid>

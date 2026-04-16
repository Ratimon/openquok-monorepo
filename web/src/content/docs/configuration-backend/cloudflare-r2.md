---
title: Cloudflare R2
description: Configure S3-compatible R2 object storage for media uploads and canvas exports in OpenQuok.
order: 3
lastUpdated: 2026-04-16
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Steps

<Steps>

### Create account and open R2

Sign in to the <DocsExternalLink href="https://dash.cloudflare.com/">Cloudflare dashboard</DocsExternalLink>, then open <strong>R2 Object Storage</strong>. If this is your first time using Cloudflare for this domain, finish the domain onboarding and DNS setup first so you can later attach a custom hostname such as <code>media.yourdomain.com</code>.

![Setup Domain](/docs/configuration-backend/cloudflare-r2/setup-domain.webp)


### Create a bucket

Create a new R2 bucket. For OpenQuok, this bucket stores user's uploaded or genrated file to Cloudflare R2.

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


### Configure bucket CORS

Click to edit the CORS policy and add the following JSON if you plan to upload directly from the browser to R2:

```json
[
  {
    "AllowedOrigins": ["https://localhost:5173", "https://www.openquok.com"],
    "AllowedMethods": ["GET", "POST", "HEAD", "PUT", "DELETE"],
    "AllowedHeaders": [
      "Authorization",
      "x-amz-date",
      "x-amz-content-sha256",
      "content-type"
    ],
    "ExposeHeaders": ["ETag", "Location"],
    "MaxAgeSeconds": 3600
  }
]
```

For the current OpenQuok flow, uploads go through the backend API, so bucket CORS is not required for normal server-side uploads.

![Cors](/docs/configuration-backend/cloudflare-r2/cors.webp)

</Steps>

## Overview

**Openquok** stores the objects in **Cloudflare R2** when the variables below are set. Avatars and blog inline images continue to use **Supabase Storage** (<Badge text="avatars" variant="default" />, <Badge text="blog_images" variant="default" />).

<Callout type="note" title="Dashboard setup">
<p>Create an R2 bucket and an <strong>Account API token</strong> with object read and write access to that bucket in the <DocsExternalLink href="https://dash.cloudflare.com/">Cloudflare dashboard</DocsExternalLink>. Attach a <strong>public access</strong> hostname (prefer a custom subdomain; use <code>r2.dev</code> only for development) if you want browsers to load images directly without going through the API download route.</p>
</Callout>

## Backend environment variables

Set these in <Badge text="backend/.env.development.local" variant="envFile" /> (or your host secret store). Restart the API after changes.

| Variable | Purpose |
| --- | --- |
| <Badge text="STORAGE_R2_ACCOUNT_ID" variant="envBackend" /> | Cloudflare account id (R2 overview). |
| <Badge text="STORAGE_R2_ACCESS_KEY_ID" variant="envBackend" /> | R2 API token access key id. |
| <Badge text="STORAGE_R2_SECRET_ACCESS_KEY" variant="envBackend" /> | R2 API token secret. |
| <Badge text="STORAGE_R2_BUCKET" variant="envBackend" /> | Bucket name. |
| <Badge text="STORAGE_R2_REGION" variant="envBackend" /> | Optional; default <code>APAC</code> (S3 client region for R2). |
| <Badge text="STORAGE_R2_PUBLIC_BASE_URL" variant="envBackend" /> | Optional; public origin for objects (no trailing slash). Use your bucket custom domain or <code>r2.dev</code> URL, not the S3 API endpoint <code>https://&lt;accountId&gt;.r2.cloudflarestorage.com</code>. |

```bash
STORAGE_R2_ACCOUNT_ID=your_account_id
STORAGE_R2_ACCESS_KEY_ID=your_r2_access_key_id
STORAGE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
STORAGE_R2_BUCKET=your_bucket_name
STORAGE_R2_REGION=APAC
STORAGE_R2_PUBLIC_BASE_URL=https://media.yourdomain.com
```

## Related

<CardGrid>
<LinkCard title="Configuration - Backend (index)" description="Env overview, Supabase, and related services" href="/docs/configuration-backend" />
<LinkCard title="Web environment" description="Vite variables and frontend origin alignment" href="/docs/configuration-web/environment" />
</CardGrid>

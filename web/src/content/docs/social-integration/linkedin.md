---
title: LinkedIn
description: Connect a LinkedIn personal profile to OpenQuok
order: 7
lastUpdated: 2026-06-20
---

<script>
import { Badge, Callout, DocsExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Connect a **personal LinkedIn profile** to OpenQuok with identifier <Badge text="linkedin" variant="default" />. OAuth completes in a single step (no Page picker). Publishing uses the official LinkedIn REST Posts API.

For **company Pages**, see <a href="/docs/social-integration/linkedin-page">LinkedIn Page</a>. Both channels share the same LinkedIn developer app credentials.

<Callout type="note" title="One LinkedIn app">
Personal profile and Page channels use the same <Badge text="LINKEDIN_CLIENT_ID" variant="envBackend" /> and <Badge text="LINKEDIN_CLIENT_SECRET" variant="envBackend" />. Register **both** OAuth redirect URIs if you connect either or both channel types.
</Callout>

## Features

### Supported

| Feature | Details |
| --- | --- |
| Text posts | Up to 3,000 characters |
| Images | Multi-image posts |
| MP4 video | One attachment per post |
| Follow-up text comments | Text-only replies after the root post |
| Image → PDF document carousel | ≥2 images, no video; enable **Post as image carousel** in per-channel composer settings — OpenQuok converts images to a PDF at publish time. Optional **Carousel document title** (default: `slides`) |
| Cross-account comment / reshare plugs | In per-channel settings, enable **Add comments by a different account** or **Add re-posters**; pick other connected LinkedIn channels, set a delay, and (for comments) the message text. Rules run after the post is live |
| Company mention | Composer toolbar LinkedIn icon — paste a `linkedin.com/company/…` URL to insert an organization mention tag |

### Not supported

| Feature | Notes |
| --- | --- |
| Account analytics | Available on <Badge text="linkedin-page" variant="default" /> channels only — see <a href="/docs/social-integration/linkedin-page">LinkedIn Page</a> |
| Per-post analytics | Available on <Badge text="linkedin-page" variant="default" /> channels only |
| Page auto-repost / auto-plug | <Badge text="linkedin-page" variant="default" /> channel plugs only — see <a href="/docs/social-integration/linkedin-page">LinkedIn Page</a> |
| Direct PDF file upload | Attach images instead; OpenQuok builds the document carousel at publish time |

## Backend environment

Set in <Badge text="backend/.env.development.local" variant="envBackend" /> (see <Badge text="backend/.env.development.example" variant="envBackend" />):

- <Badge text="LINKEDIN_CLIENT_ID" variant="envBackend" />
- <Badge text="LINKEDIN_CLIENT_SECRET" variant="envBackend" />

Restart the backend after changing env vars.

<h2 id="oauth-redirect-uri">OAuth redirect URI</h2>

Register this redirect URI in your LinkedIn app (Auth tab). The path is built from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />:

```text
https://YOUR-FRONTEND-DOMAIN/integration/oauth/linkedin
```

Local development example:

```text
https://localhost:5173/integration/oauth/linkedin
```

## LinkedIn developer app setup

<Steps>

### Create an app

Create an app at <DocsExternalLink href="https://www.linkedin.com/developers/apps">LinkedIn Developers</DocsExternalLink>.

![Create New Linkedin App](/docs/social-integration/linkedin/create-new-linkedin-app.webp)

### Add required products

In **Products**, add all required products. They include:

<ul class="not-prose list-disc pl-6">
<li><Badge text="Share on LinkedIn" variant="default" /></li>
<li><Badge text="Sign in with LinkedIn using OpenID Connect" variant="default" /></li>
<li><Badge text="Advertising API" variant="default" /></li>
</ul>

![Added Linkedin Products](/docs/social-integration/linkedin/added-products.webp)

<Callout type="note">
<p>OpenQuok requests <Badge text="openid" variant="default" /> and <Badge text="profile" variant="default" /> during OAuth and loads the signing-in member from LinkedIn’s <code>/v2/userinfo</code> endpoint.</p>
</Callout>

<Callout type="warning" title="Advertising API">
<p>Request the <strong>Advertising API</strong> product and complete LinkedIn’s access form. Without it, refresh tokens may not work and channels can disconnect.</p>
</Callout>

In **Auth**, after verification is completed, you can verify that the following organization scopes are automatically added (required for <Badge text="linkedin-page" variant="default" /> — see <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/social-integration/linkedin-page">LinkedIn Page</a> for verification steps):

<ul class="not-prose list-disc pl-6">
<li><Badge text="rw_organization_admin" variant="default" /></li>
<li><Badge text="w_organization_social" variant="default" /></li>
<li><Badge text="r_organization_social" variant="default" /></li>
</ul>

### Set redirect URI

In **Auth**, add the **personal profile OAuth redirect URI** (see <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/social-integration/linkedin#oauth-redirect-uri">OAuth redirect URI</a> above). If you also use <Badge text="linkedin-page" variant="default" />, add that URI too (see <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/social-integration/linkedin-page#oauth-redirect-uri">LinkedIn Page — OAuth redirect URI</a>).

![Set  Redirect URI](/docs/social-integration/linkedin/add-redirect-urls.webp)

### Copy credentials

Copy <strong>Client ID</strong> and <strong>Client Secret</strong> into <Badge text="LINKEDIN_CLIENT_ID" variant="envBackend" /> and <Badge text="LINKEDIN_CLIENT_SECRET" variant="envBackend" />.

</Steps>


## Related

- <a href="/docs/social-integration/linkedin-page">LinkedIn Page</a> — company Pages, analytics, and channel plugs
- CLI examples: <a href="/docs/cli-examples/linkedin">LinkedIn CLI examples</a>
- Public channel overview: <a href="/channels/linkedin">/channels/linkedin</a>

---
title: LinkedIn Page
description: How to configure a LinkedIn company page for Openquok — TikTok Developer portal, OAuth redirect URI, scopes, and backend env vars
order: 8
lastUpdated: 2026-06-20
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Connect a **LinkedIn company Page** with identifier <Badge text="linkedin-page" variant="default" />. OAuth is two-step: sign in with LinkedIn, then pick the Page you administer. Publishing uses the official LinkedIn REST Posts API.

For **personal profiles**, see <a href="/docs/social-integration/linkedin">LinkedIn</a>. Both channels share the same LinkedIn developer app credentials.

<Callout type="note" title="One LinkedIn app">
Page and personal channels use the same <Badge text="LINKEDIN_CLIENT_ID" variant="envBackend" /> and <Badge text="LINKEDIN_CLIENT_SECRET" variant="envBackend" />. Register **both** OAuth redirect URIs if you connect either or both channel types.
</Callout>

## Features

### Supported

| Feature | Details |
| --- | --- |
| Text posts | Up to 3,000 characters |
| Images | Multi-image posts |
| MP4 video | One attachment per post |
| Follow-up text comments | Text-only replies after the root post |
| Image → PDF document carousel | ≥2 images, no video; enable **Post as image carousel** in composer settings — OpenQuok combines images into a PDF document share at publish time. Optional **Carousel document title** (default: `slides`). LinkedIn is the only OpenQuok provider with document-carousel posts |
| Account analytics | Page-level insights |
| Per-post analytics | Engagement metrics on published posts |
| Cross-account comment / reshare plugs | In per-channel settings, enable **Add comments by a different account** or **Add re-posters**; pick other connected LinkedIn channels, set a delay, and (for comments) the message text. Rules run after the post is live |
| Page auto-repost / auto-plug | On a connected <Badge text="linkedin-page" variant="default" /> channel, open **Plugs**: **Auto repost posts** (reshare when likes reach a threshold, up to 3 times every 6 hours) and **Auto plug post** (promotional comment from the Page) |
| Company mention | Composer toolbar LinkedIn icon — paste a `linkedin.com/company/…` URL to insert an organization mention tag |

### Not supported

| Feature | Notes |
| --- | --- |
| Direct PDF file upload | Attach ≥2 images (no video); OpenQuok builds the PDF at publish time — the public media upload API does not accept `application/pdf` |

<Callout type="note" title="Other providers">
The public media upload API does not accept <code>application/pdf</code> for other social channels.
</Callout>

## Backend environment

Set in <Badge text="backend/.env.development.local" variant="envBackend" /> (see <Badge text="backend/.env.development.example" variant="envBackend" />):

- <Badge text="LINKEDIN_CLIENT_ID" variant="envBackend" />
- <Badge text="LINKEDIN_CLIENT_SECRET" variant="envBackend" />

Restart the backend after changing env vars.

<h2 id="oauth-redirect-uri">OAuth redirect URI</h2>

Register this redirect URI in your LinkedIn app (Auth tab). The path is built from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />:

```text
https://YOUR-FRONTEND-DOMAIN/integration/oauth/linkedin-page
```

Local development example:

```text
https://localhost:5173/integration/oauth/linkedin-page
```

## LinkedIn developer app setup

<Steps>

### Create an app

Create an app at <DocsExternalLink href="https://www.linkedin.com/developers/apps">LinkedIn Developers</DocsExternalLink>.

![Create New Linkedin App](/docs/_assets/social-integration/linkedin/create-new-linkedin-app.webp)

### Verify your app

<Callout type="note" title="Company Page required">
<p>In order to verify your app, you must first create a LinkedIn company Page.</p>
</Callout>

In **Home Page → For Business → Create a Company Page**:

![Create New Linkedin Page](/docs/_assets/social-integration/linkedin/create-new-linkedin-page.webp)


### Add required products

In **Products**, add all required products. They include:

<ul class="not-prose list-disc pl-6">
<li><Badge text="Share on LinkedIn" variant="default" /></li>
<li><Badge text="Sign in with LinkedIn using OpenID Connect" variant="default" /></li>
<li><Badge text="Advertising API" variant="default" /></li>
</ul>

![Added Linkedin Products](/docs/_assets/social-integration/linkedin/added-products.webp)

<Callout type="note">
<p>OpenQuok requests <Badge text="openid" variant="default" /> and <Badge text="profile" variant="default" /> during OAuth and loads the signing-in member from LinkedIn’s <code>/v2/userinfo</code> endpoint before the Page picker.</p>
</Callout>

<Callout type="warning" title="Advertising API">
<p>Request the <strong>Advertising API</strong> product and complete LinkedIn’s access form. Without it, refresh tokens may not work and channels can disconnect.</p>
</Callout>

In **Auth**, after verification is completed, you can verify that the following organization scopes are automatically added:

<ul class="not-prose list-disc pl-6">
<li><Badge text="rw_organization_admin" variant="param" /></li>
<li><Badge text="w_organization_social" variant="param" /></li>
<li><Badge text="r_organization_social" variant="param" /></li>
</ul>


### Set redirect URI

In **Auth**, add the **Page OAuth redirect URI** (see <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/social-integration/linkedin-page#oauth-redirect-uri">OAuth redirect URI</a> above). If you also use <Badge text="linkedin" variant="default" />, add that URI too (see <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/social-integration/linkedin#oauth-redirect-uri">LinkedIn — OAuth redirect URI</a>).

![Set  Redirect URI](/docs/_assets/social-integration/linkedin/add-redirect-urls.webp)

### Copy credentials

Copy <strong>Client ID</strong> and <strong>Client Secret</strong> into <Badge text="LINKEDIN_CLIENT_ID" variant="envBackend" /> and <Badge text="LINKEDIN_CLIENT_SECRET" variant="envBackend" />.

</Steps>


## Related

<CardGrid>
<LinkCard title="LinkedIn" description="Personal profile connection" href="/docs/social-integration/linkedin" />
<LinkCard title="CLI examples" description="Copy-paste LinkedIn recipes for openquok posts:create" href="/docs/cli-examples/linkedin" />
<LinkCard title="Public channel overview" description="LinkedIn landing page at /channels/linkedin" href="/channels/linkedin" />
</CardGrid>

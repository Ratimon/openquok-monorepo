---
title: Facebook
description: How to configure Facebook Pages for Openquok
order: 2
lastUpdated: 2026-06-06
---

<script>
import { Badge, Callout, DocsExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Facebook Page publishing uses Meta’s **Graph API** with **Facebook Login for Business**. You need a <DocsExternalLink href="https://developers.facebook.com/apps">Meta for Developers</DocsExternalLink> app, OAuth redirect URIs, and backend env vars <Badge text="FACEBOOK_APP_ID" variant="envBackend" /> and <Badge text="FACEBOOK_APP_SECRET" variant="envBackend" />.

<Callout type="note" title="One Meta app">
Instagram (Business) and Facebook can use the same developer app — you do not need separate apps for both products.
</Callout>


## Features

### Supported

| Feature | Details |
| --- | --- |
| Text posts | Up to 63,206 characters |
| Link posts | Optional URL via <Badge text="providerSettings.url" variant="param" /> in API payloads |
| Photo posts | Single image or multi-photo feed post |
| Video posts | Single <Badge text=".mp4" variant="param" /> attachment published as a Page video |
| Follow-up comments | Text replies after the root post; one image attachment per comment |
| Page analytics | Account-level and per-post insights when <Badge text="read_insights" variant="default" /> is granted |

### Not supported

| Feature | Notes |
| --- | --- |
| Stories | Not wired in Openquok today |
| Automatic inbox replies | No keyword or DM automation |
| Media on every comment type | Follow-up rows in the composer are text-only by default |

CLI walkthroughs: <a href="/docs/cli-examples/facebook">CLI Examples — Facebook</a>.

## Backend environment

Openquok reads credentials only through <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/config/GlobalConfig.ts"><Badge text="backend/config/GlobalConfig.ts" variant="path" /></DocsExternalLink>. Set:

- <Badge text="FACEBOOK_APP_ID" variant="envBackend" />
- <Badge text="FACEBOOK_APP_SECRET" variant="envBackend" />

Copy from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envBackend" /></DocsExternalLink> into <Badge text="backend/.env.development.local" variant="envBackend" />, then restart the backend.

The frontend base URL used in OAuth redirect URIs comes from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> (default <Badge text="http://localhost:5173" variant="new" /> for local Vite). For non-HTTPS local URLs, the backend uses the same HTTPS relay pattern as other Meta integrations (see the Threads doc).

<h2 id="oauth-redirect-uris-register-in-meta">OAuth redirect URIs (register in Meta)</h2>

Meta redirects the browser to your **web app** after consent. Register this **exact** path on top of your frontend origin (from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />):

```txt
https://YOUR-FRONTEND-DOMAIN/integration/oauth/facebook
```

<Callout type="note">
<p>Substitute the hostname from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> (scheme + host, no trailing slash). <code>www</code> and apex are different—register in Meta the same origin the API sends in <code>redirect_uri</code>. Align with <a href="/docs/configuration-backend">Configuration - Backend</a> and <a href="/docs/configuration-web/vite">Vite (SvelteKit)</a>.</p>
</Callout>

After OAuth, Openquok shows a **Page picker** so you choose which Facebook Page to connect (unlike guides that assume a single implicit Page).

## Meta app setup (summary)

Shared with <a href="/docs/social-integration/instagram#meta-app-setup-summary">Instagram — Meta app setup</a>.

<Steps>

### Create a Meta app

Create an app in <DocsExternalLink href="https://developers.facebook.com/apps">Meta for Developers</DocsExternalLink>.

![Step 1 - Create a Meta app](/docs/social-integration/meta/create-meta-app.webp)

### Select use case

Select **Other**.

![Step 2 - Select Other Type](/docs/social-integration/meta/select-other-usecases.webp)

### Select app type

Select **Business**.

![Step 3 - Select Business type](/docs/social-integration/meta/select-business-type.webp)


### Finish creating the app

![Step 4 - Finish Creating Meta App](/docs/social-integration/meta/finish-creating-meta-app.webp)

<Callout type="warning" title="Business verification needed">
If you are deploying a public app, business verification may be required and you may need to link your app with Meta’s business portfolio.
</Callout>

</Steps>

## Facebook Page flow

When you manage one or more Facebook Pages, connect through **Facebook Login for Business** (same product family as Instagram (Business), but with **Page** scopes and the **Facebook** redirect URI above).

<Steps>

### Add Facebook Login for Business

In the app dashboard, select **Facebook Login for Business**.

![Step 1 - Add Facebook Login for Business](/docs/social-integration/meta/set-business-login.webp)


### Set redirect URI

Add the **Facebook Page** redirect URI from the <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/social-integration/facebook#oauth-redirect-uris-register-in-meta">OAuth redirect URIs (register in Meta)</a> section to your app’s valid OAuth redirect list.

![Step 2 - Redirect URI](/docs/social-integration/meta/add-redirect-urls.webp)


### Request permissions

In the Meta developer app, open the permissions area where you can request **advanced access** (wording varies—for example **Use cases** → **Permissions and features**, or **App Review**). Request access for the scopes below; they match what Openquok’s Facebook Page integration asks for during OAuth.

<ul class="not-prose list-disc pl-6">
<li><Badge text="pages_show_list" variant="default" /></li>
<li><Badge text="business_management" variant="default" /></li>
<li><Badge text="pages_manage_posts" variant="default" /></li>
<li><Badge text="pages_manage_engagement" variant="default" /></li>
<li><Badge text="pages_read_engagement" variant="default" /></li>
<li><Badge text="read_insights" variant="default" /></li>
</ul>

![Step 3 - Set permissions](/docs/social-integration/meta/set-permissions.webp)

<Callout type="note">
Meta reorganizes this screen from time to time. If a scope name differs slightly in the UI, align with <DocsExternalLink href="https://developers.facebook.com/docs/pages-api">Meta Pages API documentation</DocsExternalLink> and keep the list in sync with <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/integrations/providers/facebook/facebookProvider.ts"><Badge text="backend/integrations/providers/facebook/facebookProvider.ts" variant="path" /></DocsExternalLink> for the canonical set in this repo.
</Callout>

<Callout type="note" title="self-host">
For a personal or team-only install where every publisher is an app Admin or Tester, Development mode is often enough without App Review. Production use for other people’s Pages requires **Live** mode and approved permissions.
</Callout>


### Set app mode to Live

Switch **App Mode** from Development to **Live** when you publish for users outside your app roles. In Development mode, posts with media may only be fully visible to testers — a common cause of “missing images” on published posts.


### Copy your credentials

In the Meta app **Settings** area, copy **App ID** → <Badge text="FACEBOOK_APP_ID" variant="envBackend" />, and **App Secret** → <Badge text="FACEBOOK_APP_SECRET" variant="envBackend" /> to your env file.

![Step 4 - Copy your credentials](/docs/social-integration/meta/copy-app-credetials.webp)

Restart the backend. Otherwise, the backend may not pick up your new environment variables.

</Steps>

## Troubleshooting

### Image missing from the published post

Check **App Mode**. In Development, media posts are often visible only to app developers and testers. Switch to **Live** for public visibility.

### Posts work for you but not for other users

Same root cause — the app is in Development mode. Only roles you added on the app can see API-published content until the app is Live.

### No Pages in the picker

During OAuth, grant access to **all Pages** you manage. Openquok also queries Business Manager owned/client Pages when <Badge text="business_management" variant="default" /> is granted. Remove the channel and reconnect if you skipped Page selection.

## Related

<Callout type="tip" title="Contributing">
See <a href="/docs/social-integration/add-provider">Adding a social provider</a> for the full backend + web checklist used when implementing Facebook and future channels.
</Callout>

## References

<ul class="list-disc pl-6">
<li><DocsExternalLink href="https://developers.facebook.com/docs/pages-api">Meta — Pages API</DocsExternalLink></li>
<li><DocsExternalLink href="https://developers.facebook.com/docs/facebook-login">Meta — Facebook Login</DocsExternalLink></li>
<li><DocsExternalLink href="https://developers.facebook.com/apps">Meta for Developers — Apps</DocsExternalLink></li>
</ul>

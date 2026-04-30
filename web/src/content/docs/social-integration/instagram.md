---
title: Instagram
description: How to configure Instagram for Openquok
order: 2
lastUpdated: 2026-04-12
---

<script>
import { Badge, Callout, DocsExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

You can connect a **professional Instagram account** in two ways: **Instagram (Business)** uses a Facebook Page linked to that Instagram account; **Instagram (Standalone)** uses Instagram Login directly (no Facebook Page).

Both require a <DocsExternalLink href="https://developers.facebook.com/apps">Meta for Developers</DocsExternalLink> app. The sections below are **Openquok-specific** URLs and envs.

<Callout type="note" title="One Meta app">
Instagram and Facebook can use the same developer app — there is no need to create two separate apps for both products.
</Callout>

## Backend environment

Openquok reads credentials only through <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/config/GlobalConfig.ts"><Badge text="backend/config/GlobalConfig.ts" variant="path" /></DocsExternalLink>. Set:


**Instagram (Business) — Facebook Login**

- <Badge text="FACEBOOK_APP_ID" variant="envBackend" />
- <Badge text="FACEBOOK_APP_SECRET" variant="envBackend" />

**Instagram (Standalone) — Instagram Login**

- <Badge text="INSTAGRAM_APP_ID" variant="envBackend" />
- <Badge text="INSTAGRAM_APP_SECRET" variant="envBackend" />

Copy from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envFile" /></DocsExternalLink> into <Badge text="backend/.env.development.local" variant="envFile" />, then restart the backend.

The frontend base URL used in OAuth redirect URIs comes from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> (default <Badge text="http://localhost:5173" variant="new" /> for local Vite). For non-HTTPS local URLs, the backend uses the same HTTPS relay pattern as other Meta integrations (see the Threads doc).


<h2 id="oauth-redirect-uris-register-in-meta">OAuth redirect URIs (register in Meta)</h2>

Meta redirects the browser to your **web app** after consent. Register these **exact** paths on top of your frontend origin (from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />), for example:

**Instagram (Business)** — Facebook Login for Business

```txt
https://YOUR-FRONTEND-DOMAIN/integration/oauth/instagram-business
```

**Instagram (Standalone)** — Instagram Login

```txt
https://YOUR-FRONTEND-DOMAIN/integration/oauth/instagram-standalone
```

<Callout type="note" title="YOUR-FRONTEND-DOMAIN must match the backend env">
<p>Substitute the hostname from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> (scheme + host, no trailing slash). <code>www</code> and apex are different—register in Meta the same origin the API sends in <code>redirect_uri</code>. Align with <a href="/docs/configuration-backend">Configuration - Backend</a> and <a href="/docs/configuration-web/environment">Web environment variables</a>.</p>
</Callout>

For local HTTPS (or relay) examples, mirror the pattern used for Threads in <DocsExternalLink href="/docs/social-integration/threads">Meta Threads</DocsExternalLink>.

## Meta app setup (summary)

<Steps>

### Create a Meta app

Create an app in <DocsExternalLink href="https://developers.facebook.com/apps">Meta for Developers</DocsExternalLink>.

![Step 1 - Create a Meta app](/docs/social-integration/meta/create-meta-app.webp)


### Select use case

Select **Other**.

![Step 2 - Select Other Type](/docs/social-integration/meta/select-other-usecases.webp)


### Select app type

Select **Business**.

![Step 3 - Finish Creating Meta App](/docs/social-integration/meta/select-business-type.webp)


### Finish Creating Meta App

![Step 4 - Finish Creating Meta App](/docs/social-integration/meta/finish-creating-meta-app.webp)

<Callout type="warning" title="Business Verification Needed">
If you are deploying public app,business verification is required and you may need to link your app with Meta's Business portfolio
</Callout>

</Steps>

## Instagram (Business) flow

When your professional Instagram account is already tied to a Facebook Page, you can connect to it by setting up the Login for Business flow.


<Steps>

### Add Facebook Login for Business

In dashboard, select **Facebook Login for Business**

![Step 1 - Add Facebook Login for Business](/docs/social-integration/meta/instagram-business/set-business-login.webp)


### Set Redirect URI

Add the **Instagram (Business)** redirect URI from the <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/social-integration/instagram#oauth-redirect-uris-register-in-meta">OAuth redirect URIs (register in Meta)</a> section to your app’s valid OAuth redirect list.

![Step 2 - Redirect URI](/docs/social-integration/meta/instagram-business/add-redirect-urls.webp)


### Request permissions

In the Meta developer app, open the permissions area where you can request **advanced access** (wording varies—for example **Use cases** → **Permissions and features**, or **App Review**). Request access for the scopes below; they match what Openquok’s Instagram (Business) integration asks for during OAuth.

<ul class="not-prose list-disc pl-6">
<li><Badge text="instagram_basic" variant="default" /></li>
<li><Badge text="pages_show_list" variant="default" /></li>
<li><Badge text="pages_read_engagement" variant="default" /></li>
<li><Badge text="business_management" variant="default" /></li>
<li><Badge text="instagram_content_publish" variant="default" /></li>
<li><Badge text="instagram_manage_comments" variant="default" /></li>
<li><Badge text="instagram_manage_insights" variant="default" /></li>
</ul>

![Step 4 - Set Permissions](/docs/social-integration/meta/instagram-business/set-permissions.webp)

<Callout type="note" title="Dashboard differences">
Meta reorganizes this screen from time to time. If a scope name differs slightly in the UI, align with <DocsExternalLink href="https://developers.facebook.com/docs/instagram-api">Instagram Platform documentation</DocsExternalLink> and your app’s use case; keep the list in sync with <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/integrations/providers/instagramBusinessProvider.ts"><Badge text="backend/integrations/providers/instagramBusinessProvider.ts" variant="path" /></DocsExternalLink> for the canonical set in this repo.
</Callout>


### Copy your credentials

In the Meta app **Settings** area, copy **App ID** → <Badge text="FACEBOOK_APP_ID" variant="envBackend" />, and **App Secret** → <Badge text="FACEBOOK_APP_SECRET" variant="envBackend" /> to your env file.

![Step 4 - Copy your credentials](/docs/social-integration/meta/instagram-business/copy-app-credetials.webp)

Restart the backend. Otherwise, the backend may not pick up your new environment variables.

</Steps>


## Instagram (Standalone) flow

Use **Instagram (Standalone)** when you prefer **Instagram Login** for a professional account and do not want to route the connection through a Facebook Page or Facebook Login for Business.

<Callout type="warning">
Standalone Login requires a professional Instagram account (creator or business).
</Callout>

<Steps>

### Add Instagram product

In dashboard, select **Instagram**

![Step 1 - Add Facebook Login for Business](/docs/social-integration/meta/instagram-standalone/set-instagram.webp)


### Set Instagram Business Login

![Step 2 - Set up Business Login for Business](/docs/social-integration/meta/instagram-standalone/set-business-login.webp)

This will let you to provide a redirect URL.


### Set Redirect URI

Add the **Instagram (Standalone)** redirect URI from the <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/social-integration/instagram#oauth-redirect-uris-register-in-meta">OAuth redirect URIs (register in Meta)</a> section to your app’s valid OAuth redirect list.

![Step 3 - Set Redirect URI](/docs/social-integration/meta/instagram-standalone/add-redirect-urls.webp)


### Copy your credentials

Copy **Instagram app ID** → <Badge text="INSTAGRAM_APP_ID" variant="envBackend" />, and **Instagram app secret** → <Badge text="INSTAGRAM_APP_SECRET" variant="envBackend" /> to your env file.

![Step 4 - Copy your credentials](/docs/social-integration/meta/instagram-standalone/copy-app-credetials.webp)

Restart the backend. Otherwise, the backend may not pick up your new environment variables.

</Steps>


## Add Role and Start testing

<Steps>

### Add People

Go to **App Roles page** and click "Add People"

![Step 1 - Add People](/docs/social-integration/meta/add-people.webp)


### Add the Instagram account as Tester

Under additional roles for this app, select **Instagram Tester**.

![Step 2 - Add instagram test user](/docs/social-integration/meta/add-instagram-test-user.webp)

Enter the **Instagram** username that should test the app (often your own).


### Accept Invitation

You should see a pending invite on Instagram’s <DocsExternalLink href="https://www.instagram.com/accounts/manage_access/">manage access</DocsExternalLink> page.

![Step 3 - Accept invite](/docs/social-integration/meta/accept-instagram-invite.webp)

Accept it to finish tester setup for that account.

</Steps>


## References

<ul class="list-disc pl-6">
<li><DocsExternalLink href="https://developers.facebook.com/docs/instagram-api">Meta — Instagram Platform</DocsExternalLink></li>
<li><DocsExternalLink href="https://developers.facebook.com/apps">Meta for Developers — Apps</DocsExternalLink></li>
</ul>

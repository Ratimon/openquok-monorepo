---
title: Meta Threads
description: How to configure Meta Threads for Openquok
order: 1
lastUpdated: 2026-04-08
---

<script>
import { Badge, Callout, DocsExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Threads publishing uses Meta’s **Threads API** behind an OAuth 2.0 flow. You need a <DocsExternalLink href="https://developers.facebook.com/apps">Meta for Developers</DocsExternalLink> app with **Threads** access, valid **OAuth redirect URIs**, and backend env vars <Badge text="THREADS_APP_ID" variant="envBackend" /> and <Badge text="THREADS_APP_SECRET" variant="envBackend" />.

For Meta’s product requirements and API surface, see <DocsExternalLink href="https://developers.facebook.com/docs/threads">Threads API documentation</DocsExternalLink>. The steps below add **Openquok-specific** URLs and envs.

<Callout type="note" title="Complex setup">
Meta’s onboarding can take time. If something fails, double-check redirect URIs **character-for-character** and that the backend picked up new env vars after a restart.
</Callout>

## Backend environment

Openquok reads Threads credentials only through <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/config/GlobalConfig.ts"><Badge text="backend/config/GlobalConfig.ts" variant="path" /></DocsExternalLink> (populated via <Badge text="getEnv" variant="default" /> from <Badge text="backend/config/envHelper.ts" variant="path" />). Set:

- <Badge text="THREADS_APP_ID" variant="envBackend" /> — **Threads App ID** from the Meta app dashboard  
- <Badge text="THREADS_APP_SECRET" variant="envBackend" /> — **Threads App Secret** (treat as confidential)

Copy from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envFile" /></DocsExternalLink> into <Badge text="backend/.env.development.local" variant="envFile" />, fill values, then **restart** the backend process.

The frontend base URL used for OAuth redirects comes from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> (default <Badge text="http://localhost:5173" variant="new" /> for local Vite).

<h2 id="oauth-redirect-uri-what-to-enter-in-meta">OAuth redirect URI (what to enter in Meta)</h2>

Meta redirects the **browser** back to your **web app** after consent—not to <Badge text="/api/v1" variant="path" />. The backend builds the redirect from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> plus the path <Badge text="/account/integrations/social/threads" variant="path" />.

- **Production** (when <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> is <Badge text="https://…" variant="new" />): register
```bash
https://YOUR-FRONTEND-DOMAIN/account/integrations/social/threads
```

- **Local development (recommended)**: Meta requires **HTTPS** redirect URIs for Threads. Run your web app on HTTPS (for example with a local dev certificate) and set <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> accordingly. Typical value:  
```bash
https://localhost:5173/account/integrations/social/threads
```


## Meta app setup (summary)

<Steps>

### Create a Meta app

Create an app in <DocsExternalLink href="https://developers.facebook.com/apps">Meta for Developers</DocsExternalLink>.

![Step 1 - Create a Meta app](/docs/social-integration/meta/create-meta-app.webp)


### Request access to Threads

Select **Access the Threads API**.

![Step 2 - Request Threads Access](/docs/social-integration/meta/threads/request-threads-access.webp)


### Finish Creating Meta App

You can skip **adding business details** and **connecting a business portfolio**

![Step 3 - Finish Creating Meta App](/docs/social-integration/meta/threads/finish-creating-meta-app.webp)


### Scope a Meta app

On your app dashboard, Select **Access the Threads API** to customize the API access.

Add **products/scopes** including <Badge text="threads_basic" variant="default" /> and <Badge text="threads_content_publish" variant="default" />.

![Step 4 - Scope a Meta App](/docs/social-integration/meta/threads/scope-api-access.webp)

<Callout type="tip">
Follow <DocsExternalLink href="https://developers.facebook.com/docs/threads/get-started">Threads API get started</DocsExternalLink> for current requirements.
</Callout>


### Configure API settings.

In the Meta app **Settings** area, copy **Threads app ID** → <Badge text="THREADS_APP_ID" variant="envBackend" />, and **Threads app Secret** → <Badge text="THREADS_APP_SECRET" variant="envBackend" /> to your env file.

Restart the app. Otherwise, the backend may not pick up your new environment variables

![Step 5 - Scope a Meta App](/docs/social-integration/meta/threads/configure-api-settings.webp)

Add the **production** and/or **local** redirect URIs from the <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/social-integration/threads#oauth-redirect-uri-what-to-enter-in-meta">OAuth redirect URI (what to enter in Meta)</a> section.

<Callout type="warning" title="Meta dashboard form">
In Meta’s Threads API settings, type/paste the redirect URI and click the suggested value below to add it. If the form still won’t save, fill the Uninstall and Delete callback URLs too. Actuallly, those Uninstall and Delete urls are not used, but if we dont fill them, Meta wont allow us to save.
</Callout>

<Callout type="note" title="About HTTPS relays">
Some OAuth providers accept redirect URIs that are HTTPS wrappers around an HTTP localhost URL. For Threads, Meta can reject redirect URIs that contain an embedded <code>http://</code> segment even when the outer URL is HTTPS. Prefer a “pure HTTPS” redirect URI (HTTPS localhost or an HTTPS tunnel).
</Callout>

### Add the Threads account as a tester

In the **Meta developer app sidebar**, go to **App roles** → **Roles**.

- Open the **Testers** tab, then choose **Add People**.

![Step 6 - Add test user](/docs/social-integration/meta/threads/add-test-user.webp)

- Under additional roles for this app, select **Threads Tester**.

- Enter the **Threads** username that should test the app (often your own). That handle is for **Threads** and can differ from the Meta developer account tied to Facebook.

### Allow the app on your Threads account

In **Threads** (app or <DocsExternalLink href="https://www.threads.net">threads.net</DocsExternalLink>), open your account **Settings**.

- Open **Website permissions**, then the **Invites** tab.

![Step 7 - Accept invite](/docs/social-integration/meta/threads/accept-invite.webp)

- You should see a pending invite for the app — accept it to finish tester setup for that account.

### Start testing

Return to the <DocsExternalLink href="https://developers.facebook.com/apps">Meta developer portal</DocsExternalLink>. In the sidebar, open **Testing**, then open **Graph API Explorer**.

- In the header, open the **API selector** (app / API version dropdown) and switch it to the **Threads** endpoint Meta lists—for example **threads.net** with **v1.0** (labels vary by dashboard version).

![Step 9 - Graph Api Explorer](/docs/social-integration/meta/threads/graph-api-explorer.webp)

- In the right sidebar, under **Access Token**, choose **Generate Threads Access Token**. A new window lets you pick the **Threads** account to test with—use one that accepted the tester invite earlier.

- If everything is wired correctly, Meta returns a long alphanumeric access token. You do not need to store or paste it into Openquok; receiving it only confirms the app and tester setup work.

</Steps>

## How Openquok uses the flow

- **Authorize URL** is produced by the backend (session or programmatic API); the user signs in with Meta and returns to the **frontend** route with an authorization <Badge text="code" variant="default" />.

- The web client then calls the backend **social-connect** endpoint with <Badge text="code" variant="default" />, <Badge text="state" variant="default" />, and timezone so the server can exchange the code and persist the channel.

API prefix defaults to <Badge text="/api/v1" variant="path" /> (see <Badge text="API_PREFIX" variant="envBackend" />). Typical patterns include session routes under <Badge text="/integrations" variant="path" /> and org–key routes under <Badge text="/public" variant="path" />—see route modules in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/tree/main/backend/routes"><Badge text="backend/routes" variant="path" /></DocsExternalLink> for the exact paths in your checkout.

## References

<ul class="list-disc pl-6">
<li><DocsExternalLink href="https://developers.facebook.com/docs/threads">Meta — Threads API</DocsExternalLink></li>
<li><DocsExternalLink href="https://developers.facebook.com/apps">Meta for Developers — Apps</DocsExternalLink></li>
</ul>

---
title: Meta Threads
description: Configure Meta Threads OAuth for Openquok — Meta app, redirect URIs, THREADS_APP_ID and THREADS_APP_SECRET, and testers.
order: 1
lastUpdated: 2026-04-02
---

<script>
import { Badge, Callout, DocsExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Threads publishing uses Meta’s **Threads API** behind an OAuth 2.0 flow. You need a <DocsExternalLink href="https://developers.facebook.com/apps">Meta for Developers</DocsExternalLink> app with **Threads** access, valid **OAuth redirect URIs**, and backend env vars <Badge text="THREADS_APP_ID" variant="envBackend" /> and <Badge text="THREADS_APP_SECRET" variant="envBackend" />.

For Meta’s product requirements and API surface, see <DocsExternalLink href="https://developers.facebook.com/docs/threads">Threads API documentation</DocsExternalLink>. The steps below add **Openquok-specific** URLs and env wiring.

<Callout type="note" title="Complex setup">
Meta’s onboarding can take time (business verification, app review, tester invites). If something fails, double-check redirect URIs **character-for-character** and that the backend picked up new env vars after a restart.
</Callout>

## Backend environment

Openquok reads Threads credentials only through <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/config/GlobalConfig.ts"><Badge text="backend/config/GlobalConfig.ts" variant="path" /></DocsExternalLink> (populated via <Badge text="getEnv" variant="default" /> from <Badge text="backend/config/envHelper.ts" variant="path" />). Set:

- <Badge text="THREADS_APP_ID" variant="envBackend" /> — **Threads App ID** from the Meta app dashboard  
- <Badge text="THREADS_APP_SECRET" variant="envBackend" /> — **Threads App Secret** (treat as confidential)

Copy from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envFile" /></DocsExternalLink> into <Badge text="backend/.env.development.local" variant="envFile" />, fill values, then **restart** the backend process.

The frontend base URL used for OAuth redirects comes from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> (default <Badge text="http://localhost:5173" variant="new" /> for local Vite).

## OAuth redirect URI (what to enter in Meta)

Meta redirects the **browser** back to your **web app** after consent—not to <Badge text="/api/v1" variant="path" />. The backend builds the redirect from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> plus the path <Badge text="/integrations/social/threads" variant="path" />.

- **Production** (when <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> is <Badge text="https://…" variant="new" />): register  
  **`https://YOUR-FRONTEND-DOMAIN/integrations/social/threads`**

- **Local HTTP** (default dev): the backend wraps non-HTTPS origins with a public HTTPS relay so the authorize URL stays valid for Meta. Register **exactly** what your running backend would send, for example:  
  **`https://redirectmeto.com/http://localhost:5173/integrations/social/threads`**  
  if <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> is <Badge text="http://localhost:5173" variant="new" />.

If you change port or host, the redirect string changes—**always match Meta’s field to the URI your backend encodes** (you can copy it from the generated authorize URL’s <Badge text="redirect_uri" variant="default" /> query parameter).

<Callout type="tip" title="Other tools may use different local ports">
Some stacks document <Badge text="localhost:4200" variant="default" /> or Docker on <Badge text=":5000" variant="default" /> for local redirects. Openquok’s default web dev server is typically <Badge text="5173" variant="default" /> (Vite)—use your actual <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />, not another project’s port, unless you deliberately run the web app elsewhere.
</Callout>

<Callout type="warning" title="Meta dashboard form">
On the Meta app **Threads API** settings screen, you often must **click** each OAuth / callback URL field so it is “active” before the form will save. Uninstall / delete callback URLs may still require placeholder values even if unused.
</Callout>

## Meta app setup (summary)

<Steps>

### Create and scope a Meta app

Create an app in <DocsExternalLink href="https://developers.facebook.com/apps">Meta for Developers</DocsExternalLink>, request **Access the Threads API**, add products/scopes such as <Badge text="threads_basic" variant="default" /> and <Badge text="threads_content_publish" variant="default" />, and complete the dashboard wizard until customization is finished. Follow <DocsExternalLink href="https://developers.facebook.com/docs/threads/get-started">Threads API get started</DocsExternalLink> for current requirements.

### Paste App ID and App Secret into the backend

In the Meta app **Threads** / **Settings** area, copy **Threads App ID** → <Badge text="THREADS_APP_ID" variant="envBackend" />, and **App Secret** → <Badge text="THREADS_APP_SECRET" variant="envBackend" />. Restart the backend.

### Register OAuth redirect URIs

Add the **production** and/or **local** redirect URIs from the section above. They must match what Openquok sends in the authorize request.

### Add testers and accept Threads invites

Add **Threads Testers** under app roles, then on Threads open **Website permissions** invites and accept the app for the test account you use.

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

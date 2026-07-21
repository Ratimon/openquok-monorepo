---
title: X (Twitter)
description: How to configure X for OpenQuok — OAuth 1.0a, backend env, and developer portal settings.
order: 8
lastUpdated: 2026-06-21
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

X publishing uses **OAuth 1.0a** (not OAuth 2). You need an X developer app with **Read and Write** permissions, a **Native App** type, valid **OAuth redirect URIs**, and backend env vars <Badge text="X_API_KEY" variant="envBackend" /> and <Badge text="X_API_SECRET" variant="envBackend" />.

<Callout type="warning">Redirect URI must match exactly. The browser callback path is <Badge text="/integration/oauth/x" variant="path" />. Register it character-for-character in the X developer portal.
</Callout>

CLI walkthroughs: <a href="/docs/cli-examples/x">CLI Examples — X</a>.

## Features

### Supported

| Feature | Details |
| --- | --- |
| Text posts | Weighted **280** characters (standard); **4000** when **Verified** is enabled on the connected channel (X Premium) |
| Image posts | Up to **four** images per tweet |
| Video posts | **One** video per tweet (≤ **140** seconds validated in the composer) |
| Who can reply | `following`, `mentionedUsers`, `subscribers`, or `verified` via compose settings |
| Community posts | Optional community URL (parsed to `community_id` at publish) |
| Content labels | **Made with AI** and **Paid partnership** toggles |
| Thread replies | Scheduled quote-less replies via <Badge text="x.replies[]" variant="param" /> with per-reply <Badge text="delaySeconds" variant="param" /> |
| Thread finisher | Closing reply via <Badge text="x.enabled" variant="param" /> and <Badge text="x.message" variant="param" /> |
| Platform analytics | Account timeline: likes, replies, reposts, quotes, impressions (unless <Badge text="DISABLE_X_ANALYTICS" variant="envBackend" /> is <Badge text="true" variant="new" />) |
| Per-post analytics | Public metrics for a published tweet when the post row has a <Badge text="release_id" variant="param" /> |
| Channel plugs | Auto-repost and auto-plug when like thresholds are met |
| Cross-account repost plug | Repost from other connected X channels after publish (<Badge text="x-repost-post-users" variant="default" />) |
| @-mention lookup | <Badge text="POST /integrations/mentions" variant="path" /> for connected X channels (API; composer autocomplete not wired in the web UI yet) |
| OAuth connect | **OAuth 1.0a** single-step flow; long-lived tokens (reconnect on auth errors) |

### Not supported

| Feature | Notes |
| --- | --- |
| OAuth 2 / PKCE | OpenQuok uses OAuth 1.0a only for X |
| Polls, quote tweets, X Articles | Not implemented |
| Mixed image + video | One media mode per post: up to four images **or** one video |
| Automatic token refresh | No refresh cron; reconnect the channel when X returns auth errors |
| Composer @-mention picker | Backend mention search exists; the post editor does not show X @ suggestions yet |

## Backend environment

OpenQuok reads X credentials only through <Badge text="backend/config/GlobalConfig.ts" variant="path" /> (populated via <Badge text="getEnv" variant="default" /> from <Badge text="backend/config/envHelper.ts" variant="path" />).

Copy the X block from <Badge text="backend/.env.development.example" variant="envBackend" /> into <Badge text="backend/.env.development.local" variant="envBackend" />, fill values, then **restart** the backend process:

```bash
# X (Twitter) — OAuth 1.0a Native App (Read + Write).
# Redirect URI on the app must match: {FRONTEND_DOMAIN_URL}/integration/oauth/x
X_API_KEY=""
X_API_SECRET=""
# Set to true to hide X analytics in API responses and dashboards.
DISABLE_X_ANALYTICS=false
```

| Variable | Description |
| --- | --- |
| <Badge text="X_API_KEY" variant="envBackend" /> | **API Key** (Consumer Key) from the X developer portal |
| <Badge text="X_API_SECRET" variant="envBackend" /> | **API Secret** (Consumer Secret) |
| <Badge text="DISABLE_X_ANALYTICS" variant="envBackend" /> | When <Badge text="true" variant="new" />, X analytics endpoints return empty series (connected X channels may still appear in the analytics UI) |

The frontend base URL used for OAuth redirects comes from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />.

<h2 id="oauth-redirect-uri">OAuth redirect URI</h2>

X redirects the **browser** back to your **web app** after consent. The backend builds the redirect from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> plus <Badge text="/integration/oauth/x" variant="path" />.

```bash
https://YOUR-FRONTEND-DOMAIN/integration/oauth/x
```

For local development with HTTPS (recommended):

```bash
https://localhost:5173/integration/oauth/x
```

## X developer app setup

<Steps>

### Create a project and app

Open the <DocsExternalLink href="https://developer.twitter.com/en/portal/dashboard">X developer portal</DocsExternalLink> 

![Create New X App](/docs/_assets/social-integration/x/create-new-x-app.webp)

Then, submit the form and the project will be created.

### Set up authentication

In **Developer Console → Apps -> Settings**:

![Configure Authentication Settings](/docs/_assets/social-integration/x/configure-auth-settings.webp)

- **App permissions:** <Badge text="Read and Write" variant="param" />

- **Type of App:** <Badge text="Native App" variant="param" />
<Callout type="warning"><Badge text="Native App" variant="param" /> is required for OAuth 1.0a. Using Web App, Automated App or Bot can fail with error code 32
</Callout>

![Configure App Type and Permissions](/docs/_assets/social-integration/x/configure-type-permissions.webp)

- **Callback URI / Redirect URL:** add the redirect URI (see <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/social-integration/x#oauth-redirect-uri">OAuth redirect URI</a> above)

![Configure App Type and Permissions](/docs/_assets/social-integration/x/configure-app-info.webp)

### Copy API keys

In **Keys and tokens**, open **Consumer Keys** and copy **API Key** and **API Secret** into <Badge text="X_API_KEY" variant="envBackend" /> and <Badge text="X_API_SECRET" variant="envBackend" />.

</Steps>

## Compose settings

Per-post options (composer or CLI) include:

| Setting | Keys |
| --- | --- |
| Who can reply | <Badge text="who_can_reply_post" variant="param" /> or <Badge text="x.whoCanReplyPost" variant="param" /> |
| Community | <Badge text="community" variant="param" /> / <Badge text="community_url" variant="param" /> or <Badge text="x.communityUrl" variant="param" /> |
| Made with AI | <Badge text="made_with_ai" variant="param" /> or <Badge text="x.madeWithAi" variant="param" /> |
| Paid partnership | <Badge text="paid_partnership" variant="param" /> or <Badge text="x.paidPartnership" variant="param" /> |
| Thread finisher | <Badge text="x.enabled" variant="param" />, <Badge text="x.message" variant="param" /> |
| Thread replies | <Badge text="x.replies[]" variant="param" /> with <Badge text="delaySeconds" variant="param" /> |

Standard accounts use a **280 weighted** character limit; enable **Verified** on the channel (in channel settings) for **4000** when the account has X Premium.

## Related

<CardGrid>
<LinkCard title="CLI examples" description="Copy-paste X recipes for openquok posts:create" href="/docs/cli-examples/x" />
<LinkCard title="Adding a provider" description="Contributor checklist for new social integrations" href="/docs/developer-guidelines/add-provider" />
</CardGrid>

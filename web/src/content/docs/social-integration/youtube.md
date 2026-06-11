---
title: YouTube
description: How to configure YouTube channel publishing for Openquok — Google Cloud OAuth, APIs, and backend env vars.
order: 5
lastUpdated: 2026-06-10
---

<script>
import { Badge, Callout, DocsExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

YouTube publishing uses **Google OAuth 2.0** with the **YouTube Data API v3** and **YouTube Analytics API**.

You need a <DocsExternalLink href="https://console.cloud.google.com/">Google Cloud</DocsExternalLink> project, an OAuth **Web application** client, enabled APIs, and backend env vars <Badge text="YOUTUBE_CLIENT_ID" variant="envBackend" /> and <Badge text="YOUTUBE_CLIENT_SECRET" variant="envBackend" />.

Openquok uploads **one MP4 video**, with optional title, privacy, tags, made-for-kids flag, and custom thumbnail. After OAuth you pick which **YouTube channel** to connect (two-step flow).

<Callout type="note" title="Not Supabase login">
<p>YouTube channel OAuth uses its own Google Cloud OAuth client (<Badge text="YOUTUBE_CLIENT_ID" variant="envBackend" /> / <Badge text="YOUTUBE_CLIENT_SECRET" variant="envBackend" />). That is <strong>not</strong> the same credentials as Supabase Auth Google sign-in — see <a href="/docs/configuration-backend/google-oauth">Google OAuth (Supabase)</a> if you also offer Google login to your workspace.</p>
</Callout>

CLI walkthroughs: <a href="/docs/cli-examples/youtube">CLI Examples — YouTube</a>.

## Features

### Supported

| Feature | Details |
| --- | --- |
| Video upload | Exactly **one** <Badge text=".mp4" variant="param" /> attachment per scheduled post |
| Title | 2–100 characters via provider settings |
| Description | Post body (<Badge text="-c" variant="param" /> / composer), up to 5,000 characters |
| Privacy | <Badge text="public" variant="default" />, <Badge text="private" variant="default" />, or <Badge text="unlisted" variant="default" /> |
| Tags | Optional string labels in provider settings |
| Custom thumbnail | Optional image path after upload |
| Made for kids | <Badge text="selfDeclaredMadeForKids" variant="param" /> — <Badge text="yes" variant="default" /> or <Badge text="no" variant="default" /> |
| Shorts | Vertical MP4 uploads use the same video upload path; YouTube may classify qualifying uploads as Shorts |
| Channel analytics | Time-series metrics (views, watch time, subscribers, likes, …) for 7 / 30 / 90 days |
| Per-video snapshot | Views, likes, comments, favorites on published videos |

### Not supported

| Feature | Notes |
| --- | --- |
| Text-only posts | A video attachment is required |
| Follow-up comments | No threaded replies after publish |
| Playlists or categories | Not wired in Openquok today |
| YouTube-side scheduled publish | Openquok schedules; upload uses immediate publish with privacy status |
| Community posts | Not available through the public YouTube Data API |
| Shorts-specific publish mode | Standard video upload only — no separate Shorts API or composer toggle |

## Backend environment

Openquok reads YouTube credentials only through <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/config/GlobalConfig.ts"><Badge text="backend/config/GlobalConfig.ts" variant="path" /></DocsExternalLink>. Set:

- <Badge text="YOUTUBE_CLIENT_ID" variant="envBackend" /> — OAuth **Client ID** (Web application)
- <Badge text="YOUTUBE_CLIENT_SECRET" variant="envBackend" /> — OAuth **Client secret**

Copy from <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/.env.development.example"><Badge text="backend/.env.development.example" variant="envBackend" /></DocsExternalLink> into <Badge text="backend/.env.development.local" variant="envBackend" />, fill values, then **restart** the backend.

The frontend base URL used for OAuth redirects comes from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> (default <Badge text="https://localhost:5173" variant="new" /> for local Vite).

<h2 id="oauth-redirect-uri-register-in-google-cloud">OAuth redirect URI (register in Google Cloud)</h2>

Google redirects the **browser** to your **web app** after consent—not to <Badge text="/api/v1" variant="path" />.

- **Production** (when <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> is <Badge text="https://…" variant="new" />): register

```text
https://YOUR-FRONTEND-DOMAIN/integration/oauth/youtube
```

<Callout type="note">
<p>Substitute the scheme and host from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" /> only (no path, no trailing slash). <code>www</code> and apex differ—register the same origin the API sends in <code>redirect_uri</code>. See <a href="/docs/configuration-backend">Configuration - Backend</a>.</p>
</Callout>

- **Local development**: typical value when Vite runs on port 5173:

```text
https://localhost:5173/integration/oauth/youtube
```

After OAuth, Openquok shows a **channel picker** so you choose which YouTube channel to connect.

<Callout type="warning">
<p>Never commit <Badge text="YOUTUBE_CLIENT_SECRET" variant="envBackend" /> or paste it into tickets, chat, or public screenshots. Store it only in your deployment secrets or local <Badge text="backend/.env.development.local" variant="envBackend" /> file.</p>
</Callout>

## API access and verification

Google splits this into two layers. They are easy to confuse because both live in Cloud Console.

| Step | What it is | When you need it |
| --- | --- | --- |
| **Enable APIs** | Turn on **YouTube Data API v3** and **YouTube Analytics API** under **APIs &amp; Services → Library** | **Always** — without this, uploads and analytics calls fail |
| **OAuth consent (Testing)** | Leave **Publishing status** on **Testing** and add **test users** on the OAuth consent screen | **Development and internal pilots** — no formal Google review; only listed accounts can connect |
| **OAuth verification** | Submit the app in the <DocsExternalLink href="https://console.cloud.google.com/auth/verification">OAuth Verification Center</DocsExternalLink> (scopes, privacy policy, demo video, justifications) | **Public production** — before any Google account outside your test list can connect |
| **Workspace admin trust** | Mark your OAuth client as **Trusted** in <DocsExternalLink href="https://admin.google.com/">Google Admin</DocsExternalLink> | **Sometimes** — brand accounts or Workspace orgs that block third-party apps (see below) |
| **Quota increase** | Request a higher YouTube Data API quota in Cloud Console | **Only if** you hit default daily upload/read limits |

Several scopes Openquok requests are classified as **sensitive** by Google (for example <Badge text="youtube.upload" variant="default" /> and <Badge text="yt-analytics.readonly" variant="default" />). That is expected for upload and analytics. While the app stays in **Testing**, you can use those scopes with test users only — including past Google’s “unverified app” warning screen. To go **Production** for arbitrary Google users, complete <DocsExternalLink href="https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification">sensitive scope verification</DocsExternalLink> (often about a week).

<Callout type="tip" title="Exceptions"> Verification is often not required.
<ul>
<li><strong>Internal-only</strong> — OAuth consent screen user type <strong>Internal</strong> and every publisher is in the same Google Workspace org.</li>
<li><strong>Personal / tiny pilot</strong> — you and a handful of known users stay on <strong>Testing</strong> with test users added.</li>
</ul>
</Callout>

You do **not** need a separate “request access” for **YouTube Reporting API** — Openquok does not use it.

## General setup

Follow <DocsExternalLink href="https://developers.google.com/youtube/registering_an_application">Obtaining authorization credentials</DocsExternalLink> for the underlying Google requirements. The steps below add Openquok redirect URIs, env vars, and the channel-picker flow.

<Steps>

### Open Google Cloud Console

Sign in with the Google account that will own the Cloud project, then open <DocsExternalLink href="https://console.cloud.google.com/">Google Cloud Console</DocsExternalLink>. Accept the terms if prompted.

### Create or select a project

On the project selector, choose **New project** (or pick an existing project dedicated to YouTube publishing). Give it a clear name and click **Create**.

### Enable YouTube APIs

In **APIs &amp; Services → Library**, search for and enable:

![Enable Google APIs](/docs/social-integration/youtube/enable-google-apis.webp)

- **YouTube Data API v3** — uploads, channel listing, video metadata
- **YouTube Analytics API** — channel analytics in Openquok

![Enable Youtube APIs](/docs/social-integration/youtube/enable-youtube-apis.webp)

You do **not** need **YouTube Reporting API** for Openquok today.

### Configure the OAuth consent screen

In **APIs &amp; Services → OAuth consent screen -> Get Started**:

![Configure Outh Consent](/docs/social-integration/youtube/configure-oauth-consent.webp)

<Callout type="tip">
<p>If you alread created set up Oauth Consent Scene before, you need to click <Badge text="Branding" variant="param" /> on the left side bar in order to edit it</p>
</Callout>

- Choose <Badge text="External" variant="param" /> for a public app that , or <Badge text="internal" variant="param" /> for business accounts only.

![Choose Audience](/docs/social-integration/youtube/choose-audience.webp)

- Fill required app information (app name, support email, developer contact).

![Fill App Info](/docs/social-integration/youtube/fill-app-info.webp)

### Create OAuth Web client credentials

- Click <Badge text="Create Credentials" variant="default" />, then choose <Badge text="OAuth client ID" variant="default" />.

- Choose application type <Badge text="Web application" variant="path" />.

- Under <Badge text="Authorized JavaScript origins" variant="default" />, leave empty; OpenQuok uses server-side redirect OAuth, not browser JavaScript calls to Google.

- Under <Badge text="Authorized redirect URIs" variant="default" />, add the following **Authorized redirect URIs** from the <a class="not-prose font-medium text-primary underline decoration-primary/50 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary" href="/docs/social-integration/youtube#oauth-redirect-uri-register-in-google-cloud">OAuth redirect URIs</a> section to your app’s valid OAuth redirect list.

![Oauth Credentials](/docs/social-integration/youtube/oauth-credentials.webp)

After creation, copy **Client ID** → <Badge text="YOUTUBE_CLIENT_ID" variant="envBackend" /> and **Client secret** → <Badge text="YOUTUBE_CLIENT_SECRET" variant="envBackend" /> into <Badge text="backend/.env.development.local" variant="envBackend" /> (or your deployment secrets).

Restart the backend so new env vars load.


### Connect a Youtube Channel in Openquok

In the web app, start **Connect YouTube**, sign in with Google, grant permissions, then pick the channel you manage on the callback screen.

- Add the scopes Openquok requests during connect (profile, email, YouTube upload/management, and YouTube Analytics read-only). They match <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/backend/integrations/providers/youtube/youtubeProvider.ts"><Badge text="backend/integrations/providers/youtube/youtubeProvider.ts" variant="path" /></DocsExternalLink>:

<ul class="not-prose list-disc pl-6">
<li><Badge text="userinfo.profile" variant="default" /></li>
<li><Badge text="userinfo.email" variant="default" /></li>
<li><Badge text="youtube" variant="default" /></li>
<li><Badge text="youtube.force-ssl" variant="default" /></li>
<li><Badge text="youtube.readonly" variant="default" /></li>
<li><Badge text="youtube.upload" variant="default" /></li>
<li><Badge text="youtubepartner" variant="default" /></li>
<li><Badge text="yt-analytics.readonly" variant="default" /></li>
</ul>

While the app is in **Testing** publishing status, only accounts you list as test users can finish OAuth.

### Add test users (Testing mode)

In **OAuth consent screen**, → OAuth consent screen -> Audience ->  Click  **+ Add users** 

Add every Google account that will connect a YouTube channel during development.

![Add test users](/docs/social-integration/youtube/add-test-users.webp)

<Callout type="warning" title="Test vs production">
<p>While consent is in <strong>Testing</strong>, only listed test users can complete the flow. Move to <strong>Production</strong> (and complete Verification).</p>
</Callout>

<Callout type="tip" title="Revoke OAuth">
<ul>
<li>Revoke Openquok under <DocsExternalLink href="https://myaccount.google.com/permissions">Google Account → Third-party apps with account access</DocsExternalLink>.</li>
<li>This will disconnect the YouTube channel in Openquok and user can reconnect youtube again.</li>
</ul>
</Callout>

</Steps>

<h2 id="brand-accounts-and-google-workspace">Brand accounts and Google Workspace</h2>

Use this section when the YouTube channel is a **Brand account** (managed separately from a personal Google login)

or when publishers sign in through **Google Workspace** and the OAuth screen blocks access until an admin trusts the app.

<Callout type="note" title="Setup in Test mode">
<p>For brand-managed channels, keep the OAuth app on <strong>External</strong> user type, add each connecting Google account as a <strong>test user</strong>, and complete the workspace trust steps below if your organization restricts third-party OAuth. You do not need to publish the app for an internal pilot, but Google can take several hours to propagate admin trust changes.</p>
</Callout>

<Steps>

### Sign in to Google Admin

Open <DocsExternalLink href="https://admin.google.com/">Google Admin console</DocsExternalLink> with a super-admin or security-admin account for the Workspace that owns the brand channel.

### Open API controls

Go to **Security → Access and data control → API controls**, then **Manage third-party app access**.

### Trust your OAuth client

Click **Configure new app**, paste your <Badge text="YOUTUBE_CLIENT_ID" variant="envBackend" /> (OAuth client ID from the credentials step), select the app from the search results, and set **App access** / data access to **Trusted** for the scopes your publishers need.

Save the policy.

### Wait for propagation

Google Workspace policy changes can take **several hours** (often around five hours) to apply. If OAuth still fails after trust is saved, wait and retry **Connect YouTube** with a test-listed account that manages the brand channel.

### Reconnect in Openquok

After propagation, remove any stale YouTube integration in Openquok and run **Connect YouTube** again. Confirm the brand channel appears in the channel picker.

</Steps>

## How Openquok uses the flow

- **Authorize URL** is produced by the backend; the user signs in with Google and returns to the **frontend** route with an authorization <Badge text="code" variant="default" />.

- The web client calls the backend **social-connect** endpoint with <Badge text="code" variant="default" />, <Badge text="state" variant="default" />, and timezone so the server can exchange the code and list channels.

- After you pick a channel, Openquok stores the channel id as the integration’s internal id and keeps the user OAuth token for refresh (unlike Meta Page tokens).

API prefix defaults to <Badge text="/api/v1" variant="path" /> (see <Badge text="API_PREFIX" variant="envBackend" />).

## Troubleshooting

### No channels in the picker

The signed-in Google account must own or manage at least one YouTube channel. Try another account or create a channel in <DocsExternalLink href="https://studio.youtube.com/">YouTube Studio</DocsExternalLink>, then reconnect. For **brand accounts**, sign in with the Google identity that manages the brand (not only the channel’s public name), and confirm that identity is listed as an OAuth **test user** while the app is in Testing mode.

### OAuth blocked for Workspace or brand accounts

If Google shows an admin-blocked or unauthorized-client error, complete the <a href="/docs/social-integration/youtube#brand-accounts-and-google-workspace">Brand accounts and Google Workspace</a> steps: trust <Badge text="YOUTUBE_CLIENT_ID" variant="envBackend" /> in <DocsExternalLink href="https://admin.google.com/">Google Admin</DocsExternalLink>, wait for propagation, and reconnect with a test-listed account.

### Missing permissions after OAuth

Remove the channel in Openquok and reconnect. Ensure the OAuth consent screen includes YouTube upload and analytics scopes and that you clicked **Allow** for all requested access.

### Upload fails at publish time

Confirm the post has **exactly one** MP4 in media, a **title** between 2 and 100 characters, and that the backend can resolve stored media to a public <Badge text="https://" variant="new" /> URL for Google to fetch.

## References

<ul class="list-disc pl-6">
<li><DocsExternalLink href="https://developers.google.com/youtube/v3">YouTube Data API</DocsExternalLink></li>
<li><DocsExternalLink href="https://developers.google.com/youtube/analytics">YouTube Analytics API</DocsExternalLink></li>
<li><DocsExternalLink href="https://developers.google.com/identity/protocols/oauth2">Google OAuth 2.0</DocsExternalLink></li>
</ul>

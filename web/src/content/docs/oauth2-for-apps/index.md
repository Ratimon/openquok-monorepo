---
title: Overview - OAuth2 for apps
description: Build third-party OpenQuok apps that act on behalf of subscribed users using OAuth2 Authorization Code flow.
order: 0
lastUpdated: 2026-09-26
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Mermaid } from '$lib/ui/components/docs/mdx/index.js';

const authorizationCodeFlow = `sequenceDiagram
    participant User
    participant YourApp as Your app
    participant Web as OpenQuok web
    participant API as OpenQuok API

    User->>YourApp: Start connect
    YourApp->>Web: Redirect GET /oauth/authorize
    Web->>User: Consent screen (select workspace)
    User->>Web: Authorize
    Web->>YourApp: Redirect with authorization code
    YourApp->>API: POST /api/v1/oauth/token (server only)
    API-->>YourApp: opo_ access_token + organizationId
    YourApp->>API: Public API with Bearer token
`;
</script>

<Callout type="note">
<p><strong>This section</strong> is for apps you register under <Badge text="Developers" variant="default" /> → <Badge text="Apps" variant="default" /> (client ID <Badge text="oqc_" variant="default" />). For automation in <strong>your own</strong> workspace — scripts and CI — rotate a programmatic token under <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" /> instead. See <a href="/docs/getting-started-for-public-api#authentication">Public API authentication</a> and <a href="/docs/getting-started-for-cli/authentication#programmatic-token">CLI programmatic token</a>.</p>
</Callout>

## Overview

OpenQuok uses OAuth2 **Authorization Code** flow for third-party apps. You register an app in the dashboard. Users approve access on OpenQuok. Your server exchanges the code for an <Badge text="opo_" variant="default" /> token and calls <Badge text="/api/v1/public/*" variant="path" /> for that workspace.

## How it works

<Mermaid string={authorizationCodeFlow} />

The user picks **one workspace** on the consent screen. The token applies only to that <Badge text="organizationId" variant="default" />. Exchange the code on your **server** with your <Badge text="oqs_" variant="default" /> client secret. Do not put the secret in a browser or mobile app.

<Callout type="tip">
<p>Step-by-step parameters, callback query strings, and curl examples are on <a href="/docs/oauth2-for-apps/implementation">Implementation</a>. A runnable Express sample is on <a href="/docs/oauth2-for-apps/nodejs-example">Node.js example</a>.</p>
</Callout>

<CardGrid>
<LinkCard title="Implementation" description="Register your app, Authorization Code flow, API calls, and credential management" href="/docs/oauth2-for-apps/implementation" />
<LinkCard title="Node.js example" description="Copy-paste Express server with Authorization Code flow" href="/docs/oauth2-for-apps/nodejs-example" />
<LinkCard title="Jev decision routing" description="Decide what to post (relevant, engaging, channel-fit), then create Global or per-channel OpenQuok drafts" href="/docs/oauth2-for-apps/jev-decision-routing" />
<LinkCard title="Error reference" description="OAuth callback and token exchange error codes" href="/docs/oauth2-for-apps/error-reference" />
</CardGrid>

## Related configuration

<CardGrid>
<LinkCard title="Public API authentication" description="Workspace programmatic tokens (opo_) vs third-party OAuth" href="/docs/getting-started-for-public-api#authentication" />
<LinkCard title="Admin: OAuth apps" description="Redirect URLs for hosted vs self-hosted servers and operator notes" href="/docs/admin/oauth-server" />
<LinkCard title="Configuration - Backend" description="Backend env vars and public API surfaces" href="/docs/configuration-backend" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Public API" description="Programmatic tokens, SDK, and REST endpoints" href="/docs/getting-started-for-public-api" />
<LinkCard title="Posts APIs" description="Schedule and manage posts after you have an OAuth access token" href="/docs/apis-posts" />
</CardGrid>

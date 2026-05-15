---
title: OAuth Server Setup
description: Create and rotate OAuth applications in the dashboard, and set the correct redirect URL for hosted vs self-hosted flows.
order: 1.5
lastUpdated: 2026-05-08
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Openquok supports **OAuth applications** so third-party services (or infrastructure you operate) can run the OAuth2 authorization code flow and receive tokens for programmatic access.

Only **workspace admins** can manage OAuth apps for their workspace. The **client secret is shown only once** (when you create the app or rotate it).

## Create an OAuth app (dashboard)

<Steps>

### Open developer settings

In the Openquok web app, go to:

- <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Apps" variant="default" />

### Create the app

Click <Badge text="Create OAuth app" variant="new" /> and fill:

- <Badge text="App name" variant="default" /> — label shown on the consent screen
- <Badge text="Description" variant="default" /> — optional
- <Badge text="Redirect URL" variant="default" /> — see the next section (this is the critical part)

After creating, copy:

- <Badge text="Client ID" variant="default" /> (prefix <Badge text="oqc_..." variant="default" />)
- <Badge text="Client secret" variant="default" /> (prefix <Badge text="oqs_..." variant="default" />) — shown once

Store the secret in your server-side secret manager / env, not in the browser or a repo.

</Steps>


## Redirect URL: hosted vs self-hosted

The redirect URL must match the server that will receive the OAuth callback.

### Hosted CLI device flow (Openquok-operated)

Openquok production splits the device flow:

- **CLI API:** <Badge text="https://cli-auth.openquok.com" variant="new" /> (<Badge text="SERVER_URL" variant="envBackend" />)
- **Browser:** <Badge text="https://www.openquok.com/cli/device/verify" variant="new" /> and callback below

Create the OAuth app with this redirect URL:

```text
https://www.openquok.com/cli/device/callback
```

Then set the auth server env vars:

- <Badge text="OPENQUOK_OAUTH_CLIENT_ID" variant="envBackend" />
- <Badge text="OPENQUOK_OAUTH_CLIENT_SECRET" variant="envBackend" />
- <Badge text="SERVER_URL=https://cli-auth.openquok.com" variant="envBackend" />
- <Badge text="BROWSER_ORIGIN=https://www.openquok.com" variant="envBackend" />

Also set <Badge text="CLI_AUTH_SERVER_URL=https://cli-auth.openquok.com" variant="envBackend" /> on the **web** Vercel project. These belong in server env (synced from <Badge text="agent/server/.env.production.local" variant="envBackend" /> and <Badge text="web/.env.production.local" variant="envBackend" />), not in the CLI.

<Callout type="note" title="CLI users do not need the secret">
CLI users run <code>openquok auth:login</code> and never see the OAuth client secret. The secret lives only on the auth server.
</Callout>

### Self-hosted auth server (customer-operated)

If a customer self-hosts their own auth server, they must create an OAuth app with:

```text
SERVER_URL/device/callback
```

Where <Badge text="SERVER_URL" variant="envBackend" /> is the public HTTPS origin of **their** auth server (no trailing slash).

For the auth server configuration details, see <a href="/docs/configuration-agent">Configuration - Agent</a>.

#### Redirect URL examples (self-hosted)

- **Production** (split web + API, recommended):

```text
https://your-web.example.com/cli/device/callback
```

- **Production** (single host — browser and API on same origin):

```text
https://auth.example.com/device/callback
```

- **Local development** (auth server only, default):

```text
http://localhost:3111/device/callback
```

## Rotation and safety notes

- Rotating the client secret will require updating whatever server uses it.
- Changing backend <Badge text="SECURITY_SECRET" variant="envBackend" /> invalidates existing OAuth secrets/tokens; see <a href="/docs/admin/security-secrets">Security secrets</a>.

## Related configuration

<CardGrid>
<LinkCard title="Configuration - Agent" description="CLI auth server env vars and callback URL" href="/docs/configuration-agent" />
<LinkCard title="Security secrets" description="SECURITY_SECRET and what it invalidates" href="/docs/admin/security-secrets" />
</CardGrid>


---
title: OAuth2 Authen for Apps
description: Let users authorize your app to access Openquok on their behalf using OAuth2 Authorization Code flow.
order: 5
lastUpdated: 2026-05-29
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Openquok supports OAuth2 **Authorization Code** flow, allowing you to build **third-party applications** that act on behalf of Openquok users.

Your app redirects users to Openquok where they approve access, and you receive an <Badge text="opo_" variant="default" /> access token to call the public API on their behalf.

<Callout type="note">
<p><strong>This page</strong> is for apps you register under <Badge text="Developers" variant="default" /> → <Badge text="Apps" variant="default" /> (client ID <Badge text="oqc_" variant="default" />). For automation in <strong>your own</strong> workspace — scripts, CI, or the CLI without device login — rotate a programmatic token under <Badge text="Developers" variant="default" /> → <Badge text="Access" variant="default" /> instead. See <a href="/docs/getting-started-for-public-api#authentication">Public API authentication</a> and <a href="/docs/getting-started-for-cli/authentication#programmatic-token">CLI programmatic token</a>.</p>
</Callout>


## Implementation

### Register your OAuth app

In the Openquok dashboard, go to:

- <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Apps" variant="default" />

Create an OAuth application and provide:

- <Badge text="App name" variant="default" /> — displayed to users on the consent screen
- <Badge text="Description" variant="default" /> (optional)
- <Badge text="Profile picture" variant="default" /> (optional)
- <Badge text="Redirect URL" variant="default" /> — where Openquok sends users after they approve/deny access

After creation you’ll receive:

- **Client ID** — public identifier (prefix <Badge text="oqc_..." variant="default" />)
- **Client secret** — secret key for token exchange (prefix <Badge text="oqs_..." variant="default" />)

<Callout type="warning" title="Secret is shown once">
Copy the client secret immediately and store it securely. If you lose it, rotate it from the same settings page.
</Callout>

### Redirect users to authorize

Redirect the user to:

```text
OPENQUOK_FRONTEND_URL/oauth/authorize?client_id=CLIENT_ID&response_type=code&state=STATE
```

| Parameter | Required | Description |
| --- | --- | --- |
| <Badge text="client_id" variant="default" /> | **Yes** | Your app’s Client ID (starts with <Badge text="oqc_" variant="default" />) |
| <Badge text="response_type" variant="default" /> | **Yes** | Must be <Badge text="code" variant="default" /> |
| <Badge text="state" variant="default" /> | No | A random string to prevent CSRF attacks. Recommended. |

- <Badge text="OPENQUOK_FRONTEND_URL" variant="envBackend" /> is the Openquok web origin (for example <code>https://www.openquok.com</code>)

Example:

```text
https://www.openquok.com/oauth/authorize?client_id=oqc_your_client_id&response_type=code&state=random123
```

| Example value | What it is |
| --- | --- |
| <Badge text="https://www.openquok.com" variant="default" /> | Openquok frontend origin (your <Badge text="OPENQUOK_FRONTEND_URL" variant="envBackend" />) |
| <Badge text="oqc_your_client_id" variant="default" /> | Your app’s Client ID |
| <Badge text="code" variant="default" /> | The only supported <Badge text="response_type" variant="default" /> |
| <Badge text="random123" variant="default" /> | Example <Badge text="state" variant="default" /> value |

The user will see a consent screen showing your app’s name and description. They can choose <Badge text="Authorize" variant="new" /> or <Badge text="Deny" variant="deprecated" />.

### Handle the callback

After the user approves, Openquok redirects to your Redirect URL.

Approved:

```text
https://yourapp.com/callback?code=abc123&state=random123
```

| Query param | Required | Description |
| --- | --- | --- |
| <Badge text="code" variant="default" /> | **Yes** | Authorization code (single-use; expires in 10 minutes) |
| <Badge text="state" variant="default" /> | No | The same <Badge text="state" variant="default" /> you sent in the authorize step |

Denied:

```text
https://yourapp.com/callback?error=access_denied&state=random123
```

| Query param | Required | Description |
| --- | --- | --- |
| <Badge text="error" variant="default" /> | **Yes** | <Badge text="access_denied" variant="default" /> when the user denies the request |
| <Badge text="state" variant="default" /> | No | The same <Badge text="state" variant="default" /> you sent in the authorize step |

Verify the <Badge text="state" variant="default" /> value matches what you sent.

### Exchange code for a token

Make a server-side request to exchange the authorization code for an access token.

```bash
curl -X POST https://api.openquok.com/api/v1/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "abc123",
    "client_id": "oqc_your_client_id",
    "client_secret": "oqs_your_client_secret"
  }'
```

| Field | Required | Description |
| --- | --- | --- |
| <Badge text="grant_type" variant="default" /> | **Yes** | Must be <Badge text="authorization_code" variant="default" /> |
| <Badge text="code" variant="default" /> | **Yes** | The authorization code from the callback |
| <Badge text="client_id" variant="default" /> | **Yes** | Your app’s Client ID |
| <Badge text="client_secret" variant="default" /> | **Yes** | Your app’s Client Secret |

The redirect URL is validated when the user approves on the consent screen (stored on your OAuth app). Do **not** send <Badge text="redirect_uri" variant="param" /> in this request.

Response:

```json
{
  "organizationId": "org_abc123",
  "access_token": "opo_your_access_token",
  "token_type": "bearer"
}
```

| Field | Description |
| --- | --- |
| <Badge text="organizationId" variant="default" /> | The workspace (organization) that was authorized |
| <Badge text="access_token" variant="default" /> | The OAuth access token to use for API calls |
| <Badge text="token_type" variant="default" /> | Always <Badge text="bearer" variant="default" /> |

### Make API calls

Use the returned <Badge text="access_token" variant="default" /> as a Bearer token in the <Badge text="Authorization" variant="default" /> header:

```bash
curl -H "Authorization: Bearer opo_your_access_token" \
  https://api.openquok.com/api/v1/public/integrations
```

| Part | Required | Description |
| --- | --- | --- |
| <Badge text="Authorization" variant="default" /> header | **Yes** | Set to your OAuth <Badge text="access_token" variant="default" /> |
| URL | **Yes** | Any public API endpoint under <Badge text="/api/v1/public/*" variant="path" /> |

## Managing your app

### Rotate client secret

If your client secret is compromised, go to <Badge text="Developers" variant="default" /> → <Badge text="Apps" variant="default" /> and click <Badge text="Rotate secret" variant="param" />.

This invalidates the old secret immediately — any token exchange requests using the old secret will fail.

<Callout type="warning" title="Existing access tokens are not invalidated">
Rotating the secret does not invalidate existing access tokens. Only new token exchange requests require the new secret.
</Callout>

### Delete your app

Deleting your OAuth app will:

- Revoke all access tokens issued to users
- Remove the app from all users’ Approved Apps list
- This action cannot be undone

## Full example (Node.js)

Redirect URL is registered on the OAuth app in the dashboard — it is **not** sent again in the token exchange body (`POST /api/v1/oauth/token` accepts only `grant_type`, `code`, `client_id`, and `client_secret`).

A copy-pasteable version with `@openquok/node-sdk` for the public API call lives in [`sdk/examples/oauth2-express.mjs`](https://github.com/Ratimon/openquok-monorepo/blob/main/sdk/examples/oauth2-express.mjs).

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();

const CLIENT_ID = 'oqc_your_client_id';
const CLIENT_SECRET = 'oqs_your_client_secret';
const OPENQUOK_URL = 'https://www.openquok.com';
const API_URL = 'https://api.openquok.com';

// Must match the Redirect URL registered on your OAuth app
const REDIRECT_URL = 'https://yourapp.com/callback';

// Demo-only: persist state server-side (session store, Redis, DB, …)
const pendingOAuthState = new Map();

// Step 2: Redirect user to Openquok consent UI
app.get('/connect', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const sessionKey = req.ip ?? 'default';
  pendingOAuthState.set(sessionKey, state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    state,
  });

  res.redirect(`${OPENQUOK_URL}/oauth/authorize?${params}`);
});

// Step 3 & 4: Handle callback and exchange code
app.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  const sessionKey = req.ip ?? 'default';
  const expectedState = pendingOAuthState.get(sessionKey);

  if (error === 'access_denied') {
    return res.send('User denied access');
  }

  if (!state || state !== expectedState) {
    return res.status(403).send('Invalid state');
  }
  pendingOAuthState.delete(sessionKey);

  if (typeof code !== 'string') {
    return res.status(400).send('Missing authorization code');
  }

  const response = await fetch(`${API_URL}/api/v1/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return res.status(502).send(`Token exchange failed: ${body}`);
  }

  const { organizationId, access_token } = await response.json();

  // Example: fetch user's integrations (Bearer opo_ token)
  const integrations = await fetch(`${API_URL}/api/v1/public/integrations`, {
    headers: { Authorization: `Bearer ${access_token}` },
  }).then((r) => r.json());

  res.json({ connected: true, organizationId, integrations });
});

app.listen(3000);
```

## Error reference

| Error | When | Description |
| --- | --- | --- |
| <Badge text="invalid_client" variant="default" /> | Token exchange | Client ID or Client Secret is wrong |
| <Badge text="invalid_grant" variant="default" /> | Token exchange | Code is invalid, expired, or already used |
| <Badge text="unsupported_grant_type" variant="default" /> | Token exchange | <Badge text="grant_type" variant="default" /> is not <Badge text="authorization_code" variant="default" /> |
| <Badge text="access_denied" variant="default" /> | Callback | User denied the authorization request |

## Related configuration

<CardGrid>
<LinkCard title="Public API authentication" description="Workspace programmatic tokens (opo_) vs third-party OAuth" href="/docs/getting-started-for-public-api#authentication" />
<LinkCard title="Admin: OAuth apps" description="Redirect URLs for hosted vs self-hosted servers and operator notes" href="/docs/admin/oauth-server" />
<LinkCard title="Configuration - Backend" description="Backend env vars and public API surfaces" href="/docs/configuration-backend" />
</CardGrid>


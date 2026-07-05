---
title: Implementation
description: Register an OAuth app, run the Authorization Code flow, and manage credentials in the OpenQuok dashboard.
order: 1
lastUpdated: 2026-07-05
---

<script>
import { Badge, Callout } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Register your OAuth app

In the OpenQuok dashboard, go to:

- <Badge text="Account" variant="default" /> → <Badge text="Settings" variant="default" /> → <Badge text="Developers" variant="default" /> → <Badge text="Apps" variant="default" />

Create an OAuth application and provide:

- <Badge text="App name" variant="default" /> — displayed to users on the consent screen
- <Badge text="Description" variant="default" /> (optional)
- <Badge text="Profile picture" variant="default" /> (optional)
- <Badge text="Redirect URL" variant="default" /> — where OpenQuok sends users after they approve/deny access

After creation you'll receive:

- **Client ID** — public identifier (prefix <Badge text="oqc_..." variant="default" />)
- **Client secret** — secret key for token exchange (prefix <Badge text="oqs_..." variant="default" />)

<Callout type="warning" title="Secret is shown once">
Copy the client secret immediately and store it securely. If you lose it, rotate it from the same settings page.
</Callout>

## Redirect users to authorize

Redirect the user to:

```text
OPENQUOK_FRONTEND_URL/oauth/authorize?client_id=CLIENT_ID&response_type=code&state=STATE
```

| Parameter | Required | Description |
| --- | --- | --- |
| <Badge text="client_id" variant="default" /> | **Yes** | Your app's Client ID (starts with <Badge text="oqc_" variant="default" />) |
| <Badge text="response_type" variant="default" /> | **Yes** | Must be <Badge text="code" variant="default" /> |
| <Badge text="state" variant="default" /> | No | A random string to prevent CSRF attacks. Recommended. |

- <Badge text="OPENQUOK_FRONTEND_URL" variant="envBackend" /> is the OpenQuok web origin (for example <code>https://www.openquok.com</code>)

Example:

```text
https://www.openquok.com/oauth/authorize?client_id=oqc_your_client_id&response_type=code&state=random123
```

| Example value | What it is |
| --- | --- |
| <Badge text="https://www.openquok.com" variant="default" /> | OpenQuok frontend origin (your <Badge text="OPENQUOK_FRONTEND_URL" variant="envBackend" />) |
| <Badge text="oqc_your_client_id" variant="default" /> | Your app's Client ID |
| <Badge text="code" variant="default" /> | The only supported <Badge text="response_type" variant="default" /> |
| <Badge text="random123" variant="default" /> | Example <Badge text="state" variant="default" /> value |

The user will see a consent screen showing your app's name and description. They can choose <Badge text="Authorize" variant="new" /> or <Badge text="Deny" variant="deprecated" />.

## Handle the callback

After the user approves, OpenQuok redirects to your Redirect URL.

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

## Exchange code for a token

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
| <Badge text="client_id" variant="default" /> | **Yes** | Your app's Client ID |
| <Badge text="client_secret" variant="default" /> | **Yes** | Your app's Client Secret |

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

## Make API calls

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
- Remove the app from all users' Approved Apps list
- This action cannot be undone

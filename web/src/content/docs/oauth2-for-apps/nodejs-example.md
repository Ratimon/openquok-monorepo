---
title: Node.js example
description: Express server implementing OpenQuok OAuth2 Authorization Code flow end to end.
order: 2
lastUpdated: 2026-09-26
---

<script>
import { CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

This sample follows the sequence on <a href="/docs/oauth2-for-apps/implementation#flow-overview">Implementation → Flow overview</a>: browser steps for authorize and callback, server-only token exchange.

Redirect URL is registered on the OAuth app in the dashboard. It is **not** sent again in the token exchange body (`POST /api/v1/oauth/token` accepts only `grant_type`, `code`, `client_id`, and `client_secret`).

A copy-pasteable version with `@openquok/node-sdk` for the public API call lives in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/sdk/examples/oauth2-express.mjs">sdk/examples/oauth2-express.mjs</DocsExternalLink>.

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

// Step 2: Redirect user to OpenQuok consent UI
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

## Related

<CardGrid>
<LinkCard title="Jev decision routing" description="Route inbound messages with Jev, then create OpenQuok drafts with the user's OAuth token" href="/docs/oauth2-for-apps/jev-decision-routing" />
<LinkCard title="Implementation" description="Register your app, Authorization Code flow, and credential management" href="/docs/oauth2-for-apps/implementation" />
<LinkCard title="OAuth2 for apps overview" description="Third-party apps and opo_ access tokens" href="/docs/oauth2-for-apps" />
</CardGrid>

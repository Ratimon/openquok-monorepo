---
title: Google OAuth
description: Configure Google login (redirect URIs) and set OAUTH_GOOGLE_* variables.
order: 4
lastUpdated: 2026-03-30
---

<script>
import { Badge, Callout, ExternalLink, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Google OAuth is optional. When configured, the backend provides endpoints that start the login flow and handle the callback.

## Steps

<Steps>

### Create OAuth credentials in Google Cloud

In the Google Cloud console, create OAuth client credentials (Web application).

### Configure the redirect URI

The callback endpoint is:

<Badge text="/api/v1/auth/oauth/google/callback" variant="path" />

If you use <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" /> and <Badge text="API_PREFIX" variant="envBackend" /> to construct the redirect, make sure your Google “Authorized redirect URI” matches the final URL shape.

### Set environment variables

```bash
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=
BACKEND_DOMAIN_URL=http://localhost:3000
API_PREFIX=/api/v1
```

### Restart the backend

Restart the backend process so the new values are loaded.

</Steps>

<Callout type="note" title="Frontend callback page">
After the backend completes the OAuth exchange, it redirects back to your frontend callback route (constructed from <Badge text="FRONTEND_DOMAIN_URL" variant="envBackend" />).
</Callout>

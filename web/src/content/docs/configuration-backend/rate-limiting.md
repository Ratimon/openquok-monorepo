---
title: Rate limiting
description: Configure backend rate limiting (global, auth, and OAuth endpoints) for Openquok.
order: 8
lastUpdated: 2026-04-01
---

<script>
import { Badge, Callout, DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The backend uses <DocsExternalLink href="https://www.npmjs.com/package/express-rate-limit">express-rate-limit</DocsExternalLink> to apply per-IP request limits:

- <Badge text="global" variant="default" /> — applied to all routes under <Badge text="API_PREFIX" variant="envBackend" /> (default <Badge text="/api/v1" variant="path" />)
- <Badge text="auth" variant="default" /> — applied to <Badge text="/auth" variant="path" /> endpoints (sign-in / sign-up / reset flows)
- <Badge text="oauth" variant="default" /> — applied to <Badge text="/auth/oauth/*" variant="path" /> endpoints (Google OAuth start + callback)

Implementation lives in <Badge text="backend/middlewares/rateLimit.ts" variant="path" /> and reads values from <Badge text="backend/config/GlobalConfig.ts" variant="path" />.

<Callout type="note" title="OAuth is intentionally stricter">
OAuth routes involve redirects and third-party flows, so they get a dedicated limiter to reduce abuse. The general <Badge text="/auth" variant="path" /> limiter skips <Badge text="/oauth/*" variant="path" /> paths to avoid double-counting.
</Callout>

## Environment variables

All rate limiting can be disabled by setting <Badge text="RATE_LIMIT_ENABLED" variant="envBackend" /> to <Badge text="false" variant="new" />.

### Global (all API routes)

- <Badge text="RATE_LIMIT_WINDOW_MS" variant="envBackend" /> — window size in ms
- <Badge text="RATE_LIMIT_MAX" variant="envBackend" /> — max requests per window per IP

### Auth (most `/auth/*` routes)

- <Badge text="AUTH_RATE_LIMIT_WINDOW_MS" variant="envBackend" />
- <Badge text="AUTH_RATE_LIMIT_MAX" variant="envBackend" />

### OAuth (Google start + callback)

- <Badge text="OAUTH_RATE_LIMIT_WINDOW_MS" variant="envBackend" />
- <Badge text="OAUTH_RATE_LIMIT_MAX" variant="envBackend" />

## Example (development)

Copy <Badge text="backend/.env.development.example" variant="envFile" /> to <Badge text="backend/.env.development.local" variant="envFile" /> and adjust:

```bash
RATE_LIMIT_ENABLED=true

# Global (all API routes)
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=60

# Auth
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=50

# OAuth (Google)
OAUTH_RATE_LIMIT_WINDOW_MS=300000
OAUTH_RATE_LIMIT_MAX=20
```


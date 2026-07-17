---
title: Rate limiting
description: Configure backend rate limiting (global, auth, public API, uploads, and other route-specific limits) for Openquok.
order: 9
lastUpdated: 2026-07-15
---

<script>
import { Badge, Callout, DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The backend uses <DocsExternalLink href="https://www.npmjs.com/package/express-rate-limit">express-rate-limit</DocsExternalLink> to apply request limits per IP or per programmatic token:

- <Badge text="global" variant="default" /> — dashboard and session API routes under <Badge text="API_PREFIX" variant="envBackend" /> (default <Badge text="/api/v1" variant="path" />), per IP
- <Badge text="auth" variant="default" /> — <Badge text="/auth" variant="path" /> sign-in / sign-up / reset flows, per IP
- <Badge text="oauth" variant="default" /> — <Badge text="/auth/oauth/*" variant="path" /> Google OAuth start + callback, per IP
- <Badge text="publicApi" variant="default" /> — <Badge text="/public/*" variant="path" /> programmatic API and MCP, **per <Badge text="opo_" variant="default" /> token** (falls back to IP for anonymous public routes)
- <Badge text="upload" variant="default" /> — <Badge text="/media/upload*" variant="path" /> and <Badge text="/public/upload*" variant="path" />, per token or IP
- <Badge text="feedback" variant="default" /> — <Badge text="POST /feedback" variant="path" />, per IP
- <Badge text="integrationConnect" variant="default" /> — OAuth connect callbacks under <Badge text="/integrations" variant="path" />, per IP
- <Badge text="oauthToken" variant="default" /> — third-party app token exchange at <Badge text="POST /oauth/token" variant="path" />, per IP
- <Badge text="publicWrite" variant="default" /> — anonymous stat/activity writes (listing counters, blog activity, conversion tracking), per IP

Implementation lives in <Badge text="backend/middlewares/rateLimit.ts" variant="path" /> and reads values from <Badge text="backend/config/GlobalConfig.ts" variant="path" />.

<Callout type="note">
Routes with their own limiter are excluded from the global per-IP counter so public API tokens are not capped by a shared office IP, and upload/feedback limits stay independent.
</Callout>

<Callout>
OAuth routes involve redirects and third-party flows, so they get a dedicated limiter to reduce abuse. The general <Badge text="/auth" variant="path" /> limiter skips <Badge text="/oauth/*" variant="path" /> paths to avoid double-counting.
</Callout>

## Environment variables

All rate limiting can be disabled by setting <Badge text="RATE_LIMIT_ENABLED" variant="envBackend" /> to <Badge text="false" variant="new" />.

### Global (session / dashboard API)

- <Badge text="RATE_LIMIT_WINDOW_MS" variant="envBackend" /> — window size in ms
- <Badge text="RATE_LIMIT_MAX" variant="envBackend" /> — max requests per window per IP (code default: 30 production, 1000 development when unset)

### Auth (most `/auth/*` routes)

- <Badge text="AUTH_RATE_LIMIT_WINDOW_MS" variant="envBackend" />
- <Badge text="AUTH_RATE_LIMIT_MAX" variant="envBackend" />

### OAuth (Google start + callback)

- <Badge text="OAUTH_RATE_LIMIT_WINDOW_MS" variant="envBackend" />
- <Badge text="OAUTH_RATE_LIMIT_MAX" variant="envBackend" />

### Public API (`/public/*`, per `opo_` token)

- <Badge text="PUBLIC_API_RATE_LIMIT_WINDOW_MS" variant="envBackend" />
- <Badge text="PUBLIC_API_RATE_LIMIT_MAX" variant="envBackend" />

### Uploads (session + programmatic)

- <Badge text="UPLOAD_RATE_LIMIT_WINDOW_MS" variant="envBackend" />
- <Badge text="UPLOAD_RATE_LIMIT_MAX" variant="envBackend" />

### Feedback

- <Badge text="FEEDBACK_RATE_LIMIT_WINDOW_MS" variant="envBackend" />
- <Badge text="FEEDBACK_RATE_LIMIT_MAX" variant="envBackend" />

### Integration OAuth connect

- <Badge text="INTEGRATION_CONNECT_RATE_LIMIT_WINDOW_MS" variant="envBackend" />
- <Badge text="INTEGRATION_CONNECT_RATE_LIMIT_MAX" variant="envBackend" />

### OAuth app token exchange

- <Badge text="OAUTH_TOKEN_RATE_LIMIT_WINDOW_MS" variant="envBackend" />
- <Badge text="OAUTH_TOKEN_RATE_LIMIT_MAX" variant="envBackend" />

### Anonymous public writes

- <Badge text="PUBLIC_WRITE_RATE_LIMIT_WINDOW_MS" variant="envBackend" />
- <Badge text="PUBLIC_WRITE_RATE_LIMIT_MAX" variant="envBackend" />

## Example (development)

Copy <Badge text="backend/.env.development.example" variant="envBackend" /> to <Badge text="backend/.env.development.local" variant="envBackend" /> and adjust:

```bash
RATE_LIMIT_ENABLED=true

# Global (session / dashboard API)
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=60

# Auth
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=50

# OAuth (Google)
OAUTH_RATE_LIMIT_WINDOW_MS=300000
OAUTH_RATE_LIMIT_MAX=20

# Public API (per opo_ token)
PUBLIC_API_RATE_LIMIT_WINDOW_MS=3600000
PUBLIC_API_RATE_LIMIT_MAX=30

# Uploads
UPLOAD_RATE_LIMIT_WINDOW_MS=3600000
UPLOAD_RATE_LIMIT_MAX=20

# Feedback
FEEDBACK_RATE_LIMIT_WINDOW_MS=3600000
FEEDBACK_RATE_LIMIT_MAX=10

# Integration connect + OAuth token exchange
INTEGRATION_CONNECT_RATE_LIMIT_WINDOW_MS=900000
INTEGRATION_CONNECT_RATE_LIMIT_MAX=30
OAUTH_TOKEN_RATE_LIMIT_WINDOW_MS=900000
OAUTH_TOKEN_RATE_LIMIT_MAX=30

# Anonymous public writes
PUBLIC_WRITE_RATE_LIMIT_WINDOW_MS=3600000
PUBLIC_WRITE_RATE_LIMIT_MAX=60
```

## Limited routes reference

| Limiter | Scope | Key | Default |
| --- | --- | --- | --- |
| Global | Most authenticated session routes | IP | 30/hr (prod) |
| Auth | <Badge text="POST /auth/sign-in" variant="path" />, sign-up, reset, verification | IP | 50 / 15 min |
| OAuth | <Badge text="GET /auth/oauth/google" variant="path" /> (+ callback) | IP | 20 / 5 min |
| Public API | All <Badge text="/public/*" variant="path" /> | <Badge text="opo_" variant="default" /> token | 30 / hr |
| Upload | <Badge text="POST /media/upload*" variant="path" />, <Badge text="POST /public/upload*" variant="path" /> | Token or IP | 20 / hr |
| Feedback | <Badge text="POST /feedback" variant="path" /> | IP | 10 / hr |
| Integration connect | <Badge text="POST /integrations/social-connect/:provider" variant="path" />, <Badge text="POST /integrations/public/provider/:id/connect" variant="path" /> | IP | 30 / 15 min |
| OAuth token | <Badge text="POST /oauth/token" variant="path" /> | IP | 30 / 15 min |
| Public write | Listing stat PUTs, blog activity PUT, <Badge text="POST /company/t" variant="path" /> | IP | 60 / hr |

<Callout type="warning" title="Webhooks are excluded">
Stripe and other <Badge text="/webhooks/" variant="path" /> routes skip all rate limiters so provider retries are not dropped.
</Callout>


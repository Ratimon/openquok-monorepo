---
title: Rate limiting
description: Configure backend rate limiting (public read, session, global, auth, public API, uploads, and other route-specific limits) for OpenQuok.
order: 9
lastUpdated: 2026-09-17
---

<script>
import { Badge, Callout, DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The backend uses <DocsExternalLink href="https://www.npmjs.com/package/express-rate-limit">express-rate-limit</DocsExternalLink>. Route rules live in <Badge text="backend/middlewares/publicRouteRegistry.ts" variant="path" />. Limits and auth skip rules use the same registry.

| Limiter | Scope | Key | Default (production) |
| --- | --- | --- | --- |
| <Badge text="publicRead" variant="default" /> | Public CMS GETs (<Badge text="/company/*" variant="path" />, <Badge text="/blog-system/*" variant="path" />, <Badge text="/listings/*" variant="path" />, allowlisted <Badge text="GET /image/download" variant="path" />) | Trusted client IP | 600 / hr |
| <Badge text="session" variant="default" /> | Authenticated API under <Badge text="API_PREFIX" variant="envBackend" /> | JWT <code>sub</code> | 2000 / hr |
| <Badge text="global" variant="default" /> | Other anonymous routes | Trusted client IP | 120 / hr |
| <Badge text="auth" variant="default" /> | <Badge text="/auth" variant="path" /> (not <Badge text="/oauth/*" variant="path" />) | IP | 50 / 15 min |
| <Badge text="oauth" variant="default" /> | <Badge text="/auth/oauth/*" variant="path" /> | IP | 20 / 5 min |
| <Badge text="publicApi" variant="default" /> | <Badge text="/public/*" variant="path" /> | <Badge text="opo_" variant="default" /> token or IP | 30 / hr |
| <Badge text="mcp" variant="default" /> | <Badge text="/mcp" variant="path" /> | Bearer, path token, or IP | 120 / hr |
| <Badge text="upload" variant="default" /> | <Badge text="/media/upload*" variant="path" />, <Badge text="/public/upload*" variant="path" /> | Token or IP | 20 / hr |
| <Badge text="feedback" variant="default" /> | <Badge text="POST /feedback" variant="path" /> | IP | 10 / hr |
| <Badge text="integrationConnect" variant="default" /> | OAuth connect under <Badge text="/integrations" variant="path" /> | IP | 30 / 15 min |
| <Badge text="oauthToken" variant="default" /> | <Badge text="POST /oauth/token" variant="path" /> | IP | 30 / 15 min |
| <Badge text="publicWrite" variant="default" /> | Listing stats, blog activity, conversion tracking | IP | 60 / hr |

Config: <Badge text="backend/middlewares/rateLimit.ts" variant="path" />, <Badge text="backend/config/GlobalConfig.ts" variant="path" />.

<Callout type="note">
Routes with a dedicated limiter do not use <Badge text="global" variant="default" />. Public CMS GETs use <Badge text="publicRead" variant="default" /> — they are not unlimited. <Badge text="/webhooks/*" variant="path" /> skip all limiters.
</Callout>

<Callout type="warning">
Behind Vercel SSR and Cloudflare, many requests can share one edge IP. Set <Badge text="TRUST_CLOUDFLARE_HEADERS" variant="envBackend" /> when you use Cloudflare. Public CMS GETs also send <code>Cache-Control</code> headers to reduce origin load.
</Callout>

## Client IP

<Badge text="backend/middlewares/trustedClientIp.ts" variant="path" /> picks the IP for keys and 429 logs:

- <Badge text="TRUST_CLOUDFLARE_HEADERS" variant="envBackend" /> — use <code>CF-Connecting-IP</code> instead of <code>req.ip</code> (default <Badge text="true" variant="new" /> in production when <Badge text="NOT_SECURED" variant="envBackend" /> is <Badge text="false" variant="new" />).
- <Badge text="VERIFY_CLOUDFLARE_IP_RANGE" variant="envBackend" /> — use <code>CF-Connecting-IP</code> only when <code>req.ip</code> is a Cloudflare edge IP.

## Redis store

When <Badge text="RATE_LIMIT_REDIS_ENABLED" variant="envBackend" /> is <Badge text="true" variant="new" /> (production default), all limiters use Redis. They share <Badge text="REDIS_HOST" variant="envBackend" /> and <Badge text="REDIS_PORT" variant="envBackend" /> with cache and BullMQ. Set <Badge text="RATE_LIMIT_REDIS_PREFIX" variant="envBackend" /> and optional <Badge text="RATE_LIMIT_REDIS_DB" variant="envBackend" /> to tune keys. If Redis is off or down at startup, counters stay in memory per API instance.

## CMS cache headers

Public CMS GETs (same routes as <Badge text="publicRead" variant="default" />) get <code>Cache-Control</code> from <Badge text="backend/middlewares/publicCmsCacheHeaders.ts" variant="path" />:

| Route kind | Default header |
| --- | --- |
| CMS JSON | <code>public, max-age=60, stale-while-revalidate=300</code> |
| <Badge text="GET /blog-system/rss" variant="path" /> | <code>public, max-age=86400</code> |
| Public images | <code>public, max-age=3600, stale-while-revalidate=86400</code> |

Anonymous public HTML uses matching hints in <Badge text="web/src/lib/seo/publicCmsPageCache.ts" variant="path" />. Tune with <Badge text="PUBLIC_CMS_CACHE_ENABLED" variant="envBackend" /> and <Badge text="PUBLIC_CMS_CACHE_*" variant="envBackend" /> (on by default when <Badge text="NOT_SECURED" variant="envBackend" /> is <Badge text="false" variant="new" />).

## 429 logs

Search logs for <code>Rate limit exceeded</code>. Fields: <code>limiter</code>, <code>trustedClientIp</code>, <code>userId</code>, <code>path</code>, <code>method</code>, <code>windowMs</code>, <code>max</code>.

## Environment variables

Set <Badge text="RATE_LIMIT_ENABLED" variant="envBackend" /> to <Badge text="false" variant="new" /> to disable all limiters.

| Group | Variables |
| --- | --- |
| Master switch | <Badge text="RATE_LIMIT_ENABLED" variant="envBackend" /> |
| Client IP | <Badge text="TRUST_CLOUDFLARE_HEADERS" variant="envBackend" />, <Badge text="VERIFY_CLOUDFLARE_IP_RANGE" variant="envBackend" /> |
| Public read | <Badge text="PUBLIC_READ_RATE_LIMIT_WINDOW_MS" variant="envBackend" />, <Badge text="PUBLIC_READ_RATE_LIMIT_MAX" variant="envBackend" /> |
| Session | <Badge text="SESSION_RATE_LIMIT_WINDOW_MS" variant="envBackend" />, <Badge text="SESSION_RATE_LIMIT_MAX" variant="envBackend" /> |
| Global | <Badge text="RATE_LIMIT_WINDOW_MS" variant="envBackend" />, <Badge text="RATE_LIMIT_MAX" variant="envBackend" /> |
| Auth / OAuth | <Badge text="AUTH_RATE_LIMIT_*" variant="envBackend" />, <Badge text="OAUTH_RATE_LIMIT_*" variant="envBackend" /> |
| Public API / MCP | <Badge text="PUBLIC_API_RATE_LIMIT_*" variant="envBackend" />, <Badge text="MCP_RATE_LIMIT_*" variant="envBackend" /> |
| Upload / feedback | <Badge text="UPLOAD_RATE_LIMIT_*" variant="envBackend" />, <Badge text="FEEDBACK_RATE_LIMIT_*" variant="envBackend" /> |
| Integrations | <Badge text="INTEGRATION_CONNECT_RATE_LIMIT_*" variant="envBackend" />, <Badge text="OAUTH_TOKEN_RATE_LIMIT_*" variant="envBackend" /> |
| Public writes | <Badge text="PUBLIC_WRITE_RATE_LIMIT_*" variant="envBackend" /> |
| Redis store | <Badge text="RATE_LIMIT_REDIS_ENABLED" variant="envBackend" />, <Badge text="RATE_LIMIT_REDIS_PREFIX" variant="envBackend" />, <Badge text="RATE_LIMIT_REDIS_DB" variant="envBackend" /> |
| CMS cache | <Badge text="PUBLIC_CMS_CACHE_ENABLED" variant="envBackend" />, <Badge text="PUBLIC_CMS_CACHE_MAX_AGE" variant="envBackend" />, <Badge text="PUBLIC_CMS_CACHE_STALE_WHILE_REVALIDATE" variant="envBackend" />, <Badge text="PUBLIC_CMS_RSS_CACHE_MAX_AGE" variant="envBackend" />, <Badge text="PUBLIC_CMS_IMAGE_CACHE_*" variant="envBackend" /> |

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

## Production deploy

1. Deploy the API with <Badge text="NOT_SECURED" variant="envBackend" /> set to <Badge text="false" variant="new" /> and Redis configured.
2. Check startup logs for <code>store: redis</code> when <Badge text="RATE_LIMIT_REDIS_ENABLED" variant="envBackend" /> is on.
3. Watch <code>Rate limit exceeded</code> logs. Raise <Badge text="PUBLIC_READ_RATE_LIMIT_MAX" variant="envBackend" /> or <Badge text="SESSION_RATE_LIMIT_MAX" variant="envBackend" /> for real traffic. Lower caps only when you confirm abuse.
4. If a public page returns 503, check for <code>limiter: &quot;publicRead&quot;</code> in API logs. Confirm <code>CF-Connecting-IP</code> behind Cloudflare and <code>Cache-Control</code> on CMS GETs.

Workers and the web app do not need rate-limit env vars. See <a href="/docs/installation/production-deployment">Production deployment</a>.

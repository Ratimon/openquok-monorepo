---
title: Rate limiting
description: How OpenQuok caps traffic so sign-in, your workspace, and public pages stay reliable.
order: 9
lastUpdated: 2026-10-06
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

**Rate limiting** means OpenQuok counts how many requests someone sends in a time window. A request can be from a signed-in user, an API key, or a visitor IP address.

When the count goes over the cap, the API returns **429 Too Many Requests**. The person must wait until the window resets.

Limits protect sign-in, the dashboard, public blog and listing pages, uploads, and integrations. Messages from social networks (webhooks) are **not** rate limited. Those go server to server.

The table below shows typical production caps. You can change them with environment variables (see <a href="#environment-variables">Environment variables</a>).

## Limits by area

Each row is one rule. One request matches **one** rule, not every rule at once.

| Area | Who it applies to | Default cap (production) |
| --- | --- | --- |
| Public blog, listings, and similar **read** pages | Visitors (by IP) | 600 requests per hour |
| Signed-in **workspace API** | Your account (by user id) | 2000 requests per hour |
| Other **anonymous** API calls | Visitors (by IP) | 120 requests per hour |
| **Sign-in and password** routes | By IP | 50 requests per 15 minutes |
| **OAuth sign-in** (Google and similar) | By IP | 20 requests per 5 minutes |
| **Public API** (API keys) | Per key, or IP if no key | 30 requests per hour |
| **MCP** tools endpoint | Token or IP | 120 requests per hour |
| **File uploads** | Token or IP | 20 requests per hour |
| **Feedback** form | By IP | 10 requests per hour |
| **Connect a social channel** | By IP | 30 requests per 15 minutes |
| **OAuth token exchange** for apps | By IP | 30 requests per 15 minutes |
| Small **public write** actions (stats, activity) | By IP | 60 requests per hour |

Public read pages are **not** unlimited. The first row stops heavy scraping from overloading your server.

## Visitor IP address

The API needs each visitor’s real IP to count fairly.

If **Cloudflare** sits in front of OpenQuok, set <Badge text="TRUST_CLOUDFLARE_HEADERS" variant="envBackend" /> so the API sees the visitor IP, not one shared edge IP. Without that, many real users can look like one person and hit limits too soon.

Optional <Badge text="VERIFY_CLOUDFLARE_IP_RANGE" variant="envBackend" /> only trusts that header when the request really came through Cloudflare.

## Shared counters with Redis

In production, counters usually live in **Redis** when <Badge text="RATE_LIMIT_REDIS_ENABLED" variant="envBackend" /> is on. Then every API server shares the same counts.

Redis uses the same host settings as cache (<Badge text="REDIS_HOST" variant="envBackend" />, <Badge text="REDIS_PORT" variant="envBackend" />). If Redis is off or unreachable at startup, each API instance keeps its own in-memory counts until Redis is available.

## Public content cache (related)

Public read routes also send **cache headers**. Browsers and CDNs can reuse responses for a short time. That lowers load and helps you stay under read limits.

| Content type | Typical behavior |
| --- | --- |
| List and hub pages (indexes, categories, tags) | Short public cache (about 1 minute) |
| Single pages you edit in secret-admin | No cache — fresh after save |
| RSS feed | Longer cache (about 1 day) |
| Public images | About 1 hour, with a longer stale window |

The public **website** follows similar rules. For why more than one cache layer exists, see <a href="/docs/configuration-backend/cache-design#public-content-and-caching">Cache design → Public content and caching</a>.

Tune cache duration with <Badge text="PUBLIC_CMS_CACHE_ENABLED" variant="envBackend" /> and <Badge text="PUBLIC_CMS_CACHE_*" variant="envBackend" />.

<Callout type="warning" title="Cloudflare and Vercel">
<p>Many visitors can share one edge IP if IP headers are wrong. Set <Badge text="TRUST_CLOUDFLARE_HEADERS" variant="envBackend" /> when you use Cloudflare. Public page caching also reduces how often every visit hits your API.</p>
</Callout>

## When something is blocked

Search API logs for <code>Rate limit exceeded</code>. Each line shows which rule fired, the IP, the path, and the cap.

If real users hit limits, raise the cap for that area (public read or signed-in session). Lower caps only when you see abuse.

## Environment variables

Set <Badge text="RATE_LIMIT_ENABLED" variant="envBackend" /> to <Badge text="false" variant="new" /> to turn off all limiters. Do not do this in production.

Copy <Badge text="backend/.env.development.example" variant="path" /> to <Badge text="backend/.env.development.local" variant="path" /> for sample values when you test locally:

```bash
# From repo root — example only; adjust values for your machine
cp backend/.env.development.example backend/.env.development.local
```

| Group | What you change |
| --- | --- |
| Master switch | <Badge text="RATE_LIMIT_ENABLED" variant="envBackend" /> |
| Visitor IP | <Badge text="TRUST_CLOUDFLARE_HEADERS" variant="envBackend" />, <Badge text="VERIFY_CLOUDFLARE_IP_RANGE" variant="envBackend" /> |
| Public read pages | <Badge text="PUBLIC_READ_RATE_LIMIT_WINDOW_MS" variant="envBackend" />, <Badge text="PUBLIC_READ_RATE_LIMIT_MAX" variant="envBackend" /> |
| Signed-in workspace | <Badge text="SESSION_RATE_LIMIT_WINDOW_MS" variant="envBackend" />, <Badge text="SESSION_RATE_LIMIT_MAX" variant="envBackend" /> |
| Other anonymous API | <Badge text="RATE_LIMIT_WINDOW_MS" variant="envBackend" />, <Badge text="RATE_LIMIT_MAX" variant="envBackend" /> |
| Sign-in and OAuth | <Badge text="AUTH_RATE_LIMIT_*" variant="envBackend" />, <Badge text="OAUTH_RATE_LIMIT_*" variant="envBackend" /> |
| Public API and MCP | <Badge text="PUBLIC_API_RATE_LIMIT_*" variant="envBackend" />, <Badge text="MCP_RATE_LIMIT_*" variant="envBackend" /> |
| Uploads and feedback | <Badge text="UPLOAD_RATE_LIMIT_*" variant="envBackend" />, <Badge text="FEEDBACK_RATE_LIMIT_*" variant="envBackend" /> |
| Channel connect and app tokens | <Badge text="INTEGRATION_CONNECT_RATE_LIMIT_*" variant="envBackend" />, <Badge text="OAUTH_TOKEN_RATE_LIMIT_*" variant="envBackend" /> |
| Public writes | <Badge text="PUBLIC_WRITE_RATE_LIMIT_*" variant="envBackend" /> |
| Redis store | <Badge text="RATE_LIMIT_REDIS_ENABLED" variant="envBackend" />, <Badge text="RATE_LIMIT_REDIS_PREFIX" variant="envBackend" />, <Badge text="RATE_LIMIT_REDIS_DB" variant="envBackend" /> |
| Public page cache | <Badge text="PUBLIC_CMS_CACHE_ENABLED" variant="envBackend" />, <Badge text="PUBLIC_CMS_CACHE_MAX_AGE" variant="envBackend" />, <Badge text="PUBLIC_CMS_CACHE_STALE_WHILE_REVALIDATE" variant="envBackend" />, <Badge text="PUBLIC_CMS_RSS_CACHE_MAX_AGE" variant="envBackend" />, <Badge text="PUBLIC_CMS_IMAGE_CACHE_*" variant="envBackend" /> |

Example production-related values (full list is in the example env file):

```bash
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_ENABLED=true
TRUST_CLOUDFLARE_HEADERS=true
PUBLIC_READ_RATE_LIMIT_MAX=600
SESSION_RATE_LIMIT_MAX=2000
```

## Production checklist

<Callout type="note" title="Deploy">
<p>Run the API in production mode (<Badge text="NOT_SECURED" variant="envBackend" /> set to <Badge text="false" variant="new" />) with Redis configured. After deploy, confirm logs show Redis for rate limits when <Badge text="RATE_LIMIT_REDIS_ENABLED" variant="envBackend" /> is on. Watch <code>Rate limit exceeded</code> in logs. Raise caps if real users hit limits. If many visitors see errors on a public page, check public read limits and Cloudflare IP settings.</p>
</Callout>

Workers and the web app do not need these variables. See <a href="/docs/installation/production-deployment">Production deployment</a>.

## Related

<CardGrid>
<LinkCard title="Cache design" description="Source of Truth, Redis, and public page caching." href="/docs/configuration-backend/cache-design" />
<LinkCard title="Redis cache" description="Connect Redis for cache and shared rate limits." href="/docs/configuration-backend/redis" />
</CardGrid>

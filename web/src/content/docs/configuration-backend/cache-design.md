---
title: Cache design
description: Where OpenQuok keeps your data, how Redis helps, and how public pages stay fresh after you publish.
order: 3.5
lastUpdated: 2026-10-06
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

OpenQuok saves your workspace data in **Supabase (Postgres)**. That database is the long-term home for posts, users, billing, and settings.

**Redis** is a fast helper. It holds short-lived copies, sign-in handoff data, and background job queues. Redis is **not** the **Source of Truth** for your product data.

To connect Redis, set the variables on <a href="/docs/configuration-backend/redis">Redis cache</a>. For background workers and queues, see <a href="/docs/configuration-worker/redis">Redis &amp; queues</a>.

## Source of Truth

**Source of Truth** means the place you trust when data must be correct.

| Data | Source of Truth |
| --- | --- |
| Posts, schedules, channels, users, workspaces, billing | Postgres |
| Fast copies used when the API reads profiles, permissions, calendars, blog, listings | Postgres (Redis holds a copy for speed) |
| Short-lived sign-in state during OAuth | Redis only (expires quickly) |
| Background jobs (publish pipeline) | Redis for the job; the schedule row stays in Postgres |

When you schedule a post, OpenQuok writes to Postgres first, then starts the worker job. If a job is lost, the system can rebuild from Postgres. The queue is not your schedule book.

## What Redis does in one host

You can use one Redis server for everything. The API and workers open separate connections for different jobs:

| Role | What it is for |
| --- | --- |
| Application cache | Speeds up repeated reads. Keys start with <Badge text="REDIS_PREFIX" variant="envBackend" /> (default <code>app:cache:</code>). |
| Queues and workflow | Runs publish and integration jobs in the background. |
| OAuth connect | Holds temporary login state under the same cache connection. |

Optional <Badge text="REDIS_BULLMQ_DB" variant="envBackend" /> puts queue data on a separate Redis database number. Cache keys use <Badge text="REDIS_DB" variant="envBackend" />.

## How reads and writes use the cache

**Reads (read-aside).** The API checks Redis first. If the data is not there, it loads from Postgres and stores a copy in Redis for a short time.

**Writes (write-around).** When something changes, OpenQuok updates Postgres first, then clears the matching cache entries so the next read is fresh.

**Time limit (TTL).** Every cache entry expires after a while even if nothing changed. Default length is <Badge text="CACHE_DEFAULT_TTL" variant="envBackend" /> (900 seconds). Sign-in handoff data uses about one hour.

In production, set <Badge text="CACHE_PROVIDER=redis" variant="envBackend" /> so sign-in works when you run more than one API server (for example on Vercel).

## Public content and caching

Blog posts, listings, playbooks, building blocks, and link-directory pages can be cached in **several places at once**. Adding Redis on the server does **not** remove the other layers. Each layer has a job:

| Layer | What it does for visitors |
| --- | --- |
| Redis on the API | Fewer database reads when many people view the same content |
| API response headers | Tells browsers and CDNs how long they may reuse JSON data |
| Website data fetch | Detail pages you edit in secret-admin always ask for fresh API data |
| HTML page | Stops the edge from showing an old page after you save in secret-admin |

**Pages you edit in secret-admin** (single blog post, one listing, one link-directory site, creator playbooks, and similar) are treated as **no cache** for visitors. After you save, people should see the new version when they reload (use a hard refresh if their browser still shows old text).

**List and hub pages** (indexes, categories, tags, RSS, public images) may be cached for a short time. That reduces load and helps stay within <a href="/docs/configuration-backend/rate-limiting">rate limits</a>.

You can tune hub cache time with <Badge text="PUBLIC_CMS_CACHE_ENABLED" variant="envBackend" /> and <Badge text="PUBLIC_CMS_CACHE_*" variant="envBackend" />.

<Callout type="note">
<p>If a public page looks stale after a secret-admin save, check that you are viewing the detail URL (not an old tab), log out or use a private window, and hard refresh. Operators can also send a HEAD request with <code>curl -I</code> to the page URL to see cache headers.</p>
</Callout>

## Connection limits

Redis plans limit how many **connections** can be open at once (for example 256 on a small Redis Cloud plan).

| Part of OpenQuok | Typical connections |
| --- | --- |
| Each warm API server | One cache connection; short extra connections when enqueueing jobs |
| Each background worker | One or two long-lived queue connections |
| Health checks | May add connections if each check opens a new client |

Traffic spikes can open many connections quickly. Redis does not close idle connections for you.

<Callout type="warning" title="Production">
<p>Watch <strong>Connected clients</strong> in your Redis provider dashboard. Turn off <Badge text="BULL_BOARD_ENABLED" variant="envBackend" /> on serverless API unless you need the queue dashboard there. Run one worker replica per queue service when you can.</p>
</Callout>

### Check connections

```bash
redis-cli -u 'redis://default:PASSWORD@HOST:PORT' --tls INFO clients | grep connected_clients
redis-cli -u 'redis://...' --tls CLIENT LIST
```

Replace <code>PASSWORD</code>, <code>HOST</code>, and <code>PORT</code> with values from your Redis provider.

Only disconnect clients that have been **idle** for more than one day and are not active workers. Do not disconnect live API or worker rows.

Example local cache settings (see <a href="/docs/configuration-backend/redis">Redis cache</a> for the full list):

```bash
CACHE_PROVIDER=redis
CACHE_DEFAULT_TTL=900
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
```

## Related

<CardGrid>
<LinkCard title="Redis cache" description="Connect Redis, TLS, and local Docker." href="/docs/configuration-backend/redis" />
<LinkCard title="Redis &amp; queues" description="Background jobs and safe redis-cli checks." href="/docs/configuration-worker/redis" />
<LinkCard title="Rate limiting" description="Caps on traffic and how caching helps public reads." href="/docs/configuration-backend/rate-limiting" />
<LinkCard title="Configuration - Worker" description="Workers and health checks." href="/docs/configuration-worker" />
</CardGrid>

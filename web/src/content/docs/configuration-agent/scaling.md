---
title: Scaling & Postgres
description: Run multiple CLI auth server instances—shared DATABASE_URL and SERVER_URL, no sticky sessions, and pooled Postgres on Vercel.
order: 3
lastUpdated: 2026-05-09
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The CLI auth server is **stateless at the process layer**: device-flow state lives in **Postgres** (<Badge text="device_requests" variant="default" /> table, auto-created on startup — see <a href="/docs/configuration-agent/architecture#postgres-state-model">Auth server architecture → Postgres state model</a>). That means **horizontal scaling** is safe when every instance shares the same database and the same public configuration.

## Multiple instances

You can run **several replicas** behind a load balancer (or on serverless concurrency) **if they share**:

- The same <Badge text="DATABASE_URL" variant="envBackend" />
- The same <Badge text="SERVER_URL" variant="envBackend" /> (public origin users and OAuth redirects see)
- The same OAuth client <Badge text="OPENQUOK_OAUTH_CLIENT_ID" variant="envBackend" /> / <Badge text="OPENQUOK_OAUTH_CLIENT_SECRET" variant="envBackend" />

**Sticky sessions are not required** — any instance can serve the next poll or browser request.

## Serverless (Vercel) and Postgres

On Vercel, functions scale concurrently. Use a **managed Postgres** connection string suited to **many short-lived connections** (pooling — for example Neon, Supabase pooler, Vercel Postgres, or your provider’s serverless URL). Avoid a single non-pooled DSN that exhausts connection limits under burst traffic.

<Callout type="warning" title="Keep SERVER_URL stable across replicas">
Every replica must advertise the same canonical <Badge text="SERVER_URL" variant="envBackend" /> that matches your OAuth app’s registered callback host; otherwise redirect URIs and verification links can disagree between invocations.
</Callout>

## Related configuration

<CardGrid>
<LinkCard title="Environment variables" description="DATABASE_URL, SERVER_URL, and optional overrides" href="/docs/configuration-agent#environment-variables" />
<LinkCard title="Vercel deployment" description="Link, env sync, and deploy agent/server" href="/docs/installation/vercel#cli-auth-server-on-vercel" />
<LinkCard title="Vercel (installation)" description="Monorepo deploy patterns for backend, web, and agent" href="/docs/installation/vercel" />
<LinkCard title="Configuration - Agent" description="Back to the CLI auth hub" href="/docs/configuration-agent" />
</CardGrid>

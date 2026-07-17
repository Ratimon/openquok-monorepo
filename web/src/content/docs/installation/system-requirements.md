---
title: Self-host - System requirements
description: CPU, RAM, disk, ports, and required services for running OpenQuok as a self-hosted social scheduler with Docker Compose.
order: 4
lastUpdated: 2026-07-16
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Use these floors when you self-host OpenQuok with the Compose stack under <Badge text="infra/self-host/" variant="path" />. Contributor machines that only run <code>pnpm</code> + local Supabase can be lighter; image builds for the full stack need more RAM.

## Hardware floors

| Resource | Minimum | Notes |
| --- | --- | --- |
| CPU | 2 cores | Prefer 4+ when building all images on the same host |
| RAM | 8 GB | 16 GB recommended for first <code>docker compose … --build</code> (web + backend TypeScript builds) |
| Disk | 20 GB free | Images, Redis AOF, and the local uploads volume |

<Callout type="note" title="Build memory">
<p>Dockerfiles set <Badge text="NODE_OPTIONS" variant="envRuntime" /> with a raised heap (for example <code>--max-old-space-size=8192</code> on the web image). Give Docker enough memory so those builds do not OOM; on constrained hosts, build one service at a time or raise the Docker Desktop memory limit.</p>
</Callout>

## Required software

- <DocsExternalLink href="https://docs.docker.com/get-docker/">Docker</DocsExternalLink> Engine (or Docker Desktop) with **Compose v2** (<code>docker compose</code>)
- Git, to clone this monorepo (images build from the repo root context; app images use **Node 24** on <code>bookworm-slim</code>)
- A **Supabase** project — hosted cloud **or** <DocsExternalLink href="https://supabase.com/docs/guides/cli/getting-started"><code>supabase start</code></DocsExternalLink> on the same host. App data and Auth go through Supabase; Compose does **not** bundle the Supabase multi-container stack in v1.

## Network and outbound access

- Browser and operators need reachability to the **web** and **API** ports you publish (defaults below).
- The API and workers need outbound **HTTPS** to Supabase and to any social provider APIs you enable.
- Optional object storage (R2) and email providers need outbound access when configured.

## Default ports (self-host Compose)

| Service | Host port (default) | Container | Purpose |
| --- | --- | --- | --- |
| Web UI | <Badge text="4007" variant="default" /> | <code>3000</code> | SvelteKit Node server |
| API | <Badge text="3000" variant="default" /> | <code>3000</code> | Express backend |
| Worker health (integration refresh) | <Badge text="3091" variant="default" /> | <code>3091</code> | Optional health probe |
| Redis | not published | <code>6379</code> | Cache + BullMQ (debug publish optional) |
| CLI auth server (profile <code>cli</code>) | <Badge text="3111" variant="default" /> | <code>3111</code> | Device-flow OAuth helper |
| CLI Postgres (profile <code>cli</code>) | not published | <code>5432</code> | Auth-server state |

Override host maps with <Badge text="OPENQUOK_WEB_HOST_PORT" variant="envBackend" />, <Badge text="OPENQUOK_API_HOST_PORT" variant="envBackend" />, and related keys in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/infra/self-host/.env.example"><Badge text="infra/self-host/.env.example" variant="path" /></DocsExternalLink>.

## What Compose provides vs what you provide

| In Compose | Operator-provided |
| --- | --- |
| Redis | Supabase project (URL + keys); apply OpenQuok migrations |
| Backend API, web, three BullMQ workers | Social OAuth app credentials as needed |
| Local uploads volume | Optional object storage (default: local disk) |
| Optional CLI Postgres + agent server (<code>--profile cli</code>) | Reverse proxy / TLS if you expose beyond localhost |

## Related

<CardGrid>
<LinkCard title="Docker Compose (self-host)" description="Copy env, fill Supabase, bring the stack up" href="/docs/installation/docker-compose" />
<LinkCard title="Development environment" description="pnpm-based local API and web; infra/docker-compose.yml for Redis only" href="/docs/installation/development-environment" />
<LinkCard title="Supabase" description="Project keys and dashboard setup for the API" href="/docs/configuration-backend/supabase" />
</CardGrid>

---
title: Overview - Installation
description: Set up OpenQuok — system requirements, Docker Compose self-host, local development, and Vercel / Railway production deploys for the social scheduler.
order: 0
lastUpdated: 2026-07-16
---

<script>
import { Callout, Tabs, TabItem, Steps, Card, CardGrid, LinkCard, Badge, FileTree } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Installation

<CardGrid>
<LinkCard title="System requirements" description="CPU, RAM, ports, Docker, and operator-provided Supabase for self-host" href="/docs/installation/system-requirements" />
<LinkCard title="Docker Compose (self-host)" description="Full app stack: API, web, Redis, and BullMQ workers from the monorepo" href="/docs/installation/docker-compose" />
<LinkCard title="Production deployment" description="Vercel API and web, Redis, optional BullMQ workers" href="/docs/installation/production-deployment" />
<LinkCard title="Development environment" description="Local development commands" href="/docs/installation/development-environment" />
<LinkCard title="Production Vercel" description="Vercel deployment detail for backend and web" href="/docs/installation/vercel" />
<LinkCard title="Production Railway (workers)" description="Railway deployment detail for Always-on orchestrator worker services" href="/docs/installation/railway" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Backend configuration" description="Env files and variables for the backend / Supabase workspace" href="/docs/configuration-backend" />
<LinkCard title="Configuration - Worker" description="Worker env, Docker, Redis, Railway, and scripts" href="/docs/configuration-worker" />
<LinkCard title="Frontend configuration" description="Environment variables for the SvelteKit app in web/" href="/docs/configuration-web" />
<LinkCard title="Super Admin" description="Platform admin setup after deployment" href="/docs/admin/super-admin" />
</CardGrid>

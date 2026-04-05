---
title: Overview - Installation
description: Set up your environment and deploy Openquok.
order: 0
lastUpdated: 2026-04-02
---

<script>
import { Callout, Tabs, TabItem, Steps, Card, CardGrid, LinkCard, Badge, FileTree } from '$lib/ui/components/docs/mdx/index.js';
</script>

# Installation

<CardGrid>
<LinkCard title="Production deployment" description="Backend (Railway or Vercel), web, Temporal connectivity" href="/docs/Installation/production-deployment" />
<LinkCard title="Development environment" description="Local development commands" href="/docs/Installation/development-environment" />
<LinkCard title="Docker & Compose" description="Temporal, Redis, and optional API container workflows" href="/docs/Installation/docker" />
<LinkCard title="Vercel" description="Vercel-focused deployment detail for backend and web" href="/docs/Installation/vercel" />
<LinkCard title="Temporal, workers & Railway" description="Task queues, orchestrator vs API, Railway Temporal stack" href="/docs/Installation/temporal-workers-railway" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Backend configuration" description="Env files and variables for the backend / Supabase workspace" href="/docs/configuration-backend" />
<LinkCard title="Frontend configuration" description="Environment variables for the SvelteKit app in web/" href="/docs/configuration-web" />
<LinkCard title="Admin" description="Super admin setup after deployment" href="/docs/admin/super-admin" />
</CardGrid>

---
title: Overview - Installation
description: Set up your environment and deploy Openquok.
order: 0
lastUpdated: 2026-04-07
---

<script>
import { Callout, Tabs, TabItem, Steps, Card, CardGrid, LinkCard, Badge, FileTree } from '$lib/ui/components/docs/mdx/index.js';
</script>

# Installation

<CardGrid>
<LinkCard title="Production deployment" description="Vercel API and web, Redis, optional BullMQ workers" href="/docs/Installation/production-deployment" />
<LinkCard title="Development environment" description="Local development commands" href="/docs/Installation/development-environment" />
<LinkCard title="Vercel" description="Vercel-focused deployment detail for backend and web" href="/docs/Installation/vercel" />
<LinkCard title="Railway (workers)" description="Always-on orchestrator worker services and CLI" href="/docs/Installation/railway" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Backend configuration" description="Env files and variables for the backend / Supabase workspace" href="/docs/configuration-backend" />
<LinkCard title="Orchestrator workers" description="Worker env, build/start commands, and Railway" href="/docs/configuration-worker" />
<LinkCard title="Frontend configuration" description="Environment variables for the SvelteKit app in web/" href="/docs/configuration-web" />
<LinkCard title="Admin" description="Super admin setup after deployment" href="/docs/admin/super-admin" />
</CardGrid>

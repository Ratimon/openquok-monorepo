---
title: Overview - Developer Guidelines
description: OpenQuok's developer guidelines — security, RBAC, SSR safety, and theming conventions.
order: 0
lastUpdated: 2026-04-07
---

<script>
import { CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

# Developer Guidelines

This section collects **engineering guidelines** that are easy to forget during day-to-day work (RBAC conventions, SSR security constraints, and secret-handling rules).

<CardGrid>
<LinkCard title="Security guidelines" description="Service key rules, RLS guidance, and SSR state management safety" href="/docs/developer-guidelines/security" />
<LinkCard title="RBAC (roles & permissions)" description="How app-level roles/permissions work and how to secure routes correctly" href="/docs/developer-guidelines/rbac" />
<LinkCard title="DaisyUI theming" description="Semantic color classes, theme-safe UI tokens, and shadcn-to-DaisyUI mapping" href="/docs/developer-guidelines/daisyui-theme" />
<LinkCard title="Orchestrator workflows" description="Flowcraft refresh and notification email, in-process or BullMQ" href="/docs/developer-guidelines/orchestrator-workflows" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Configuration - Backend" description="Supabase, env vars, and backend operational setup" href="/docs/configuration-backend" />
<LinkCard title="Orchestrator workers" description="Worker env, Railway, and production start commands" href="/docs/configuration-worker" />
<LinkCard title="Configuration - Web" description="Vite env vars and web configuration" href="/docs/configuration-web" />
</CardGrid>

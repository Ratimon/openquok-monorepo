---
title: Overview - Developer Guidelines
description: Engineering conventions for auth, RBAC, SSR safety, and secrets handling.
order: 0
lastUpdated: 2026-03-30
---

<script>
import { CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

# Developer Guidelines

This section collects **engineering guidelines** that are easy to forget during day-to-day work (RBAC conventions, SSR security constraints, and secret-handling rules).

<CardGrid>
<LinkCard title="RBAC (roles & permissions)" description="How app-level roles/permissions work and how to secure routes correctly" href="/docs/developer-guidelines/rbac" />
<LinkCard title="Security guidelines" description="Service key rules, RLS guidance, and SSR state management safety" href="/docs/developer-guidelines/security" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Configuration - Backend" description="Supabase, env vars, and backend operational setup" href="/docs/configuration-backend" />
<LinkCard title="Configuration - Web" description="Vite env vars and web configuration" href="/docs/configuration-web" />
</CardGrid>

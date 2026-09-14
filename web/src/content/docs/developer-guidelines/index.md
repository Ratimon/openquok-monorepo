---
title: Overview - Developer Guidelines
description: OpenQuok's developer guidelines — fork the repo, submit code PRs, security, RBAC, and theming conventions.
order: 0
lastUpdated: 2026-07-05
---

<script>
import { CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Developer Guidelines

This section collects **engineering guidelines** for contributing code to OpenQuok — from opening a pull request to conventions that are easy to forget during day-to-day work (RBAC, SSR security constraints, and secret-handling rules).

## Contribution guides

Pick scoped product work, publish catalog listings, or author documentation for the docs site.

<CardGrid>
<LinkCard title="Contribution opportunities" description="Scoped product work — social providers, Humanizer locales, and docs translations" href="/docs/contribution-opportunities" />
<LinkCard title="Publish listings" description="Share building blocks and playbooks on the OpenQuok catalog" href="/docs/publish-listings" />
<LinkCard title="Documentation contribution" description="Author docs pages, preview locally, and submit a PR" href="/docs/documentation-contribution" />
</CardGrid>

## Engineering guidelines

Conventions for code contributions — pull requests, security, RBAC, theming, notifications, and workers.

<CardGrid>
<LinkCard title="Submit a pull request" description="Fork the repo, run checks locally, and open a code PR on GitHub" href="/docs/developer-guidelines/submit-a-pr" />
<LinkCard title="Security guidelines" description="Service key rules, RLS guidance, and SSR state management safety" href="/docs/developer-guidelines/security" />
<LinkCard title="RBAC (roles & permissions)" description="How app-level roles/permissions work and how to secure routes correctly" href="/docs/developer-guidelines/rbac" />
<LinkCard title="DaisyUI theming" description="Semantic color classes, theme-safe UI tokens, and shadcn-to-DaisyUI mapping" href="/docs/developer-guidelines/daisyui-theme" />
<LinkCard title="Notifications" description="In-app notifications + notification email (immediate vs digest), workers, and troubleshooting" href="/docs/developer-guidelines/notifications" />
<LinkCard title="Orchestrator workflows" description="Flowcraft integration refresh, notification email, scheduled posts—in-process or BullMQ" href="/docs/developer-guidelines/orchestrator-workflows" />
</CardGrid>

## Related Section(s)

More guides and operator setup on Self-hosting.

<CardGrid>
<LinkCard title="Publish listings" description="Share building blocks and playbooks on the OpenQuok catalog" href="/docs/publish-listings" />
<LinkCard title="Documentation contribution" description="Author docs pages, preview locally, and submit a PR" href="/docs/documentation-contribution" />
<LinkCard title="Contribution opportunities" description="Scoped product work — social providers, Humanizer locales, and docs translations" href="/docs/contribution-opportunities" />
<LinkCard title="Submit a pull request" description="Fork the repo, run checks locally, and open a code PR on GitHub" href="/docs/developer-guidelines/submit-a-pr" />
<LinkCard title="Self-hosting overview" description="Architecture, quick start, and operator defaults" href="/docs/getting-started-for-dev" />
<LinkCard title="Configuration - Backend" description="Supabase, env vars, and backend operational setup" href="/docs/configuration-backend" />
<LinkCard title="Configuration - Worker" description="Worker env, Railway, and production start commands" href="/docs/configuration-worker" />
<LinkCard title="Configuration - Web" description="Vite env vars and web configuration" href="/docs/configuration-web" />
<LinkCard title="General" description="What OpenQuok is and how to use the social scheduler" href="/docs" />
<LinkCard title="Public API" description="Posts, channels, and analytics over HTTP" href="/docs/getting-started-for-public-api" />
</CardGrid>

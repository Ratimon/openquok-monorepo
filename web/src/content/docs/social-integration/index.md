---
title: Overview - Connetions
description: Connect social channels (Meta Threads and more) to Openquok — OAuth, backend env, and Meta dashboard settings.
order: 0
lastUpdated: 2026-04-02
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Openquok connects **social channels** through the **backend** integration layer: OAuth flows, organization-scoped channels, and optional **programmatic** APIs authenticated with a workspace <Badge text="opo_" variant="default" /> token. Credentials and redirect URLs are configured via **environment variables** on the backend and **Meta for Developers** (for Threads, Instagram, and other providers). See <a href="/docs/getting-started-for-public-api#authentication">Public API authentication</a> for token setup.

The flow matches common **OAuth-based social tools**: you register apps with each platform, set redirect URIs, and store client IDs and secrets in env—**never** in client-side code or the repo.

<Callout type="danger" title="Secrets">
Never commit <Badge text="THREADS_APP_SECRET" variant="envBackend" /> or other provider secrets. Use <Badge text="backend/.env.development.local" variant="envBackend" /> (or your host’s secret store in production).
</Callout>

## Guides

<CardGrid>
<LinkCard title="Meta Threads" description="Connect Threads so you can schedule posts from OpenQuok" href="/docs/social-integration/threads" />
<LinkCard title="Instagram" description="Connect Instagram Business or Standalone and start posting" href="/docs/social-integration/instagram" />
<LinkCard title="Facebook Page" description="Link a Facebook Page and publish from your workspace" href="/docs/social-integration/facebook" />
<LinkCard title="YouTube" description="Connect a YouTube channel and schedule video uploads" href="/docs/social-integration/youtube" />
<LinkCard title="TikTok" description="Connect TikTok and schedule content to your account" href="/docs/social-integration/tiktok" />
<LinkCard title="LinkedIn" description="Connect your personal LinkedIn profile for posts and documents" href="/docs/social-integration/linkedin" />
<LinkCard title="LinkedIn Page" description="Connect a Company Page to post and view page insights" href="/docs/social-integration/linkedin-page" />
<LinkCard title="X" description="Connect X (Twitter) so you can schedule posts" href="/docs/social-integration/x" />
<LinkCard title="Adding a provider" description="How to add a new social channel as a contributor" href="/docs/developer-guidelines/add-provider" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Backend configuration" description="Env files, Supabase, Redis, and service keys" href="/docs/configuration-backend" />
<LinkCard title="Frontend configuration" description="Vite env and PWA" href="/docs/configuration-web" />
<LinkCard title="Getting started" description="Stack overview and architecture" href="/docs/getting-started-for-dev" />
</CardGrid>

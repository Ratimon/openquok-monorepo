---
title: Social integration overview
description: Self-host operator guides to connect posting channels — OAuth apps, API keys, extension session, and backend env.
order: 0
lastUpdated: 2026-10-24
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

<Callout type="tip" title="Self-host operators">
<p>These guides are for people who run OpenQuok and register their own social developer apps. On <a href="/docs/cloud">OpenQuok Cloud</a>, those apps are already configured — workspace owners only connect their accounts.</p>
</Callout>

OpenQuok connects **social channels** through the backend integration layer. Each channel is organization-scoped. Workspaces can also call programmatic APIs with a <Badge text="opo_" variant="default" /> token. See <a href="/docs/getting-started-for-public-api#authentication">Public API authentication</a> for token setup.

Connect models fall into three families:

- **OAuth (most networks)** — You create a developer app, set redirect URIs, request API access, and store client IDs and secrets in backend environment variables.
- **Personal API key (for example Dev.to, Bluesky)** — The user pastes a key in Add Channel; operators document which env vars apply per guide.
- **Browser extension (Skool)** — No operator OAuth app. Set <Badge text="VITE_OPENQUOK_BROWSER_EXTENSION_ID" variant="envWeb" /> on the web build and distribute the extension. See <a href="/docs/installation/chrome-extension">Browser extension</a>.

<Callout type="danger">
<p>Never commit <Badge text="THREADS_APP_SECRET" variant="envBackend" /> or other provider secrets. Use <Badge text="backend/.env.development.local" variant="envBackend" /> locally or your host secret store in production.</p>
</Callout>

Directory launch destinations (extension autofill, no posting OAuth) are documented under <a href="/docs/directory-integration">Directory integration</a> and <a href="/docs/directory-submission">Directory submission</a>.

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
<LinkCard title="Dev.to" description="Connect with a personal API key and schedule markdown articles" href="/docs/social-integration/devto" />
<LinkCard title="Bluesky" description="Connect with an app password and schedule text, media, and follow-up replies" href="/docs/social-integration/bluesky" />
<LinkCard title="Skool" description="Connect with the browser extension — no operator OAuth app" href="/docs/social-integration/skool" />
<LinkCard title="Browser extension" description="Build and install the OpenQuok Chrome extension" href="/docs/installation/chrome-extension" />
<LinkCard title="Adding a provider" description="How to add a new social channel as a contributor" href="/docs/contribution-opportunities/add-provider" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Backend configuration" description="Env files, Supabase, Redis, and service keys" href="/docs/configuration-backend" />
<LinkCard title="Frontend configuration" description="Vite env and PWA" href="/docs/configuration-web" />
<LinkCard title="Directory integration" description="Directory launch catalog and per-site operator guides" href="/docs/directory-integration" />
<LinkCard title="Getting started" description="Stack overview and architecture" href="/docs/getting-started-for-dev" />
</CardGrid>

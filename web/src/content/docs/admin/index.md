---
title: Admin Setup
description: Getting Started to Platform admin access and post-deployment setup in Openquok.
order: 0
lastUpdated: 2026-05-08
---

<script>
import { CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Guides for using tools for different **admin** roles and how to grant the roles after you have deployed the stack.

<CardGrid>
<LinkCard title="Platform admin (first operator)" description="Sign up, then promote your user in Supabase — do this after config and deployment" href="/docs/admin/super-admin" />
<LinkCard title="OAuth apps (client ID & secret)" description="Create and rotate OAuth apps; set redirect URL for hosted vs self-hosted auth servers" href="/docs/admin/oauth-server" />
<LinkCard title="Security secrets" description="Set SECURITY_SECRET for invite links and OAuth2 hashing" href="/docs/admin/security-secrets" />
<LinkCard title="Product analytics & UTM" description="PostHog, Meta Pixel, campaign links, and checkout attribution" href="/docs/admin/product-analytics" />
</CardGrid>

## Related Section(s)

<CardGrid>
<LinkCard title="Installation" description="Deploy and set up OpenQuok" href="/docs/installation" />
<LinkCard title="Configuration - Backend" description="Backend env, Supabase, and services" href="/docs/configuration-backend" />
<LinkCard title="Configuration - Web" description="Vite env and web defaults" href="/docs/configuration-web" />
</CardGrid>

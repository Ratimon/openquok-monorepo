---
title: Getting Started for Self-host
description: Getting started with OpenQuok for contributors and self-hosted social scheduler instances — architecture, quick start, and default env patterns.
order: 0
lastUpdated: 2026-08-22
sidebar:
  label: Overview
---

<script>
import { Callout, Tabs, TabItem, Steps, Card, CardGrid, LinkCard, Badge, FileTree } from '$lib/ui/components/docs/mdx/index.js';
</script>

<Callout type="note">
Looking to edit or extend this documentation? See <a href="/docs/documentation-contribution">Documentation contribution</a>.
</Callout>

## Start here !!

<CardGrid>
<LinkCard title="Project Architecture" description="Learn the project 's layout and architecture" href="/docs/getting-started-for-dev/architecture" />

<LinkCard title="Quick Start" description="Get started with OpenQuak Installation" href="/docs/getting-started-for-dev/quick-start" />
</CardGrid>

## Self-hosting documentation

Install the stack, configure each service, connect social OAuth, and assign admin roles on your infrastructure.

<CardGrid>
<LinkCard title="Installation" description="Docker Compose self-host, local development, and production deploys" href="/docs/installation" />
<LinkCard title="Backend Setup" description="Env vars, Supabase, and backend services" href="/docs/configuration-backend" />
<LinkCard title="Frontend Setup" description="Vite env vars and web configuration" href="/docs/configuration-web" />
<LinkCard title="Workers Setup" description="Orchestrator workers, BullMQ, Redis, and Railway deploy" href="/docs/configuration-worker" />
<LinkCard title="CLI Auth Server Setup" description="Deploy and configure the CLI device-flow auth server" href="/docs/configuration-agent" />
<LinkCard title="Admin Roles" description="Platform admin access and post-deployment setup" href="/docs/admin" />
<LinkCard title="Social integrations" description="OAuth apps, API keys, and per-network operator setup" href="/docs/social-integration" />
</CardGrid>

## Self-hosted defaults

For the full operator stack (API, web, Redis, workers), use <a href="/docs/installation/docker-compose">Docker Compose (self-host)</a>. After <code>up --build</code>, open <Badge text="http://localhost:4007" variant="default" /> — Compose serves the UI; you do not run the Vite dev server for that path.

<Callout type="tip" title="Without Email">
<p>Set <Badge text="EMAIL_ENABLED" variant="envBackend" />{' '}<code>=false</code> — no outbound mail; signup marks users verified.</p>
<p>Details: <a href="/docs/configuration-backend/resend">Resend / email setup</a>.</p>
</Callout>

<Callout type="tip" title="Without Billing">
<p>Leave <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> unset — <code>billingEnabled</code> is false, plan guards skip, and the first-billing paywall does not show.</p>
<p>Details: <a href="/docs/configuration-backend/stripe">Stripe billing</a>.</p>
</Callout>

## Related Section(s)

Every self-hosting section plus General, Cloud, and contributing guides.

<CardGrid>
<LinkCard title="Installation" description="Docker Compose self-host, local development, and production deploys" href="/docs/installation" />
<LinkCard title="Backend Setup" description="Env vars, Supabase, and backend services" href="/docs/configuration-backend" />
<LinkCard title="Frontend Setup" description="Vite env vars and web configuration" href="/docs/configuration-web" />
<LinkCard title="Workers Setup" description="Orchestrator workers, BullMQ, Redis, and Railway deploy" href="/docs/configuration-worker" />
<LinkCard title="CLI Auth Server Setup" description="Deploy and configure the CLI device-flow auth server" href="/docs/configuration-agent" />
<LinkCard title="Admin Roles" description="Platform admin access and post-deployment setup" href="/docs/admin" />
<LinkCard title="Social integrations" description="OAuth apps, API keys, and per-network operator setup" href="/docs/social-integration" />
<LinkCard title="Docker Compose (self-host)" description="Bring the full operator stack up locally" href="/docs/installation/docker-compose" />
<LinkCard title="General" description="What OpenQuok is and how to use the social scheduler" href="/docs" />
<LinkCard title="Cloud" description="Hosted plans, trial, and billing" href="/docs/cloud" />
<LinkCard title="Contributing" description="Code guidelines, catalog listings, and docs authoring" href="/docs/developer-guidelines" />
</CardGrid>
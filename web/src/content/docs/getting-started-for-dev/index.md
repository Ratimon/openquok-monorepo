---
title: Overview - Getting Started
description: Getting started with OpenQuok for contributors and self-hosted social scheduler instances — architecture, quick start, and default env patterns.
order: 0
lastUpdated: 2026-07-16
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

## Self-hosted defaults

<Callout type="tip" title="Email without a provider">
<p>Set <Badge text="EMAIL_ENABLED" variant="envBackend" />{' '}<code>=false</code> — no outbound mail; signup marks users verified.</p>
<p>Details: <a href="/docs/configuration-backend/resend">Resend / email setup</a>.</p>
</Callout>

<Callout type="tip" title="Billing without Stripe">
<p>Leave <Badge text="STRIPE_PUBLISHABLE_KEY" variant="envBackend" /> unset — <code>billingEnabled</code> is false, plan guards skip, and the first-billing paywall does not show.</p>
<p>Details: <a href="/docs/configuration-backend/stripe">Stripe billing</a>.</p>
</Callout>

## Related Section(s)

<CardGrid>
<LinkCard title="Installation" description="Deploy and set up OpenQuok" href="/docs/installation" />
</CardGrid>
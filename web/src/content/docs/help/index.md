---
title: Help and support
description: How to get help with OpenQuok, what support to expect on Cloud vs self-host, and what to include when you contact us.
order: 0
lastUpdated: 2026-09-23
sidebar:
  label: Get Helped
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, TabItem, Tabs } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Help and support

> Where you go for answers and what we can realistically offer. It depends on whether you use **OpenQuok Cloud** or **self-host** OpenQuok on your own infrastructure.

The contact paths are not the same, and neither are the commitments behind them.

Most questions are already covered in the docs below. When you need a person, pick the tab that matches your setup in **Talk to us**.

## Check the docs first

<CardGrid>
<LinkCard title="Troubleshooting" description="Connect errors, uploads, login, failed posts, known issues" href="/docs/troubleshooting" />
<LinkCard title="Platforms" description="Rules when a network rejects a post" href="/docs/platforms" />
<LinkCard title="Installation" description="Self-host setup, CORS, Redis, and workers" href="/docs/installation" />
<LinkCard title="OpenQuok Cloud" description="Hosted vs self-host, plans, trial, and billing" href="/docs/cloud" />
</CardGrid>

## Talk to us

<Tabs items={["OpenQuok Cloud", "Self-hosted"]} variant="line">
<TabItem label="OpenQuok Cloud">

<p><strong>Product and scheduling questions</strong> — start with <a href="/docs/getting-started/quickstart">Quickstart</a> and <a href="/docs/troubleshooting">Troubleshooting</a>.</p>

<p><strong>Billing and invoices</strong> — workspace owners use <a href="/account/billing">Billing</a> and the Stripe customer portal first.</p>

<p><strong>Discord</strong> — <DocsExternalLink href="https://discord.gg/wXgWcYzU4">OpenQuok Discord</DocsExternalLink> for fast questions and screenshots. Do not paste API keys or OAuth secrets there.</p>

<p><strong>Email</strong> — <a href="mailto:admin@openquok.com">admin@openquok.com</a> for billing, refunds, or anything you should not post publicly. Company contact details are on <a href="/about">About</a>.</p>

</TabItem>
<TabItem label="Self-hosted">

<p>Self-hosted OpenQuok is mainly supported by the <strong>community</strong> on <DocsExternalLink href="https://discord.gg/wXgWcYzU4">Discord</DocsExternalLink>. There is no guaranteed response time.</p>

<p>For a durable bug report, open an issue on <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/issues">GitHub</DocsExternalLink> with reproduction steps, OpenQuok version or commit, and how you deploy (Docker Compose, Vercel, Railway, and so on).</p>

<Callout type="note">
<p>If you need support you can rely on, <a href="/docs/cloud">OpenQuok Cloud</a> is the hosted product with billing and account help through email.</p>
</Callout>

</TabItem>
</Tabs>

<Callout type="warning">
<p>Never share programmatic tokens (<Badge text="opo_" variant="default" /> API keys), Stripe secret keys, or social provider app secrets in Discord or GitHub. Send those only through private email when support asks.</p>
</Callout>

## How to ask so we can help

Use this order: **goal, environment, changes, result.**

### Goal

What were you trying to do? Example: schedule a LinkedIn post for 6pm, or connect TikTok after a server upgrade.

### Environment

- Cloud or self-hosted? If self-hosted, how did you install and which version?
- Browser and operating system when the problem is in the UI.

### Changes

What changed just before it broke? An upgrade, new env var, plan change, or new browser extension.

### Result

What happened and what did you expected? Paste the **exact** error text from a toast, failed post tooltip, or API response. Screenshots help for UI issues.

Failed post messages often come from the social network, not from OpenQuok — the exact wording usually identifies the fix.

## Related

<CardGrid>
<LinkCard title="Troubleshooting overview" description="Step-by-step fixes for common errors" href="/docs/troubleshooting" />
<LinkCard title="Refunds and support" description="Cloud refund window and billing contact" href="/docs/billing/refunds-and-support" />
<LinkCard title="Quickstart" description="First channel and first scheduled post" href="/docs/getting-started/quickstart" />
</CardGrid>

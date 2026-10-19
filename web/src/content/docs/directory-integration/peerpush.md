---
title: PeerPush directory launch
description: PeerPush Standard launch and free queue from OpenQuok — profile fields, extension autofill, and submission tracking.
order: 1
lastUpdated: 2026-10-17
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

**PeerPush** (<DocsExternalLink href="https://peerpush.com">peerpush.com</DocsExternalLink>) is a product launch directory. OpenQuok supports **extension-assisted** submits: your business profile on <a href="/account/products">My Products</a> feeds the form on PeerPush. You review the page and click submit (or join the free queue) on PeerPush.

<Callout type="warning">
<p>OpenQuok does not charge PeerPush fees or publish for you. Paid Standard launch and free queue rules come from PeerPush. Confirm pricing on their site before you pay.</p>
</Callout>

## Launch variants in OpenQuok

| Variant | Typical start page | When to pick it |
| --- | --- | --- |
| **Standard launch** | Paid instant publish flow on peerpush.com | You want the paid listing path PeerPush documents for immediate placement |
| **Free queue** | Free queue submit flow | You are okay waiting in PeerPush’s free tier |

Each variant is a separate destination on your product profile. Readiness and submitted counts are tracked per variant. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.

## Profile fields to prepare

Before you click <Badge text="Launch to directory" variant="new" /> → PeerPush, fill the product profile with:

- **Name** and **tagline**
- **Description** (short pitch and longer body where the composer asks for both)
- **Website** URL
- **Logo** (and gallery images if the composer exposes them)
- **PeerPush discovery fields** — categories, tags, or other directory-specific inputs shown on the Products composer tabs

The readiness badge on the PeerPush card lists anything still missing. Fix gaps in the profile editor instead of retyping on peerpush.com.

## Launch workflow

<Steps
	howToName="Launch on PeerPush from OpenQuok"
	howToDescription="Install the extension, autofill from your business profile, submit on peerpush.com, and save the listing URL in My Products."
>

### Install the extension

Install the <a href="/docs/installation/chrome-extension">OpenQuok browser extension</a> in Chrome and pin it for directory autofill.

### Open your product profile

On <a href="/account/products">My Products</a>, select the business profile you want to launch.

### Start Standard launch or Free queue

Choose <strong>Standard launch</strong> or <strong>Free queue</strong> on the PeerPush destination card.

### Review and submit on PeerPush

Open the PeerPush tab from the extension. Confirm autofilled fields. Edit anything that needs a change. Click submit (or join the queue) on PeerPush.

### Mark complete and save the listing URL

Return to OpenQuok. Mark the launch complete and paste the live <strong>listing URL</strong> when PeerPush publishes your page.

</Steps>

## Editorial catalog and marketing pages

| Page | Use |
| --- | --- |
| <a href="/channels/peerpush">PeerPush on Channels</a> | Product positioning, FAQs, and trial CTA |
| <a href="/build-backlinks/peerpush">PeerPush on Build Backlinks</a> | Dofollow, cost notes, and bookmarking for outreach |

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Full launch workflow" href="/docs/directory-submission" />
<LinkCard title="Uneed integration" description="Join the line and paid launch on Uneed" href="/docs/directory-integration/uneed" />
<LinkCard title="Directory integration overview" description="Social vs directory channels" href="/docs/directory-integration" />
<LinkCard title="Business profiles" description="Products tab and channel grouping" href="/docs/channels/channel-groups" />
</CardGrid>

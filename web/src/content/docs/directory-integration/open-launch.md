---
title: Open Launch directory launch
description: Open Launch premium launch and free queue from OpenQuok — profile fields, tech stack, extension autofill, and submission tracking.
order: 3
lastUpdated: 2026-11-09
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
import {
	getPublicBrowserExtensionChromeStoreCtaHref,
	PUBLIC_BROWSER_EXTENSION_CHROME_STORE_DOCS_LINK_LABEL
} from '$lib/content/constants/landing/browser-extension-chrome-cta';

const chromeWebStoreHref = getPublicBrowserExtensionChromeStoreCtaHref();
const chromeWebStoreLinkLabel = PUBLIC_BROWSER_EXTENSION_CHROME_STORE_DOCS_LINK_LABEL;
</script>

## Overview

**Open Launch** (<DocsExternalLink href="https://open-launch.com">open-launch.com</DocsExternalLink>) is a product directory and launch platform. OpenQuok supports **extension-assisted** submits: your business profile on <a href="/account/products">My Products</a> feeds the multi-step wizard on Open Launch. You pick your launch date, review, and pay on Open Launch when you choose premium.

<Callout type="warning">
<p>OpenQuok does not charge Open Launch fees or publish for you. Premium slots and free-queue timing come from Open Launch. Confirm pricing on their site before you pay.</p>
</Callout>

## Launch variants in OpenQuok

| Variant | Typical start page | When to pick it |
| --- | --- | --- |
| **Premium launch** | Paid submit flow on open-launch.com | You want the timed premium slot Open Launch documents (paid launch, 8:00 AM UTC) |
| **Free queue** | Pricing / queue entry on open-launch.com | You are okay waiting in Open Launch’s free tier |

Each variant is a separate destination on your product profile. Readiness and submitted counts are tracked per variant. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.

## Profile fields to prepare

Before you click <Badge text="Launch to directory" variant="new" /> → Open Launch, fill the product profile with:

- **Name** and **website** URL
- **Short description** (rich HTML where the composer exposes it)
- **Logo** and optional **product image** in the gallery
- **Categories** (up to three) and **tech stack** (up to five tags)
- **Platforms**, **pricing model**, and optional **GitHub** / **X** links on discovery tabs

The readiness badge on the Open Launch card lists anything still missing. Fix gaps in the profile editor instead of retyping on open-launch.com.

## Launch workflow

<Steps
	howToName="Launch on Open Launch from OpenQuok"
	howToDescription="Install the extension, autofill from your business profile, complete the wizard on open-launch.com, and save the listing URL in My Products."
>

### Install the extension

Install from the  <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink>  listing in Chrome (or follow <a href="/docs/installation/chrome-extension">Browser extension</a> for source builds) and pin the OpenQuok extension for directory autofill.

### Open your product profile

On <a href="/account/products">My Products</a>, select the business profile you want to launch.

### Start Premium launch or Free queue

Choose <strong>Premium launch</strong> or <strong>Free queue</strong> on the Open Launch destination card.

### Sign in on Open Launch when prompted

Open Launch uses Google or GitHub sign-in on the submit path. Sign in on open-launch.com before you rely on autofill.

### Review Project Info and Details

Open the Open Launch tab from the extension. Confirm autofilled fields on the first wizard steps. Edit anything that needs a change.

### Complete launch date, review, and submit

Pick your slot, confirm the listing, and submit (or join the free queue) on Open Launch.

### Mark complete and save the listing URL

Return to OpenQuok. Mark the launch complete and paste the live <strong>listing URL</strong> when Open Launch publishes your page.

</Steps>

## Editorial catalog and marketing pages

| Page | Use |
| --- | --- |
| <a href="/channels/open-launch">Open Launch on Channels</a> | Product positioning, FAQs, and trial CTA |
| <a href="/build-backlinks/open-launch">Open Launch on Build Backlinks</a> | Dofollow, cost notes, and bookmarking for outreach |

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Full launch workflow" href="/docs/directory-submission" />
<LinkCard title="PeerPush integration" description="Standard launch and free queue" href="/docs/directory-integration/peerpush" />
<LinkCard title="Uneed integration" description="Join the line, paid launch, and maker profile" href="/docs/directory-integration/uneed" />
<LinkCard title="Directory integration overview" description="Social vs directory channels" href="/docs/directory-integration" />
<LinkCard title="Open Launch CLI examples" description="directory:* recipes before you hand off to the extension" href="/docs/cli-examples/open-launch" />
<LinkCard title="Business profiles" description="Products tab and channel grouping" href="/docs/channels/channel-groups" />
</CardGrid>

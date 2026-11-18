---
title: TinyLaunch directory launch
description: TinyLaunch Standard and Premium launch from OpenQuok — profile fields, category autofill, extension handoff, and submission tracking.
order: 4
lastUpdated: 2026-11-17
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

**TinyLaunch** (<DocsExternalLink href="https://www.tinylaunch.com">tinylaunch.com</DocsExternalLink>) is a startup directory and launch calendar. OpenQuok supports **extension-assisted** submits: your business profile on <a href="/account/products">My Products</a> feeds the create-startup form on TinyLaunch. You sign in, review autofilled fields, complete payment or queue steps on TinyLaunch, and submit the listing yourself.

<Callout type="warning">
<p>OpenQuok does not charge TinyLaunch fees or publish for you. Premium slots and Standard queue timing come from TinyLaunch. Confirm pricing on their site before you pay.</p>
</Callout>

## Launch variants in OpenQuok

| Variant | Typical start page | When to pick it |
| --- | --- | --- |
| **Premium launch** | Create startup form at tinylaunch.com/dashboard/startups/new | You want the paid Premium slot TinyLaunch documents on its pricing page |
| **Standard launch** | Pricing page at tinylaunch.com/pricing | You are okay with the free Standard queue after you compare tiers |

Each variant is a separate destination on your product profile. Readiness and submitted counts are tracked per variant. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.

## Profile fields to prepare

Before you click <Badge text="Launch to directory" variant="new" /> → TinyLaunch, fill the product profile with:

- **Name** (up to 30 characters) and **tagline** (up to 60 characters)
- **Logo** and up to **three gallery images**
- **Website** URL
- **Description** (rich HTML where the composer exposes it)
- **Category** — TinyLaunch category from the Discovery tab (`profile_data.category`)

The readiness badge on the TinyLaunch card lists anything still missing. Fix gaps in the profile editor instead of retyping on tinylaunch.com.

<Callout type="note">
<p>The <strong>upvote pledge</strong> on TinyLaunch’s create form is manual — OpenQuok does not autofill pledge or payment fields.</p>
</Callout>

## Launch workflow

<Steps
	howToName="Launch on TinyLaunch from OpenQuok"
	howToDescription="Install the extension, autofill from your business profile, complete pricing or queue steps on tinylaunch.com, and save the listing URL in My Products."
>

### Install the extension

Install from the <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink> listing in Chrome (or follow <a href="/docs/installation/chrome-extension">Browser extension</a> for source builds) and pin the OpenQuok extension for directory autofill.

### Open your product profile

On <a href="/account/products">My Products</a>, select the business profile you want to launch.

### Start Premium launch or Standard launch

Choose <strong>Premium launch</strong> or <strong>Standard launch</strong> on the TinyLaunch destination card.

### Sign in on TinyLaunch when prompted

TinyLaunch uses account sign-in on the create-startup path. Sign in on tinylaunch.com before you rely on autofill.

### Review the create-startup form

Open the TinyLaunch tab from the extension. Confirm autofilled name, tagline, logo, gallery, website, description, and category.

### Complete pricing, queue, and submit

For Premium, finish payment and scheduling on TinyLaunch. For Standard, follow the queue flow from the pricing page, then submit when your slot is ready.

### Mark complete and save the listing URL

Return to OpenQuok. Mark the launch complete and paste the live <strong>listing URL</strong> when TinyLaunch publishes your startup page.

</Steps>

## Editorial catalog and marketing pages

| Page | Use |
| --- | --- |
| <a href="/channels/tinylaunch">TinyLaunch on Channels</a> | Product positioning, FAQs, and trial CTA |
| <a href="/build-backlinks/tinylaunch">TinyLaunch on Build Backlinks</a> | Dofollow, cost notes, and bookmarking for outreach |

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Full launch workflow" href="/docs/directory-submission" />
<LinkCard title="Open Launch integration" description="Premium launch and free queue" href="/docs/directory-integration/open-launch" />
<LinkCard title="PeerPush integration" description="Standard launch and free queue" href="/docs/directory-integration/peerpush" />
<LinkCard title="Uneed integration" description="Join the line, paid launch, and maker profile" href="/docs/directory-integration/uneed" />
<LinkCard title="Directory integration overview" description="Social vs directory channels" href="/docs/directory-integration" />
<LinkCard title="Directory launch CLI" description="Profiles, variants, and readiness before extension handoff" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Business profiles" description="Products tab and channel grouping" href="/docs/channels/channel-groups" />
</CardGrid>
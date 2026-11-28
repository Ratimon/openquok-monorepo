---
title: StartupInspire directory launch
description: StartupInspire free listing and Starter launch from OpenQuok — profile fields, extension handoff, dofollow checks, and submission tracking.
order: 11
lastUpdated: 2026-11-26
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

**StartupInspire** (<DocsExternalLink href="https://www.startupinspire.com">startupinspire.com</DocsExternalLink>) is a startup directory and launch platform. OpenQuok supports **extension-assisted** submits: your business profile on <a href="/account/products">My Products</a> feeds the dashboard startup create form on StartupInspire. You sign in, review autofilled fields, complete free-tier review or Starter checkout on StartupInspire, and submit the listing yourself.

<Callout type="warning">
<p>OpenQuok does not charge StartupInspire fees or publish for you. Starter checkout and free-tier approval timing come from StartupInspire. Confirm pricing on their site before you pay.</p>
</Callout>

<Callout type="note">
<p>After publish, confirm the <strong>website</strong> button on your public startup page under <code>startupinspire.com/startup/</code>. OpenQuok documents both free and Starter opportunities as dofollow on <a href="/build-backlinks/startupinspire">Build backlinks</a> — verify <code>rel</code> on the live page.</p>
</Callout>

## Launch variants in OpenQuok

| Variant | Typical start page | When to pick it |
| --- | --- | --- |
| **Free listing** | <DocsExternalLink href="https://www.startupinspire.com/pricing">startupinspire.com/pricing</DocsExternalLink> | You want the free tier and can wait for manual review (typically a few business days) |
| **Starter launch** | <DocsExternalLink href="https://www.startupinspire.com/dashboard/startup/create">startupinspire.com/dashboard/startup/create</DocsExternalLink> | You want the paid Starter tier with instant approval after checkout |

Each variant is a separate destination on your product profile. Readiness and submitted counts are tracked per variant. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.

## Profile fields to prepare

Before you click <Badge text="Launch to directory" variant="new" /> → StartupInspire, fill the product profile with:

- **Name** (startup name)
- **Tagline** (headline on the create form)
- **Description** (rich HTML where the composer exposes it)
- **Website** URL
- **Logo**
- **Tech stack** — map to StartupInspire Technology Stack from the Discovery tab (`profile_data.tech_stack`, up to 10 on the form)
- **Screenshots** — add gallery images on the Media tab (`profile_data.gallery_urls`); logo alone is not used for screenshots

The readiness badge on the StartupInspire card lists anything still missing. Fix gaps in the profile editor instead of retyping on startupinspire.com.

<Callout type="note">
<p><strong>Social links</strong> (LinkedIn, X, Product Hunt, and similar), <strong>launch status</strong>, reCAPTCHA, and final publish stay manual on StartupInspire — OpenQuok does not autofill those fields in v1.</p>
</Callout>

## Launch workflow

<Steps
	howToName="Launch on StartupInspire from OpenQuok"
	howToDescription="Install the extension, autofill from your business profile, complete pricing or Starter checkout on startupinspire.com, and save the listing URL in My Products."
>

### Install the extension

Install from the <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink> listing in Chrome (or follow <a href="/docs/installation/chrome-extension">Browser extension</a> for source builds) and pin the OpenQuok extension for directory autofill.

### Open your product profile

On <a href="/account/products">My Products</a>, select the business profile you want to launch.

### Start free listing or Starter launch

Choose <strong>Free listing</strong> or <strong>Starter launch</strong> on the StartupInspire destination card.

### Sign in on StartupInspire when prompted

StartupInspire uses account sign-in on the dashboard and pricing paths. Sign in on startupinspire.com before you rely on autofill.

### Review the create or edit form

Open the StartupInspire tab from the extension. Confirm autofilled name, headline, description, website, logo, and technology or category.

### Complete pricing, checkout, and submit

For free listing, follow the tier on the pricing page, then open the create form when StartupInspire allows. For Starter, pay on StartupInspire, then submit when the form is ready.

### Mark complete and save the listing URL

Return to OpenQuok. Mark the launch complete and paste the live <strong>listing URL</strong> (typically under <code>startupinspire.com/startup/</code>).

</Steps>

## Editorial catalog and marketing pages

| Page | Use |
| --- | --- |
| <a href="/channels/startupinspire">StartupInspire on Channels</a> | Product positioning, FAQs, and trial CTA |
| <a href="/build-backlinks/startupinspire">StartupInspire on Build Backlinks</a> | Dofollow, cost notes, and bookmarking for outreach |

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Full launch workflow" href="/docs/directory-submission" />
<LinkCard title="TinyLaunch integration" description="Premium and Standard create-startup autofill" href="/docs/directory-integration/tinylaunch" />
<LinkCard title="Open Launch integration" description="Premium launch and free queue" href="/docs/directory-integration/open-launch" />
<LinkCard title="DevHunt integration" description="Free listing and paid launch week" href="/docs/directory-integration/devhunt" />
<LinkCard title="Directory integration overview" description="Social vs directory channels" href="/docs/directory-integration" />
<LinkCard title="Directory launch CLI" description="Profiles, variants, and readiness before extension handoff" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Business profiles" description="Products tab and channel grouping" href="/docs/channels/channel-groups" />
</CardGrid>
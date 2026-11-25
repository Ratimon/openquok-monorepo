---
title: Nick Launches directory launch
description: Nick Launches free launch, paid launch, and maker profile from OpenQuok — product profile fields, extension autofill, and submission tracking.
order: 7
lastUpdated: 2026-11-25
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

**Nick Launches** (<DocsExternalLink href="https://nicklaunches.com">nicklaunches.com</DocsExternalLink>) is a product launch directory. OpenQuok supports **extension-assisted** submits: your business profile on <a href="/account/products">My Products</a> feeds the listing form and maker profile on Nick Launches. You sign in, review autofilled fields, choose a free or paid path on Nick Launches, and submit yourself.

<Callout type="warning">
<p>Admin review applies on every listing. OpenQuok does not charge Nick Launches fees or publish for you. Confirm plan pricing, badge rules, and dofollow terms on Nick Launches before you pay.</p>
</Callout>

## Launch variants in OpenQuok

| Variant | Typical start page | When to pick it |
| --- | --- | --- |
| **Free launch** | New listing at <DocsExternalLink href="https://nicklaunches.com/submit/new/">nicklaunches.com/submit/new/</DocsExternalLink> | You want a freemium listing with weekly upvotes and a live <DocsExternalLink href="https://nicklaunches.com/badge/">Featured badge</DocsExternalLink> for dofollow |
| **Paid launch** | Same listing form | You want a paid tier ($19, $39, $99, or $199 one-time) with featured placement; badge may be optional for dofollow |
| **Maker profile** | <DocsExternalLink href="https://nicklaunches.com/profile/">nicklaunches.com/profile/</DocsExternalLink> | You want a maker page separate from a product listing |

Each variant is a separate destination on your product profile. Readiness and submitted counts are tracked per variant. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.

## Profile fields to prepare

Before you click <Badge text="Launch to directory" variant="new" /> → Nick Launches, fill the product profile with:

- **Name** and **tagline**
- **Logo** and up to **five gallery screenshots**
- **Website** URL
- **Description** (rich HTML where the composer exposes it)
- Up to **three categories** and **pricing type** on discovery tabs
- Optional **open source** flag, **X** handle, and **launch video** URL

The readiness badge on the Nick Launches card lists anything still missing. Fix gaps in the profile editor instead of retyping on nicklaunches.com.

<Callout type="note">
<p>Nick Launches may <strong>prefill a draft</strong> from your website URL on the submit flow. Skip or review that draft, then use OpenQuok when the main listing form is visible.</p>
</Callout>

<Callout type="note">
<p><strong>Target keyword</strong>, <strong>discount</strong>, <strong>first comment</strong>, <strong>launch date</strong>, and <strong>slug</strong> on the listing form stay manual. <strong>Plan selection</strong> on <DocsExternalLink href="https://nicklaunches.com/submit/plan/">/submit/plan/</DocsExternalLink> stays manual after you submit the listing form.</p>
</Callout>

## Launch workflow

<Steps
	howToName="Launch on Nick Launches from OpenQuok"
	howToDescription="Install the extension, autofill from your business profile, complete the listing or profile on nicklaunches.com, and save the listing URL in My Products."
>

### Install the extension

Install from the <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink> listing in Chrome (or follow <a href="/docs/installation/chrome-extension">Browser extension</a> for source builds) and pin the OpenQuok extension for directory autofill.

### Open your product profile

On <a href="/account/products">My Products</a>, select the business profile you want to launch.

### Start Free launch, Paid launch, or Maker profile

Choose the Nick Launches destination that matches your path on the destination card.

### Sign in on Nick Launches when prompted

Sign in at <DocsExternalLink href="https://nicklaunches.com/signin/">nicklaunches.com/signin/</DocsExternalLink> before you rely on autofill.

### Open the listing or profile form

The handoff opens <DocsExternalLink href="https://nicklaunches.com/submit/new/">/submit/new/</DocsExternalLink> for listing variants or <DocsExternalLink href="https://nicklaunches.com/profile/">/profile/</DocsExternalLink> for maker profile when you are signed in.

### Review autofilled fields

Open the Nick Launches tab from the extension. Confirm autofilled name, tagline, logo, screenshots, website, description, categories, pricing type, and optional social and video fields.

### Complete plan selection and submit

For listings, submit the form on Nick Launches, then pick a plan on the site if you chose paid launch. For maker profile, save the profile on Nick Launches. Admin review applies before the listing goes live.

### Mark complete and save the listing URL

Return to OpenQuok. Mark the launch complete and paste the live <strong>listing URL</strong> when Nick Launches publishes your page.

</Steps>

## Editorial catalog and marketing pages

| Page | Use |
| --- | --- |
| <a href="/channels/nick-launches">Nick Launches on Channels</a> | Product positioning, FAQs, and trial CTA |
| <a href="/build-backlinks/nick-launches">Nick Launches on Build Backlinks</a> | Dofollow, cost notes, and bookmarking for outreach |

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Full launch workflow" href="/docs/directory-submission" />
<LinkCard title="DevHunt integration" description="Developer tool free listing and paid launch" href="/docs/directory-integration/devhunt" />
<LinkCard title="Uneed integration" description="Join the line, paid launch, and maker profile" href="/docs/directory-integration/uneed" />
<LinkCard title="Fazier integration" description="Company page and product listing" href="/docs/directory-integration/fazier" />
<LinkCard title="Directory integration overview" description="Social vs directory channels" href="/docs/directory-integration" />
<LinkCard title="Directory launch CLI" description="Profiles, variants, and readiness before extension handoff" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Business profiles" description="Products tab and channel grouping" href="/docs/channels/channel-groups" />
</CardGrid>
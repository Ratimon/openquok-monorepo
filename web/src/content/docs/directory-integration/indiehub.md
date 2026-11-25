---
title: IndieHub directory launch
description: IndieHub Basic and Pro listings from OpenQuok — product profile fields, extension autofill on submit step 1, and submission tracking.
order: 8
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

**IndieHub** (<DocsExternalLink href="https://indiehub.best">indiehub.best</DocsExternalLink>) is an indie product directory. OpenQuok supports **extension-assisted** submits: your business profile on <a href="/account/products">My Products</a> feeds step 1 (Details) on the submit wizard. You sign in, review autofilled fields, pay on IndieHub, and publish yourself.

<Callout type="warning">
<p>IndieHub has no free listing tier. OpenQuok does not charge IndieHub fees or publish for you. Confirm Basic vs Pro pricing and dofollow rules on <DocsExternalLink href="https://indiehub.best/pricing">indiehub.best/pricing</DocsExternalLink> before you pay.</p>
</Callout>

## Launch variants in OpenQuok

| Variant | Typical start page | When to pick it |
| --- | --- | --- |
| **Basic launch** | <DocsExternalLink href="https://indiehub.best/submit">indiehub.best/submit</DocsExternalLink> step 1 | You want a Basic listing ($4.9) with dofollow on IndieHub |
| **Pro launch** | Same submit wizard | You want a Pro listing ($9.9) with stronger placement on IndieHub |

Each variant is a separate destination on your product profile. Readiness and submitted counts are tracked per variant. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.

## Profile fields to prepare

Before you click <Badge text="Launch to directory" variant="new" /> → IndieHub, fill the product profile with:

- **Name** and **tagline** (IndieHub uses tagline as the short Description field)
- **Description** (long Introduction — markdown on IndieHub)
- **Logo** (square Icon, 1:1, max 1 MB on the site)
- **One cover image** in gallery (16:9 banner — OpenQuok uses the first gallery image only)
- **Website** URL
- **Categories** and **tags** on discovery tabs

The readiness badge on the IndieHub card lists anything still missing. Fix gaps in the profile editor instead of retyping on indiehub.best.

<Callout type="note">
<p>IndieHub may offer <strong>AI AutoFill</strong> from your website link on the Details step. Skip or review that draft, then use OpenQuok when the main form is visible.</p>
</Callout>

<Callout type="note">
<p><strong>Payment</strong> (step 2) and <strong>Publish</strong> (step 3) stay manual. OpenQuok does not autofill Stripe checkout or the final publish action.</p>
</Callout>

## Launch workflow

<Steps
	howToName="Launch on IndieHub from OpenQuok"
	howToDescription="Install the extension, autofill from your business profile, complete payment and publish on indiehub.best, and save the listing URL in My Products."
>

### Install the extension

Install from the <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink> listing in Chrome (or follow <a href="/docs/installation/chrome-extension">Browser extension</a> for source builds) and pin the OpenQuok extension for directory autofill.

### Open your product profile

On <a href="/account/products">My Products</a>, select the business profile you want to launch.

### Start Basic launch or Pro launch

Choose the IndieHub destination that matches the tier you plan to buy on the site.

### Sign in on IndieHub when prompted

Sign in at <DocsExternalLink href="https://indiehub.best/auth/login">indiehub.best/auth/login</DocsExternalLink> (GitHub, Google, or email) before you rely on autofill.

### Open submit step 1 Details

The handoff opens <DocsExternalLink href="https://indiehub.best/submit">indiehub.best/submit</DocsExternalLink> when you are signed in.

### Review autofilled fields

Open the IndieHub tab from the extension. Confirm autofilled link, name, categories, tags, short description, introduction, icon, and cover image.

### Pay and publish on IndieHub

On step 2, choose Basic or Pro and complete payment on IndieHub. On step 3, publish the listing.

### Mark complete and save the listing URL

Return to OpenQuok. Mark the launch complete and paste the live <strong>listing URL</strong> when IndieHub publishes your product page.

</Steps>

## Editorial catalog and marketing pages

| Page | Use |
| --- | --- |
| <a href="/channels/indiehub">IndieHub on Channels</a> | Product positioning, FAQs, and trial CTA |
| <a href="/build-backlinks/indiehub">IndieHub on Build Backlinks</a> | Dofollow, cost notes, and bookmarking for outreach |

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Full launch workflow" href="/docs/directory-submission" />
<LinkCard title="Nick Launches integration" description="Free, paid, and maker profile autofill" href="/docs/directory-integration/nick-launches" />
<LinkCard title="DevHunt integration" description="Developer tool free listing and paid launch" href="/docs/directory-integration/devhunt" />
<LinkCard title="TinyLaunch integration" description="Premium and Standard create-startup autofill" href="/docs/directory-integration/tinylaunch" />
<LinkCard title="Directory integration overview" description="Social vs directory channels" href="/docs/directory-integration" />
<LinkCard title="Directory launch CLI" description="Profiles, variants, and readiness before extension handoff" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Business profiles" description="Products tab and channel grouping" href="/docs/channels/channel-groups" />
</CardGrid>
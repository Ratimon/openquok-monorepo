---
title: DevHunt directory launch
description: DevHunt free listing and paid launch week from OpenQuok — developer-tool profile fields, extension autofill, and submission tracking.
order: 6
lastUpdated: 2026-11-23
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

**DevHunt** (<DocsExternalLink href="https://devhunt.org">devhunt.org</DocsExternalLink>) is a launch directory for developer tools. OpenQuok supports **extension-assisted** submits: your business profile on <a href="/account/products">My Products</a> feeds the new-tool form on DevHunt. You sign in, review autofilled fields, choose free listing or paid launch on DevHunt, and submit yourself.

<Callout type="warning">
<p>DevHunt is for <strong>developer tools</strong> only. Listings that are not APIs, SDKs, libraries, or similar tools may be removed. OpenQuok does not charge DevHunt fees or publish for you. Confirm pricing and link rules on DevHunt before you pay.</p>
</Callout>

## Launch variants in OpenQuok

| Variant | Typical start page | When to pick it |
| --- | --- | --- |
| **Free listing** | New-tool form at <DocsExternalLink href="https://devhunt.org/account/tools/new">devhunt.org/account/tools/new</DocsExternalLink> | You want a permanent tool page at no listing fee (nofollow link to your site) |
| **Paid launch** | Same new-tool form | You want a $49 launch week with a dofollow link, homepage placement, and newsletter exposure |

Each variant is a separate destination on your product profile. Readiness and submitted counts are tracked per variant. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.

## Profile fields to prepare

Before you click <Badge text="Launch to directory" variant="new" /> → DevHunt, fill the product profile with:

- **Name** and **tagline** (DevHunt labels them tool name and catchy slogan)
- **Logo** and up to **three gallery images** (DevHunt requires at least three screenshots)
- **Website** URL
- **Description** (rich HTML where the composer exposes it)
- Optional **GitHub** repo, **pricing model**, **categories**, and **launch video** URL on discovery tabs

The readiness badge on the DevHunt card lists anything still missing. Fix gaps in the profile editor instead of retyping on devhunt.org.

<Callout type="note">
<p>DevHunt may offer an <strong>AI draft</strong> from your website URL on the first screen. Skip or review that draft, then use OpenQuok when the main tool form is visible.</p>
</Callout>

<Callout type="note">
<p><strong>Maker comment</strong>, <strong>launch week</strong>, <strong>$49 checkout</strong>, and <strong>maker name</strong> on DevHunt stay manual. After you submit, verify pricing radios on the live form — DevHunt has had markup quirks on pricing type labels.</p>
</Callout>

## Launch workflow

<Steps
	howToName="Launch on DevHunt from OpenQuok"
	howToDescription="Install the extension, autofill from your business profile, complete listing or paid launch on devhunt.org, and save the listing URL in My Products."
>

### Install the extension

Install from the <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink> listing in Chrome (or follow <a href="/docs/installation/chrome-extension">Browser extension</a> for source builds) and pin the OpenQuok extension for directory autofill.

### Open your product profile

On <a href="/account/products">My Products</a>, select the business profile you want to launch.

### Start Free listing or Paid launch

Choose <strong>Free listing</strong> or <strong>Paid launch</strong> on the DevHunt destination card.

### Sign in on DevHunt when prompted

DevHunt uses GitHub, Google, or email sign-in. Sign in at <DocsExternalLink href="https://devhunt.org/login">devhunt.org/login</DocsExternalLink> before you rely on autofill.

### Open the new-tool form

The handoff opens <DocsExternalLink href="https://devhunt.org/account/tools/new">devhunt.org/account/tools/new</DocsExternalLink> when you are signed in.

### Review autofilled fields

Open the DevHunt tab from the extension. Confirm autofilled name, tagline, logo, screenshots, website, description, and optional GitHub, pricing, categories, and demo video.

### Complete listing or checkout and submit

Submit a free listing on the form, or pay $49 on DevHunt and pick a launch week when you chose the paid path. Submit the listing on DevHunt.

### Mark complete and save the listing URL

Return to OpenQuok. Mark the launch complete and paste the live <strong>listing URL</strong> when DevHunt publishes your tool page (typically under <code>devhunt.org/tool/</code>).

</Steps>

## Editorial catalog and marketing pages

| Page | Use |
| --- | --- |
| <a href="/channels/devhunt">DevHunt on Channels</a> | Product positioning, FAQs, and trial CTA |
| <a href="/build-backlinks/devhunt">DevHunt on Build Backlinks</a> | Dofollow, cost notes, and bookmarking for outreach |

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Full launch workflow" href="/docs/directory-submission" />
<LinkCard title="TinyLaunch integration" description="Premium and Standard create-startup autofill" href="/docs/directory-integration/tinylaunch" />
<LinkCard title="Open Launch integration" description="Premium launch and free queue" href="/docs/directory-integration/open-launch" />
<LinkCard title="Fazier integration" description="Company page and product listing" href="/docs/directory-integration/fazier" />
<LinkCard title="Directory integration overview" description="Social vs directory channels" href="/docs/directory-integration" />
<LinkCard title="Directory launch CLI" description="Profiles, variants, and readiness before extension handoff" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Business profiles" description="Products tab and channel grouping" href="/docs/channels/channel-groups" />
</CardGrid>
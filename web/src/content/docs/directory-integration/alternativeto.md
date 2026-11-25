---
title: AlternativeTo directory launch
description: AlternativeTo free listing, paid review tiers, and user profile from OpenQuok — profile fields, extension autofill on manage-item, and submission tracking.
order: 9
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

**AlternativeTo** (<DocsExternalLink href="https://alternativeto.net">alternativeto.net</DocsExternalLink>) is a software alternatives directory. OpenQuok supports **extension-assisted** submits: your business profile on <a href="/account/products">My Products</a> feeds the manage-item listing form and the user profile editor on AlternativeTo. You sign in with a verified email, review autofilled fields, submit on AlternativeTo, and track progress yourself.

<Callout type="warning">
<p>Listings are <strong>English-only</strong> and go through manual review. OpenQuok does not charge AlternativeTo fees or publish for you. Dofollow on your official website link applies only after AlternativeTo approves and publishes the app page — confirm rules on alternativeto.net before you expect a live backlink.</p>
</Callout>

## Launch variants in OpenQuok

| Variant | Typical start page | When to pick it |
| --- | --- | --- |
| **Free listing** | <DocsExternalLink href="https://alternativeto.net/manage-item/">alternativeto.net/manage-item/</DocsExternalLink> | You want the free review queue after you submit the listing form |
| **Priority review** | Same manage-item form | You plan to pay $15 on AlternativeTo after submit for faster review (checkout stays on the site) |
| **We finish it** | Same manage-item form | You plan to pay $29 on AlternativeTo after submit so their team completes remaining fields |
| **User profile** | <DocsExternalLink href="https://alternativeto.net/user/edit/">alternativeto.net/user/edit/</DocsExternalLink> | You want maker social handles updated (separate from a product listing) |

Free listing, Priority review, and We finish it share the same form; only status copy in OpenQuok differs. Each variant is a separate destination on your product profile. Readiness and submitted counts are tracked per variant. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.

## Profile fields to prepare

Before you click <Badge text="Launch to directory" variant="new" /> → AlternativeTo, fill the product profile with:

- **Name** and **tagline** (short description on AlternativeTo)
- **Description** (full description — avoid promotional links per AlternativeTo FAQ)
- **Website** URL
- **Tags** plus **categories**, **use cases**, or **platforms** on discovery tabs (OpenQuok can merge these into tags)
- **Platforms** your product supports (web apps should usually map to Online and/or SaaS only)
- **Logo** (application icon; AlternativeTo recommends at least 280px)
- Up to **five gallery screenshots**
- **Pricing type** and optional **open source** flag for license radios
- For **user profile**: social **X**, **GitHub**, **Instagram**, and **YouTube** as handles; **LinkedIn** as a full profile URL

The readiness badge on the AlternativeTo card lists anything still missing. Fix gaps in the profile editor instead of retyping on alternativeto.net.

<Callout type="note">
<p><strong>Company / Author</strong> autofills from your product <strong>name</strong>. Change it on the live form when your legal entity differs from the product name.</p>
</Callout>

<Callout type="note">
<p><strong>Features</strong>, <strong>supported languages</strong>, suggest-as-alternative flows, post-submit <strong>Stripe upsell</strong> (Priority $15 or Finish $29), and the final <strong>Submit</strong> action stay manual. Track status on <DocsExternalLink href="https://alternativeto.net/my-submissions/">my-submissions</DocsExternalLink>. <strong>Reddit</strong> on user profile is not mapped in OpenQuok v1 — add it manually if needed.</p>
</Callout>

## Launch workflow

<Steps
	howToName="Launch on AlternativeTo from OpenQuok"
	howToDescription="Install the extension, autofill from your business profile, submit on alternativeto.net, and save the listing URL in My Products."
>

### Install the extension

Install from the <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink> listing in Chrome (or follow <a href="/docs/installation/chrome-extension">Browser extension</a> for source builds) and pin the OpenQuok extension for directory autofill.

### Open your product profile

On <a href="/account/products">My Products</a>, select the business profile you want to launch.

### Start a listing variant or user profile

Choose Free listing, Priority review, We finish it, or User profile on the AlternativeTo destination card.

### Sign in on AlternativeTo when prompted

Verify your email on AlternativeTo, then sign in at <DocsExternalLink href="https://alternativeto.net/login/">alternativeto.net/login/</DocsExternalLink> (Google, GitHub, Apple, or email) before you rely on autofill.

### Open manage-item or user edit

The handoff opens <DocsExternalLink href="https://alternativeto.net/manage-item/">manage-item</DocsExternalLink> for listing variants or <DocsExternalLink href="https://alternativeto.net/user/edit/">user/edit</DocsExternalLink> for profile when you are signed in.

### Review autofilled fields

Open the AlternativeTo tab from the extension. Confirm autofilled name, descriptions, website, tags, platforms, author, license, icon, screenshots, and profile socials.

### Submit and complete upsell on AlternativeTo

Submit the listing application on AlternativeTo. Skip paid upsell for the free path, or pay Priority review or We finish it on the site when that matches the destination you chose in OpenQuok.

### Mark complete and save the listing URL

Return to OpenQuok. Mark the launch complete and paste the live <strong>listing URL</strong> when AlternativeTo publishes your software page (typically under <code>alternativeto.net/software/</code>).

</Steps>

## Editorial catalog and marketing pages

| Page | Use |
| --- | --- |
| <a href="/channels/alternativeto">AlternativeTo on Channels</a> | Product positioning, FAQs, and trial CTA |
| <a href="/build-backlinks/alternativeto">AlternativeTo on Build Backlinks</a> | Dofollow, cost notes, and bookmarking for outreach |

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Full launch workflow" href="/docs/directory-submission" />
<LinkCard title="IndieHub integration" description="Basic and Pro paid listings" href="/docs/directory-integration/indiehub" />
<LinkCard title="Nick Launches integration" description="Free, paid, and maker profile autofill" href="/docs/directory-integration/nick-launches" />
<LinkCard title="DevHunt integration" description="Developer tool free listing and paid launch" href="/docs/directory-integration/devhunt" />
<LinkCard title="Directory integration overview" description="Social vs directory channels" href="/docs/directory-integration" />
<LinkCard title="Directory launch CLI" description="Profiles, variants, and readiness before extension handoff" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Business profiles" description="Products tab and channel grouping" href="/docs/channels/channel-groups" />
</CardGrid>
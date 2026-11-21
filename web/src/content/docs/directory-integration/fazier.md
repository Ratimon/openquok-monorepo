---
title: Fazier directory launch
description: Fazier company page and product launch from OpenQuok — profile fields, extension handoff, and manual badge or tier steps on fazier.com.
order: 5
lastUpdated: 2026-11-20
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

**Fazier** (<DocsExternalLink href="https://fazier.com">fazier.com</DocsExternalLink>) is a daily product launch directory with separate **company pages** and **product launch** submissions. OpenQuok supports **extension-assisted** submits: your business profile on <a href="/account/products">My Products</a> feeds the wizards on Fazier. You sign in on fazier.com, review autofilled fields, complete moderation, embed badges, comments, or paid launch tiers on Fazier, and publish the listing yourself.

<Callout type="warning">
<p>OpenQuok does not charge Fazier fees or publish for you. Lite Plan and higher tiers, free Basic backlink rules, and review timing come from Fazier. Confirm pricing on <DocsExternalLink href="https://fazier.com/launch">fazier.com/launch</DocsExternalLink> before you pay.</p>
</Callout>

## Launch variants in OpenQuok

| Variant | Typical start page | When to pick it |
| --- | --- | --- |
| **Page** | Company wizard at fazier.com/page/new | You want a Fazier organization profile with website and social links |
| **Free product listing** | Product form at fazier.com/submit (Basic tier) | You are joining the free Basic launch queue with badge and comment requirements |
| **Paid product listing** | Product form at fazier.com/submit (Lite Plan or higher) | You are paying for faster placement and skipping the free-tier backlink rules |

Each variant is a separate destination on your product profile. Readiness and submitted counts are tracked per variant. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.

<Callout type="note">
<p>Compare tiers on <DocsExternalLink href="https://fazier.com/launch">fazier.com/launch</DocsExternalLink> before you pay. OpenQuok opens <DocsExternalLink href="https://fazier.com/submit">fazier.com/submit</DocsExternalLink> for <strong>Free product listing</strong> and <strong>Paid product listing</strong>. Sign in on fazier.com first so the form loads instead of the homepage.</p>
</Callout>

## Profile fields to prepare

Before you click <Badge text="Launch to directory" variant="new" /> → Fazier, fill the product profile with:

- **Name** and **tagline**
- **Logo** and **gallery images** (launch flow)
- **Website** URL
- **Description** (company **About** and launch **Description**)
- **Discovery-style fields** on the composer — industry, categories, use cases, social URLs, and launch date dimensions map into Fazier overview selects where the fixture defines `profilePath`s

The readiness badge on the Fazier card lists anything still missing. Fix gaps in the profile editor instead of retyping on fazier.com.

<Callout type="note">
<p><strong>Page</strong> social rows on Fazier support many platforms (Twitter, LinkedIn, Instagram, YouTube, Website, and more). OpenQuok autofills <strong>LinkedIn</strong> and <strong>Twitter / X</strong> from <Badge text="profile_data.social_linkedin" variant="param" /> and <Badge text="profile_data.social_x" variant="param" />. Add other platform URLs manually in the repeatable rows.</p>
</Callout>

<Callout type="note">
<p><strong>Product listing</strong> post-submit steps are <strong>manual</strong> on Fazier: maker comments, embed badge or homepage/footer link on the free Basic tier, optional Lite Plan checkout, and moderation. OpenQuok does not autofill payment, comments, or badge embed code.</p>
</Callout>

## Launch workflow

<Steps
	howToName="Launch on Fazier from OpenQuok"
	howToDescription="Install the extension, autofill from your business profile, complete Fazier sign-in and tier rules, and save the listing URL in My Products."
>

### Install the extension

Install from the <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink> listing in Chrome (or follow <a href="/docs/installation/chrome-extension">Browser extension</a> for source builds) and pin the OpenQuok extension for directory autofill.

### Open your product profile

On <a href="/account/products">My Products</a>, select the business profile you want to launch.

### Start Page, Free product listing, or Paid product listing

Choose the variant on the Fazier destination card (three launch paths, like Uneed’s product listing pair).

### Sign in on Fazier when prompted

Fazier uses Google or email sign-in. Complete login at <DocsExternalLink href="https://fazier.com/login">fazier.com/login</DocsExternalLink> before you rely on autofill.

### Review the wizard or launch form

Open the Fazier tab from the extension. For **Page**, confirm steps **Basic info**, **Overview**, and **Social links**. For **Free** or **Paid product listing**, confirm product name, tagline, website, description, features, category, and social URLs, and pick the matching plan tier on Fazier.

### Complete manual Fazier requirements and submit

Pick a launch tier on Fazier when needed. On free Basic, add the badge or site link Fazier documents, leave required comments, and wait for moderation. On paid tiers, finish checkout on Fazier.

### Mark complete and save the listing URL

Return to OpenQuok. Mark the launch complete and paste the live <strong>listing URL</strong> (company page under <Badge text="/company/" variant="path" /> or launch under <Badge text="/launches/" variant="path" /> / <Badge text="/p/" variant="path" />).

</Steps>

## Editorial catalog

| Page | Use |
| --- | --- |
| <a href="/build-backlinks/fazier">Fazier on Build Backlinks</a> | Dofollow, cost notes, and bookmarking for outreach |

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Full launch workflow" href="/docs/directory-submission" />
<LinkCard title="TinyLaunch integration" description="Premium and Standard create-startup" href="/docs/directory-integration/tinylaunch" />
<LinkCard title="Open Launch integration" description="Premium launch and free queue" href="/docs/directory-integration/open-launch" />
<LinkCard title="Uneed integration" description="Join the line, paid launch, and maker profile" href="/docs/directory-integration/uneed" />
<LinkCard title="Directory integration overview" description="Social vs directory channels" href="/docs/directory-integration" />
<LinkCard title="Directory launch CLI" description="Profiles, variants, and readiness before extension handoff" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Business profiles" description="Products tab and channel grouping" href="/docs/channels/channel-groups" />
</CardGrid>
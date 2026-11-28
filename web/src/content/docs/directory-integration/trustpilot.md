---
title: Trustpilot directory launch
description: Trustpilot Business company profile from OpenQuok — profile fields, business email verification, nofollow links, and extension autofill on company settings.
order: 10
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

**Trustpilot** (<DocsExternalLink href="https://www.trustpilot.com">trustpilot.com</DocsExternalLink>) hosts public company review pages. OpenQuok supports **extension-assisted** setup on <DocsExternalLink href="https://businessapp.b2b.trustpilot.com/company-settings/">Trustpilot Business company settings</DocsExternalLink>: your business profile on <a href="/account/products">My Products</a> feeds company name, domain, description, and logo. You sign in to Trustpilot Business, verify with a **business email on your company domain**, complete contact info, and publish yourself.

<Callout type="warning">
<p>Claiming a Trustpilot company profile requires a <strong>verifiable business email</strong> on your domain. OpenQuok documents that step on <a href="/build-backlinks/trustpilot">Build backlinks</a> but does not store a separate business-email field on your product profile — use your real domain inbox on Trustpilot.</p>
</Callout>

<Callout type="note">
<p>Public Trustpilot profile links to your website are typically <strong>nofollow</strong>. OpenQuok labels the opportunity accordingly on Build backlinks. Confirm <code>rel</code> on the live profile after you publish.</p>
</Callout>

## Launch variant in OpenQuok

| Variant | Typical start page | When to pick it |
| --- | --- | --- |
| **Company profile** | <DocsExternalLink href="https://businessapp.b2b.trustpilot.com/company-settings/">businessapp.b2b.trustpilot.com/company-settings/</DocsExternalLink> | You want a free company profile path and will verify domain and business email on Trustpilot |

Readiness and submission tracking use this single destination on your product profile. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.

## Profile fields to prepare

Before you click <Badge text="Launch to directory" variant="new" /> → Trustpilot, fill the product profile with:

- **Name** (company name on Trustpilot)
- **Website** URL (company domain — Trustpilot may verify it matches your business)
- **Description** (Describe your company)
- **Logo** (JPG or PNG; Trustpilot recommends about 400×300 within their size limits, roughly 1 MB)

The readiness badge on the Trustpilot card lists anything still missing. Fix gaps in the profile editor instead of retyping on Trustpilot Business.

<Callout type="note">
<p><strong>Contact info</strong> (email, phone, address, postcode, city), <strong>Save and publish</strong>, homepage screenshot updates, and <strong>domain / business-email verification</strong> stay manual on Trustpilot. The extension step rail shows a <strong>Contact info</strong> step with no mapped fields as a reminder.</p>
</Callout>

<Callout type="warning" title="Expand accordions before Fill">
<p>On company settings, open <strong>About your business</strong> before you fill company name, domain, or logo. Open <strong>Company description</strong> before you fill the long description. If a section stays collapsed, the extension blocks Fill and shows a yellow warning — filling while closed can target the profile preview instead of the real inputs.</p>
</Callout>

## Launch workflow

<Steps
	howToName="Launch on Trustpilot from OpenQuok"
	howToDescription="Install the extension, autofill company settings from your business profile, verify on Trustpilot Business, and save the review profile URL in My Products."
>

### Install the extension

Install from the <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink> listing in Chrome (or follow <a href="/docs/installation/chrome-extension">Browser extension</a> for source builds) and pin the OpenQuok extension for directory autofill.

### Open your product profile

On <a href="/account/products">My Products</a>, select the business profile you want to launch.

### Start Company profile

Choose the Trustpilot destination on your product profile.

### Sign in to Trustpilot Business when prompted

Sign in at <DocsExternalLink href="https://businessapp.b2b.trustpilot.com/">Trustpilot Business</DocsExternalLink> before you rely on autofill. Use an account that can manage company settings for your brand.

### Open company settings

The handoff opens <DocsExternalLink href="https://businessapp.b2b.trustpilot.com/company-settings/">company settings</DocsExternalLink> when you are signed in.

### Review autofilled fields

Open the Trustpilot tab from the extension. Confirm autofilled company name, domain, description, and logo. Complete contact info on Trustpilot if it is still empty.

### Verify domain and business email on Trustpilot

Follow Trustpilot’s prompts to verify your company domain and a business email on that domain. This step is required to claim and publish the profile.

### Save, publish, and confirm link rel

Save and publish on Trustpilot when the form is complete. After the public profile is live, confirm whether your website link uses <code>nofollow</code> as expected.

### Mark complete and save the listing URL

Return to OpenQuok. Mark the launch complete and paste the live <strong>listing URL</strong> (typically under <code>trustpilot.com/review/</code>).

</Steps>

## Editorial catalog and marketing pages

| Page | Use |
| --- | --- |
| <a href="/channels/trustpilot">Trustpilot on Channels</a> | Product positioning, FAQs, and trial CTA |
| <a href="/build-backlinks/trustpilot">Trustpilot on Build backlinks</a> | Nofollow label, business-email step, cost notes, and bookmarking for outreach |

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Full launch workflow" href="/docs/directory-submission" />
<LinkCard title="AlternativeTo integration" description="Free listing, paid review tiers, and user profile" href="/docs/directory-integration/alternativeto" />
<LinkCard title="IndieHub integration" description="Basic and Pro paid listings" href="/docs/directory-integration/indiehub" />
<LinkCard title="DevHunt integration" description="Developer tool free listing and paid launch" href="/docs/directory-integration/devhunt" />
<LinkCard title="Directory integration overview" description="Social vs directory channels" href="/docs/directory-integration" />
<LinkCard title="Directory launch CLI" description="Profiles, variants, and readiness before extension handoff" href="/docs/cli-usages/directory-launch" />
<LinkCard title="Business profiles" description="Products tab and channel grouping" href="/docs/channels/channel-groups" />
</CardGrid>
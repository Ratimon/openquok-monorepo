---
title: Directory submission overview
description: Launch on product directories from OpenQuok with a business profile, browser extension autofill, and you submit on each site.
order: 0
lastUpdated: 2026-11-03
sidebar:
  label: Overview
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

## What is a directory launch?

> One business profile, extension autofill, you click submit on the directory site.

A **directory launch** is how you list a product on directory websites. OpenQuok stores your pitch in a **product profile** on <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab.

![Launch Directory Features in web ui and extension](/docs/_assets/directory-submission/products-dashboard-browser.webp)

<p><strong>Add a destination.</strong> Click <strong>Add Channel</strong> on <a href="/account">My Dashboard</a> → <strong>Channels</strong> tab — directory tiles sit beside social networks. OpenQuok does not sign you in on the directory site. See <a href="/docs/channels/connect#directory-launch-in-add-channel">Connect a channel</a>.</p>

<p><strong>Select where to launch.</strong> On <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab, each wired site shows on the product card with <strong>readiness</strong>. Click <strong>Launch to directory</strong>, pick the site, and choose a <strong>variant</strong> when the catalog offers more than one path (for example PeerPush Standard launch or Uneed Join the line).</p>

<p><strong>Autofill in Chrome.</strong> OpenQuok opens the directory URL and sends a handoff to the <a href="/docs/installation/chrome-extension">browser extension</a>. Install from the  <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink>  when you use Chrome. Use the side panel <strong>Directory</strong> tab or <strong>Fill</strong> on the page.</p>

<p>Review every field, then submit or pay on the directory yourself. If you are already on those directory sites while signed in to OpenQuok, you can use the extension there too — you still need a product profile ready.</p>

<Callout type="note">
<p>OpenQuok does <strong>not</strong> auto-submit paid listings for you. You stay in control of each publish, the same way you approve each social post.</p>
</Callout>

<Callout type="warning">
<p><strong>Social channels</strong> connect with OAuth or API keys and schedule posts from OpenQuok. <strong>Directory launches</strong> reuse your product profile and the extension. They do not add a posting channel to the composer calendar.</p>
</Callout>

<Callout type="note">
<p>For a product overview with cost comparison and FAQs, see the <a href="/directory-submission-tool">directory submission tool</a> page.</p>
</Callout>


## Where to work in the app

| Area | What you do |
| --- | --- |
| <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab | Create or edit a product profile, see directory cards, readiness, and submitted counts |
| <strong>Launch to directory</strong> on the product card | Pick a site and variant, then hand off to the extension |
| <a href="/account">My Dashboard</a> → <strong>Channels</strong> tab — <strong>Add Channel</strong> | Directory launch tiles beside social networks — no OAuth. See <a href="/docs/channels/connect#directory-launch-in-add-channel">Connect a channel</a> |

Link social accounts to the same business profile when you want one client or brand to cover both scheduled posts and directory launches. See <a href="/docs/channels/channel-groups">Business profiles</a>.

## Typical workflow

<Steps
	howToName="Submit a product listing with OpenQuok"
	howToDescription="Build a profile in the workspace, launch with the browser extension, then record the live listing in OpenQuok."
>

### Install the browser extension

<p>Install the OpenQuok Chrome extension —  <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink>  on Chrome, or follow <a href="/docs/installation/chrome-extension">Browser extension</a> for unpacked builds. Directory launch uses the same extension as Skool connect and Reddit handoff.</p>

### Create a product profile

<p>On <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab, add a product profile for your product. Fill name, tagline, description, website, logo, and any directory-specific fields the composer shows.</p>

<Callout type="note">
<p>For CLI and MCP, programmatic clients set <Badge text="logoUrl" variant="param" /> and screenshot URLs in <Badge text="profileData.gallery_urls" variant="param" /> (up to three) on the profile API — not via the composer upload bucket. See <a href="/docs/cli-usages/directory-launch#logo-and-screenshots">Directory launch CLI — logo and screenshots</a>.</p>
</Callout>

### Check readiness

Each directory destination shows **readiness** on the profile card. Fix missing fields in the profile editor before you open the directory site.

### Launch to a directory

<p>Click <strong>Launch to directory</strong> on the product profile, or add the site with <strong>Add Channel</strong> on <a href="/account">My Dashboard</a> → <strong>Channels</strong> tab first.</p>

![Add Directory Channel in Channels Tab](/docs/_assets/directory-submission/fill-directory.webp)

### Choose Listing Option

<p>Choose the site and variant — for example PeerPush Standard launch or Uneed Join the line. OpenQuok opens the correct website and sends a handoff to the extension.</p>

![Choose one of Directory 's Listing Options](/docs/_assets/directory-submission/fill-directory.webp)

### Review and submit on the directory

On the directory site, confirm autofilled values. Edit anything that still needs a human touch. Click the directory’s own submit or pay button. OpenQuok does not bypass their checkout or terms.

### Mark complete and save the listing URL

<p>Back in OpenQuok, on <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab, mark the launch complete and paste the public listing URL when you have it. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.</p>

</Steps>

## Public hubs

Compare directory sites on three surfaces:

| Surface | Role |
| --- | --- |
| <a href="/channels#public-directory-channels-hub-heading">Channels — Directory launch platforms</a> | Supported destinations with setup copy — links to <a href="/docs/directory-integration">Directory integration</a> |
| <a href="/build-backlinks">Build Backlinks</a> | Public research catalog — cost, dofollow, editorial notes, and bookmarks |
| <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab | Executable launches — profile, readiness, extension, submission status |

<p>See <a href="/docs/directory-submission/build-backlinks">Build Backlinks</a> for the public catalog. Manage bookmarks on <a href="/account/saved?tab=backlinks">Account → Saved</a> → <strong>Backlinks</strong> tab — <a href="/docs/saved/backlinks">Backlinks management</a>.</p>

## In this section

<CardGrid>
<LinkCard title="Track submissions" description="Readiness on My Products, listing URL, dofollow notes, and mark complete" href="/docs/directory-submission/track-submissions" />
<LinkCard title="Profile variants per directory" description="Site-specific copies, similarity %, and which profile the extension uses" href="/docs/directory-submission/profile-variants" />
<LinkCard title="Directory analytics" description="Domain rating charts and competitor tracking on paid plans" href="/docs/insights/directory-analytics" />
<LinkCard title="Build Backlinks" description="Public catalog vs Channels setup and My Products" href="/docs/directory-submission/build-backlinks" />
</CardGrid>

## Related

<CardGrid>
<LinkCard title="Directory submission tool" description="DIY autofill and tracking vs done-for-you bulk packages — marketing overview" href="/directory-submission-tool" />
<LinkCard title="Glossary — Directory launch" description="Main profile, variants, listing readiness, and directory analytics" href="/docs/getting-started/glossary#directory-launch" />
<LinkCard title="Directory integration" description="How directory destinations differ from OAuth social channels" href="/docs/directory-integration" />
<LinkCard title="Browser extension" description="Install the OpenQuok Chrome extension for directory handoff" href="/docs/installation/chrome-extension" />
<LinkCard title="Business profiles" description="Link social channels to a client or brand for calendar and kanban" href="/docs/channels/channel-groups" />
<LinkCard title="Channels overview" description="Social vs directory channel families in OpenQuok" href="/docs/channels" />
<LinkCard title="Connect a channel" description="Add Channel picker — social OAuth and directory launch tiles" href="/docs/channels/connect#directory-launch-in-add-channel" />
<LinkCard title="Backlinks management" description="Reorder and mark outreach done on Account → Saved" href="/docs/saved/backlinks" />
</CardGrid>

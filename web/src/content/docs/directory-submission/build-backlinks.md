---
title: Build Backlinks
description: Public outreach catalog — compare directory and backlink sites, bookmark rows, and how research differs from Channels setup and My Products launches.
order: 4
lastUpdated: 2026-11-03
sidebar:
  label: Build Backlinks
---

<script>
import { Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
import {
	getPublicBrowserExtensionChromeStoreCtaHref,
	PUBLIC_BROWSER_EXTENSION_CHROME_STORE_DOCS_LINK_LABEL
} from '$lib/content/constants/landing/browser-extension-chrome-cta';

const chromeWebStoreHref = getPublicBrowserExtensionChromeStoreCtaHref();
const chromeWebStoreLinkLabel = PUBLIC_BROWSER_EXTENSION_CHROME_STORE_DOCS_LINK_LABEL;
</script>

## What the catalog is

> Browse sites before you pick a launch or outreach target.

The public <a href="/build-backlinks">Build Backlinks</a> page lists directory and backlink opportunities with editorial fields — for example cost, dofollow, and audience notes.

![Public Backlinks Hub Pages](/docs/_assets/saved/public-backlinks-hub.webp)

<p>Use <strong>Bookmark</strong> on a row to add it to your shortlist. You can bookmark without an account. When you sign in, bookmarks sync to <a href="/account/saved?tab=backlinks">Account → Saved</a> → <strong>Backlinks</strong> tab. See <a href="/docs/saved/backlinks">Backlinks management</a> to reorder and mark outreach done.</p>

<p>When you launch on a wired directory from <a href="/account/products">My Products</a>, install the OpenQuok extension first —  <DocsExternalLink href={chromeWebStoreHref}>{chromeWebStoreLinkLabel}</DocsExternalLink>  on Chrome — then follow <a href="/docs/directory-submission">Directory submission</a>.</p>

## Catalog vs Channels vs My Products

OpenQuok shows directory sites in more than one place:

| Surface | Role |
| --- | --- |
| <a href="/build-backlinks">Build Backlinks</a> | Research and shortlist — compare many sites |
| <a href="/channels#public-directory-channels-hub-heading">Channels — Directory launch platforms</a> | Setup-oriented copy for destinations OpenQuok can autofill today |
| <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab | Run a wired launch — readiness, extension handoff, submission status |

<Callout type="note">
<p>One site can appear on Build Backlinks and on <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab. Compare on the catalog. Launch from <strong>Products</strong> when OpenQuok supports autofill for that destination. See <a href="/docs/directory-submission/track-submissions#build-backlinks-vs-my-products-tracking">Track submissions — Build Backlinks vs My Products</a>.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Product profile, Add Channel, and extension autofill" href="/docs/directory-submission" />
<LinkCard title="Track submissions" description="Mark complete and save listing URLs on My Products" href="/docs/directory-submission/track-submissions" />
<LinkCard title="Backlinks management" description="Account → Saved — reorder and mark done" href="/docs/saved/backlinks" />
<LinkCard title="Directory integration" description="Field notes for PeerPush, Uneed, and other wired sites" href="/docs/directory-integration" />
<LinkCard title="Channels hub" description="Social platforms and directory launch platforms" href="/channels#public-directory-channels-hub-heading" />
</CardGrid>

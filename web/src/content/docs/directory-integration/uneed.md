---
title: Uneed directory launch
description: Uneed Join the line, paid launch, and maker profile from OpenQuok — profile fields and extension autofill.
order: 2
lastUpdated: 2026-10-17
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

**Uneed** (<DocsExternalLink href="https://www.uneed.best">uneed.best</DocsExternalLink>) is a product launch and discovery site. OpenQuok wires three launch paths from <a href="/account/products">My Products</a>. The browser extension autofills the right form. You submit on Uneed when the copy and pricing look correct.

<Callout type="warning">
<p>Join the line, paid launch, and maker profile have different costs and timelines on Uneed. OpenQuok does not purchase slots for you. Read Uneed’s pricing page before you commit.</p>
</Callout>

## Launch variants in OpenQuok

| Variant | Typical start page | When to pick it |
| --- | --- | --- |
| **Join the line** | Queue / line flow on uneed.best | You want the free or queued path Uneed offers |
| **Paid launch** | Paid launch or pricing flow | You are buying a featured or timed launch slot |
| **Maker profile** | Maker or profile setup on uneed.best | You are creating or updating your maker presence on Uneed |

Track each variant separately on your product profile. Mark complete and save listing URLs per variant. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.

## Profile fields to prepare

Fill your business profile before launch:

- **Name**, **tagline**, and **description**
- **Website** and social links when the composer exposes them
- **Logo** and optional gallery media
- **Pricing or maker context** fields shown on Uneed-specific composer tabs (for example plan name, price point, or maker bio snippets)

Readiness on the Uneed card mirrors missing `profilePath` values in the extension config. Update the profile once and reuse it across all three variants.

## Workflow summary

1. Install the <a href="/docs/installation/chrome-extension">OpenQuok browser extension</a>.
2. On <a href="/account/products">My Products</a>, open your product and choose a Uneed variant.
3. Complete autofill on uneed.best. Adjust tone or pricing details on the page.
4. Submit or pay on Uneed.
5. Return to OpenQuok to mark complete and store the public **listing URL**.

You can also start from <Badge text="Add Channel" variant="new" /> when Uneed appears as a directory tile — the same variants open from there.

## Editorial catalog and marketing pages

| Page | Use |
| --- | --- |
| <a href="/channels/uneed">Uneed on Channels</a> | Product landing, FAQs, and sign-up path |
| <a href="/build-backlinks/uneed">Uneed on Build Backlinks</a> | Cost, dofollow, and bookmark context |

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Full launch workflow" href="/docs/directory-submission" />
<LinkCard title="PeerPush integration" description="Standard launch and free queue" href="/docs/directory-integration/peerpush" />
<LinkCard title="Directory integration overview" description="Social vs directory channels" href="/docs/directory-integration" />
<LinkCard title="Business profiles" description="Products tab and channel grouping" href="/docs/channels/channel-groups" />
</CardGrid>

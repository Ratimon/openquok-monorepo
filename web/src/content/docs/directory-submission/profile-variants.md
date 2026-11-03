---
title: Profile variants per directory
description: Optional site-specific copies of your main product profile — when to use them, and how Edit variant and Create variant work on My Products.
order: 2
lastUpdated: 2026-11-03
sidebar:
  label: Profile variants
---

<script>
import { Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What you see on the product card

<p>On <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab, each product card includes actions for the <strong>main</strong> profile and for directory launches.</p>

![OpenQuok Main Profile Card](/docs/_assets/directory-submission/profile-main-card.webp)

| Control | What it does |
| --- | --- |
| **Edit profile** | Opens the main product profile — name, tagline, description, logo, and shared fields |

![Edit Main Profile Card](/docs/_assets/directory-submission/edit-profile.webp)

| Control | What it does |
| --- | --- |
| **+ Add directory launch** | Pick a directory site and a launch path (for example PeerPush Standard launch or Uneed Paid launch), then hand off to the extension. OpenQuok uses the <strong>main</strong> profile unless you already created a site copy for that directory |
| **Edit variant** | Opens a <strong>site copy</strong> you created earlier (shown in the list as <em>peerpush variant</em>, <em>uneed variant</em>, and so on, often with a <strong>match %</strong>) |

<p><strong>+ Add directory launch</strong> does not create a site copy by itself. It starts a launch. You only need a variant when that directory should use different copy than the main profile.</p>

## Main profile vs site copy

> One main pitch — optional copies when a directory needs different wording.

<p>Your <strong>main</strong> product profile is the default for extension autofill. A <strong>profile variant</strong> (site copy) is a duplicate for <strong>one</strong> directory site. You edit the copy for that site without changing every other destination.</p>

<Callout type="note">
<p>Variants are optional. If you never create one, <strong>+ Add directory launch</strong> and row-level <strong>Launch</strong> still use the main profile.</p>
</Callout>

## Create or edit a site copy

<Steps
	howToName="Create or edit a directory profile variant"
	howToDescription="Create site copy or Edit variant on the card."
>

### Create a copy for one site

<p>On the product card, expand <strong>Directory channels</strong>. On the row for that site, click <strong>Create variant</strong>. OpenQuok copies the main profile and opens the editor.</p>

### Edit a copy you already have

<p>Click <strong>Edit variant</strong> on the card (next to <em>peerpush variant</em>, and so on) or on the row in <strong>Directory channels</strong>.</p>

### Save

<p>Update fields in the profile composer and save.</p>

</Steps>

<p>After a copy exists, the row shows <strong>Edit variant</strong> instead of <strong>Create variant</strong>.</p>

## Similarity to main

<p>Each site copy can show a <strong>match %</strong> (similarity to the main profile). OpenQuok compares name, tagline, description, website, logo, and shared fields — no external API calls.</p>

| Signal | What it means |
| --- | --- |
| High match | The site copy still aligns with your main pitch |
| Lower match | You changed copy for this directory |
| Main profile edited later | You may see a drift warning — review the variant before the next launch |

## Launches and submissions

<p>When you launch to a site that has a variant, OpenQuok sends <strong>that variant’s</strong> snapshot to the extension. If no variant exists, the launch uses the <strong>main</strong> profile.</p>

<p>See <a href="/docs/directory-submission/track-submissions">Track submissions</a> to mark complete and save listing URLs after you publish on the directory.</p>

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Extension workflow from profile to mark complete" href="/docs/directory-submission" />
<LinkCard title="Track submissions" description="Listing URL, dofollow notes, and completion status" href="/docs/directory-submission/track-submissions" />
<LinkCard title="Directory analytics" description="Domain rating for your product site and competitors" href="/docs/insights/directory-analytics" />
<LinkCard title="Business profiles" description="Link social channels to the same product profile" href="/docs/channels/channel-groups" />
</CardGrid>

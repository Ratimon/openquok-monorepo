---
title: Tailor profiles per directory
description: Branch a directory-specific copy of your main business profile, track similarity, and launch with the right variant in OpenQuok.
order: 2
lastUpdated: 2026-10-19
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Why directory variants exist

Your **main** business profile on <a href="/account/products">My Products</a> is the default source for extension autofill. Some directories want a shorter tagline, different pricing copy, or site-specific fields.

A **directory variant** is a full copy of the main profile, linked to one directory site (for example <Badge text="peerpush" variant="param" /> or <Badge text="uneed" variant="param" />). You edit the variant without changing the main profile for every other destination.

<Callout type="note">
<p>Variants are optional. When you have not created one for a site, launches still use the main profile.</p>
</Callout>

## Create or open a variant

On <a href="/account/products">My Products</a>, open a product’s directory grid or destination card.

1. Find the directory row you want to customize.
2. Choose <strong>Tailor for this directory</strong> (or open an existing tailored profile from the nested variant list under the main card).
3. OpenQuok creates a variant on first use — a copy of the main profile at that moment — or opens the one you already have for that <Badge text="site_key" variant="param" />.

Edit fields in the same profile composer as the main product. Save when you are done.

## Similarity to main

Each variant shows a **similarity %** compared to the main profile. OpenQuok compares normalized fields (name, tagline, description, website, logo, and shared <Badge text="profile_data" variant="param" /> keys) without calling external APIs.

| Signal | What it means |
| --- | --- |
| High similarity | Variant still matches the main pitch |
| Lower similarity | You changed copy for this directory |
| Main profile updated later | Variants may show a drift warning — review before the next launch |

Use similarity to see which directories you have customized and whether a main-profile edit should be mirrored into variants.

## Launches and submissions

When you <Badge text="Launch to directory" variant="new" /> for a site that has a variant, OpenQuok hands off **that variant’s** snapshot to the extension. Submissions store the variant’s <Badge text="product_profile_id" variant="param" />.

If no variant exists for the site, the launch uses the **main** profile — same as before variants shipped.

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="Extension workflow from profile to mark complete" href="/docs/directory-submission" />
<LinkCard title="Track submissions" description="Listing URL, dofollow notes, and completion status" href="/docs/directory-submission/track-submissions" />
<LinkCard title="Directory analytics" description="Domain rating for your product site and competitors" href="/docs/directory-submission/directory-analytics" />
<LinkCard title="Business profiles" description="Link social channels to the same product profile" href="/docs/channels/channel-groups" />
</CardGrid>

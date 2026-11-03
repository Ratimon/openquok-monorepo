---
title: Track directory submissions
description: Readiness on My Products, save listing URLs, and mark directory launches complete in OpenQuok.
order: 1
lastUpdated: 2026-11-03
---

<script>
import { Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Submission status on My Products

<p>On <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab, each product profile shows <strong>directory destination</strong> cards grouped by site (PeerPush, Uneed, and others as they ship).</p>

![Directory card group by site for each directory](/docs/_assets/directory-submission/profile-directory-channels.webp)

| Signal | Meaning |
| --- | --- |
| **Readiness** | Whether required profile fields for extension autofill are filled — for example <strong>Ready</strong> or a count of missing fields |
| **Submitted** | How many variants you marked complete for that site |
| **Per-variant row** | One row per launch path (Standard launch vs free queue, Join the line vs paid launch, and so on) |

<p>Readiness is about <strong>your OpenQuok profile</strong>, not whether the directory accepted you yet. Finish missing fields in the profile composer before you launch again.</p>

## After you publish on the directory

<p>When the directory shows your live listing (or confirms queue placement), return to <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab.</p>

<Steps
	howToName="Mark a directory launch complete"
	howToDescription="Record the live listing on My Dashboard after you submit on the directory site."
>

### Open the destination row

<p>In <strong>Directory channels</strong>, find the row for that site.</p>

### Mark launch complete

<p>Click <strong>Mark launch complete</strong> (or open an existing submission to edit).</p>

![Mark directory site as listed](/docs/_assets/directory-submission/make-listing-complete.webp)

### Save listing details

<p>Select the launch path you used if the site offers more than one. Paste the <strong>listing URL</strong>. Optionally add dofollow notes and the email you used on the directory.</p>

</Steps>

<Callout type="tip">
<p>Listing URL and dofollow notes help your team remember what went live. They are for your workspace records. They do not replace the directory’s own dashboard.</p>
</Callout>

## Edit or undo a submission

<p>On the same product card, use <strong>Edit listing</strong> on a completed row to fix the URL, variant, or notes. You can <strong>mark incomplete</strong> when you reset a launch and plan to submit again from scratch.</p>

## Build Backlinks vs My Products tracking

| Surface | Purpose |
| --- | --- |
| <a href="/build-backlinks">Build Backlinks</a> | Editorial catalog — cost, dofollow, and outreach notes. Bookmark sites from the public catalog. |
| <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab | Executable launches — profile, extension autofill, and submission status for wired destinations |

<Callout type="note">
<p>A site can appear in both places. Use the public <a href="/build-backlinks">Build Backlinks</a> catalog to compare sites. Use <a href="/account/products">My Dashboard</a> → <strong>Products</strong> tab to run the launch workflow. See <a href="/docs/directory-submission/build-backlinks">Build Backlinks</a> and <a href="/docs/saved/backlinks">Backlinks management</a>.</p>
</Callout>


## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="End-to-end launch workflow with the extension" href="/docs/directory-submission" />
<LinkCard title="Profile variants per directory" description="Site-specific profile copies and similarity to main" href="/docs/directory-submission/profile-variants" />
<LinkCard title="Directory analytics" description="Live domain rating for your product site and competitors" href="/docs/directory-submission/directory-analytics" />
<LinkCard title="PeerPush integration" description="Variants and profile fields for PeerPush" href="/docs/directory-integration/peerpush" />
<LinkCard title="Uneed integration" description="Join the line, paid launch, and maker profile" href="/docs/directory-integration/uneed" />
<LinkCard title="Build Backlinks" description="Public catalog vs My Products" href="/docs/directory-submission/build-backlinks" />
</CardGrid>

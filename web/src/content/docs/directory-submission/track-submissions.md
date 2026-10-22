---
title: Track directory submissions
description: Readiness on My Products, save listing URLs, and mark directory launches complete in OpenQuok.
order: 1
lastUpdated: 2026-10-17
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Submission status on My Products

On <a href="/account/products">My Products</a>, each business profile shows **directory destination** cards grouped by site (PeerPush, Uneed, and others as they ship).

| Signal | Meaning |
| --- | --- |
| **Readiness** | Whether required profile fields for extension autofill are filled — for example <strong>Ready</strong> or a count of missing fields |
| **Submitted** | How many variants you marked complete for that site |
| **Per-variant row** | One row per launch path (Standard launch vs free queue, Join the line vs paid launch, and so on) |

Readiness is about **your OpenQuok profile**, not whether the directory accepted you yet. Finish missing fields in the profile composer before you launch again.

## After you publish on the directory

When the directory shows your live listing (or confirms queue placement), return to OpenQuok:

1. Open the destination card or grid row for that site.
2. Choose <strong>Mark launch complete</strong> (or edit an existing submission).
3. Select the **variant** you used if the site offers more than one path.
4. Paste the **listing URL** — the public page on the directory when you have it.
5. Optionally note whether the link is **dofollow** and which **email** you used to sign in on the directory.

<Callout type="tip">
<p>Listing URL and dofollow notes help your team remember what went live. They are for your workspace records. They do not replace the directory’s own dashboard.</p>
</Callout>

## Edit or undo a submission

Use **Edit listing** on a completed row to fix the URL, variant, or notes. You can **mark incomplete** when you reset a launch and plan to submit again from scratch.

## Evidence and extension proof

Some destinations can suggest a listing URL from the page you had open when you finished. OpenQuok may store light **evidence** from the handoff when the extension config supports it. You can still type or paste the URL manually — that is the source of truth for your team.

## Build Backlinks vs My Products tracking

| Surface | Purpose |
| --- | --- |
| <a href="/build-backlinks">Build Backlinks</a> | Editorial catalog — cost, dofollow, and outreach notes. Bookmark sites from the public hub. |
| <a href="/account/products">My Products</a> | Executable launches — profile, extension autofill, and submission status for wired destinations |

A site can appear in both places. Use Build Backlinks to compare opportunities. Use My Products to run the launch workflow. See <a href="/docs/saved/backlinks">Backlinks Opportunities</a> for bookmarks.

## Related

<CardGrid>
<LinkCard title="Directory submission overview" description="End-to-end launch workflow with the extension" href="/docs/directory-submission" />
<LinkCard title="Tailor profiles per directory" description="Site-specific profile copies and similarity to main" href="/docs/directory-submission/profile-variants" />
<LinkCard title="Directory analytics" description="Live domain rating for your product site and competitors" href="/docs/directory-submission/directory-analytics" />
<LinkCard title="PeerPush integration" description="Variants and profile fields for PeerPush" href="/docs/directory-integration/peerpush" />
<LinkCard title="Uneed integration" description="Join the line, paid launch, and maker profile" href="/docs/directory-integration/uneed" />
<LinkCard title="Business profiles" description="Products tab and channel grouping" href="/docs/channels/channel-groups" />
</CardGrid>

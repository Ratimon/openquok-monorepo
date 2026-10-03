---
title: Browse and bookmarks
description: Browse the catalog, filter with the hub sidebar, bookmark, and open the detail pages.
order: 1
lastUpdated: 2026-10-03
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Libs → Browse

> Search community playbooks and building blocks, narrow results, and save the ones you want to install later.

On <a href="/account/saved">Account → Saved</a>, open the **Libs** tab and choose **Browse**.

![Account -> Saved - > Choose Tab](/docs/_assets/saved/overview-tabs.webp)

The catalog loads from the public hubs.

## Layout

Browse matches the public hub pattern: **filters in a left sidebar**, **results on the right**.

![Explore All Playbooks & Building Blocks](/docs/_assets/saved/browse-all-saved.webp)

<Callout type="note">
<p>You can choose between <Badge text="Building Blocks" variant="default" />, <Badge text="Playbooks" variant="default" />, and <Badge text="All" variant="default" /> on the grid</p>
</Callout>

## Sidebar controls

| Control | Effect |
| --- | --- |
| **Search** | Matches titles and descriptions |
| **Sort** | **Newest**, **Oldest**, **Most liked**, or **Most viewed** |
| **Saved → Bookmarked** | Shows only listings you saved and the count; click **×** to turn the filter off |
| **Type** | When **All** or **Building blocks** is active on the grid, filter by **Skills**, **MCP**, or **Both** |
| **Categories** | Pick one category, or choose **All categories** |
| **Tags** | Click tag chips to narrow the grid; click an active chip again to remove it. Use **More** when the list is long |


## Bookmark on public hubs

While you browse <a href="/building-blocks">Building Blocks</a> or <a href="/playbooks">Playbooks</a>, use **Bookmark** icon on a card to save it.

![Bookmark Building block](/docs/_assets/saved/bookmark-building-block.webp)





<Callout type="warning">
You can bookmark while signed out. Anonymous bookmarks stay in browser storage only, so it might be gone if you clear the browser.
</Callout>

<Callout type="note">
<p>Listing bookmarks are separate from <strong>Backlinks</strong> shortlists on <a href="/account/saved?tab=backlinks">Account → Saved → Backlinks</a>. See <a href="/docs/saved/backlinks">Backlinks shortlist</a> for outreach sites.</p>
</Callout>

## After you sign in

When you open **Libs → Browse** or return to a public hub while signed in, OpenQuok reads browser bookmarks and your account sync it.

| State | What happens |
| --- | --- |
| **Signed out** | Picks stay in browser storage on this device. They still show as bookmarked on hub cards and in Browse when the catalog row is loaded. |
| **Signed in** | Local picks merge into your account. Duplicates drop out. After merge, your account is the source of truth across devices. |


## Card actions

Open the **⋯** menu on a card:

![Bookmark or View OpenQuok Playbook](/docs/_assets/saved/card-actions.webp)

| Action | When to use it |
| --- | --- |
| **Bookmark** / **Remove bookmark** | Save a listing for later (local in the browser; syncs to your account when signed in) |
| **View on hub** | Open the public detail page on <a href="/building-blocks">Building Blocks</a> or <a href="/playbooks">Playbooks</a> |

## Compose from Browse

Building block cards include an **Add** checkbox. Select one or more blocks, then use **Create playbook** in the bar above the grid. That flow continues in <a href="/docs/saved/compose-a-playbook">Compose a playbook</a>.

![Select Building Blocks to Create New Playbooks](/docs/_assets/saved/compose-building-blocks.webp)

<Callout type="tip">
<p>You can run the same steps from <strong>Your library</strong> when you want to stack your own drafts with catalog entries.</p>
</Callout>

## Cookies and local storage

Anonymous bookmark picks may live in browser storage until you sign in and merge. OpenQuok also uses first-party cookies for account and product features. See the <a href="/cookie-policy">Cookie Policy</a> for how cookies are used across the app.

## Related

<CardGrid>
<LinkCard title="Compose a playbook" description="Selection bar and Skill Builder handoff" href="/docs/saved/compose-a-playbook" />
<LinkCard title="Your library" description="Drafts, stats, and publish actions" href="/docs/saved/my-library" />
<LinkCard title="Saved overview" description="Libs, Backlinks, and OpenQuok Core" href="/docs/saved" />
<LinkCard title="Backlinks shortlist" description="Save outreach sites from Build Backlinks" href="/docs/saved/backlinks" />
<LinkCard title="Building Blocks hub" description="Public catalog visitors see" href="/building-blocks" />
<LinkCard title="Playbooks hub" description="Public playbook catalog" href="/playbooks" />
</CardGrid>

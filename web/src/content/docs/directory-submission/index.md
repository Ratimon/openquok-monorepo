---
title: Directory submission overview
description: Launch on product directories from OpenQuok with a business profile, browser extension autofill, and you submit on each site.
order: 0
lastUpdated: 2026-10-18
sidebar:
  label: Overview
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What is a directory launch?

> One business profile, extension autofill, you click submit on the directory site.

A **directory launch** is how you list a product on startup directories. OpenQuok stores your pitch in a **business profile** on <a href="/account/products">My Products</a>.

You can pick a directory as a destination channel, open the directory in Chrome, and the **OpenQuok browser extension** fills mapped fields. You review the page and publish on the directory yourself.

<Callout type="note">
<p>OpenQuok does <strong>not</strong> auto-submit paid listings for you. You stay in control of each publish, the same way you approve each social post.</p>
</Callout>

<Callout type="warning">
<p><strong>Social channels</strong> connect with OAuth or API keys and schedule posts from OpenQuok. <strong>Directory launches</strong> reuse your product profile and the extension. They do not add a posting channel to the composer calendar.</p>
</Callout>


## DIY submission vs done-for-you packages

Done-for-you vendors sell bulk submission as a one-time package. They submit on your behalf and send a report when they finish. OpenQuok is **submission software**: you build a business profile, autofill each directory form with the browser extension, and click submit on the directory site. You keep logins and approvals. That tradeoff can save money when you launch more than once or manage several products, because you are not buying a new bulk package for every wave. Public list prices on those vendor packages often fall in the $60–$140+ range per campaign (verify on their sites; prices change). OpenQuok workspace pricing is separate, and paid listing fees on PeerPush, Uneed, and other directories are still yours to pay on each site.

For a product overview with cost comparison and FAQs, see the <a href="/directory-submission-tool">directory submission tool</a> page.


## Where to work in the app

| Area | What you do |
| --- | --- |
| <a href="/account/products">My Products</a> | Create or edit a business profile, see directory cards, readiness, and submitted counts |
| <Badge text="Launch to directory" variant="new" /> | Pick a site and variant, then hand off to the extension |
| <a href="/account">My Dashboard</a> → <Badge text="Add Channel" variant="new" /> | Some directory sites also appear as tiles when you add a launch from the channel picker |

Link social accounts to the same business profile when you want one client or brand to cover both scheduled posts and directory launches. See <a href="/docs/channels/channel-groups">Business profiles</a>.

## Typical workflow

<Steps
	howToName="Submit a product listing with OpenQuok"
	howToDescription="Build a profile in the workspace, launch with the browser extension, then record the live listing in OpenQuok."
>

### Install the browser extension

Install and load the OpenQuok Chrome extension. See <a href="/docs/installation/chrome-extension">Browser extension</a>. Directory launch uses the same extension install as other extension-assisted flows.

### Create a product profile

On <a href="/account/products">My Products</a>, add a business profile for your product. Fill name, tagline, description, website, logo, and any directory-specific fields the composer shows.

### Check readiness

Each directory destination shows **readiness** on the profile card. Fix missing fields in the profile editor before you open the directory site.

### Launch to a directory

Click <Badge text="Launch to directory" variant="new" /> (or the launch action on a destination card). Choose the site and variant — for example PeerPush Standard launch or Uneed Join the line. OpenQuok opens the correct URL and sends a handoff to the extension.

### Review and submit on the directory

On the directory site, confirm autofilled values. Edit anything that still needs a human touch. Click the directory’s own submit or pay button. OpenQuok does not bypass their checkout or terms.

### Mark complete and save the listing URL

Back in OpenQuok, mark the launch complete and paste the public listing URL when you have it. See <a href="/docs/directory-submission/track-submissions">Track submissions</a>.

</Steps>

## Directory launch platforms (marketing)

The public <a href="/channels#public-directory-channels-hub-heading">Channels hub — Directory launch platforms</a> section lists supported destinations with setup-oriented copy. Per-site field notes live under <a href="/docs/directory-integration">Directory integration</a>.

## Related

<CardGrid>
<LinkCard title="Directory submission tool" description="DIY autofill and tracking vs done-for-you bulk packages — marketing overview" href="/directory-submission-tool" />
<LinkCard title="Track submissions" description="Readiness, listing URL, dofollow notes, and marking a launch complete" href="/docs/directory-submission/track-submissions" />
<LinkCard title="Directory integration" description="How directory destinations differ from OAuth social channels" href="/docs/directory-integration" />
<LinkCard title="Browser extension" description="Install the OpenQuok Chrome extension for directory handoff" href="/docs/installation/chrome-extension" />
<LinkCard title="Business profiles" description="Link channels to a profile and use the Products tab" href="/docs/channels/channel-groups" />
<LinkCard title="Channels overview" description="Social vs directory channel families in OpenQuok" href="/docs/channels" />
</CardGrid>

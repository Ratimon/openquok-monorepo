---
title: Publish via the UI
description: Add your own building block or playbook on OpenQuok — username, editor, review, and Skill Builder.
order: 2
lastUpdated: 2026-07-05
---

<script>
import { Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

You publish listings from your OpenQuok account. No repository access is required.

## Before you start

<Steps>

### Sign in

Create an account or sign in at <a href="/sign-in">Sign in</a>. Publishing is only available to logged-in users.

### Choose a public username

Your listings appear under <code>/creators/your-username</code>. If prompted, complete <a href="/account/choose-username">Choose username</a> before creating a building block or playbook.

### Know what you are publishing

Decide whether you are sharing a single **building block** or a **playbook** stack. See <a href="/docs/publish-listings/listing-types">Listing types explained</a> if you are unsure.

</Steps>

## Publish a building block

<Steps>

### Open your Playbooks workspace

Go to <a href="/account/playbooks">Account → Playbooks</a> and open the **My Playbooks** tab.

### Start a new building block

Click **New building block**. This opens the listing editor at <code>/account/playbooks/building-block/new</code>.

### Fill in the basics

Add a clear **title**, **slug**, **description**, and **category**. Choose **Skills**, **MCP**, or **Both** as the extension type, then add the fields that match:

- **Skills** — install command and optional setup doc URL
- **MCP** — tools list, transport, setup doc URL, and detail-page server config
- **Both** — separate skills and MCP sections

Add **tags** so people can filter your listing on the hub (for example social platforms or content types).

### Save, then submit for review

Click **Create** or **Update** to save. When you are ready for others to see it, turn **Publish** on and save again.

<Callout type="warning" title="Admin approval">
<p>Community listings need <strong>platform admin approval</strong> before they show on <a href="/building-blocks">Building Blocks</a>. Until then, status shows as awaiting approval in your account.</p>
</Callout>

</Steps>

## Publish a playbook

You can create a playbook in two ways.

### From your account

<Steps>

### Open My Playbooks

Go to <a href="/account/playbooks">Account → Playbooks</a> → **My Playbooks**.

### Click New playbook

Opens <code>/account/playbooks/playbook/new</code>.

### Add metadata and members

Set title, description, category, and tags. Select which **building blocks** belong in the stack (your own drafts or published entries from the catalog).

### Submit for review

Save the draft, then enable **Publish** when ready. Playbooks also require admin approval before appearing on <a href="/playbooks">Playbooks</a>.

</Steps>

<h3 id="skill-builder">From Skill Builder</h3>

<a href="/tools/skill-builder">Skill Builder</a> is a visual way to compose a playbook:

1. Pick building blocks from the library (OpenQuok Core is included by default).
2. Arrange **workflow steps** — CLI commands, prompts, and notes.
3. Preview the exported `SKILL.md` on the right.
4. Sign in and click **Save as playbook** to open the playbook editor with your draft pre-filled.

This is ideal when you want to experiment with a workflow before filling in catalog metadata.

<Callout type="tip" title="Start from the hub">
<p>On <a href="/building-blocks">Building Blocks</a>, select multiple entries and use <strong>Create playbook</strong> to jump into Skill Builder with those blocks already chosen.</p>
</Callout>

## After you submit

| Status | What it means |
| --- | --- |
| **Draft** | Only you can see and edit the listing |
| **Awaiting approval** | You submitted; an admin has not approved yet |
| **Published** | Live on the public hub and on your creator page |

You can **unpublish** from your account to remove a listing from the catalog without deleting your work. **Delete** is available for drafts you no longer need.

## Manage existing listings

From <a href="/account/playbooks">Account → Playbooks</a> → **My Playbooks**:

- **Edit** — update copy, tags, install commands, or stack members
- **View public page** — open the hub detail URL when published
- **Unpublish** — hide from the catalog while keeping bookmarks and stack links

Your creator profile at <a href="/creators">Creators</a> lists your published building blocks and playbooks once you have at least one approved listing.

## Related

<CardGrid>
<LinkCard title="Listing types explained" description="Building blocks vs playbooks, Skills vs MCP vs Both" href="/docs/publish-listings/listing-types" />
<LinkCard title="Building Blocks hub" description="See how published building blocks appear to visitors" href="/building-blocks" />
<LinkCard title="Playbooks hub" description="See how published playbooks appear to visitors" href="/playbooks" />
</CardGrid>

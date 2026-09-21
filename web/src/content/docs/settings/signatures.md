---
title: Signatures
description: Reusable text for the OpenQuok post composer — CTAs, hashtag blocks, and link lines, shared across your workspace.
order: 6
lastUpdated: 2026-09-21
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Signatures

> Reusable sign-offs you append in the post composer — CTAs, hashtag blocks, or link lines.

**Where:** <Badge text="Settings" variant="default" /> → <Badge text="Signatures" variant="default" /> (<a href="/account/settings?section=signature">/account/settings?section=signature</a>).

<p>Signatures are <strong>snippets</strong> which everyone on the team sees the same list. Save a hashtag block, disclosure, or sign-off once, then drop it into posts from Settings or the post editor toolbar.</p>

<Callout type="note">
<p>Signatures belong to the <strong>active workspace</strong> in the header switcher. Switch workspaces before editing sign-offs for another team.</p>
</Callout>

## What you can save

| Field | What it does |
| --- | --- |
| **Title** | Label in Settings and the composer picker — required, up to 80 characters |
| **Content** | The text that gets inserted — required, up to 500 characters |
| **Auto add signature?** | When set to <strong>Yes</strong>, OpenQuok prepends this snippet when you open a <strong>new, empty</strong> composer |

![Signature Setting](/docs/_assets/settings/signature-setting.webp)

<p>Each saved signature shows an <Badge text="Auto add" variant="param" /> or <Badge text="Manual" variant="param" /> badge on the list. Only one signature can auto-add at a time — marking a new default clears the previous one.</p>

## Create a signature

<Steps howToName="Create a workspace signature" howToDescription="Add a reusable sign-off in Settings and choose whether it auto-adds to new posts.">

### Open Signatures

<p>From the account menu, open <Badge text="Settings" variant="default" /> and choose <Badge text="Signatures" variant="default" /> in the left list.</p>

### Add the snippet

<p>Click <Badge text="New signature" variant="new" />. Enter a <strong>Title</strong> and <strong>Content</strong>. Use the title to tell similar sign-offs apart — for example <em>Newsletter CTA</em> vs <em>Legal disclosure</em>.</p>

![Add Signature from OpenQuok Signature Setting](/docs/_assets/settings/signature-add-setting.webp)

### Choose auto-add

<p>Set <strong>Auto add signature?</strong> to <strong>Yes</strong> when this sign-off should appear every time you start a blank post. Leave it on <strong>No</strong> when you only want to insert it sometimes. Click <Badge text="Save" variant="new" />.</p>

</Steps>

## Auto-add on new posts

<p>When one signature is marked for auto-add, OpenQuok automatically inserts it when you create a <strong>new post with an empty caption</strong>. You can still edit  that text before you save.</p>

<p>Auto-add does <strong>not</strong> run when:</p>

<ul>
<li>You edit or duplicate an existing post</li>
<li>The composer already has caption text</li>
<li>You load a saved channel set into the composer</li>
<li>You are building a <a href="/docs/posts-management/templates">reusable template</a> (per-channel editing is disabled in that flow)</li>
</ul>

<Callout type="tip">
<p>To change which snippet auto-adds, open the signature in Settings and set <strong>Auto add signature?</strong> to <strong>Yes</strong>, or click <Badge text="Set default" variant="param" /> on the signature list in <strong>Setting</strong>.</p>
</Callout>

## Insert from the post editor

<p>Click the signature icon on the composer toolbar to open the picker.</p>

![Insert a signature from the composer toolbar](/docs/_assets/glossary/insert-a-signature.webp)

<p>Choose a saved snippet and OpenQuok appends it to the caption — with a blank line before it when the body already has text.</p>

![Open Signature Modal](/docs/_assets/settings/signature-composer-modal.webp)

<p>The picker also links to <Badge text="Manage signatures" variant="param" /> when you need to edit sign-offs.</p>

<Callout type="note">
<p>On the post editor in guest mode (for example the free <a href="/tools/humanizer">Humanizer tool</a>), the signature toolbar require sign in. <a href="/sign-up">Sign up</a> for a free account — saved signatures load only after you are in a workspace.</p>
</Callout>

## Edit or remove

<p>On the Signatures settings page, each row offers <Badge text="Edit" variant="param" />, <Badge text="Set default" variant="param" /> (if not auto-add), and <Badge text="Delete" variant="deprecated" />.</p>

## When auto-add is a not a right tool

<Callout type="warning">
<p>An auto-added signature goes into <strong>every</strong> new post on <strong>every</strong> selected channel. A LinkedIn hashtag block or a long link line may not suit every social platform.</p>
</Callout>

<Callout type="tip">
<p>If your sign-off is platform-specific, keep <strong>Auto add signature?</strong> on <strong>No</strong> and insert it manually from the toolbar when you need it. See <a href="/docs/creating-posts/global-vs-per-channel">Global vs per-channel</a>.</p>
</Callout>

<p>Follow-up comment and thread-reply editors do not show the signature toolbar — those rows publish as plain text. See <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a>.</p>

## Plan availability

<p>Signatures are available on every OpenQuok Cloud plan and on self-hosted installs. See <a href="/docs/settings">Settings overview</a> for how other sections behave on Cloud vs self-host.</p>

## Related

<CardGrid>
<LinkCard title="Settings overview" description="All Settings sections and plan gates" href="/docs/settings" />
<LinkCard title="Writing the post" description="Composer toolbar, editor modes, and caption tools" href="/docs/creating-posts/writing-the-post" />
<LinkCard title="Creating posts overview" description="Editor layout, templates, and save options" href="/docs/creating-posts" />
<LinkCard title="Global vs per-channel" description="One caption or a version per network" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="Team" description="Workspace invites, roles, and switching workspaces" href="/docs/settings/team" />
<LinkCard title="Templates" description="Saved composer presets for repeat workflows" href="/docs/posts-management/templates" />
<LinkCard title="Glossary" description="Template, signature, and workspace terms" href="/docs/getting-started/glossary#template" />
</CardGrid>

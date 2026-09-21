---
title: Templates
description: Saved OpenQuok post presets — channels, captions, media, tags, and settings you reuse when scheduling posts.
order: 6
lastUpdated: 2026-09-21
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Templates

> Saved post presets in post editor — channels, captions, media, tags, and settings you reuse instead of rebuilding every post.

**Where:** Sidebar <Badge text="Templates" variant="default" /> (<a href="/account/templates">/account/templates</a>).

<p>A <strong>template</strong> is a <strong>preset</strong> for the post editor. Pick one when you start a new post and OpenQuok restores the channel selection, caption, attachments, tags, provider settings, repeat cadence, and follow-up replies you saved.</p>

![Select a template when starting a post](/docs/_assets/glossary/select-a-template.webp)

<p>Then, you can edit what changed and schedule as usual.</p>

<p>Templates speed up repeat workflows. They do <strong>not</strong> publish on their own.</p>

<Callout type="note">
<p>Templates belong to the <strong>active workspace</strong> in the header switcher. Teammates in the same workspace share the same list.</p>
</Callout>


## What a template stores

| Saved piece | What it restores in the composer |
| --- | --- |
| **Channels** | Which networks are selected (and the channel group, when one was active) |
| **Caption** | Global text, or per-channel bodies when the snapshot was saved that way |
| **Media** | Attachments on the main post |
| **Tags** | Footer tag chips |
| **Provider settings** | Per-network compose fields (post type, title, plugs, and similar) |
| **Repeat** | Repeat cadence from the footer, when set |
| **Follow-up replies** | Shared auto-reply rows for networks that support them |

<p>After you load a template, you can still change anything before you save a draft or add the post to the calendar.</p>

## Create a template

<Steps howToName="Create a reusable template" howToDescription="Define a composer preset on the Templates page and save it for the workspace.">

### Open Templates

<p>From the account sidebar, go to <Badge text="Templates" variant="default" /> or open <a href="/account/templates">/account/templates</a>.</p>

![List of saved templates](/docs/_assets/posts-management/templates-table.webp)

### Add a preset

<p>Click <Badge text="Add a Template" variant="param" />. The composer opens as <strong>Define Reusable Template Set</strong>.</p>

### Build the arrangement

<p>Select channels, write the caption, attach media, set tags, and open per-network <Badge text="Settings" variant="default" /> when needed — same as a normal post. While you are defining a template, stay in <strong>Global</strong> mode: if you focus a channel and try to customize per network, OpenQuok shows <em>You can't edit networks when creating a set</em> and keeps global authoring enabled.</p>

### Save the template

<p>Click <Badge text="Save Template…" variant="new" /> in the footer. Enter a short name and confirm. You need at least <strong>one channel</strong> and either caption text or media before save succeeds.</p>

</Steps>

## Use a template for a new post

<p>When the workspace has at least one saved template, starting a new post from <a href="/account">Home</a> or the <a href="/account/calendar">calendar</a> opens a picker titled <strong>Select a template</strong>.</p>

<ul>
<li>Click a template name to load that preset into the composer.</li>
<li>Click <Badge text="Continue without template" variant="param" /> to start from a blank composer with your usual channel selection.</li>
<li>Click <Badge text="Cancel" variant="default" /> to close without opening the editor.</li>
</ul>

<p>If the workspace has no templates yet, <Badge text="Create Post" variant="new" /> opens the composer directly.</p>

<Callout type="tip">
<ul>
<li>One template per client or brand — their channels and default tags come up together.</li>
<li>One template per content type — for example video posts vs link posts to different networks.</li>
<li>A weekly bundle — same caption skeleton, media slot, and channel mix you tweak each time.</li>
</ul>
</Callout>

## Manage templates on the grid

<p>The Templates page lists every preset in a table. Columns include <strong>Name</strong>, <strong>Channels</strong>, <strong>Body preview</strong>, <strong>Tags</strong>, <strong>Auto-replies</strong>, <strong>Media</strong>, <strong>Repeat</strong>, and <strong>Updated</strong>.</p>

| Action | What it does |
| --- | --- |
| <Badge text="Edit" variant="param" /> | Reopens the composer in template mode with the saved snapshot |
| <Badge text="Delete" variant="deprecated" /> | Removes the template after you confirm |

<p>Use <Badge text="Add filters" variant="param" /> to narrow the table by social channel, tags, name, or body preview.

<p>The <Badge text="Open calendar to schedule posts" variant="param" /> on the Templates page jumps to the calendar when you are ready to turn a loaded preset into a scheduled post.</p>

![Use Smart Filter to find desired templates](/docs/_assets/posts-management/templates-smart-filter.webp)

<Callout type="tip">
This is the same smart filter as Home and <a href="/docs/automations/plugs">Auto Plugs</a>. See <a href="/docs/getting-started/glossary#smart-filter">Smart filter</a> in the glossary.
</Callout>

## Templates vs signatures

| Feature | Templates | <a href="/docs/settings/signatures">Signatures</a> |
| --- | --- | --- |
| **Where** | <a href="/account/templates">/account/templates</a> | Settings → Signatures |
| **Scope** | Full composer preset | Trailing sign-off text only |
| **Typical use** | Same channels + caption structure every week | CTA, hashtag block, or link line appended to posts |

<p>You can combine both: load a template for the main post, then insert a signature from the post editor toolbar or rely on an auto-added default signature.</p>

## Related

<CardGrid>
<LinkCard title="Posts management overview" description="Calendar, kanban, and post actions" href="/docs/posts-management" />
<LinkCard title="Creating posts overview" description="Composer layout, flow, and save options" href="/docs/creating-posts" />
<LinkCard title="Global vs per-channel" description="One caption or a version per network" href="/docs/creating-posts/global-vs-per-channel" />
<LinkCard title="Scheduling" description="Save as draft, add to calendar, and repeat" href="/docs/creating-posts/scheduling" />
<LinkCard title="Signatures" description="Reusable sign-offs from Settings" href="/docs/settings/signatures" />
<LinkCard title="Glossary" description="Template, smart filter, and workspace terms" href="/docs/getting-started/glossary#template" />
</CardGrid>

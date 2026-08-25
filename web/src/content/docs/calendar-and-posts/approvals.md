---
title: Approvals
description: Send a client a preview link, collect comments, and schedule once you are happy — no OpenQuok login required for reviewers.
order: 3
lastUpdated: 2026-08-25
---

<script>
import { Badge, Callout, CardGrid, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## What it is

Every post has a **preview page** at <Badge text="/p/" variant="path" /> plus the post id. Send that link when someone outside your workspace should read the copy and leave feedback — without giving them access to Home, the calendar, or your other clients.

**Where:** <a href="/account">Home</a> or the <a href="/account/calendar">calendar</a> — open a post card, then click <Badge text="Preview" variant="default" /> in the actions menu.

![Post Actions Modal](/docs/_assets/glossary/post-actions-modal.webp)

The preview opens in a new tab. Click <Badge text="Share with Others" variant="new" /> on that page to copy the link and send it by email or chat.

## What the reviewer sees

- The post as it will look on the network — caption, media, and thread parts where applicable.
- The scheduled date, when one is set.
- A comment box when collaboration is enabled on your plan.

They do not see your workspace, other channel groups, or any other posts. No OpenQuok account is required to read the page.

## A simple review cycle

<Steps>

### Draft the week

Write posts and save them as <Badge text="Draft" variant="default" /> so nothing can publish while they are under review.

### Send preview links

Open each post’s actions menu, click <Badge text="Preview" variant="default" />, then <Badge text="Share with Others" variant="new" />. Send the copied URL to your client.

### Read the comments

Feedback is stored on the post it belongs to — not scattered across email threads.

### Edit and schedule

Apply changes in the composer, then move the post to <Badge text="Scheduled" variant="default" /> when you are ready to publish.

</Steps>

## Pair with channel groups

If you run social for multiple clients, the usual flow is:

1. Put their channels in a <a href="/docs/channels/channel-groups">channel group</a>.
2. Filter Home or the calendar to that group.
3. Draft their week.
4. Send preview links for posts that need sign-off.
5. Schedule once you have heard back.

## Limits worth knowing

<Callout type="note" title="Cloud plans">
<p>Shareable preview links and collaboration comments need <strong>Team</strong> or above on OpenQuok Cloud. Lower tiers can still open previews from the post menu for your own review. See <a href="/docs/cloud/limits">Cloud limits</a>.</p>
</Callout>

<Callout type="warning">
<p>A preview link is not password protected. Anyone with the URL can read the post and comment. Treat it like an unlisted link — only send it to people you trust.</p>
</Callout>

<p>Approval is a conversation, not a locked state. OpenQuok does not set an <strong>approved</strong> flag that blocks publishing. You move the post from draft to scheduled yourself when you are satisfied.</p>

## Related

<CardGrid>
<LinkCard title="Channel groups" description="Bundle a client’s channels and filter the calendar" href="/docs/channels/channel-groups" />
<LinkCard title="Glossary" description="Draft, scheduled, and preview link terminology" href="/docs/getting-started/glossary" />
<LinkCard title="Cloud limits" description="Shareable preview availability by plan" href="/docs/cloud/limits" />
<LinkCard title="Quickstart" description="Connect a channel and schedule your first post" href="/docs/getting-started/quickstart" />
</CardGrid>

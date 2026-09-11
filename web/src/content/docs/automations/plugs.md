---
title: Plugs Overview
description: OpenQuok plugs add a reply, comment, repost, or reshare after your post publishes.
order: 1
lastUpdated: 2026-09-11
---

<script>
import { Badge, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

A **plug** is an automation that runs **after** your post goes live. It, for example, adds a reply, comment, repost, or reshare.

| Kind | Scope | Where you set it | When it runs |
| --- | --- | --- | --- |
| <a href="/docs/automations/internal-plugs">Internal plug</a> | Same account, one post | Post Editor <Badge text="Settings" variant="default" /> | After publish and after same-account <a href="/docs/creating-posts/threads-and-comments">follow-up replies</a> |
| <a href="/docs/automations/cross-account-plugs">Cross-account plug</a> | Other connected channels, one post | Post Editor <Badge text="Plug settings" variant="default" /> or <Badge text="Settings" variant="default" /> | After publish and after same-account follow-ups |
| <a href="/docs/automations/global-plugs">Global plug</a> | Channel rule on future posts | <a href="/account/plugs">Account → Auto Plugs</a> | When **likes** on the live post reach your threshold |

## What each network supports

| Network | Same-account follow-ups | Cross-account plugs | Global plugs |
| --- | --- | --- | --- |
| **Threads** | Yes — thread replies, finisher, delayed engagement reply | Comment from other Threads channels | Auto plug post (reply when likes ≥ threshold) |
| **X** | Yes — quote-less replies on the root tweet | **Repost** from other X channels (not reply comments from another account) | Auto repost; auto plug post (reply when likes ≥ threshold) |
| **LinkedIn** | Yes — text-only comments on the main post | Comment or reshare from other LinkedIn channels | No |
| **LinkedIn Page** | Yes — text-only comments on the main post | Comment or reshare from other LinkedIn channels | Auto repost; auto plug post (Page comment when likes ≥ threshold) |
| **Instagram**, **Facebook**, **YouTube**, **TikTok**, **Dev.to**, … | See <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a> | No | No |

Media on same-account follow-ups varies by network. See the platform table in <a href="/docs/creating-posts/threads-and-comments#what-each-platform-does">Threads and comments → What each platform does</a>.

## Order of operations

For a typical scheduled post with follow-ups and plugs:

1. Publish the **main post** on each selected channel.
2. Run **same-account follow-up replies** (and thread finisher on Threads or X, if enabled).
3. Run the **internal plug** (Threads delayed engagement reply).
4. Run **cross-account plugs** (comment, repost, or reshare from other channels).
5. **Global plugs** run later when likes cross your threshold.

## Things to check

1. Global rules watch **likes**. Pick a threshold your posts can reach.
2. Follow-ups and plug replies count as real posts. Rate limits still apply.
3. Cross-account plugs need two connected channels on that network.
4. Internal and cross-account plugs live on the post. Global plugs live at <a href="/account/plugs">/account/plugs</a>.

## Related

<CardGrid>
<LinkCard title="Internal plugs" description="Same-account delayed engagement on one post" href="/docs/automations/internal-plugs" />
<LinkCard title="Cross-account plugs" description="Other connected channels comment, repost, or reshare" href="/docs/automations/cross-account-plugs" />
<LinkCard title="Global plugs" description="Channel rules when likes reach a threshold" href="/docs/automations/global-plugs" />
<LinkCard title="Threads and comments" description="Follow-up replies and thread finisher in the composer" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="CLI usage — Global plugs" description="plugs:catalog, plugs:upsert, and related commands" href="/docs/cli-usages/plugs" />
<LinkCard title="Public API → Plugs" description="Internal vs global plugs for API and SDK users" href="/docs/getting-started-for-public-api#plugs" />
</CardGrid>

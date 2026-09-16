---
title: Free AI generation
description: Draft and rewrite captions in the OpenQuok social scheduler — on-device Writer, Summarizer, and Rewriter, plus agent and API scheduling.
order: 5
lastUpdated: 2026-09-12
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Free AI generation

> Writer, Summarizer, and Sound more human — on-device in the composer, or schedule drafts from agents.

**Where:** The post editor toolbar and the same three tools on each **Follow-up comments** row.

Generate and rewrite post copy in the post editor, or schedule drafts from an agent, MCP client, or CLI.

![Three AI tools in the composer toolbar](/docs/_assets/creating-posts/ai-toolbar.webp)


| Tools | What it does |
| --- | --- |
| <Badge text="AI Writer" variant="param" /> | Drafts new caption text from your prompt, then **appends** the result to the caption box |
| <Badge text="Summarizer" variant="param" /> | Shortens the caption, then **replaces** that text with the summary |
| <Badge text="Sound more human" variant="param" /> | Rewrites the caption, so it reads less machine-written, then **replaces** the source text |


## Unlimited writing

OpenQuok does **not** meter AI usage by credits. Writer, Summarizer, and Rewriter run in your browser after you opt in. Inference stays on your device, not OpenQuok's server.

![Opt-in local modal before using AI toolbar](/docs/_assets/creating-posts/ai-opt-in.webp)

**Unlimited** means no token bucket to drain in the dashboard. It does not guarantee every laptop can download the on-device model, or that Chrome's experimental APIs stay unchanged. If those APIs becomes stable, there should more supported devices.

You may still hit platform character limits and save-time validation — see <a href="/docs/platforms">Posting rules by platform</a>.

<Callout type="warning">
<p>The local LLM model runs <strong>on your device</strong> in supported Chromium browsers. They use Chrome's <DocsExternalLink href="https://developer.chrome.com/docs/ai/writer-api">Writer API</DocsExternalLink>, <DocsExternalLink href="https://developer.chrome.com/docs/ai/rewriter-api">Rewriter API</DocsExternalLink>, and <DocsExternalLink href="https://developer.chrome.com/docs/ai/summarizer-api">Summarizer API</DocsExternalLink>, which are still <strong>experimental</strong>. The first use may download an on-device model. Android, iOS, and browsers without these APIs are not supported for on-device generation.</p>
</Callout>


## AI Writer

**AI Writer** drafts new caption text from your prompt. It uses the Chrome Writer API on your machine.

Open the tool. Type what you want. The modal streams a draft. Refine it with chips such as **More casual**, **Shorter**, or **Sound more human**. Those refinements use the Rewriter API.

![Open AI Writer modal from the composer toolbar](/docs/_assets/creating-posts/ai-writer.webp)

When you are ready, **Insert** appends the draft to the caption. The modal can show a soft character limit for your selected channels.


## Summarizer

**Summarizer** shortens text that is already in the post editor. It uses the Chrome Summarizer API. For long captions, OpenQuok may summarize in chunks and merge the result.

![Open AI Summarizer modal from the composer toolbar](/docs/_assets/creating-posts/ai-summarizer.webp)

Pick a **type** and **length**:

| Type | What you get |
| --- | --- |
| <Badge text="TL;DR" variant="param" /> | A tight summary of the main point |
| <Badge text="Key points" variant="param" /> | Bullet-style takeaways |
| <Badge text="Teaser" variant="param" /> | A short hook |
| <Badge text="Headline" variant="param" /> | A one-line title |

Length options are <Badge text="Short" variant="param" />, <Badge text="Medium" variant="param" />, and <Badge text="Long" variant="param" />.

## Sound more human

**Sound more human** rewrites existing copy so it reads less machine-written. It uses the Chrome Rewriter API.

![Open AI Rewriter modal from the composer toolbar](/docs/_assets/creating-posts/ai-rewriter.webp)

| Mode | What it does |
| --- | --- |
| <Badge text="Human" variant="param" /> | Same facts and call to action — less stock phrasing |
| <Badge text="Roughen" variant="param" /> | Rougher, more spoken voice. Review any invented names, dates, or prices before you post |

The modal shows a **tells** count before and after the rewrite. That count tracks common machine's habits. It is not a detector score.

When Rewriter is not available, OpenQuok runs a **local cleanup** on the same catalogs (stock phrases, em dashes, pep-talk endings, and similar).

<Callout type="tip">
<p>The local cleanup's result should be faster and more predictable, but less nuanced than the on-device model. Also, <strong>Sound more human</strong> still applies a local phrasing cleanup when Rewriter is missing.</p>
</Callout>

<Callout type="tip">
<p>Read <a href="/blog/how-openquok-humanizer-rewrites-a-draft-in-the-browser">How OpenQuok Humanizer rewrites a draft in the browser</a> for the writing catalogs and the two rewrite paths.</p>
</Callout>


### Free Humanizer tool

The public <a href="/tools/humanizer">Humanizer</a> at <Badge text="/tools/humanizer" variant="path" /> uses the same **Human** and **Roughen** modes. Rewrite and copy text with no account. Channel chips are samples for format and limits only.

<a href="/sign-in">Sign in</a> when you want real channels, drafts, and scheduling in the composer.

Per-network pages such as <a href="/tools/humanizer/linkedin">LinkedIn Humanizer</a> preselect a sample chip and tighten the FAQ for that network.

## Follow-up comments

On networks that support **Follow-up comments**, each reply row has its own mini toolbar with **AI Writer**, **Summarize**, and **Sound more human**. Behavior matches the main caption tools. See <a href="/docs/creating-posts/threads-and-comments">Threads and comments</a>.

## Agent, MCP, CLI, and API

Alternativel, you may use your prefered agents to schedule posts. The options are:

| Path | Typical use |
| --- | --- |
| **MCP** | Ask Cursor, Claude Desktop, or another MCP client to schedule a post — see <a href="/docs/getting-started-for-mcp">MCP introduction</a> |
| **CLI** | Run <Badge text="openquok posts:create" variant="default" /> from a terminal — see <a href="/docs/getting-started-for-cli">CLI</a> |
| **Public API** | Call <Badge text="POST /public/posts" variant="path" /> with an API key — see <a href="/docs/getting-started-for-public-api">Public API</a> |


## Privacy and review

After the first model download, Chrome's on-device APIs process text locally. OpenQuok still stores the caption you save as a draft or scheduled post in your workspace.

<Callout type="note">
AI output can sound confident and still be wrong. <Badge text="Roughen" variant="param" /> mode may invent specifics — swap in real names, numbers, and links. Platforms may add AI labels or enforce disclosure rules separately from how the copy reads. See more at <a href="/blog/platforms-are-adding-ai-labels-detectors-and-bans-your-draft-can-still-sound-like-a-machine">AI labels, detectors, and bans</a>.
</Callout>

## Related

<CardGrid>
<LinkCard title="Writing the post" description="Toolbar overview, character count, and editor modes" href="/docs/creating-posts/writing-the-post" />
<LinkCard title="Media" description="Attach images and video — no AI image or video generation" href="/docs/creating-posts/media" />
<LinkCard title="Humanizer" description="Free browser tool — rewrite drafts without signing in" href="/tools/humanizer" />
<LinkCard title="Threads and comments" description="AI tools on follow-up comment rows" href="/docs/creating-posts/threads-and-comments" />
<LinkCard title="Kanban board" description="Filter agent drafts with Source → Agent" href="/docs/creating-posts/kanban" />
<LinkCard title="MCP introduction" description="Schedule from Cursor, Claude, and other clients" href="/docs/getting-started-for-mcp" />
<LinkCard title="Public API" description="POST /public/posts and Payload Wizard" href="/docs/getting-started-for-public-api" />
<LinkCard title="CLI" description="openquok posts:create and related commands" href="/docs/getting-started-for-cli" />
</CardGrid>

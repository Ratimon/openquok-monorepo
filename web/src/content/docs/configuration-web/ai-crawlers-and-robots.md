---
title: AI crawlers and robots.txt
description: Allow Claude, Gemini, ChatGPT, and Perplexity to discover OpenQuok public pages when Cloudflare managed robots.txt is enabled.
order: 5
lastUpdated: 2026-08-12
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

OpenQuok serves <Badge text="/robots.txt" variant="path" /> from the web app and publishes <Badge text="/llms.txt" variant="path" /> plus <Badge text="/llms-full.txt" variant="path" /> for documentation discovery. Marketing pages, docs, and channel hubs are meant to be crawlable; auth and workspace routes stay disallowed.

If a **directory or AI visibility tool** (for example PeerPush’s “AI engine coverage map”) reports that **Claude** or **Gemini** “has not found you” while ChatGPT, Copilot, or Perplexity partially do, check production <Badge text="/robots.txt" variant="path" /> first. On OpenQuok, the usual cause is **Cloudflare managed robots.txt** (“block training in robots.txt”), not the SvelteKit route alone.

<Callout type="danger" title="Repo deploy cannot fix PeerPush Claude / Gemini">
The SvelteKit <Badge text="Allow: /" variant="path" /> groups are already correct. Cloudflare still prepends <Badge text="Disallow Path" variant="path" /> for <Badge text="ClaudeBot" variant="default" /> and <Badge text="Google-Extended" variant="default" /> until you turn managed robots.txt off in the zone. Confirm with <code>pnpm --filter ./web run verify:ai-robots</code> — it fails while that prepend exists.
</Callout>

## Why ChatGPT can look fine while Claude and Gemini do not

Cloudflare’s managed block list typically includes <Badge text="ClaudeBot" variant="default" />, <Badge text="Google-Extended" variant="default" />, and <Badge text="GPTBot" variant="default" />, but **not** every OpenAI or Microsoft user agent. Tools often attribute ChatGPT coverage to <Badge text="OAI-SearchBot" variant="default" /> / <Badge text="ChatGPT-User" variant="default" />, Copilot to Bing, and Perplexity to <Badge text="PerplexityBot" variant="default" /> — none of which appear in the managed Disallow list. Claude and Gemini map to the blocked tokens, so the coverage map shows a gap.

## What production looks like when the bug is present

When Cloudflare injects managed content, <Badge text="/robots.txt" variant="path" /> begins with a block like:

```text
# BEGIN Cloudflare Managed content
User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /
...
# END Cloudflare Managed Content
```

The OpenQuok app **appends** its own rules after that block (sitemap, auth disallows, explicit <strong>Allow</strong> groups for AI crawlers). Most parsers treat the Cloudflare <Badge text="Disallow: /" variant="path" /> as a full-site block for that user agent. **Appending** <Badge text="Allow: /" variant="path" /> in the app cannot undo it.

<Callout type="warning" title="Repo deploy is not enough">
Turning off Cloudflare managed robots.txt is required. Allowing crawlers in <strong>AI Crawl Control</strong> alone does <strong>not</strong> remove the prepended <Badge text="Disallow: /" variant="path" /> block. Verify with <code>pnpm --filter ./web run verify:ai-robots</code>.
</Callout>

## Why “Training → Allow” is not enough

Cloudflare has <strong>two separate controls</strong>:

| Control | What it does | PeerPush Claude / Gemini |
| --- | --- | --- |
| <strong>Training → Allow (do not block)</strong> under Configure AI bot policies | Stops Cloudflare from <strong>HTTP-blocking</strong> training crawlers at the edge | Necessary, but not sufficient |
| <strong>Set your preference to block training in robots.txt</strong> (managed robots.txt) | Prepends <Badge text="Disallow: /" variant="path" /> for <Badge text="ClaudeBot" variant="default" />, <Badge text="Google-Extended" variant="default" />, <Badge text="GPTBot" variant="default" />, … | This is what PeerPush reads |

Cloudflare’s Training UI even points at the robots preference (“To exclude such crawlers, set your preference <em>here</em>”). Having Training on <strong>Allow</strong> while managed robots.txt stays on is exactly the state that produces: crawlers are not WAF-blocked, but <Badge text="/robots.txt" variant="path" /> still tells them the site is off-limits — and coverage tools treat that as “Claude / Gemini hasn’t found you.”

<Callout type="warning" title="Confirm with curl, not the Training toggle">
If <code>curl -sS https://www.openquok.com/robots.txt</code> still shows <code># BEGIN Cloudflare Managed content</code> with <Badge text="ClaudeBot" variant="default" /> / <Badge text="Google-Extended" variant="default" /> and <Badge text="Disallow: /" variant="path" />, managed robots.txt is still on — regardless of Training Allow.
</Callout>

## Fix in Cloudflare (production)

<Steps
	howToName="Cloudflare Setup to allow AI clawers"
	howToDescription="Allow Claude, Gemini, ChatGPT, and Perplexity to discover OpenQuok public pages."
>

### Open Security Settings → Bot traffic

In the <DocsExternalLink href="https://dash.cloudflare.com/">Cloudflare dashboard</DocsExternalLink>, select the zone that serves <Badge text="www.openquok.com" variant="new" />. Open <strong>Security</strong> → <strong>Settings</strong>, filter by <strong>Bot traffic</strong> (or follow the <strong>here</strong> link from the Training policy copy).

### Turn OFF managed training blocks in robots.txt

Find <strong>Set your preference to block training in robots.txt</strong> (managed robots.txt) and <strong>turn it off</strong>. Do <strong>not</strong> stop at <strong>Training → Allow (do not block)</strong> — that is a different setting.

That is the control that prepends <Badge text="Disallow: /" variant="path" /> for <Badge text="ClaudeBot" variant="default" />, <Badge text="Google-Extended" variant="default" />, <Badge text="GPTBot" variant="default" />, and related training crawlers. With it off, crawlers see only the OpenQuok origin file (Content Signals + auth disallows + explicit AI <strong>Allow</strong> groups). OpenQuok still emits <Badge text="ai-train=no" variant="default" /> via Content-Signal, so you keep a soft training preference without a site-wide crawl block.

### Or flip it via API

Create a Cloudflare API token with <strong>Bot Management Write</strong> for the marketing zone, then:

```bash
export CLOUDFLARE_API_TOKEN='…'
export CLOUDFLARE_ZONE_NAME='openquok.com' # or set CLOUDFLARE_ZONE_ID
pnpm --filter ./web run fix:ai-robots
```

This sets <Badge text="is_robots_txt_managed" variant="default" /> to <code>false</code> on the zone (see <DocsExternalLink href="https://developers.cloudflare.com/api/resources/bot_management/methods/update/">Update Zone Bot Management Config</DocsExternalLink>).

### Keep Training Allow (already correct if set)

Under <strong>Security</strong> → <strong>Settings</strong> → <strong>Configure AI bot policies</strong>, leave <strong>Training</strong> on <strong>Allow (do not block)</strong>. That only affects edge HTTP blocking. PeerPush still fails until managed robots.txt is off.

### Optional: AI Crawl Control Allow

Under <strong>Security</strong> → <strong>AI Crawl Control</strong>, set <strong>Action</strong> to <strong>Allow</strong> for crawlers you want (at least <Badge text="ClaudeBot" variant="default" /> and <Badge text="Google-Extended" variant="default" />). This also controls WAF blocking; it does not replace turning off managed robots.txt for the PeerPush-style robots check.

### Verify the live file

```bash
pnpm --filter ./web run verify:ai-robots
# or
curl -sS "https://www.openquok.com/robots.txt"
```

Pass criteria:

- No Cloudflare managed section with <Badge text="ClaudeBot" variant="default" /> / <Badge text="Google-Extended" variant="default" /> and <Badge text="Disallow: /" variant="path" />
- Origin suffix still lists <Badge text="Sitemap:" variant="default" /> and <Badge text="Allow: /" variant="path" /> for those bots

</Steps>

## After robots is fixed: PeerPush may still lag

Once <code>pnpm --filter ./web run verify:ai-robots</code> passes, the crawl <strong>gate</strong> is open. PeerPush’s “AI engine coverage map” is not only a robots check — the percentages (e.g. ChatGPT 73% / Copilot 24% / Perplexity 3%) are a <strong>visibility mix</strong> across engines that have already retrieved or attributed your product.

So <strong>Claude hasn’t found you</strong> / <strong>Gemini hasn’t found you</strong> after a successful Cloudflare change usually means:

1. PeerPush has not rescanned yet (force a refresh/rescan in their dashboard if available), or
2. Claude / Gemini have not crawled or cited the product yet (often days to weeks after allow), or
3. Those engines still lack enough public facts / third-party mentions to retrieve you for PeerPush’s prompts

That is no longer fixed by more <Badge text="robots.txt" variant="path" /> edits. Keep <Badge text="/llms.txt" variant="path" />, pricing, compare, and docs public; watch Cloudflare <strong>AI Crawl Control</strong> for <Badge text="ClaudeBot" variant="default" /> / <Badge text="Google-Extended" variant="default" /> request logs; and re-check PeerPush after a rescan.

## What the web app emits

The route <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/routes/robots.txt/%2Bserver.ts"><Badge text="web/src/routes/robots.txt/+server.ts" variant="path" /></DocsExternalLink> builds:

- <Badge text="User-agent: *" variant="default" /> — Content-Signal (<Badge text="search=yes" variant="default" />, <Badge text="ai-input=yes" variant="default" />, <Badge text="ai-train=no" variant="default" />) plus disallow auth, editor, admin, and OAuth paths only
- Per–AI-bot groups with <Badge text="Allow: /" variant="path" /> plus the same auth/admin disallows (including <Badge text="Claude-SearchBot" variant="default" /> / <Badge text="Claude-User" variant="default" />)
- Meta crawler allows (Facebook / Instagram app verification)
- Comments pointing to <Badge text="/llms.txt" variant="path" /> and <Badge text="/rss.xml" variant="path" />

Every public HTML page also advertises the LLM index via <Badge text="&lt;link rel=&quot;alternate&quot; href=&quot;/llms.txt&quot;&gt;" variant="default" /> in global meta tags (<Badge text="createMetaData" variant="path" />).

## Related configuration

<CardGrid>
<LinkCard title="SEO & marketing defaults" description="Meta tags and CONFIG_SCHEMA_MARKETING" href="/docs/configuration-web/seo" />
<LinkCard title="Production deployment" description="Canonical origins and redeploying web + API" href="/docs/installation/production-deployment" />
<LinkCard title="Configuration - Web" description="Web env and Vite settings" href="/docs/configuration-web" />
</CardGrid>

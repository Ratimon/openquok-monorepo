---
title: AI crawlers and robots.txt
description: Allow Claude, Gemini, ChatGPT, and Perplexity to discover OpenQuok public pages when Cloudflare managed robots.txt is enabled.
order: 5
lastUpdated: 2026-09-25
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

The web app exposes <Badge text="/robots.txt" variant="path" />, <Badge text="/llms.txt" variant="path" />, and <Badge text="/llms-full.txt" variant="path" /> so bots can find public docs and marketing pages. Sign-in and workspace URLs stay off-limits.

<Badge text="/mcp" variant="path" /> on the <strong>website</strong> is docs-only (no API key). Workspace automation uses <Badge text="/mcp" variant="path" /> on the **API** — same path, different host.

If an AI visibility checker says Claude or Gemini cannot see you, read live <Badge text="/robots.txt" variant="path" /> first. On Cloudflare, turning off <strong>block training in robots.txt</strong> (managed robots) fixes this more often than changing OpenQuok settings alone.

## Why “Training → Allow” is not enough

Cloudflare has <strong>two separate controls</strong>:

| Control | What it does | Claude / Gemini |
| --- | --- | --- |
| <strong>Training → Allow (do not block)</strong> under Configure AI bot policies | Stops Cloudflare from <strong>HTTP-blocking</strong> training crawlers at the edge | Necessary, but not sufficient |
| <strong>Set your preference to block training in robots.txt</strong> (managed robots.txt) | Prepends <Badge text="Disallow: /" variant="path" /> for <Badge text="ClaudeBot" variant="default" />, <Badge text="Google-Extended" variant="default" />, <Badge text="GPTBot" variant="default" />, … | What robots-based visibility checkers see |

<strong>Training → Allow</strong> without turning off managed robots.txt leaves <Badge text="/robots.txt" variant="path" /> telling crawlers to stay away — which is why visibility tools still say Claude or Gemini cannot find you.

<Callout type="warning">
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

Under <strong>Security</strong> → <strong>Settings</strong> → <strong>Configure AI bot policies</strong>, leave <strong>Training</strong> on <strong>Allow (do not block)</strong>. That only affects edge HTTP blocking.

### Optional: AI Crawl Control Allow

Under <strong>Security</strong> → <strong>AI Crawl Control</strong>, set <strong>Action</strong> to <strong>Allow</strong> for crawlers you want (at least <Badge text="ClaudeBot" variant="default" /> and <Badge text="Google-Extended" variant="default" />). This also controls WAF blocking.

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

## After robots is fixed: AI crawlers may still lag

When <code>pnpm --filter ./web run verify:ai-robots</code> passes, bots are allowed in,but Claude or Gemini may still not show your site for days or weeks. Each engine crawls and updates on its own schedule.

More <Badge text="robots.txt" variant="path" /> changes will not speed that up. Keep docs, pricing, compare, and <Badge text="/llms.txt" variant="path" /> public, and use Cloudflare <strong>AI Crawl Control</strong> to confirm <Badge text="ClaudeBot" variant="default" /> and <Badge text="Google-Extended" variant="default" /> are actually hitting your domain.

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
<LinkCard title="MCP overview" description="Product MCP on the API vs documentation MCP on the web origin" href="/docs/getting-started-for-mcp" />
</CardGrid>

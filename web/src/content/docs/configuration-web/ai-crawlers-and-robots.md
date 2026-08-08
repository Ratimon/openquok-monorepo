---
title: AI crawlers and robots.txt
description: Allow Claude, Gemini, ChatGPT, and Perplexity to discover OpenQuok public pages when Cloudflare managed robots.txt is enabled.
order: 5
lastUpdated: 2026-08-08
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

OpenQuok serves <Badge text="/robots.txt" variant="path" /> from the web app and publishes <Badge text="/llms.txt" variant="path" /> plus <Badge text="/llms-full.txt" variant="path" /> for documentation discovery. Marketing pages, docs, and channel hubs are meant to be crawlable; auth and workspace routes stay disallowed.

If a **directory or AI visibility tool** reports that **Claude** or **Gemini** “has not found you” while ChatGPT or Copilot partially do, the usual cause on production is **Cloudflare Managed robots.txt** (AI Crawl Control), not the SvelteKit route alone.

## What production looks like today

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

The OpenQuok app **appends** its own rules after that block (sitemap, auth disallows, explicit <strong>Allow</strong> groups for AI crawlers). Some crawlers merge duplicate user-agent groups; others treat the first <Badge text="Disallow: /" variant="path" /> as a full-site block. **You should align Cloudflare with the Allow policy below** so Claude and Gemini can crawl public URLs reliably.

<Callout type="warning" title="Dashboard change required">
Turning off blanket AI blocks in Cloudflare is required for Claude (<Badge text="ClaudeBot" variant="default" />) and Gemini training/grounding crawlers (<Badge text="Google-Extended" variant="default" />). Repo changes alone cannot remove the prepended Cloudflare section.
</Callout>

## Fix in Cloudflare (production)

<Steps>

### Open AI Crawl Control

In the <DocsExternalLink href="https://dash.cloudflare.com/">Cloudflare dashboard</DocsExternalLink>, select the zone that serves <Badge text="www.openquok.com" variant="new" /> (or your marketing hostname). Open <strong>Security</strong> → <strong>AI Crawl Control</strong> (formerly AI Audit).

### Allow crawlers you want indexed

For each crawler you want in AI search and directory coverage tools, set **Action** to <strong>Allow</strong> (at minimum):

- <Badge text="ClaudeBot" variant="default" /> (Anthropic / Claude)
- <Badge text="Google-Extended" variant="default" /> (Google Gemini / AI products)
- <Badge text="GPTBot" variant="default" /> and <Badge text="OAI-SearchBot" variant="default" /> (OpenAI / ChatGPT) if you want parity with other engines
- <Badge text="PerplexityBot" variant="default" /> if not already allowed via <Badge text="User-agent: *" variant="default" />

Keep **training** restrictions if you prefer: managed content can still emit <Badge text="Content-Signal: ai-train=no" variant="default" /> while allowing search and grounding crawlers.

### Review Managed robots.txt

Under <strong>Security</strong> → <strong>Bots</strong> → <strong>Configure robots.txt</strong> (managed robots.txt), either:

- Disable automatic <Badge text="Disallow: /" variant="path" /> injection for the crawlers you allowed above, or
- Rely on Cloudflare’s updated Allow actions so the prepended file no longer blocks those user agents.

### Verify the live file

After saving, fetch the live file (replace the host with yours):

```bash
curl -sS "https://www.openquok.com/robots.txt"
```

Confirm <Badge text="ClaudeBot" variant="default" /> and <Badge text="Google-Extended" variant="default" /> are not left with a site-wide <Badge text="Disallow: /" variant="path" /> in the Cloudflare-managed section, and that the OpenQuok suffix still lists <Badge text="Sitemap:" variant="default" /> and <Badge text="Allow: /" variant="path" /> for those bots.

</Steps>

## What the web app emits

The route <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/routes/robots.txt/%2Bserver.ts"><Badge text="web/src/routes/robots.txt/+server.ts" variant="path" /></DocsExternalLink> builds:

- <Badge text="User-agent: *" variant="default" /> — disallow auth, editor, admin, and OAuth paths only
- Per–AI-bot groups with <Badge text="Allow: /" variant="path" /> plus the same auth/admin disallows
- Meta crawler allows (Facebook / Instagram app verification)
- Comments pointing to <Badge text="/llms.txt" variant="path" /> and <Badge text="/rss.xml" variant="path" />

Every public HTML page also advertises the LLM index via <Badge text="&lt;link rel=&quot;alternate&quot; href=&quot;/llms.txt&quot;&gt;" variant="default" /> in global meta tags (<Badge text="createMetaData" variant="path" />).

## Related configuration

<CardGrid>
<LinkCard title="SEO & marketing defaults" description="Meta tags and CONFIG_SCHEMA_MARKETING" href="/docs/configuration-web/seo" />
<LinkCard title="Production deployment" description="Canonical origins and redeploying web + API" href="/docs/installation/production-deployment" />
<LinkCard title="Configuration - Web" description="Web env and Vite settings" href="/docs/configuration-web" />
</CardGrid>

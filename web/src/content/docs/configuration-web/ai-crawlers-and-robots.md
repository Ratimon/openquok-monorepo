---
title: AI crawlers and robots.txt
description: Allow Claude, Gemini, ChatGPT, and Perplexity to discover OpenQuok public pages when Cloudflare managed robots.txt is enabled.
order: 5
lastUpdated: 2026-08-09
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

OpenQuok serves <Badge text="/robots.txt" variant="path" /> from the web app and publishes <Badge text="/llms.txt" variant="path" /> plus <Badge text="/llms-full.txt" variant="path" /> for documentation discovery. Marketing pages, docs, and channel hubs are meant to be crawlable; auth and workspace routes stay disallowed.

If a **directory or AI visibility tool** (for example PeerPush’s “AI engine coverage map”) reports that **Claude** or **Gemini** “has not found you” while ChatGPT, Copilot, or Perplexity partially do, check production <Badge text="/robots.txt" variant="path" /> first. On OpenQuok, the usual cause is **Cloudflare managed robots.txt** (“block training in robots.txt”), not the SvelteKit route alone.

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

## Fix in Cloudflare (production)

<Steps>

### Open Security Settings → Bot traffic

In the <DocsExternalLink href="https://dash.cloudflare.com/">Cloudflare dashboard</DocsExternalLink>, select the zone that serves <Badge text="www.openquok.com" variant="new" />. Open <strong>Security</strong> → <strong>Settings</strong>, filter by <strong>Bot traffic</strong>.

### Turn OFF managed training blocks in robots.txt

Find <strong>Set your preference to block training in robots.txt</strong> (managed robots.txt) and <strong>turn it off</strong>.

That is the control that prepends <Badge text="Disallow: /" variant="path" /> for <Badge text="ClaudeBot" variant="default" />, <Badge text="Google-Extended" variant="default" />, <Badge text="GPTBot" variant="default" />, and related training crawlers. With it off, crawlers see only the OpenQuok origin file (Content Signals + auth disallows + explicit AI <strong>Allow</strong> groups).

### Optional: AI Crawl Control Allow

Under <strong>Security</strong> → <strong>AI Crawl Control</strong>, set <strong>Action</strong> to <strong>Allow</strong> for crawlers you want (at least <Badge text="ClaudeBot" variant="default" /> and <Badge text="Google-Extended" variant="default" />). This controls WAF blocking; it does not replace turning off managed robots.txt for the PeerPush-style robots check.

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

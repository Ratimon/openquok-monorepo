---
title: Built-in Components
description: Documentation components you can use directly in your markdown files.
order: 3
---

<script>
import { Callout, Tabs, TabItem, Steps, Card, CardGrid, LinkCard, Badge, FileTree, DocsExternalLink } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Callouts

Use callouts to highlight important information.

<Callout type="note">
This is a note callout. Use it for general information the reader should be aware of.
</Callout>

<Callout type="tip">
This is a tip callout. Use it for helpful suggestions and best practices.
</Callout>

<Callout type="warning">
This is a warning callout. Use it for potential issues or things to watch out for.
</Callout>

<Callout type="danger">
This is a danger callout. Use it for critical warnings about destructive or irreversible actions.
</Callout>

You can also customize the title:

<Callout type="note" title="Custom Title">
Callouts support custom titles via the `title` prop.
</Callout>

## Tabs

Use tabs to show alternative content, like different package managers:

<Tabs items={["npm", "pnpm", "yarn"]}>
<TabItem label="npm">

```bash
npm install svelte-docs-starter
```

</TabItem>
<TabItem label="pnpm">

```bash
pnpm add svelte-docs-starter
```

</TabItem>
<TabItem label="yarn">

```bash
yarn add svelte-docs-starter
```

</TabItem>
</Tabs>

## Steps

Use steps for sequential instructions:

<Steps>

### Create a new project

Clone the template repository and install dependencies.

### Configure your site

Edit <code>web/src/lib/docs/constants/config.ts</code> (site title, description, sidebar sections, i18n, and assembled docs config such as TOC settings).

### Write your content

Add markdown files to `src/content/docs/`.

### Deploy

Build and deploy to your hosting provider.

</Steps>

## Cards

Use cards to highlight features or key information:

<CardGrid>
<Card title="Markdown Powered" icon="📝">
Write documentation in Markdown with full MDSvex support for Svelte components.
</Card>
<Card title="Fast Search" icon="🔍">
Built-in full-text search powered by Pagefind with zero JavaScript overhead.
</Card>
<Card title="Dark Mode" icon="🌙">
Automatic light and dark theme support with system preference detection.
</Card>
<Card title="SEO Ready" icon="📈">
OpenGraph, Twitter cards, JSON-LD structured data, and auto-generated sitemap.
</Card>
</CardGrid>

## Link Cards

Use link cards for navigation:

<CardGrid>
<LinkCard title="Installation" description="Set up your environment and deploy OpenQuok" href="/docs/Installation" />
<LinkCard title="Configuration" description="Customize your docs site" href="/docs/how-to-write-docs/configuration" />
</CardGrid>

## External links

Use **`DocsExternalLink`** (not raw `<ExternalLink>`) for outbound URLs in docs so links use **`text-primary`**, underline, and **`not-prose`**—they stay readable inside prose.

<DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink>

Optional props match the base anchor: `trusted`, `follow`, `ariaLabel`, `class`.

## Badges

Use **`Badge`** from `$lib/ui/components/docs/mdx/index.js` for short labels in prose.

**Release / status:** <Badge text="New" variant="new" /> <Badge text="Experimental" variant="experimental" /> <Badge text="Deprecated" variant="deprecated" /> <Badge text="v1.0.0" />

**Docs semantics** (pick variants so readers can scan by color — see `web/src/content/docs/Installation/vercel.md`):

- **Backend env** (no <Badge text="VITE_" variant="envWeb" /> prefix): <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />
- **Web / Vite env**: <Badge text="VITE_API_BASE_URL" variant="envWeb" />
- **CORS / origins**: <Badge text="ALLOWED_FRONTEND_ORIGINS" variant="envCors" />
- **Runtime / platform**: <Badge text="VERCEL" variant="envRuntime" />
- **Env files**: <Badge text="backend/.env.development.local" variant="envFile" />
- **Repo paths & routes** (often nested in DocsExternalLink to GitHub): <Badge text="backend/vercel.json" variant="path" />
- **URL examples** (prefer / avoid): <Badge text="https://example.com" variant="new" /> vs <Badge text="https://example.com/" variant="deprecated" />; use the same **new** variant for local dev bases such as <Badge text="http://localhost:5173" variant="new" /> or <Badge text="http://localhost:3000" variant="new" />

## File Tree

Display directory structures:

<FileTree>

- src/
  - content/
    - docs/
      - index.md
      - getting-started/
        - installation.md
      - how-to-write-docs/
        - configuration.md
  - lib/
    - components/
      - docs/
        - callout.svelte
        - tabs.svelte
    - docs/
      - config.ts
      - content.ts

</FileTree>

---
title: Built-in Components
description: how to use documentation components in the markdown files.
order: 4
lastUpdated: 2026-07-05
---

<script>
import { Callout, Tabs, TabItem, Steps, Card, CardGrid, LinkCard, Badge, FileTree, Mermaid, DocsExternalLink, ParamField, ResponseField } from '$lib/ui/components/docs/mdx/index.js';

const docsComponentFlow = `flowchart LR
    MD[".md page"] --> Script["page script import"]
    Script --> Body["MDX body"]
    Body --> UI["Styled docs UI"]
`;
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
<LinkCard title="Installation" description="Set up your environment and deploy OpenQuok" href="/docs/installation" />
<LinkCard title="Configuration" description="Customize your docs site" href="/docs/documentation-contribution/configuration" />
</CardGrid>

## External links

Use **`DocsExternalLink`** (not raw `<ExternalLink>`) for outbound URLs in docs so links use **`text-primary`**, underline, and **`not-prose`**—they stay readable inside prose.

<DocsExternalLink href="https://supabase.com/dashboard">Supabase Dashboard</DocsExternalLink>

Optional props match the base anchor: `trusted`, `follow`, `ariaLabel`, `class`.

## Badges

Use **`Badge`** from `$lib/ui/components/docs/mdx/index.js` for short labels in prose.

**Release / status:** <Badge text="New" variant="new" /> <Badge text="Experimental" variant="experimental" /> <Badge text="Deprecated" variant="deprecated" /> <Badge text="v1.0.0" />

**Docs semantics** (pick variants so readers can scan by color — see `web/src/content/docs/installation/vercel.md`). **`Badge`** is `DocsBadge.svelte`; **`variant`** must be one of: **`default`**, **`new`**, **`deprecated`**, **`experimental`**, **`envBackend`**, **`envWeb`**, **`envRuntime`**, **`path`**, **`param`**.

- **Backend env** (no <Badge text="VITE_" variant="envWeb" /> prefix): <Badge text="BACKEND_DOMAIN_URL" variant="envBackend" />
- **Web / Vite env**: <Badge text="VITE_API_BASE_URL" variant="envWeb" />
- **Runtime / platform**: <Badge text="VERCEL" variant="envRuntime" />
- **Repo paths, env filenames, routes** (often nested in DocsExternalLink to GitHub): <Badge text="backend/.env.development.local" variant="path" /> <Badge text="backend/vercel.json" variant="path" />
- **CLI flags, query keys, path params** (when not using ParamField): <Badge text="--dry-run" variant="param" /> <Badge text="page" variant="param" />
- **URL examples** (prefer / avoid): <Badge text="https://example.com" variant="new" /> vs <Badge text="https://example.com/" variant="deprecated" />; use the same **new** variant for local dev bases such as <Badge text="http://localhost:5173" variant="new" /> or <Badge text="http://localhost:3000" variant="new" />

## Mermaid

Render sequence diagrams, flowcharts, and other Mermaid diagrams. Define the source in a `<script>` constant and pass it with **`string={…}`** (see **Writing Content** → **Mermaid diagrams** for the full pattern).

<Mermaid string={docsComponentFlow} />

```html
<script>
import { Mermaid } from '$lib/ui/components/docs/mdx/index.js';

const mcpFlow = `sequenceDiagram
    participant Agent as AI Agent
    participant MCP as OpenQuok MCP Server
    Agent->>MCP: Connect with opo_ Bearer token
    MCP-->>Agent: List available tools
`;
</script>

<Mermaid string={mcpFlow} />
```

## File Tree

Display directory structures with nested Markdown lists inside **`<FileTree>`** (prefer this over a plain **` ```text `** tree for architecture pages):

<FileTree>

- src/
  - content/
    - docs/
      - index.md
      - getting-started-for-dev/
        - quick-start.md
      - documentation-contribution/
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

## API request / response panels

This repo ships **`RequestExample`** and **`ResponseExample`** cards (similar to common docs-site patterns) plus **`OpenApiOperationExamples`**, which loads **`GET /api/v1/openapi.json`** and fills curl + JSON from the **`openapi:`** frontmatter line. **`OpenApiPlayground`** renders the full try-it UI from the same spec.

Pages with **`openapi`** in YAML get a **desktop split layout** from **`DocsDocRenderer`**: the **endpoint bar** (method, URL, **Try it**) sits in the **main column** under the page title, with **request/response** code panels in the **right rail**. The **left nav** shows a compact **HTTP method badge** for those pages, and the **right “Search / On this page” sidebar** is hidden so the examples rail is the only right column. To keep the **standard** docs chrome (right sidebar + no method badge) on a page that still declares **`openapi`** for the split + playground, add **`docsLayout: standard`** to the frontmatter.

**`ParamField`** shows a request parameter name, **type** and **location** pills, **required**, and description. **`OpenApiDocSplit`** **auto-injects** **Authorizations** (when OpenAPI **`security`** requires your API key), plus **path**, **query**, and **header** parameters from the operation’s **`parameters`** array—use **`ParamField`** in Markdown only for extra narrative the spec does not carry.

<ParamField path="integrationId" type="string" location="path" required description="UUID of the connected channel integration." />

```html
<ParamField path="page" type="integer" location="query" default={1} description="1-based page index for paginated list endpoints." />
```

**`ResponseField`** documents JSON response properties (same pill layout, with optional **`pre`** / **`post`** label arrays):

<ResponseField name="success" type="boolean" required description="Whether the request completed without error." />

```html
<ResponseField name="data" type="object" post={["nullable"]} description="Payload when success is true; omitted or null on failure." />
```

To drop the same three blocks into a single column (e.g. custom MDX), use **`OpenApiOperationExamples`**:

```svelte
<script>
	import { OpenApiOperationExamples } from '$lib/ui/components/docs/mdx/index.js';
</script>

<OpenApiOperationExamples operation="GET /public/social/{integration}" />
```

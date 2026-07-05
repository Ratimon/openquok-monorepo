---
title: Writing Content
description: How to write and organize documentation content.
order: 2
lastUpdated: 2026-07-05
---

## Creating Pages

Create a new `.md` file in `src/content/docs/` to add a page. The file path determines the URL:

| File Path | URL |
|-----------|-----|
| `docs/index.md` | `/docs` |
| `docs/installation/index.md` | `/docs/installation` |
| `docs/how-to-write-docs/configuration.md` | `/docs/how-to-write-docs/configuration` |

## Markdown Features

### Standard Markdown

All standard Markdown syntax is supported — headings, lists, links, images, tables, blockquotes, and more.

### Code Blocks

Fenced code blocks get syntax highlighting via Shiki:

**Shell commands** (`pnpm`, `docker`, `git`, etc.): use **` ```bash `** so commands match the rest of the docs site (see **Installation** guides). Use **` ```text `** for directory trees or CLI transcripts, not **` ```bash `**.

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```

```svelte
<script>
  let count = $state(0);
</script>

<button onclick={() => count++}>
  Clicks: {count}
</button>
```

### Svelte components in Markdown

Docs pages use **MDsveX**: import built-in components from **`$lib/ui/components/docs/mdx/index.js`** in a page-level `<script>` block, then use them in the Markdown body. See **[Built-in Components](/docs/how-to-write-docs/components)** for live examples of callouts, tabs, cards, badges, and OpenAPI panels.

**Pattern**:

```html
<script>
import { Callout, Mermaid, FileTree } from '$lib/ui/components/docs/mdx/index.js';
</script>
```

Conventions for callouts, **`CardGrid`** / **`LinkCard`**, **`Steps`**, **`Badge`**, **`DocsExternalLink`**, agent prompts, and CLI examples are covered in the sections below on this page.

### Mermaid diagrams

Use **`Mermaid`** for sequence diagrams, flowcharts, and other [Mermaid](https://mermaid.js.org/) syntax. Store the diagram source in a `<script>` constant (template literal), then pass it with **`string={…}`**. The component follows the docs light/dark theme automatically.

Reference: **`web/src/content/docs/getting-started-for-mcp/index.md`**, **`web/src/content/docs/configuration-agent/architecture.md`**.

```html
<script>
import { Mermaid } from '$lib/ui/components/docs/mdx/index.js';

const mcpFlow = `sequenceDiagram
    participant Agent as AI Agent
    participant MCP as OpenQuok MCP Server
    participant API as OpenQuok Backend

    Agent->>MCP: Connect with opo_ Bearer token
    MCP-->>Agent: List available tools
    Agent->>MCP: Call tool (e.g. schedulePostTool)
    MCP->>API: Execute action
    API-->>MCP: Return result
    MCP-->>Agent: Tool response
`;
</script>

<Mermaid string={mcpFlow} />
```

Keep diagram text in the script block — not in a fenced Markdown code block — so MDsveX does not treat arrows or quotes as Markdown syntax.

### Directory trees (`FileTree`)

Use **`FileTree`** for folder layouts instead of a plain **` ```text `** block when you want the styled tree UI (connectors, monospace panel). Nest items with Markdown **unordered lists** inside the component.

Reference: **`web/src/content/docs/getting-started-for-dev/architecture.md`**.

```html
<script>
import { FileTree } from '$lib/ui/components/docs/mdx/index.js';
</script>

<FileTree>

- backend/
  - api/
  - handler/
  - app.ts
  - config/
  - connections/
  - controllers/
  - repositories/
  - routes/
  - services/
  - supabase/

</FileTree>
```

Each top-level `- item/` becomes a row; indent with two spaces per level. Trailing slashes on folders are optional but help readers distinguish directories from files.

### Other built-in components

| Component | Use for |
|-----------|---------|
| **`Callout`** | Notes, tips, warnings (`type="note\|tip\|warning\|danger"`) — HTML body, not Markdown |
| **`Steps`** | Numbered setup flows (`###` headings inside `<Steps>`) |
| **`Tabs`** / **`TabItem`** | Alternate commands or config (npm vs pnpm, client vs server) |
| **`Card`** / **`CardGrid`** | Feature highlights or grouped info cards |
| **`LinkCard`** | In-site navigation cards (Related, Next steps) |
| **`Badge`** | Env vars, paths, CLI flags, status chips |
| **`DocsExternalLink`** | Third-party URLs with docs-friendly contrast |
| **`ParamField`** / **`ResponseField`** | Extra API field docs beyond OpenAPI auto-injection |
| **`OpenApiOperationExamples`** | Request/response panels when `openapi:` frontmatter is set |

Live demos and OpenAPI layout notes: **[Built-in Components](/docs/how-to-write-docs/components)**.

## Organizing Content

### Directory Structure

Group related pages in directories. Each directory becomes a sidebar section when configured in `docs.config.ts`.

### Ordering Pages

Use the `order` frontmatter field to control the order of pages in the sidebar:

```yaml
---
title: First Page
order: 1
---
```

Pages without an `order` value appear after ordered pages, sorted alphabetically.

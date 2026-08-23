---
title: Documentation Configuration
description: How to configure docs tabs, sidebars, and site metadata for the OpenQuok documentation site.
order: 2
lastUpdated: 2026-08-22
---

<script>
import { Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Site Configuration

Edit the docs config in:

- <code>web/src/lib/docs/constants/config.ts</code> — site metadata (title/description/social), <code>docsTabs</code> (one sidebar per tab), i18n
- <code>web/src/lib/docs/constants/config.ts</code> — assembled <code>docsConfig</code> (merged sidebar, TOC defaults, optional version selector)

The header tab bar is <code>docsTabs</code>, left to right: **General**, **Cloud**, **Self-hosting**, **CLI**, **MCP**, **Public API**, **Contributing**. Operator install and configuration live on Self-hosting, not General.

<Callout type="note" title="Landing URL">
<p><code>/docs</code> loads the General introduction (the <code>getting-started</code> folder) without redirecting. The same page is also available at <code>/docs/getting-started</code>. Do not treat a root <code>docs/index.md</code> as the tab home.</p>
</Callout>

```typescript
export const docsTabs: DocsTabDefinition[] = [
  { id: 'general', label: 'General', sidebar: docsSidebarGeneral },
  { id: 'cloud', label: 'Cloud', sidebar: docsSidebarCloud },
  { id: 'self-hosting', label: 'Self-hosting', sidebar: docsSidebarSelfHosting },
  { id: 'cli', label: 'CLI', sidebar: docsSidebarCli },
  { id: 'mcp', label: 'MCP', sidebar: docsSidebarMcp },
  { id: 'public-api', label: 'Public API', sidebar: docsSidebarPublicApi },
  { id: 'contributing', label: 'Contributing', sidebar: docsSidebarContributing }
];

export const docsConfig: DocsConfig = {
  site: docsSite,
  sidebar: docsSidebarMerged, // flattened from docsTabs (search, prev/next, llms.txt)
  tabs: docsTabs,
  toc: {
    minDepth: 2,
    maxDepth: 3
  }
};
```

| Tab | Sidebar constant | Tab home |
| --- | --- | --- |
| General | <code>docsSidebarGeneral</code> (<code>getting-started</code>) | <code>/docs</code> |
| Cloud | <code>docsSidebarCloud</code> | <code>/docs/cloud</code> |
| Self-hosting | <code>docsSidebarSelfHosting</code> | <code>/docs/getting-started-for-dev</code> |
| CLI | <code>docsSidebarCli</code> | <code>/docs/getting-started-for-cli</code> |
| MCP | <code>docsSidebarMcp</code> | <code>/docs/getting-started-for-mcp</code> |
| Public API | <code>docsSidebarPublicApi</code> (includes <code>oauth2-for-apps</code>) | <code>/docs/getting-started-for-public-api</code> |
| Contributing | <code>docsSidebarContributing</code> | <code>/docs/developer-guidelines</code> |

Third-party app OAuth (<code>oauth2-for-apps</code>) belongs on Public API. Operator OAuth server setup stays under Self-hosting (<code>admin</code>).

Path matching lives in <code>web/src/lib/docs/navigation.ts</code>. Unknown slugs resolve to <strong>General</strong>, not Self-hosting.

## Sidebar Configuration

### Auto-generated Sections

Use `autogenerate` to build sidebar sections from a directory. Attach each section to the tab that should show it:

```typescript
export const docsSidebarGeneral: DocsSidebarSection[] = [
  {
    label: 'Guide',
    autogenerate: { directory: 'getting-started' }
  }
];
```

This scans `src/content/docs/getting-started/` and creates nav items for each `.md` file.

### Manual Sections

You can also define items manually:

```typescript
{
  label: 'Resources',
  items: [
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'Discord', href: 'https://discord.gg/example' }
  ]
}
```

## Frontmatter Options

Each markdown file supports these frontmatter fields:

```yaml
---
title: Page Title        # Required — displayed as the page heading
description: A summary   # Optional — shown below the title and in meta tags
order: 1                 # Optional — controls sidebar ordering (lower = higher)
draft: true              # Optional — hides the page from navigation
sidebar:
  label: Custom Label    # Optional — overrides the title in the sidebar
---
```

## Related Section(s)

<CardGrid>
<LinkCard title="Writing content" description="Pages, Markdown, FileTree, callouts, and authoring conventions" href="/docs/documentation-contribution/writing-content" />
<LinkCard title="Project Architecture" description="How docs folders map onto the tab bar" href="/docs/getting-started-for-dev/architecture" />
<LinkCard title="General" description="Product usage introduction loaded at /docs" href="/docs" />
</CardGrid>

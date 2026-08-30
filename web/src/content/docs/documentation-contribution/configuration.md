---
title: Documentation Configuration
description: How to configure docs tabs, sidebars, and site metadata for the OpenQuok documentation site.
order: 2
lastUpdated: 2026-08-22
---

<script>
import { Badge, Callout, CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Site Configuration

Edit the docs config in:

-  <Badge text="web/src/lib/docs/constants/config.ts" variant="path" /> — site metadata (title/description/social), <Badge text="docsTabs" variant="param" /> (one sidebar per tab), i18n
- <Badge text="web/src/lib/docs/constants/config.ts" variant="path" /> — assembled <Badge text="docsConfig" variant="param" /> (merged sidebar, TOC defaults, optional version selector)

The header tab bar is <Badge text="docsTabs" variant="param" />, left to right: **General**, **Cloud**, **Self-hosting**, **CLI**, **MCP**, **Public API**, **Contributing**.

<Callout type="note">
<p><Badge text="/docs" variant="path" /> loads the General introduction (the <Badge text="/getting-started" variant="path" /> folder) without redirecting. The same page is also available at <Badge text="/docs/getting-started" variant="path" />. Do not treat a root <Badge text="docs/index.md" variant="path" /> as the tab home.</p>
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
| General | <Badge text="docsSidebarGeneral" variant="param" /> (<Badge text="getting-started" variant="path" />) | <Badge text="/docs" variant="path" /> |
| Cloud | <Badge text="docsSidebarCloud" variant="param" /> | <Badge text="/docs/cloud" variant="path" /> |
| Self-hosting | <Badge text="docsSidebarSelfHosting" variant="param" /> | <Badge text="/docs/getting-started-for-dev" variant="path" /> |
| CLI | <Badge text="docsSidebarCli" variant="param" /> | <Badge text="/docs/getting-started-for-cli" variant="path" /> |
| MCP | <Badge text="docsSidebarMcp" variant="param" /> | <Badge text="/docs/getting-started-for-mcp" variant="path" /> |
| Public API | <Badge text="docsSidebarPublicApi" variant="param" /> (includes <Badge text="oauth2-for-apps" variant="path" />) | <Badge text="/docs/getting-started-for-public-api" variant="path" /> |
| Contributing | <Badge text="docsSidebarContributing" variant="param" /> | <Badge text="/docs/developer-guidelines" variant="path" /> |

Third-party app OAuth (<Badge text="oauth2-for-apps" variant="path" />) belongs on Public API. Operator OAuth server setup stays under Self-hosting (<Badge text="admin" variant="path" />).

Path matching lives in <Badge text="web/src/lib/docs/navigation.ts" variant="path" />. Unknown slugs resolve to <strong>General</strong>, not Self-hosting.

## Sidebar Configuration

### Auto-generated Sections

Use <Badge text="autogenerate" variant="param" /> to build sidebar sections from a directory. Attach each section to the tab that should show it:

```typescript
export const docsSidebarGeneral: DocsSidebarSection[] = [
  {
    label: 'Get started',
    autogenerate: { directory: 'getting-started' }
  },
  {
    label: 'Channels',
    autogenerate: { directory: 'channels' }
  }
];
```

This scans <Badge text="src/content/docs/getting-started/" variant="path" /> and creates nav items for each `.md` file.

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

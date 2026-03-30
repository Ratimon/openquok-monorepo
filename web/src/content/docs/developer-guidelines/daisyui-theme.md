---
title: DaisyUI theming
description: Use DaisyUI semantic colors so UI respects the active theme.
order: 3
lastUpdated: 2026-03-30
---

<script>
import { Badge, Callout, CardGrid, ExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Use **DaisyUI semantic color utilities** for backgrounds, text, and borders so the UI respects the active theme (for example `forest`, `light`). Avoid hardcoded Tailwind colors and avoid `dark:*` variants.

## Rules

<Steps>

### Use semantic classes

Prefer semantic tokens like:

- <Badge text="bg-base-100" variant="default" /> page / card background
- <Badge text="bg-base-200" variant="default" /> elevated surfaces
- <Badge text="border-base-300" variant="default" /> borders/dividers
- <Badge text="text-base-content" variant="default" /> primary text
- <Badge text="text-base-content/70" variant="default" /> muted text
- <Badge text="hover:bg-base-200" variant="default" /> hover surfaces
- <Badge text="bg-primary" variant="default" /> + <Badge text="text-primary-content" variant="default" /> brand buttons

Avoid:

- <Badge text="bg-white" variant="deprecated" /> / <Badge text="text-black" variant="deprecated" />
- <Badge text="bg-neutral-900" variant="deprecated" />
- <Badge text="dark:*" variant="deprecated" />

### Example

```html
<!-- ✅ GOOD: theme follows data-theme -->
<header class="bg-base-100 border-b border-base-300">
  <a class="text-base-content hover:bg-base-200">Link</a>
</header>

<!-- ❌ BAD: hardcoded and dark: variant -->
<header class="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
  <a class="text-neutral-700 dark:text-neutral-200">Link</a>
</header>
```

### When copying shadcn-style components

When adding or editing components under <Badge text="web/src/lib/ui/" variant="path" />, replace shadcn-style tokens with DaisyUI semantics. Common mappings:

| Shadcn / registry class | Use instead (DaisyUI) |
|-------------------------|------------------------|
| <code>text-muted-foreground</code> | <code>text-base-content/70</code> |
| <code>text-foreground</code> | <code>text-base-content</code> |
| <code>bg-background</code> | <code>bg-base-100</code> |
| <code>ring-offset-background</code> | <code>ring-offset-base-100</code> |
| <code>focus:ring-ring</code> | <code>focus:ring-primary</code> |
| <code>text-primary-foreground</code> | <code>text-primary-content</code> |
| <code>text-secondary-foreground</code> | <code>text-secondary-content</code> |
| <code>bg-destructive</code> / <code>text-destructive-foreground</code> | <code>bg-error</code> / <code>text-error-content</code> |
| <code>bg-black/50</code> (overlays) | <code>bg-base-content/50</code> |
| generic <code>border</code> | <code>border border-base-300</code> |

</Steps>

<Callout type="warning" title="Why this matters">
Hardcoded colors and `dark:*` variants bypass DaisyUI themes and create inconsistent UI across themes.
</Callout>

## References

- <ExternalLink href="https://daisyui.com/docs/colors/">DaisyUI Colors</ExternalLink>
- <ExternalLink href="https://daisyui.com/docs/themes/">DaisyUI Themes</ExternalLink>

## Related Section(s)

<CardGrid>
<LinkCard title="Developer Guidelines" description="Back to the developer guidelines hub" href="/docs/developer-guidelines" />
<LinkCard title="How to write docs" description="Docs components and authoring conventions" href="/docs/how-to-write-docs" />
</CardGrid>


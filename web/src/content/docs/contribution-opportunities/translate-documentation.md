---
title: Translating documentation
description: Contributor guide for translating OpenQuok docs into other languages — locale folders, URL paths, Markdown authoring, and pull requests.
order: 3
lastUpdated: 2026-09-12
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

OpenQuok documentation is **Markdown-first** and supports multiple languages. English is the default under <Badge text="web/src/content/docs/" variant="path" /> and is served at <Badge text="/docs/..." variant="path" />. Translations live in sibling folders named <Badge text="docs-&lt;locale&gt;" variant="path" /> — for example <Badge text="web/src/content/docs-es/" variant="path" /> for Spanish at <Badge text="/docs/es/..." variant="path" />.

Readers switch languages from the **language picker** in the docs header. It keeps the same page slug and swaps only the locale prefix (<Badge text="/docs/getting-started" variant="path" /> ↔ <Badge text="/docs/es/getting-started" variant="path" />).

```text
web/src/content/
  docs/                          # English (default) → /docs/<slug>
    getting-started/
      index.md
      quickstart.md
    channels/
      connect.md
  docs-es/                       # Spanish → /docs/es/<slug>
    getting-started-for-dev/
      installation.md
    documentation-contribution/
      writing-content.md
```

<Callout type="note">
<p>Translations do <strong>not</strong> need to cover every English page before you open a PR. Ship one section or a handful of pages — partial locale coverage is welcome as long as each added file mirrors a real English source page.</p>
</Callout>

## What you translate vs what stays the same

| Keep in English (or unchanged) | Translate |
| --- | --- |
| Repo paths, env var names, CLI flags, HTTP routes, JSON keys | Headings, body copy, table labels, callout text |
| <Badge text="openquok" variant="default" /> CLI commands and code samples | LinkCard <Badge text="title" variant="param" /> and <Badge text="description" variant="param" /> |
| Product name <strong>OpenQuok</strong> (brand casing) | Sentences that explain concepts to readers |
| <Badge text="import" variant="param" /> paths and component names in <Badge text="&lt;script&gt;" variant="param" /> blocks | FAQ answers, step instructions, intro paragraphs |
| GitHub URLs and third-party doc links | Sidebar <Badge text="label" variant="param" /> overrides when the English title does not fit |

Leave fenced <Badge text="bash" variant="param" /> blocks copy-pasteable — translate comments inside them only when it helps, not the commands themselves.

## Contributor checklist

<Steps
	howToName="Translate an OpenQuok docs page"
	howToDescription="Add or update a localized Markdown page under docs-<locale> and open a pull request."
>

### Pick a source page and locale

1. Choose an English page under <Badge text="web/src/content/docs/" variant="path" /> — start with a section you know well (for example <Badge text="getting-started/quickstart.md" variant="path" /> or <Badge text="channels/connect.md" variant="path" />).
2. Confirm the target locale is registered in <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/web/src/lib/docs/constants/config.ts"><Badge text="web/src/lib/docs/constants/config.ts" variant="path" /></DocsExternalLink> under <Badge text="docsI18n.locales" variant="param" />. Today that includes <Badge text="en" variant="param" /> (English) and <Badge text="es" variant="param" /> (Español).

To add a **new** language (for example French), append a row to <Badge text="docsI18n.locales" variant="param" /> and create <Badge text="web/src/content/docs-fr/" variant="path" />. Use a short ISO-style code (<Badge text="es" variant="param" />, <Badge text="fr" variant="param" />) — the folder suffix and URL segment must match.

### Mirror the English file path

Copy the relative path from <Badge text="docs/" variant="path" /> into <Badge text="docs-&lt;locale&gt;/" variant="path" />:

| English source | Spanish translation | URL |
| --- | --- | --- |
| <Badge text="docs/getting-started/index.md" variant="path" /> | <Badge text="docs-es/getting-started/index.md" variant="path" /> | <Badge text="/docs/es/getting-started" variant="path" /> |
| <Badge text="docs/documentation-contribution/writing-content.md" variant="path" /> | <Badge text="docs-es/documentation-contribution/writing-content.md" variant="path" /> | <Badge text="/docs/es/documentation-contribution/writing-content" variant="path" /> |

Section roots use <Badge text="index.md" variant="path" /> inside a folder (slug is the folder name, not <Badge text="index" variant="path" />).

### Write the translated Markdown

Create the file with the same frontmatter keys as English. Translate <Badge text="title" variant="param" /> and <Badge text="description" variant="param" />; keep <Badge text="order" variant="param" /> aligned so sidebar order matches.

**Minimal example** — English introduction (<Badge text="docs/getting-started/index.md" variant="path" />):

```yaml
---
title: Introduction
description: OpenQuok social scheduler — volume without the headache.
order: 0
sidebar:
  label: Overview
---
```

**Spanish counterpart** (<Badge text="docs-es/getting-started/index.md" variant="path" /> — illustrative; add this file when you translate the page):

```yaml
---
title: Introducción
description: OpenQuok, programador de redes sociales — volumen sin complicaciones.
order: 0
sidebar:
  label: Resumen
---
```

```html
<script>
import { CardGrid, LinkCard } from '$lib/ui/components/docs/mdx/index.js';
</script>

OpenQuok es un **programador de redes sociales** para publicar a escala sin perder el control.
Los agentes redactan y encolan publicaciones; tú revisas y apruebas en el **calendario**
y el **tablero kanban** antes de que se publique algo.

## Elige tu camino

<CardGrid>
<LinkCard title="Inicio rápido" description="Primer canal, primera publicación y aprobación en calendario o kanban." href="/docs/es/getting-started/quickstart" />
<LinkCard title="Cloud" description="Prueba, límites del plan y facturación en la versión alojada." href="/docs/es/cloud" />
<LinkCard title="Autoalojamiento" description="Sin factura de Cloud. Instala y ejecuta OpenQuok tú mismo." href="/docs/es/installation" />
</CardGrid>
```

<Callout type="tip">
<p>In localized pages, prefix in-site <Badge text="href" variant="param" /> values with <Badge text="/docs/&lt;locale&gt;/" variant="path" /> (for Spanish, <Badge text="/docs/es/..." variant="path" />). English pages omit the locale segment.</p>
</Callout>

Reuse the same MDX components as English — <Badge text="Callout" variant="default" />, <Badge text="Steps" variant="default" />, <Badge text="CardGrid" variant="default" />, <Badge text="LinkCard" variant="default" />, <Badge text="Badge" variant="default" />. Follow <a href="/docs/documentation-contribution/writing-content">Writing content</a> and <a href="/docs/documentation-contribution/components">Built-in components</a>; inside <Badge text="&lt;Callout&gt;" variant="path" /> bodies use HTML (<Badge text="&lt;strong&gt;" variant="path" />, <Badge text="&lt;p&gt;" variant="path" />) instead of Markdown emphasis.

### Preview locally

From the monorepo root:

```bash
pnpm --filter ./web run dev
```

Open the translated URL (for example <Badge text="http://localhost:5173/docs/es/documentation-contribution/writing-content" variant="path" />). Use the header language picker to confirm slug parity with English.

### Open a pull request

Follow <a href="/docs/developer-guidelines/submit-a-pr">Submit a pull request</a>. In the PR description, list:

- English source path(s) you translated
- Locale code and new files under <Badge text="docs-&lt;locale&gt;/" variant="path" />
- Any new locale registration in <Badge text="docsI18n" variant="param" /> (only when adding a language)

</Steps>

## Existing Spanish translations

The <Badge text="docs-es" variant="path" /> tree is the live reference for Spanish contributors:

| Path | Notes |
| --- | --- |
| <Badge text="docs-es/getting-started-for-dev/" variant="path" /> | Self-hosting intro, installation, project structure (shows <Badge text="docs/" variant="path" /> vs <Badge text="docs-es/" variant="path" /> layout) |
| <Badge text="docs-es/documentation-contribution/" variant="path" /> | Localized authoring guides — configuration, writing content, components |

Browse <a href="/docs/es/documentation-contribution/writing-content">Escribir contenido</a> for a full Spanish page that uses code blocks and frontmatter in context.

## PR review prompts

Before opening a PR, confirm:

- File path under <Badge text="docs-&lt;locale&gt;/" variant="path" /> matches the English slug you translated.
- Frontmatter includes <Badge text="title" variant="param" />, <Badge text="description" variant="param" />, and <Badge text="order" variant="param" /> where the English page has them.
- In-site links use the locale prefix (<Badge text="/docs/es/..." variant="path" /> for Spanish).
- Code, CLI, env vars, and API paths are unchanged unless the prose around them requires a translated comment.
- MDX <Badge text="&lt;script&gt;" variant="path" /> imports match English when you reuse components.
- You previewed the page locally at the correct <Badge text="/docs/&lt;locale&gt;/..." variant="path" /> URL.

## Related

<CardGrid>
<LinkCard title="Contribution opportunities" description="Other scoped product tasks for external contributors" href="/docs/contribution-opportunities" />
<LinkCard title="Documentation contribution" description="Author pages, preview locally, and submit docs PRs" href="/docs/documentation-contribution" />
<LinkCard title="Writing content" description="Pages, Markdown, Mermaid, and authoring conventions" href="/docs/documentation-contribution/writing-content" />
<LinkCard title="Submit a pull request" description="Fork the repo, run checks locally, and open a code PR on GitHub" href="/docs/developer-guidelines/submit-a-pr" />
</CardGrid>

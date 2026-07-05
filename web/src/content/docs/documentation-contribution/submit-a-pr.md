---
title: Submit a pull request
description: How to fork OpenQuok, edit documentation, and open a pull request on GitHub.
order: 1
lastUpdated: 2026-07-05
---

<script>
import { Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

Improve OpenQuok docs by editing Markdown in this repository and opening a pull request. No special permissions are required — fork the repo, make your changes, and submit a PR for review.

## Repository

<p>All documentation lives in the <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo">openquok-monorepo</DocsExternalLink> monorepo on GitHub. English pages are under <code>web/src/content/docs/</code>; the docs app and sidebar config live under <code>web/src/lib/docs/</code>.</p>

## Workflow

<Steps>

### Fork and clone

On GitHub, fork <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo">Ratimon/openquok-monorepo</DocsExternalLink>, then clone your fork locally:

```bash
git clone https://github.com/<your-username>/openquok-monorepo.git
cd openquok-monorepo
corepack enable
pnpm install
```

Replace <code>&lt;your-username&gt;</code> with your GitHub username.

### Create a branch

Use a short, descriptive branch name (for example <code>docs/fix-cli-auth</code> or <code>docs/add-mcp-example</code>):

```bash
git checkout -b docs/your-topic
```

### Edit documentation

Add or update files under <code>web/src/content/docs/</code>. Match the folder layout of the section you are contributing to — for example CLI pages under <code>cli-usages/</code>, setup guides under <code>mcp-setup-guides/</code>, or this section under <code>documentation-contribution/</code>.

If you add a new page, include front matter with <code>title</code>, <code>description</code>, and <code>order</code> so it appears correctly in the sidebar. See <a href="/docs/documentation-contribution/writing-content">Writing content</a> for paths, MDX components, and authoring conventions.

To preview locally, run the web app from the repo root (see <a href="/docs/getting-started-for-dev/quick-start">Quick start</a>):

```bash
pnpm --filter web dev
```

Open <code>http://localhost:5173/docs</code> and navigate to the page you changed.

### Commit and push

Stage only the files you changed, write a clear commit message, and push to your fork:

```bash
git add web/src/content/docs/
git commit -m "docs: describe your change briefly"
git push -u origin docs/your-topic
```

<Callout type="tip" title="Commit message style">
<p>Start with <code>docs:</code> when the change is documentation-only. Focus on <strong>why</strong> the change helps readers, not just which files moved.</p>
</Callout>

### Open a pull request

On GitHub, open a pull request from your branch into <code>main</code> on <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo">Ratimon/openquok-monorepo</DocsExternalLink>.

In the PR description:

- Summarize what you fixed or added and who it helps (CLI users, self-hosters, MCP clients, etc.).
- Link any related issue if one exists.
- Add a short **Test plan** checklist (for example: “Opened `/docs/...` locally and verified links and callouts render”).

Maintainers will review, suggest edits if needed, and merge when ready.

</Steps>

## What to contribute

<p>Good first contributions include fixing typos, clarifying setup steps, adding CLI copy-paste examples, documenting new env vars, and cross-linking related pages. Larger additions (new provider guides, API reference pages) are welcome — open a <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/issues">GitHub issue</DocsExternalLink> first if you are unsure about scope.</p>

<Callout type="note" title="Code and migrations">
<p>Changes to backend code, database migrations, or web UI belong in separate PRs — see <a href="/docs/developer-guidelines/submit-a-pr">Submit a pull request (code)</a>. This section focuses on documentation under <code>web/src/content/docs/</code>.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Writing content" description="Page paths, front matter, MDX components, and authoring conventions" href="/docs/documentation-contribution/writing-content" />
<LinkCard title="Built-in components" description="Callouts, tabs, cards, badges, and Steps" href="/docs/documentation-contribution/components" />
<LinkCard title="Submit a pull request (code)" description="Fork the repo, run checks locally, and open a code PR on GitHub" href="/docs/developer-guidelines/submit-a-pr" />
</CardGrid>

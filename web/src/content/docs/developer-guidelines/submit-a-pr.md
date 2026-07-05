---
title: Submit a pull request
description: How to fork OpenQuok, run the monorepo locally, and open a code pull request on GitHub.
order: 1
lastUpdated: 2026-07-05
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

Improve OpenQuok by editing application code in this repository and opening a pull request. No special permissions are required — fork the repo, make your changes, run the relevant checks, and submit a PR for review.

## Repository

<p>Application code lives in the <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo">openquok-monorepo</DocsExternalLink> monorepo on GitHub. Key packages include <Badge text="backend/" variant="path" />, <Badge text="web/" variant="path" />, <Badge text="orchestrator/" variant="path" />, <Badge text="agent/" variant="path" />, <Badge text="sdk/" variant="path" />, and <Badge text="common/" variant="path" />. See <a href="/docs/getting-started-for-dev/architecture">Project architecture</a> for layout and responsibilities.</p>

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

Replace <code>&lt;your-username&gt;</code> with your GitHub username. For first-time setup (Node version, env files, local Supabase), follow <a href="/docs/getting-started-for-dev/quick-start">Quick start</a>.

### Create a branch

Use a short, descriptive branch name (for example <code>feat/threads-analytics</code>, <code>fix/oauth-callback</code>, or <code>chore/bump-deps</code>):

```bash
git checkout -b feat/your-topic
```

### Make your changes

Work in the package that matches your change:

| Area | Typical paths |
| --- | --- |
| API, integrations, migrations | <Badge text="backend/" variant="path" /> |
| Dashboard, marketing site, docs app | <Badge text="web/" variant="path" /> |
| BullMQ workers, Flowcraft flows | <Badge text="orchestrator/" variant="path" /> |
| CLI and agent tooling | <Badge text="agent/" variant="path" />, <Badge text="sdk/" variant="path" /> |
| Shared types and utilities | <Badge text="common/" variant="path" /> |

Follow the conventions in this section — especially <a href="/docs/developer-guidelines/security">Security guidelines</a> and <a href="/docs/developer-guidelines/rbac">RBAC</a> when touching auth, secrets, or route access.

<Callout type="note" title="Database migrations">
<p>If you add or rename SQL under <Badge text="backend/supabase/db/" variant="path" />, follow the migration naming pattern and re-aggregate before opening the PR:</p>
</Callout>

```bash
pnpm backend:db:aggregate-migrations-all
```

See <a href="/docs/configuration-backend/database">Database &amp; migrations</a> for push and typegen commands.

### Run checks locally

From the repository root, run the checks that apply to your change before you push. Full command reference: <a href="/docs/installation/development-environment">Development environment</a>.

**Backend** — lint and tests:

```bash
pnpm backend:lint
pnpm backend:test:unit
```

Run integration or e2e suites when your change touches routes, providers, or cross-module behavior:

```bash
pnpm backend:test:integration
pnpm backend:test:e2e
```

**Web** — typecheck (and lint when you changed Svelte or TypeScript under <Badge text="web/" variant="path" />):

```bash
pnpm web:check
pnpm --filter ./web lint
```

**Orchestrator / agent** — when you changed worker or CLI code:

```bash
pnpm orchestrator:test:unit
pnpm agent:test:unit
```

Start the dev servers to manually verify UI or API behavior:

```bash
pnpm backend:dev
pnpm web:dev
```

### Commit and push

Stage only the files you changed, write a clear commit message, and push to your fork:

```bash
git add backend/ web/
git commit -m "feat: describe your change briefly"
git push -u origin feat/your-topic
```

<Callout type="tip" title="Commit message style">
<p>Use a conventional prefix (<code>feat:</code>, <code>fix:</code>, <code>chore:</code>, <code>refactor:</code>) and focus on <strong>why</strong> the change helps users or maintainers, not just which files moved.</p>
</Callout>

### Open a pull request

On GitHub, open a pull request from your branch into <code>main</code> on <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo">Ratimon/openquok-monorepo</DocsExternalLink>.

In the PR description:

- Summarize what you changed and who it helps (dashboard users, API consumers, self-hosters, etc.).
- Link any related issue if one exists.
- Note which packages you touched (<Badge text="backend/" variant="path" />, <Badge text="web/" variant="path" />, migrations, etc.).
- Add a short **Test plan** checklist (for example: “Ran <code>pnpm backend:test:unit</code>”, “Verified OAuth connect flow locally”, “Re-aggregated migrations”).

Maintainers will review, suggest edits if needed, and merge when ready.

</Steps>

## What to contribute

<p>Good first contributions include bug fixes, test coverage, provider improvements, UI polish, and documentation clarifications in code comments or README sections. Larger features (new social providers, new API surfaces) are welcome — open a <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/issues">GitHub issue</DocsExternalLink> first if you are unsure about scope. For a new channel integration, start with <a href="/docs/developer-guidelines/add-provider">Adding a social provider</a>.</p>

<Callout type="note" title="Documentation-only changes">
<p>Edits under <Badge text="web/src/content/docs/" variant="path" /> belong in documentation-focused PRs. See <a href="/docs/documentation-contribution/submit-a-pr">Submit a pull request (docs)</a> for the docs workflow and keep code and docs in separate PRs when possible.</p>
</Callout>

## Related

<CardGrid>
<LinkCard title="Security guidelines" description="Service key rules, RLS guidance, and SSR state management safety" href="/docs/developer-guidelines/security" />
<LinkCard title="Adding a social provider" description="Contributor checklist for new social integrations" href="/docs/developer-guidelines/add-provider" />
<LinkCard title="Development environment" description="Local dev servers, tests, DB tasks, and deployment commands" href="/docs/installation/development-environment" />
<LinkCard title="Submit a pull request (docs)" description="Fork the repo, edit docs, preview locally, and open a PR on GitHub" href="/docs/documentation-contribution/submit-a-pr" />
</CardGrid>

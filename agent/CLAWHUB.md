# Publishing agent skills to ClawHub

[ClawHub](https://clawhub.ai) is the public skill registry for OpenClaw. Skills live under `agent/skills/<slug>/` and publish independently of the `@openquok/auto-cli` npm package.

| Slug | Path | Bundle | Notes |
|------|------|--------|-------|
| `openquok-core` | `agent/skills/openquok-core/` | `SKILL.md` + `resources/` | Primary CLI skill; auth, media Rule 2, channel recipes |
| `openquok-tiktok-slideshow` | `agent/skills/openquok-tiktok-slideshow/` | `SKILL.md` + `scripts/` + `references/` | Sibling pipeline skill; **requires** `openquok-core` / `openquok` on PATH; install with **Copy** so `scripts/` are real files |

Frontmatter on each skill declares both hosts: OpenClaw `metadata.openclaw.requires.bins` and Hermes `prerequisites.commands` + `metadata.hermes`.

## Prerequisites

- [ClawHub](https://clawhub.ai) publisher account (sign in with GitHub).
- Node.js 20+ on the machine that runs the publish command.
- ClawHub CLI:

```bash
npm i -g clawhub
# or
pnpm add -g clawhub
```

## One-time authentication

```bash
clawhub login
clawhub whoami
```

Headless / CI: create a token in the ClawHub dashboard and use `clawhub login --token clh_...` or set the `CLAWHUB_TOKEN` secret for GitHub Actions.

## Publish (manual)

Requires the global [ClawHub CLI](https://docs.openclaw.ai/clawhub/cli) (`npm i -g clawhub`) and `clawhub login`.

### openquok-core

From the **monorepo root** (pnpm shortcuts):

```bash
# Preview metadata and version resolution without uploading
pnpm publish:clawhub:dry-run

# First publish (defaults to 1.0.0)
pnpm publish:clawhub:manual
```

Equivalent raw commands from the monorepo root:

```bash
clawhub skill publish ./agent/skills/openquok-core \
  --slug openquok-core \
  --name "OpenQuok Core" \
  --dry-run

clawhub skill publish ./agent/skills/openquok-core \
  --slug openquok-core \
  --name "OpenQuok Core"
```

### openquok-tiktok-slideshow

```bash
pnpm publish:clawhub:tiktok-slideshow:dry-run
pnpm publish:clawhub:tiktok-slideshow:manual
```

Equivalent raw commands:

```bash
clawhub skill publish ./agent/skills/openquok-tiktok-slideshow \
  --slug openquok-tiktok-slideshow \
  --name "OpenQuok TikTok Slideshow" \
  --dry-run

clawhub skill publish ./agent/skills/openquok-tiktok-slideshow \
  --slug openquok-tiktok-slideshow \
  --name "OpenQuok TikTok Slideshow"
```

Later changes auto-bump the patch version when content changes. Pass `--version <semver>` only when you need an explicit release.

Optional flags:

- `--owner <handle>` — publish under an org publisher you manage.
- `--changelog "..."` — release notes for that version.
- `--tags latest` — default tag; add more comma-separated tags if needed.

Publishing releases each skill under **MIT-0** on ClawHub (free, open redistribution).

## Verify

```bash
clawhub search openquok
clawhub inspect openquok-core
clawhub inspect openquok-tiktok-slideshow
```

Public pages (after review completes):

- `https://clawhub.ai/skills/openquok-core`
- `https://clawhub.ai/skills/openquok-tiktok-slideshow`

New releases may stay hidden from install/search until automated security review finishes. Use `clawhub scan --slug <slug>` while logged in to check scan status.

## Consumer install (OpenClaw workspace)

Users install from the workspace directory (e.g. `cd /data/workspace` on Docker/Railway):

```bash
clawhub install openquok-core
clawhub install openquok-tiktok-slideshow
```

Equivalent native commands:

```bash
openclaw skills install openquok-core
openclaw skills install openquok-tiktok-slideshow
```

Skills that ship `scripts/` (today: `openquok-tiktok-slideshow`) must land as **real files**, not agent-dir symlinks only. Prefer Copy when the host offers it; GitHub/skills CLI installs should use `--copy`:

```bash
npx skills add https://github.com/Ratimon/openquok-monorepo/tree/main/agent \
  --skill openquok-tiktok-slideshow --copy -y
```

`clawhub update <slug>` (or `openclaw skills update <slug>`) refreshes a ClawHub-tracked install. Installing or updating a skill does **not** install the `openquok` CLI — users still run `npm install -g @openquok/auto-cli@latest`. Sibling skills that call `openquok` also need `openquok-core` (or an equivalent CLI install) on PATH.

## CI publish (optional)

ClawHub ships a reusable workflow for catalog repos. Add a job that calls `openclaw/clawhub/.github/workflows/skill-publish.yml@main` with:

- `skill_path: agent/skills/<slug>` (single skill), or
- `root: agent/skills` (publish every immediate child folder that changed)

Store `CLAWHUB_TOKEN` in GitHub Actions secrets. Use `dry_run: true` on PRs to preview without uploading.

Example (core only):

```yaml
jobs:
  clawhub-skill:
    if: github.ref == 'refs/heads/main'
    uses: openclaw/clawhub/.github/workflows/skill-publish.yml@main
    with:
      owner: ratimon
      skill_path: agent/skills/openquok-core
      dry_run: false
    secrets:
      clawhub_token: ${{ secrets.CLAWHUB_TOKEN }}
```

To cover every skill under `agent/skills/` when any of them change, prefer `root: agent/skills` and trigger on `agent/skills/**`. For a single sibling skill, set `skill_path: agent/skills/openquok-tiktok-slideshow` and trigger on that folder.

## Maintainer checklist

- [ ] `SKILL.md` frontmatter `name` matches the ClawHub slug (`openquok-core`, `openquok-tiktok-slideshow`, …).
- [ ] `description` and `metadata.openclaw` are valid single-line JSON where required.
- [ ] Sibling skills with `scripts/` document Copy / `--copy` install and do not claim to replace `openquok-core`.
- [ ] Run `clawhub skill publish ... --dry-run` before the first live publish of that slug.
- [ ] After publish, confirm `clawhub install <slug>` from a test workspace (and that `scripts/` are executable files when applicable).
- [ ] Bump `@openquok/auto-cli` on npm separately when the CLI changes (`agent/PUBLISHING.md`).

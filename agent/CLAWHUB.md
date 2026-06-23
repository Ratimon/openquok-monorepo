# Publishing `openquok-core` to ClawHub

[ClawHub](https://clawhub.ai) is the public skill registry for OpenClaw. After publish, users can install with `clawhub install openquok-core` or `openclaw skills install openquok-core` from their OpenClaw workspace.

The skill bundle lives at `agent/skills/openquok-core/` (`SKILL.md` plus `resources/`). Frontmatter declares both hosts: OpenClaw `metadata.openclaw.requires.bins` and Hermes `prerequisites.commands` + `metadata.hermes`.

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

Later changes auto-bump the patch version when content changes. Pass `--version <semver>` only when you need an explicit release.

Optional flags:

- `--owner <handle>` — publish under an org publisher you manage.
- `--changelog "..."` — release notes for that version.
- `--tags latest` — default tag; add more comma-separated tags if needed.

Publishing releases the skill under **MIT-0** on ClawHub (free, open redistribution).

## Verify

```bash
clawhub search openquok
clawhub inspect openquok-core
```

Public page: `https://clawhub.ai/skills/openquok-core` (after review completes).

New releases may stay hidden from install/search until automated security review finishes. Use `clawhub scan --slug openquok-core` while logged in to check scan status.

## Consumer install (OpenClaw workspace)

Users install from the workspace directory (e.g. `cd /data/workspace` on Docker/Railway):

```bash
clawhub install openquok-core
```

Equivalent native command:

```bash
openclaw skills install openquok-core
```

`clawhub update openquok-core` (or `openclaw skills update openquok-core`) refreshes a ClawHub-tracked install. Installing or updating the skill does **not** install the `openquok` CLI — users still run `npm install -g @openquok/auto-cli@latest`.

## CI publish (optional)

ClawHub ships a reusable workflow for catalog repos. Add a job that calls `openclaw/clawhub/.github/workflows/skill-publish.yml@main` with:

- `skill_path: agent/skills/openquok-core` (single skill), or
- `root: agent/skills` (publish every immediate child folder that changed)

Store `CLAWHUB_TOKEN` in GitHub Actions secrets. Use `dry_run: true` on PRs to preview without uploading.

Example:

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

Trigger on changes under `agent/skills/openquok-core/**` so recipe and `SKILL.md` updates ship to ClawHub without a manual CLI run.

## Maintainer checklist

- [ ] `SKILL.md` frontmatter `name` stays `openquok-core` (matches ClawHub slug).
- [ ] `description` and `metadata.openclaw` are valid single-line JSON where required.
- [ ] Run `clawhub skill publish ... --dry-run` before the first live publish.
- [ ] After publish, confirm `clawhub install openquok-core` from a test workspace.
- [ ] Bump `@openquok/auto-cli` on npm separately when the CLI changes (`agent/PUBLISHING.md`).

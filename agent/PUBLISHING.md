# Publishing `@openquok/auto-cli` (Openquok CLI) to npm

## Quick publish (manual)

```bash
# From monorepo root
pnpm --filter ./agent run publish:manual

# Or from /agent
cd agent
pnpm run publish:manual
```

Then users can install:

```bash
npm install -g @openquok/auto-cli
# or
pnpm add -g @openquok/auto-cli
```

Verify the CLI is available:

```bash
openquok --help
```

## Publish via GitHub

Match `agent/package.json` `version` to the tag (`cli-v0.0.8` → `"0.0.8"`). Commit to `main`, then tag **that** commit:

```bash
git add agent/
git commit -m "chore(cli): release 0.0.9"
git push origin main
git tag cli-v0.0.9
git push origin cli-v0.0.9
```

### GitHub release notes

CI fills the GitHub release body automatically from `scripts/release-notes.mjs` (scoped to `agent/` vs the previous `cli-v*` tag).

**Preview before tagging** (from monorepo root):

```bash
pnpm release:notes cli-v0.0.8
# optional: compare against an older tag
pnpm release:notes cli-v0.0.8 --from cli-v0.0.7
```

**Manual template** (edit and paste on GitHub if you want to override CI):

~~~markdown
## @openquok/auto-cli v0.0.8

**Compare:** [cli-v0.0.7...cli-v0.0.8](https://github.com/Ratimon/openquok-monorepo/compare/cli-v0.0.7...cli-v0.0.8)

```bash
npm install -g @openquok/auto-cli@0.0.8
```

### Added
- …

### Changed
- …

### Removed
- …
~~~

Replace version numbers and bullets. For skill-only releases, list new JSON recipes and provider docs under **Added**; CLI command changes under **Changed** / **Removed**.

CI uses **npm trusted publishing** (OIDC) — see below. **Do not** pass `NPM_AUTH_TOKEN` to the publish step; a Publish token there causes `EOTP`.

### One-time: trusted publisher on npm (required for CI)

1. [npmjs.com/package/@openquok/auto-cli](https://www.npmjs.com/package/@openquok/auto-cli) → **Settings** → **Trusted publishing** → **GitHub Actions**
2. **Organization / user:** `Ratimon`
3. **Repository:** `openquok-monorepo`
4. **Workflow filename:** `release.yml` (exact; file is `.github/workflows/release.yml`)
5. **Environment:** leave blank
6. Save

Configure separately from `@openquok/node-sdk` — each package has its own trusted publisher entry (same workflow file is fine).

The workflow sets `permissions: id-token: write` and runs `npm publish` **without** `NODE_AUTH_TOKEN`. npm CLI ≥ 11.5.1 + Node ≥ 22 exchanges GitHub OIDC for a short-lived publish grant (no 2FA prompt).

`package.json` `repository.url` must point at the monorepo (`git+https://github.com/Ratimon/openquok-monorepo.git` with `"directory": "agent"`).

### CI errors

| Error | Cause | Fix |
|-------|--------|-----|
| `EOTP` | `NPM_AUTH_TOKEN` is a **Publish** token on the publish step | Remove token from workflow publish; use trusted publishing |
| `E404` on PUT | Token publish without scope | Use trusted publishing, or Automation token locally |
| `ENEEDAUTH` / Unable to authenticate | Trusted publisher not configured or workflow name mismatch | Check `release.yml` on npm matches exactly |

Re-run: `git push origin cli-v0.0.8 --force` (if not on npm yet).

### Tag already exists

```bash
git tag -d cli-v0.0.8
git tag cli-v0.0.8
git push origin cli-v0.0.8 --force
```

Or bump version and use `cli-v0.0.9`.

### Manual publish (local)

```bash
npm login
pnpm --filter ./agent run publish:manual
# or with 2FA: cd agent && npm publish --access public --otp=123456
```

## Publishing checklist

### Before publish

- [ ] Verify the package on npm
  ```bash
  npm view @openquok/auto-cli
  ```

- [ ] Confirm the `bin` name (what users run)
  ```json
  "bin": {
    "openquok": "./dist/index.js"
  }
  ```

- [ ] Update `version` in `agent/package.json`

- [ ] Build and sanity-check tarball
  ```bash
  pnpm --filter ./agent run build
  cd agent && pnpm pack --dry-run
  ```

### Publish to npm (manual)

```bash
npm login
pnpm --filter ./agent run publish:manual
```

### After publishing

```bash
npm view @openquok/auto-cli
npm install -g @openquok/auto-cli
openquok --help
```

## GitHub workflow

`.github/workflows/release.yml` publishes on tag push:

| Tag | Package | Job |
|-----|---------|-----|
| `sdk-vX.Y.Z` | `@openquok/node-sdk` | `sdk_publish` |
| `cli-vX.Y.Z` | `@openquok/auto-cli` | `cli_publish` |

The CLI job runs `pnpm run publish:cli:build` (monorepo build script), then `npm publish` from `agent/` via OIDC.

## ClawHub (openquok-core skill)

The agent skill bundle is published separately from npm. See [CLAWHUB.md](./CLAWHUB.md) for details.

```bash
# From monorepo root — preview, then publish
pnpm publish:clawhub:dry-run
pnpm publish:clawhub:manual
```

Consumer install after publish: `clawhub install openquok-core`.

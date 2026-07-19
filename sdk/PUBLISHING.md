# Publishing the Openquok SDK to npm

## Quick Publish 

```bash
# From /sdk directory
pnpm run publish:manual
```

Then users can install:
```bash
npm install -g @openquok/node-sdk
# or
pnpm install -g @openquok/node-sdk
```

## Publish via Github

Match `sdk/package.json` `version` to the tag (`sdk-v0.0.8` → `"0.0.10"`). Commit to `main`, then tag **that** commit:

```bash
git add sdk/
git commit -m "chore(sdk): release 0.0.10"
git push origin main
git tag sdk-v0.0.10
git push origin sdk-v0.0.10
```

### GitHub release notes

CI fills the GitHub release body automatically from `scripts/release-notes.mjs` (scoped to `sdk/` vs the previous `sdk-v*` tag). New/removed `async` methods in `sdk/src/index.ts` are listed under **Added** / **Removed**.

**Preview before tagging** (from monorepo root):

```bash
pnpm release:notes sdk-v0.0.9
# optional: compare against last npm release instead of the previous tag
pnpm release:notes sdk-v0.0.9 --from sdk-v0.0.2
```

**Manual template** (edit and paste on GitHub if you want to override CI):

~~~markdown
## @openquok/node-sdk v0.0.9

**Compare:** [sdk-v0.0.2...sdk-v0.0.9](https://github.com/Ratimon/openquok-monorepo/compare/sdk-v0.0.2...sdk-v0.0.9)

```bash
npm install @openquok/node-sdk@0.0.9
```

### Added
- **API methods:** `isConnected()`, `getWorkspace()`, …

### Changed
- Bearer auth header; shared HTTP error handling

### Removed
- **Removed methods:** `getPostGroup()`, …
~~~

Replace version numbers and bullets to match the diff since the last published tag.

CI uses **npm trusted publishing** (OIDC) — see below. **Do not** pass `NPM_AUTH_TOKEN` to the publish step; a Publish token there causes `EOTP`.

### One-time: trusted publisher on npm (required for CI)

1. [npmjs.com](https://www.npmjs.com/package/@openquok/node-sdk) → **Settings** → **Trusted publishing** → **GitHub Actions**
2. **Organization / user:** `Ratimon`
3. **Repository:** `openquok-monorepo`
4. **Workflow filename:** `release.yml` (exact; file is `.github/workflows/release.yml`)
5. **Environment:** leave blank
6. Save

Repeat for `@openquok/auto-cli` when publishing the CLI from the same workflow (separate trusted publisher entry on npm — same `release.yml` filename).

The workflow sets `permissions: id-token: write` and runs `npm publish` **without** `NODE_AUTH_TOKEN`. npm CLI ≥ 11.5.1 + Node ≥ 22 exchanges GitHub OIDC for a short-lived publish grant (no 2FA prompt).

`package.json` `repository.url` must point at the monorepo (`git+https://github.com/Ratimon/openquok-monorepo.git` with `"directory": "sdk"`).

### CI errors

| Error | Cause | Fix |
|-------|--------|-----|
| `EOTP` | `NPM_AUTH_TOKEN` is a **Publish** token on the publish step | Remove token from workflow publish; use trusted publishing |
| `E404` on PUT | Token publish without scope | Use trusted publishing, or Automation token locally |
| `ENEEDAUTH` / Unable to authenticate | Trusted publisher not configured or workflow name mismatch | Check `release.yml` on npm matches exactly |

Re-run: `git push origin sdk-v0.0.8 --force` (if not on npm yet).

### Tag already exists

```bash
git tag -d sdk-v0.0.8
git tag sdk-v0.0.8
git push origin sdk-v0.0.8 --force
```

Or bump version and use `sdk-v0.0.9`.

### Manual publish (local)

```bash
npm login
pnpm --filter ./sdk run publish:manual
# or with 2FA: npm publish --access public --otp=123456
```

## Publishing Checklist

### Before First Publish

- [ ] Verify package name is available on npm
  ```bash
  npm view @openquok/node-sdk
  # If error "404 Not Found" - name is available!
  ```

- [ ] Update version if needed
  ```json
  "version": "0.0.3"
  ```

- [ ] Review files to include
  ```json
  "files": [
    "dist",
    "README.md",
  ]
  ```

- [ ] Build the package
  ```bash
  pnpm run build
  ```

- [ ] Test locally
  ```bash
  pnpm link --global
  ```

### Publish to npm

```bash
# Login to npm (first time only)
npm login

# From sdk/
pnpm run build
pnpm publish --access public

# Or use the root script
cd /path/to/monorepo/root
pnpm run publish-cli
```

### After Publishing

Verify it's published:
```bash
npm view @openquok/node-sdk
# Should show your package info
```

Test installation:
```bash
npm install -g @openquok/node-sdk
```

## Using from Monorepo Root

The root `package.json` already has:


Publish from the root:

```bash
# From monorepo root
pnpm publish:sdk
```
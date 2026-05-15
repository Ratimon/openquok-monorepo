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


## Publish via Github

```bash
git add .
git commit -m "cli-v0.0.5"
git push -u origin main
git tag cli-v0.0.5
git push origin cli-v0.0.5
```

## Publishing checklist

### Before first publish

- [ ] Verify the package name is available on npm
  ```bash
  npm view @openquok/auto-cli
  # If you see "404 Not Found", the name is available.
  ```

- [ ] Confirm the `bin` name is correct (this is what users run)
  ```json
  "bin": {
    "openquok": "./dist/index.js"
  }
  ```

- [ ] Update version in `agent/package.json` if needed

- [ ] Build the package
  ```bash
  pnpm --filter ./agent run build
  ```

- [ ] (Optional) sanity-check the published contents
  ```bash
  cd agent
  pnpm pack --dry-run
  ```

### Publish to npm

```bash
# Login to npm (first time only)
npm login

# From monorepo root
pnpm --filter ./agent run build
pnpm --filter ./agent publish --access public
```

## After publishing

Verify it’s published:

```bash
npm view @openquok/auto-cli
```

Test installation:

```bash
npm install -g @openquok/auto-cli
openquok --help
```

## Publish via GitHub tags

The workflow at `.github/workflows/release.yml` publishes:

- tags `sdk-vX.Y.Z` → `./sdk`
- tags `cli-vX.Y.Z` → `./agent` (`pnpm run publish:cli:build` then `pnpm --filter ./agent publish`)

Push a new tag after merging these fixes (for example `cli-v0.0.4`) if a previous `cli-v0.0.3` run failed before publish.


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
git commit -m "cli-v0.0.3"
git push -u origin main
git tag cli-v0.0.3
git push origin cli-v0.0.3
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

## Publish via GitHub tags (not wired for `agent` yet)

The repo workflow at `.github/workflows/release.yml` currently publishes:

- tags `sdk-vX.Y.Z` -> `./sdk`
- tags `cli-vX.Y.Z` -> `./apps/cli`

So tagging `cli-v...` **will not** publish `./agent` unless the workflow is updated (e.g., add an `agent_publish` job that runs `pnpm --filter ./agent publish` on `agent-vX.Y.Z` tags, or repoint the existing `cli_publish` job to `./agent`).


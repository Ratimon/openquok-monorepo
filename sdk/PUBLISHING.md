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

Match `sdk/package.json` `version` to the tag (`sdk-v0.0.7` → `"0.0.7"`). Commit to `main`, then tag **that** commit:

```bash
git add sdk/
git commit -m "chore(sdk): release 0.0.7"
git push origin main
git tag sdk-v0.0.8
git push origin sdk-v0.0.8
```

Requires GitHub secret **`NPM_AUTH_TOKEN`** — see **CI npm token** below.

### CI npm token (`NPM_AUTH_TOKEN`)

GitHub Actions cannot type a 2FA code. Use an npm **Automation** token (not **Publish** / not classic with 2FA-on-publish):

1. [npmjs.com](https://www.npmjs.com/) → avatar → **Access Tokens** → **Generate New Token** → **Granular Access Token**
2. **Token type: Automation** (bypasses 2FA for CI)
3. **Packages and scopes** → `@openquok` org (or both `@openquok/node-sdk` and `@openquok/auto-cli`) → **Read and write**
4. Copy token → GitHub repo **Settings → Secrets → Actions** → **`NPM_AUTH_TOKEN`**

| Error in CI | Cause | Fix |
|-------------|--------|-----|
| `E404` on PUT | Token missing or no publish scope | Automation token with write on `@openquok` |
| `EOTP` | **Publish** token or 2FA-required token | Recreate as **Automation** token |
| `npm whoami` fails | Secret empty / wrong name | Secret must be exactly `NPM_AUTH_TOKEN` |

Re-run after fixing the secret: `git push origin sdk-v0.0.7 --force` (if that version is not on npm yet).

### Tag already exists

```bash
git tag -d sdk-v0.0.7
git tag sdk-v0.0.7
git push origin sdk-v0.0.7 --force
```

Or bump `package.json` and use a new tag (`sdk-v0.0.8`).

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
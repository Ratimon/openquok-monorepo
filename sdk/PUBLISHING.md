# Publishing the Openquok SDK to npm

## Quick Publish 

```bash
# From /sdk directory
pnpm run build
pnpm publish --access public
```

Then users can install:
```bash
npm install -g @openquok/node-sdk
# or
pnpm install -g @openquok/node-sdk
```

## Publish via Github

```bash
git add .
git commit -am "v1.0.0"
git push -u origin main
git tag v1.0.0 main
git push origin tag v1.0.0
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
  "version": "1.0.0"
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
npm install -g  @openquok/node-sdk
```

## Using from Monorepo Root

The root `package.json` already has:


Publish from the root:

```bash
# From monorepo root
pnpm publish:sdk
```
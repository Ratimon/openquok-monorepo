# @openquok/browser-extension

Chrome Manifest V3 extension for **cookie-session** social channels (Skool first). The OpenQuok web app talks to this extension via `chrome.runtime.sendMessage` when adding a channel or registering periodic session refresh.

## Build

From the monorepo root:

```bash
pnpm common:build
pnpm --filter @openquok/browser-extension build
```

Output is in `extension/dist/`. Load it in Chrome via **Extensions → Developer mode → Load unpacked**.

Optional zip for manual distribution:

```bash
pnpm --filter @openquok/browser-extension zip
```

## Self-host web origin

`manifest.json` `externally_connectable.matches` includes `localhost` and `https://*.openquok.com/*`. For other dashboard origins, add your HTTPS origin to `externally_connectable` and rebuild.

## Adding a cookie-session provider

1. Register the provider in `common/src/browser-extension/cookieSessionProviders.ts`.
2. Add the provider `host_permissions` entry to `extension/manifest.json` (or automate in a follow-up build step).
3. Rebuild the extension.

Message types and payloads are defined in `openquok-common` (`common/src/browser-extension/`).

# @openquok/browser-extension

Chrome Manifest V3 extension for **cookie-session** social channels (Skool first) and **directory launch** assist (Uneed destinations). The OpenQuok web app talks to this extension via `chrome.runtime.sendMessage` when adding a channel, registering periodic session refresh, or handing off an auto-launch submission intent.

## Build

From the monorepo root:

```bash
pnpm common:build
pnpm --filter @openquok/browser-extension build
```

Output is in `extension/dist/`. Load **that folder** in Chrome via **Extensions → Developer mode → Load unpacked** (not `extension/` itself). After each build, click **Reload** on the extension card.

**popup**, **background**, and **content scripts** are each built as a single self-contained ES module (no shared `dist/assets/` chunks). If you see `Cannot use import statement outside a module` or “Extension background is not running”, rebuild, reload `extension/dist` on `chrome://extensions`, and open **Service worker** to confirm there are no errors.

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

## Directory launch (auto-launch)

1. Register the destination in `common/src/browser-extension/pageAssist.ts` (`directoryLaunchProviders`).
2. Add a thin entry under `extension/src/content/directory-launch/` and register it in `extension/manifest.json` `content_scripts`.
3. Rebuild the extension. The toolbar popup and on-page step rail read `extension_config.steps` from the dashboard handoff payload.

Message types and payloads are defined in `openquok-common` (`common/src/browser-extension/`).

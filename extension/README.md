# @openquok/browser-extension

Manifest V3 extension for **cookie-session** social channels (Skool first) and **directory launch** assist. The OpenQuok web app talks to the Chromium build via `chrome.runtime.sendMessage` (`externally_connectable`). On **Firefox**, the dashboard content script relays the same API through a `window.postMessage` bridge (no `externally_connectable`).

## Build

From the monorepo root:

```bash
pnpm common:build
pnpm --filter @openquok/browser-extension build
```

Output is in `extension/dist/`. Load **that folder** in Chrome or Edge via **Extensions → Developer mode → Load unpacked** (not `extension/` itself). After each build, click **Reload** on the extension card.

### Multi-browser builds

| Target | Command | Output |
| --- | --- | --- |
| Chromium (Chrome + Edge) | `pnpm --filter @openquok/browser-extension build` | `extension/dist/` |
| Firefox | `pnpm --filter @openquok/browser-extension build:firefox` | `extension/dist-firefox/` |

Store zips: `zip` (Chromium) and `zip:firefox`. See [docs/store/README.md](./docs/store/README.md).

**popup**, **background**, and **content scripts** are each built as a single self-contained ES module (no shared `dist/assets/` chunks). If you see `Cannot use import statement outside a module` or “Extension background is not running”, rebuild, reload `extension/dist` on `chrome://extensions`, and open **Service worker** to confirm there are no errors.

Optional zip for store upload (Chrome Web Store and Microsoft Edge Add-ons — same artifact):

```bash
pnpm --filter @openquok/browser-extension zip
```

See [docs/store/README.md](./docs/store/README.md) and [docs/store/edge-addons.md](./docs/store/edge-addons.md) for Edge Partner Center steps and post-publish extension ID wiring.

## Self-host web origin

`manifest.json` `externally_connectable.matches` includes `localhost` and `https://*.openquok.com/*`. For other dashboard origins, add your HTTPS origin to `externally_connectable` and rebuild.

## Adding a cookie-session provider

1. Register the provider in `common/src/browser-extension/cookieSessionProviders.ts`.
2. Add the provider `host_permissions` entry to `extension/manifest.json` (or automate in a follow-up build step).
3. Rebuild the extension.

## Directory launch (auto-launch)

1. In `common/src/auto-launch/destination-configs/<site>.ts`, export the `extension_config` fixture and one `{SITE}_DIRECTORY_LAUNCH_PROVIDERS` row per `provider_slug` (`hostPatterns`, `contentScriptEntry`, `defaultStartUrl`). Register fixtures in `destination-configs/index.ts` and append the site’s provider array in `destination-configs/directoryLaunchRegistry.ts` (aggregated `directoryLaunchProviders`). Run `pnpm sync:auto-launch-configs` when fixtures change.
2. Add a thin entry under `extension/src/content/directory-launch/` (filename must match `contentScriptEntry`) and register it in `extension/manifest.json` `content_scripts` + `extension/scripts/build-extension.mjs`.
3. Rebuild the extension. The toolbar popup and on-page step rail read `extension_config.steps` from the dashboard handoff payload.

Types (`LaunchStepField`, `DirectoryLaunchProvider`) and registry re-exports remain on `common/src/browser-extension/pageAssist.ts`; new destinations do not edit that file for provider rows.

Message types and payloads are defined in `openquok-common` (`common/src/browser-extension/`).

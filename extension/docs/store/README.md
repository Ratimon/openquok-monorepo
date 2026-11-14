# Browser extension store publishing

OpenQuok ships one Chromium build (`extension/dist/` and `openquok-browser-extension.zip`) to both the **Chrome Web Store** and **Microsoft Edge Add-ons**. **Firefox** uses `BUILD_TARGET=firefox` → `extension/dist-firefox/` (see [Firefox AMO checklist](./firefox-amo.md)).

| Artifact | Command |
| --- | --- |
| Unpacked dev load | `pnpm --filter @openquok/browser-extension build` → load `extension/dist/` |
| Store upload zip | `pnpm --filter @openquok/browser-extension zip` |

The zip step runs `verify-extension-dist.mjs` (build) and `verify-store-zip.mjs` (archive layout + manifest checks).

## Guides

- [Microsoft Edge Add-ons checklist](./edge-addons.md) — Partner Center upload, listing copy, ID wiring, QA on Edge
- [Mozilla Firefox (AMO) checklist](./firefox-amo.md) — sidebar build, page bridge, QA matrix, source upload

## Shared listing assets

- **Privacy policy:** [https://www.openquok.com/privacy-policy](https://www.openquok.com/privacy-policy) — use the same URL on Chrome and Edge.
- **Manifest description:** browser-neutral (no “Chrome” in `extension/manifest.json` `description`; copied into `dist/` on build).
- **Permissions justifications:** explain `cookies` (Skool session refresh), `host_permissions` per domain, `sidePanel`, and `scripting` the same way on both stores.

## After Edge publish

Edge assigns a **different extension ID** than Chrome. Update production web env:

- `VITE_OPENQUOK_BROWSER_EXTENSION_IDS` — e.g. `chromium:<chrome-id>,edge:<edge-id>` (see [configuration-web](https://www.openquok.com/docs/configuration-web)).

Unchanged Chrome listing ID stays in `VITE_OPENQUOK_BROWSER_EXTENSION_ID` as fallback for single-ID deployments.

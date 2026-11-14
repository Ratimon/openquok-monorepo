# Mozilla Firefox (AMO) checklist

Firefox ships from a **separate build** (`extension/dist-firefox/`). Chromium store upload stays on `extension/dist/`.

| Artifact | Command |
| --- | --- |
| Unpacked dev load | `pnpm --filter @openquok/browser-extension build:firefox` → **about:debugging#/runtime/this-firefox** (sidebar **This Firefox**, not **Setup**) → Load Temporary Add-on → `dist-firefox/manifest.json` |
| Source / review zip | `pnpm --filter @openquok/browser-extension zip:firefox` → `openquok-browser-extension-firefox.zip` |

## Build differences

| Area | Chromium (`dist/`) | Firefox (`dist-firefox/`) |
| --- | --- | --- |
| Panel UI | `side_panel.default_path` | `sidebar_action.default_panel` (same `sidepanel.html` bundle) |
| Dashboard connect | `externally_connectable` + `chrome.runtime.sendMessage` | Dashboard content script `postMessage` bridge (`pageRuntimeBridge`) |
| Gecko ID | n/a | `manifest.firefox.json` → `browser_specific_settings.gecko.id` (update before public listing if AMO assigns another) |
| Permissions | includes `sidePanel` | `sidePanel` removed |

After AMO assigns the listing extension ID, add `firefox:<amo-id>` to production `VITE_OPENQUOK_BROWSER_EXTENSION_IDS` (see [configuration-web](https://www.openquok.com/docs/configuration-web)).

## Manual QA matrix

Run each row on **Firefox** with a temporary or signed AMO build and `https://www.openquok.com` (or local dashboard + matching host permissions).

| Check | Steps | Pass criteria |
| --- | --- | --- |
| Sidebar opens | Toolbar icon or context menu → OpenQuok | Sidebar shows Social + Directory tabs |
| Dashboard session sync | Sign in on dashboard; open sidebar | Extension shows signed-in org; Skool connect available |
| Skool connect + refresh | Connect Skool via extension; wait or trigger refresh | Integration stays connected; cookies refresh without manual re-auth |
| Social schedule | Prefill from page selection or composer; schedule | Post appears in OpenQuok |
| Directory autofill | Launch handoff from `/auto-launch`; open destination tab | Step rail + fill engine run; complete marks submission |
| Directory launch handoff (web) | From dashboard, start launch with extension installed | No `externally_connectable` error; handoff reaches extension |
| Reddit handoff | Context menu on Reddit submit page | Draft lands in social composer |
| Self-host origin | Custom dashboard HTTPS in `host_permissions` + content script matches | Session sync + page bridge work on that origin |

## AMO submission notes

- **Privacy policy:** [https://www.openquok.com/privacy-policy](https://www.openquok.com/privacy-policy)
- **Source upload:** Submit the monorepo or a tagged source archive matching the built XPI/zip (Mozilla often requests reproducible build steps — cite `pnpm common:build && pnpm --filter @openquok/browser-extension build:firefox`).
- **Permission justifications:** Same as Chromium listing — `cookies` (Skool session), `host_permissions` table per domain, `scripting` for directory assist, `storage`/`alarms` for refresh tokens and composer drafts.
- **Humanizer on Firefox:** Open [Humanizer](https://www.openquok.com/tools/humanizer) in a tab; rewrites stay on-device when the Rewriter API is available. Copy polished text back into the side panel or dashboard composer.

## Regression after manifest edits

```bash
pnpm common:build
pnpm --filter @openquok/browser-extension build:firefox
pnpm --filter @openquok/browser-extension test
```

Reload the temporary add-on on **about:debugging** after every rebuild.

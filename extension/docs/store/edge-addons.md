# Microsoft Edge Add-ons — publish checklist

Use this when submitting the same Chromium MV3 package as Chrome to [Microsoft Edge Add-ons](https://partner.microsoft.com/dashboard/microsoftedge/overview).

## 1. Build and verify the upload zip

From the monorepo root:

```bash
pnpm --filter @openquok/browser-extension zip
```

This will:

1. Build `openquok-common` and the extension into `extension/dist/`.
2. Run `verify-extension-dist.mjs` (manifest, side panel, content scripts).
3. Create `extension/openquok-browser-extension.zip` with **files at the archive root** (not wrapped in a `dist/` folder).
4. Run `verify-store-zip.mjs` (root `manifest.json`, required bundles, browser-neutral description, MV3).

If verification fails, fix the reported issue, delete `extension/dist/` if stale bundles are mentioned, rebuild, and zip again.

## 2. Partner Center — new submission

1. Sign in to [Partner Center → Edge extensions](https://partner.microsoft.com/dashboard/microsoftedge/overview).
2. **Create new extension** (or new version on an existing listing).
3. Upload `extension/openquok-browser-extension.zip` — do **not** re-zip through Finder/Explorer; use the script output as-is.
4. Wait for automated package validation (MV3, manifest parse). Edge accepts the same zip Chrome uses.

## 3. Listing metadata (reuse Chrome copy, neutral browser wording)

| Field | Guidance |
| --- | --- |
| **Name** | Match manifest: `OpenQuok: Social Media Scheduler & Directory Autofill` |
| **Short description** | Mirror manifest `description` (side panel, not “Chrome side panel”). |
| **Detailed description** | Reuse Chrome Web Store long description; say “browser extension” / “Microsoft Edge” where the Chrome text says “Chrome”. |
| **Category** | Productivity or Social (match Chrome). |
| **Privacy policy URL** | `https://www.openquok.com/privacy-policy` |
| **Support / website** | `https://www.openquok.com` and `/docs/installation/chrome-extension` (Chromium install doc; Edge users follow the same steps on `edge://extensions`). |
| **Screenshots** | Same assets as Chrome (side panel, schedule flow, directory autofill). |

## 4. Permissions and data use

Edge asks for the same permission rationales as Chrome. Reuse your Chrome Web Store justifications:

- **`cookies` + `*.skool.com`:** read session cookies so Skool can connect without server-stored passwords.
- **`host_permissions`:** only listed domains (Skool, Reddit submit, directory sites, OpenQuok dashboard, localhost for dev).
- **`sidePanel`:** primary scheduling UI.
- **`storage` / `alarms`:** session refresh and composer drafts.
- **No sale of personal data;** processing aligns with the privacy policy.

## 5. Manual QA on Microsoft Edge (before or after review)

Load unpacked from `extension/dist/` or install the build under review, then:

| Check | Pass criteria |
| --- | --- |
| Side panel opens | Toolbar action opens side panel with Social / Directory tabs |
| OpenQuok connect | Signed-in dashboard recognizes extension (`edge://extensions` → ID matches env when published) |
| Skool schedule | Cookie refresh + schedule from side panel |
| Reddit handoff | Context menu / composer handoff to Reddit submit |
| Directory autofill | PeerPush / Uneed / Open Launch scripts on matched hosts |
| Humanize context menu | Selected text → **Humanize selection with OpenQuok** opens `/tools/humanizer` on the preferred dashboard origin; side panel stays closed |

Record Edge version and build zip `manifest.version` in release notes.

## 6. Post-publish — extension ID on the web app

1. Copy the **Extension ID** from `edge://extensions` (Details) for the Edge Add-ons build.
2. Set production `VITE_OPENQUOK_BROWSER_EXTENSION_IDS` to include `edge:<edge-id>` alongside the Chrome ID (see `web/.env.production.example` and [configuration-web](https://www.openquok.com/docs/configuration-web)).
3. Deploy web so **Add channel → browser extension** pings the Edge ID when users run Edge.

Chrome listing ID is unchanged; self-hosters can keep a single `VITE_OPENQUOK_BROWSER_EXTENSION_ID` if they only ship one store build.

## 7. Ongoing releases

For each extension version bump:

1. Bump `version` in `extension/manifest.json`.
2. `pnpm --filter @openquok/browser-extension zip`
3. Submit **new package** to Edge Add-ons and Chrome Web Store (same zip file for both).
4. Update store release notes; redeploy web only when Edge extension ID changes (rare after first publish).

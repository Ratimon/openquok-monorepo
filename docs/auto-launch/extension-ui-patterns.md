# Directory extension UI patterns

Reference for **extension-assisted directory launches**: step rail, compare panel, `profilePath` mapping, and manual smoke. Fixtures live in `common/src/auto-launch/destination-configs/`; the dashboard hands off `extension_config` to the browser extension.

---

## Shipped directory destinations

| Site slug | Provider slugs | Start URLs (typical) | Content script |
| --- | --- | --- | --- |
| `uneed` | `uneed-join-line`, `uneed-paid-launch`, `uneed-maker-profile` | per variant on uneed.best | `openquok-directory-uneed.js` |
| `peerpush` | `peerpush-free-queue`, `peerpush-standard-launch` | peerpush.com submit flows | `openquok-directory-peerpush.js` |
| `open-launch` | `open-launch-free-launch`, `open-launch-premium-launch` | Premium wizard; free queue via pricing | `openquok-directory-open-launch.js` |
| `tinylaunch` | `tinylaunch-standard-launch`, `tinylaunch-premium-launch` | Premium → create form; Standard → pricing | `openquok-directory-tinylaunch.js` |

**Site count for smoke:** **4** directory sites (8 provider variants total).

Picker groups: TinyLaunch and Open Launch group variants under one Add Channel tile per site (`picker_group_key` = site slug).

---

## Extension handoff (all sites)

1. Member chooses a destination on **My Products** → **Launch to directory**.
2. API returns `extension_config` (steps, fields, proof selectors) and `start_url`.
3. Extension opens `start_url`, runs login gate when needed, renders **step rail** and **field compare**.
4. Member edits on the live site, submits on the directory, then marks complete in OpenQuok with the **listing URL**.

Compare rail flags (`compareRequired`, `compareLabel`) come from fixtures; only map `profilePath` values that exist on the business profile composer.

---

## TinyLaunch field mapping

Module: `common/src/auto-launch/destination-configs/tinylaunch.ts`

| Form label (TinyLaunch) | `profilePath` | `fillMode` | Notes |
| --- | --- | --- | --- |
| Startup Name | `name` | `text` | max 30 |
| Tagline | `tagline` | `text` | max 60 |
| Logo | `logo_url` | `file` | `fileInputIndex` 0 |
| Images (gallery) | `profile_data.gallery_urls` | `files` | max 3; second file input |
| Website URL | `website_url` | `text` | |
| Description | `description` | `rich_html` | |
| Category | `profile_data.category` | `select` | `selectCatalog: 'tinylaunch'` |
| Upvote pledge | — | — | **Manual** on tinylaunch.com |

`readyUrlHint`: Premium uses `dashboard/startups`; Standard derives from Premium with `readyUrlHint: 'pricing'` via `syncMetadata` (`tinylaunch-standard-launch` → base `tinylaunch-premium-launch`).

Login: `extension/src/directory/directory-launch/siteLogin/tinylaunch.ts` → `https://www.tinylaunch.com/login`.

---

## Open Launch field mapping (summary)

| Area | `profilePath` | Notes |
| --- | --- | --- |
| Name, website, descriptions | `name`, `website_url`, `description` | |
| Logo / gallery | `logo_url`, gallery paths | |
| Categories / tech | `profile_data.*` | up to 3 categories, 5 tech tags |

Standard free queue spreads Premium config with `readyUrlHint: 'pricing'`.

---

## PeerPush & Uneed (summary)

- **PeerPush:** name, tagline, description, website, logo, PeerPush-specific discovery fields; Standard vs free queue destinations.
- **Uneed:** join line, paid launch, maker profile variants; category and tag catalogs via `fieldCatalogRegistry`.

See operator guides under `web/src/content/docs/directory-integration/`.

---

## Manual smoke checklist

Run after changing fixtures, extension manifests, or marketing tiles. Use a dev workspace with the extension loaded from `extension/dist`.

### All sites (4)

- [ ] `pnpm --filter openquok-common test:unit` (includes destination config drift tests)
- [ ] `pnpm sync:auto-launch-configs:check` and `pnpm sync:auto-launch-destinations:check`
- [ ] Add Channel shows one tile per site with bundled logo under `/icons/link-directory/{slug}.svg`
- [ ] Side panel **session bar** (above Social / Directory tabs): sign in from the bar on Social → Directory shows the same connection label and channel picker (no red sign-in banner); **Disconnect** in the bar clears the Social composer; self-host connect from the bar works without opening Social first

### TinyLaunch

- [ ] Sign in on tinylaunch.com; handoff opens Premium start URL with non-empty `extension_config`
- [ ] Step rail shows **Create startup**; compare lists name, tagline, logo, gallery, website, description, category
- [ ] Category select options match `tinylaunch` catalog labels
- [ ] Standard destination opens pricing URL; compare config matches Premium minus `readyUrlHint`
- [ ] After publish, proof regex `/dashboard/startups/` and listing URL selector match a live startup link
- [ ] `/channels/tinylaunch` and `directory-integration/tinylaunch` docs load; hub lists TinyLaunch with PeerPush, Uneed, Open Launch

### Regression peers (spot-check one variant each)

- [ ] Uneed paid or join line handoff
- [ ] PeerPush Standard or free queue handoff
- [ ] Open Launch premium or free queue handoff

---

## Related

- `extension/README.md` — build and directory launch wiring
- `web/src/content/docs/directory-integration/` — per-site operator guides
- `.cursor/rules/add-directory-integration.mdc` — PR file checklist
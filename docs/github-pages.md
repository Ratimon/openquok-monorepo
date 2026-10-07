# GitHub Pages (docs site)

Static landing page: `index.html` in this folder. Outbound links to `openquok.com` are plain anchors (dofollow on Pages).

## One-time repo setup (required)

If **Deploy GitHub Pages** fails with `Failed to create deployment (status: 404)`, Pages is not enabled yet:

1. Open [Repository Settings → Pages](https://github.com/Ratimon/openquok-monorepo/settings/pages).
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Re-run the failed workflow (**Actions** → **Deploy GitHub Pages** → **Re-run all jobs**).

Published URL (default): `https://ratimon.github.io/openquok-monorepo/`

Org-owned repos may need an admin to allow Pages under organization settings.

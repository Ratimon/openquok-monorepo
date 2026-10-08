# GitHub Pages (docs site)

Static landing page: `index.html` in this folder. Outbound links to `openquok.com` are plain anchors (dofollow on Pages).

## One-time repo setup (required)

If **Deploy GitHub Pages** fails with `Failed to create deployment (status: 404)`, Pages is not enabled yet:

1. Open [Repository Settings → Pages](https://github.com/Ratimon/openquok-monorepo/settings/pages).
2. Under **Build and deployment**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Re-run the failed workflow (**Actions** → **Deploy GitHub Pages** → **Re-run all jobs**).

Published URL (default): `https://ratimon.github.io/openquok-monorepo/`

Org-owned repos may need an admin to allow Pages under organization settings.

## Job stuck on “waiting for github-pages deployment approval”

GitHub created a **`github-pages` environment** with **required reviewers** (common on first Pages + Actions setup). The workflow will sit in **Waiting** until someone approves it — it does not time out on its own.

**Approve this run**

1. Open the workflow run (e.g. **Actions** → **Deploy GitHub Pages** → run **#2**).
2. On the yellow banner or the **deploy** job, click **Review deployments** (or **View pending deployments**).
3. Select the **github-pages** environment → **Approve and deploy**.

**Optional — skip approval on future pushes** (repo admins only)

1. [Settings → Environments → github-pages](https://github.com/Ratimon/openquok-monorepo/settings/environments).
2. Under **Deployment protection rules**, remove **Required reviewers** (or add only people who should gate production Pages).
3. Save. The next workflow run deploys without a manual step.

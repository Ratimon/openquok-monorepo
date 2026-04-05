# Publishing the backend Docker image (maintainer)

This note is for **maintainers** who push pre-built images to a registry so self-hosters can `docker pull` instead of building from source. It is **not** part of the public documentation site under `web/`.

## What you publish

- **Image**: API server built from `backend/Dockerfile` (monorepo root as build context).
- **Default process**: `node dist/app.js` (port **3000**). Runtime env (Supabase, secrets, Temporal, Redis, etc.) is supplied by the host or orchestrator.

There is currently **one** production Dockerfile in this repo (backend only). If you add a `web` image later, repeat the same pattern with a second name/tag.

## Registry choice

**GitHub Container Registry (`ghcr.io`)** is a straightforward default if the code lives on GitHub: same org, billing, and permission model as the repo.

Alternatives: Docker Hub, AWS ECR, Google Artifact Registry, etc. The commands below use GHCR; replace the registry host and login step for others.

## One-time setup (GHCR)

1. **Personal access token (classic)** or fine-grained token with permission to **write packages** (and **read** if you use private pulls in CI).
2. Log in locally (not committed to scripts):

   ```bash
   echo YOUR_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```

3. **Image name**: GHCR expects a path like  
   `ghcr.io/<owner-or-org-lowercase>/<image-name>:<tag>`  
   Example: `ghcr.io/myorg/openquok-backend:1.0.0`  
   Use **lowercase** for the owner segment; tags often use semver or `latest`.

4. After the first push, open the package on GitHub → **Package settings** → set **visibility** to **public** if you want anonymous `docker pull` for self-hosters (same idea as other projects that publish `:latest`).

## Build and push (manual)

From the **repository root** (required so the Dockerfile can copy workspace files):

```bash
pnpm docker:build:backend
```

That tags the image as `openquok-backend:local`. Retag and push to GHCR:

```bash
docker tag openquok-backend:local ghcr.io/<owner>/openquok-backend:<tag>
docker push ghcr.io/<owner>/openquok-backend:<tag>
```

Optional **semver + latest**:

```bash
VERSION=1.2.3
docker tag openquok-backend:local ghcr.io/<owner>/openquok-backend:$VERSION
docker tag openquok-backend:local ghcr.io/<owner>/openquok-backend:latest
docker push ghcr.io/<owner>/openquok-backend:$VERSION
docker push ghcr.io/<owner>/openquok-backend:latest
```

## What self-hosters do

They reference your image in Compose or `docker run`, for example:

```yaml
services:
  api:
    image: ghcr.io/<owner>/openquok-backend:latest
    # env, ports, depends_on, etc.
```

They still supply **env**, **database**, and any sidecars (Temporal worker, Redis) per your deployment docs—not the image alone.

## Updating Compose after a successful publish

**Yes** — any Compose file that today builds the API from the repo (`build` + `dockerfile`) should be **switched to a registry `image`** when you want pulls instead of local builds. You do **not** need to change Compose to *publish* the image; you change it so **runtimes** use the image you pushed.

### File in this repo: `infra/docker-compose.full-stack.example.yaml`

The `api` service is defined with **`build`** (monorepo root context + `backend/Dockerfile`). That suits **build-from-git** self-hosting. After you publish to GHCR (or another registry), **operators** (including you) can replace that block with **`image`**.

**Before** (build locally / in CI from checkout):

```yaml
  api:
    build:
      context: ..
      dockerfile: backend/Dockerfile
```

**After** (pull a published tag):

```yaml
  api:
    image: ghcr.io/<owner>/openquok-backend:<tag>
```

Keep the same `env_file` (or equivalent env injection), `ports`, `depends_on`, `networks`, and volumes as in the example; only the way the image is obtained changes.

### Commands

- The example’s usage comment uses `up -d --build`. For a **pre-pulled** image, use `up -d` (omit `--build`) so Compose does not try to rebuild. Add `pull_policy: always` on `api` if you want a fresh pull on each `up`.
- **Private** registry images: run `docker login ghcr.io` (or your registry) on the host before `docker compose up`, or configure a Compose credential helper.

### What to commit in git

- **Option A — keep the example as build-from-source** (good for contributors who have the repo and want to build): leave `docker-compose.full-stack.example.yaml` as-is; document in your release notes or operator runbook that published-image users should **replace `build` with `image`** in their **private** copy.
- **Option B — registry-first example**: change the committed file to `image: ghcr.io/<your-org>/openquok-backend:latest` (or `${OPENQUOK_IMAGE:-ghcr.io/...}`) so copy-paste self-hosting matches published releases; contributors who need local builds can temporarily restore a `build` block.

Pick one convention and stay consistent so support questions stay simple.

## Automation (optional)

- Add a **GitHub Actions** workflow that runs on `release` or `workflow_dispatch`, checks out the repo, runs `docker build` with `GITHUB_TOKEN` or `GHCR` credentials, and pushes to `ghcr.io/${{ github.repository_owner }}/openquok-backend:${{ github.ref_name }}`.
- Pin **digest** (`image@sha256:…`) in serious production; tags move.

## Checklist before tagging `latest`

- [ ] `pnpm docker:build:backend` succeeds on a clean machine/CI.
- [ ] Image runs with a realistic env file (smoke test).
- [ ] You are comfortable with the visibility (public vs private) of the GHCR package.
- [ ] You decided how Compose is maintained (build-from-repo vs published `image` in `infra/docker-compose.full-stack.example.yaml` or operator copies) and documented the choice for self-hosters.

## Tooling and ignore rules

You do **not** need to add this file to `.gitignore`, `.eslintignore`, or the docs site config: keep it **committed** so maintainers share the same instructions.

- **Docker** — The monorepo root `.dockerignore` already excludes the `infra/` tree and all `*.md` files from the API image build context, so this guide is not copied into images and does not affect image size.
- **ESLint** — Backend ESLint targets TypeScript only; Markdown is untouched.
- **Public docs** — Content under `web/src/content/docs/` is what ships to the site; this path is not part of that tree unless you link it manually.

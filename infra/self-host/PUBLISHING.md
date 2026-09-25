# Publishing self-host container images

Operators pull images documented at [Docker (pre-built images)](https://www.openquok.com/docs/installation/docker). This file is for **maintainers** cutting a self-host image release.

## Prerequisites

1. **Workflow on `main`:** `.github/workflows/self-host-containers.yml` must be merged (tag-triggered builds).
2. **GHCR:** Packages under `ghcr.io/ratimon/openquok-*` are **public** and linked to this repo (Settings → Packages) so anonymous `docker pull` works.
3. **Docker Hub mirror:** Repository secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` must be set (mirror job in the same workflow). Without them, GHCR images still publish; Hub tags are skipped when the job fails.

## Tag convention

| Git tag | Image tags |
| --- | --- |
| `self-host-v0.1.0` | `0.1.0`, `0.1.0-amd64`, `0.1.0-arm64`, and `latest` (multi-arch manifest) |

Pattern: **`self-host-v<semver>`** only — do not use bare `v1.0.0` or `cli-v*` / `sdk-v*` prefixes for this pipeline.

Semver in the tag may include a pre-release suffix (for example `self-host-v1.0.0-rc.1` → image tag `1.0.0-rc.1`).

## Cut a release (preferred: git tag)

Commit the release candidate to **`main`**, then tag **that commit**:

```bash
# From monorepo root — replace version as needed
VERSION=0.1.0
git checkout main
git pull origin main
git tag "self-host-v${VERSION}"
git push origin "self-host-v${VERSION}"
```

GitHub Actions workflow **Self-host containers** runs on the tag push. It builds four images (`openquok-api`, `openquok-web`, `openquok-orchestrator`, `openquok-agent-server`) for **linux/amd64** and **linux/arm64**, pushes per-arch tags to GHCR, assembles manifests, then mirrors to `docker.io/ratimon/`.

Watch the run: [Actions → Self-host containers](https://github.com/Ratimon/openquok-monorepo/actions/workflows/self-host-containers.yml).

### Manual rebuild (no new git tag)

Use **workflow_dispatch** on **Self-host containers** with input **version** set to an existing semver (for example `0.1.0`). Same image tags are overwritten.

## Post-release verification

Run from a machine with Docker. Replace `VERSION` with the release you tagged.

### 1. Registry pulls (GHCR)

```bash
VERSION=0.1.0
for img in openquok-api openquok-web openquok-orchestrator openquok-agent-server; do
  docker pull "ghcr.io/ratimon/${img}:${VERSION}"
done
```

### 2. Multi-arch manifest

```bash
VERSION=0.1.0
docker buildx imagetools inspect "ghcr.io/ratimon/openquok-api:${VERSION}"
```

Expect **`linux/amd64`** and **`linux/arm64`** in the manifest list.

On **arm64** hosts, `docker pull` uses the arm64 variant; on **amd64**, the amd64 variant. Optional per-arch tags: `ghcr.io/ratimon/openquok-api:${VERSION}-arm64`.

### 3. Docker Hub mirror (if secrets configured)

```bash
VERSION=0.1.0
docker pull "docker.io/ratimon/openquok-api:${VERSION}"
docker buildx imagetools inspect "docker.io/ratimon/openquok-api:${VERSION}"
```

### 4. Compose smoke (operator path)

Uses the images overlay; **web still builds locally** unless `OPENQUOK_PULL_WEB=true` and your `VITE_*` match the CI bake.

```bash
# From monorepo root
cp infra/self-host/.env.example infra/self-host/.env
# Edit .env: Supabase URL + service role + anon/publishable keys, JWT secret, matching VITE_PUBLIC_SUPABASE_*

echo 'OPENQUOK_IMAGE_TAG=0.1.0' >> infra/self-host/.env

docker compose -f infra/self-host/docker-compose.yml -f infra/self-host/docker-compose.images.yml pull
docker compose -f infra/self-host/docker-compose.yml -f infra/self-host/docker-compose.images.yml up -d --build

# Web UI (default port)
curl -sf -o /dev/null -w '%{http_code}\n' http://localhost:4007/
# API health (adjust if OPENQUOK_API_HOST_PORT differs)
curl -sf -o /dev/null -w '%{http_code}\n' http://localhost:3000/api/v1/health || true
```

Expect HTTP **200** (or **302** for web if auth redirect) once Supabase and secrets are valid. Tear down when finished:

```bash
docker compose -f infra/self-host/docker-compose.yml -f infra/self-host/docker-compose.images.yml down
```

### 5. Docs spot-check

Load [installation/docker](https://www.openquok.com/docs/installation/docker) locally or on staging and confirm pull commands and `OPENQUOK_IMAGE_*` match this release.

## First release checklist (`self-host-v0.1.0`)

- [ ] Container workflow and compose overlay merged to `main`
- [ ] GHCR packages public; Docker Hub secrets set (optional mirror)
- [ ] `git tag self-host-v0.1.0 && git push origin self-host-v0.1.0`
- [ ] CI **Self-host containers** green for all matrix legs + manifest + mirror
- [ ] `docker pull` + `imagetools inspect` for `0.1.0` on amd64 **and** arm64 hosts (or inspect manifest)
- [ ] Compose smoke with pinned `OPENQUOK_IMAGE_TAG=0.1.0`, local `web` build, UI reachable on port 4007

## Tag already exists / bad tag

```bash
git tag -d self-host-v0.1.0
git push origin :refs/tags/self-host-v0.1.0
# Fix commit, then re-tag and push
git tag self-host-v0.1.0
git push origin self-host-v0.1.0
```

Re-pushing the same tag after a failed CI run re-triggers the workflow. Prefer a new patch version if images were already consumed publicly.

## Related

- Workflow: `.github/workflows/self-host-containers.yml`
- Operator docs: `web/src/content/docs/installation/docker.md`
- Compose overlay: `infra/self-host/docker-compose.images.yml`

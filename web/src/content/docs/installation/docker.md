---
title: Self-host - Docker (pre-built images)
description: Pull published OpenQuok self-host container images from GHCR or Docker Hub — registry env vars, version tags, multi-arch, and when to rebuild the web image.
order: 4.5
lastUpdated: 2026-09-25
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

OpenQuok publishes **multi-architecture** container images for the self-host stack so you can skip local TypeScript builds for the API, BullMQ workers, and (optionally) the agent server. Images are built from this monorepo when maintainers push a git tag such as <Badge text="self-host-v1.0.0" variant="default" /> (image tag <Badge text="1.0.0" variant="default" />).

<Callout type="tip" title="Default path">
<p>Clone the repo, configure <Badge text="infra/self-host/.env" variant="path" />, and run <code>docker compose … up --build</code> — see <a href="/docs/installation/docker-compose">Docker Compose (self-host)</a>. Use this page when you want <strong>registry pulls</strong> for faster bring-up on the same machine architecture.</p>
</Callout>

## Registries and image names

| Registry | Prefix | Example pull |
| --- | --- | --- |
| GitHub Container Registry (default) | <Badge text="ghcr.io/ratimon" variant="path" /> | <code>docker pull ghcr.io/ratimon/openquok-api:latest</code> |
| Docker Hub mirror | <Badge text="docker.io/ratimon" variant="path" /> | <code>docker pull docker.io/ratimon/openquok-api:latest</code> |

| Image name | Compose services | Dockerfile in repo |
| --- | --- | --- |
| <Badge text="openquok-api" variant="default" /> | <code>api</code> | <Badge text="backend/Dockerfile" variant="path" /> |
| <Badge text="openquok-web" variant="default" /> | <code>web</code> | <Badge text="web/Dockerfile" variant="path" /> |
| <Badge text="openquok-orchestrator" variant="default" /> | <code>worker-*</code> (three services) | <Badge text="orchestrator/Dockerfile" variant="path" /> |
| <Badge text="openquok-agent-server" variant="default" /> | <code>agent-server</code> (<code>cli</code> profile) | <Badge text="agent/server/Dockerfile" variant="path" /> |

Registry listings (when packages are public):

- <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/pkgs/container/openquok-api">openquok-api on GHCR</DocsExternalLink>
- <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/pkgs/container/openquok-web">openquok-web on GHCR</DocsExternalLink>
- <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/pkgs/container/openquok-orchestrator">openquok-orchestrator on GHCR</DocsExternalLink>
- <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/pkgs/container/openquok-agent-server">openquok-agent-server on GHCR</DocsExternalLink>
- Docker Hub: <DocsExternalLink href="https://hub.docker.com/u/ratimon">ratimon</DocsExternalLink> (same image names under <code>docker.io/ratimon/</code>)

## Version tags and multi-arch

- **Release tags:** git tag <Badge text="self-host-v1.0.0" variant="default" /> → images tagged <Badge text="1.0.0" variant="default" />, <Badge text="latest" variant="default" />, and per-arch tags such as <Badge text="1.0.0-amd64" variant="default" /> / <Badge text="1.0.0-arm64" variant="default" /> (manifest lists combine amd64 and arm64).
- **Maintainers:** cut and verify releases via <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/infra/self-host/PUBLISHING.md"><Badge text="infra/self-host/PUBLISHING.md" variant="path" /></DocsExternalLink> (push a <Badge text="self-host-v0.1.0" variant="default" />-style tag on <Badge text="main" variant="default" /> after <Badge text=".github/workflows/self-host-containers.yml" variant="path" /> is merged).
- **Pinning:** set <Badge text="OPENQUOK_IMAGE_TAG" variant="envBackend" /> in <Badge text="infra/self-host/.env" variant="path" /> to a semver (for example <code>1.0.0</code>) instead of <code>latest</code> for reproducible deploys.
- **Verify architecture:** <code>docker manifest inspect ghcr.io/ratimon/openquok-api:1.0.0</code> should list <code>linux/amd64</code> and <code>linux/arm64</code> when the release job completed successfully.

## Compose environment variables

Set these in <Badge text="infra/self-host/.env" variant="path" /> (see <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/blob/main/infra/self-host/.env.example"><Badge text="infra/self-host/.env.example" variant="path" /></DocsExternalLink>):

| Variable | Default | Role |
| --- | --- | --- |
| <Badge text="OPENQUOK_IMAGE_REGISTRY" variant="envBackend" /> | <code>ghcr.io/ratimon</code> | Registry host + org (use <code>docker.io/ratimon</code> for Docker Hub) |
| <Badge text="OPENQUOK_IMAGE_TAG" variant="envBackend" /> | <code>latest</code> | Image tag for all <code>openquok-*</code> services |
| <Badge text="OPENQUOK_PULL_WEB" variant="envBackend" /> | <code>false</code> | When <code>true</code>, opt into pulling a pre-built <code>web</code> image only if your <Badge text="VITE_*" variant="envWeb" /> match the published bake (advanced) |

Base compose file <Badge text="infra/self-host/docker-compose.yml" variant="path" /> always declares both <code>image:</code> and <code>build:</code> so <code>docker compose up --build</code> still works from a git clone. Registry-first pulls use the overlay <Badge text="infra/self-host/docker-compose.images.yml" variant="path" /> (sets <code>pull_policy: always</code> on API, workers, and agent server).

<Callout type="warning" title="Web image and VITE_*">
<p><Badge text="VITE_*" variant="envWeb" /> values are baked into the <code>web</code> image at <strong>build</strong> time. CI publishes a web image with self-host-friendly defaults (empty Supabase/Stripe keys, <Badge text="VITE_API_BASE_URL" variant="envWeb" /> empty for same-origin proxy, <Badge text="VITE_FRONTEND_DOMAIN_URL=http://localhost:4007" variant="envWeb" />). If your Supabase URL, publishable key, or public site URL differ, <strong>build the web service locally</strong> — do not set <Badge text="OPENQUOK_PULL_WEB" variant="envBackend" /> unless you know the pulled bundle matches your <Badge text=".env" variant="path" />.</p>
</Callout>

<Callout type="note">
<p>A single universal pulled web image for every Supabase project would require runtime injection of public config — that is not available today. Until then, treat pulled <code>openquok-web</code> as an optional shortcut for localhost demos, not a substitute for <code>compose build web</code> on real projects.</p>
</Callout>

## Pull and start

Prerequisites match <a href="/docs/installation/system-requirements">System requirements</a> and the Supabase keys documented on <a href="/docs/installation/docker-compose">Docker Compose (self-host)</a>.

<Steps
	howToName="Run self-host with pre-built images"
	howToDescription="Pull OpenQuok API and worker images from a registry, build web locally when VITE_* differ from the published bake."
>

### Configure <code>.env</code>

Copy <Badge text="infra/self-host/.env.example" variant="path" /> to <Badge text="infra/self-host/.env" variant="path" />, fill Supabase and backend secrets, and set matching <Badge text="VITE_PUBLIC_SUPABASE_*" variant="envWeb" /> for the web **build**.

Optionally uncomment and set:

```bash
OPENQUOK_IMAGE_REGISTRY=ghcr.io/ratimon
OPENQUOK_IMAGE_TAG=latest
```

### Pull API and workers

From the **repository root**:

```bash
docker compose -f infra/self-host/docker-compose.yml -f infra/self-host/docker-compose.images.yml pull
```

This downloads <code>openquok-api</code>, <code>openquok-orchestrator</code>, and (if you use the <code>cli</code> profile) <code>openquok-agent-server</code>. The <code>web</code> service still **builds** by default.

### Build web and bring the stack up

```bash
docker compose -f infra/self-host/docker-compose.yml -f infra/self-host/docker-compose.images.yml up -d --build
```

<Callout type="note" title="First start takes a while">
<p>The first time you run this, Docker still builds the web UI — often <strong>15–30 minutes</strong> or more. Later restarts are much faster. If it seems stuck, give Docker more memory; see <a href="/docs/installation/system-requirements">System requirements</a>.</p>
</Callout>

The <code>--build</code> step compiles the <code>web</code> image with your <Badge text="VITE_*" variant="envWeb" /> build args. Omit <code>--build</code> only when you intentionally pull web (see below).

Open <Badge text="http://localhost:4007" variant="default" /> (override with <Badge text="OPENQUOK_WEB_HOST_PORT" variant="envBackend" />).

### Optional: pull pre-built web (advanced)

When your public URL and Supabase publishable settings match the CI bake:

1. Set <Badge text="OPENQUOK_PULL_WEB=true" variant="envBackend" /> in <Badge text=".env" variant="path" />.
2. Uncomment the <code>web:</code> block in <Badge text="docker-compose.images.yml" variant="path" /> (<code>pull_policy: missing</code>).
3. Run <code>pull</code> again, then <code>up -d</code> without <code>--build</code> for web.

### Optional: CLI profile

Same as compose docs — include <code>--profile cli</code> on <code>pull</code> and <code>up</code> when you need Postgres and the agent server for device-flow login.

</Steps>

## Clone-and-build vs pull (summary)

| Approach | When to use |
| --- | --- |
| <code>docker compose -f infra/self-host/docker-compose.yml up --build</code> | Default — contributors and operators with custom <Badge text="VITE_*" variant="envWeb" /> |
| Base compose + <Badge text="docker-compose.images.yml" variant="path" /> + <code>pull</code> | Faster API/worker startup; still <code>build web</code> for real Supabase projects |
| Pinned <Badge text="OPENQUOK_IMAGE_TAG" variant="envBackend" /> | Production-like self-host when you want a known semver |

## Related

<CardGrid>
<LinkCard title="Docker Compose (self-host)" description="Full env reference, security defaults, and build-from-clone bring-up" href="/docs/installation/docker-compose" />
<LinkCard title="System requirements" description="Docker, RAM, ports, and operator-provided Supabase" href="/docs/installation/system-requirements" />
<LinkCard title="Database & migrations" description="Apply OpenQuok SQL to your Supabase project" href="/docs/configuration-backend/database" />
<LinkCard title="Maintenance mode" description="MAINTENANCE_MODE for cutover windows" href="/docs/installation/maintenance-mode" />
</CardGrid>

---
title: Self-host - Docker (pre-built images)
description: Pull published OpenQuok self-host container images from GHCR or Docker Hub — registry env vars, version tags, updates, and when to rebuild the web image.
order: 5
lastUpdated: 2026-09-25
---

<script>
import { Badge, Callout, CardGrid, DocsExternalLink, LinkCard, Steps } from '$lib/ui/components/docs/mdx/index.js';
</script>

## Overview

Maintainers publish container images for the self-host stack. You can **pull** the API, workers, and (optionally) the agent server instead of compiling them locally.

The usual path is still: clone the repo, configure <Badge text="infra/self-host/.env" variant="path" />, and run Compose. See <a href="/docs/installation/docker-compose">Docker Compose (self-host)</a>. Use this page when you want registry images on the same CPU architecture as the build (amd64 or arm64).

Release tags look like <Badge text="self-host-v1.0.0" variant="default" /> on git; images use <Badge text="1.0.0" variant="default" /> and <Badge text="latest" variant="default" />.

## Registries

| Registry | Prefix |
| --- | --- |
| GitHub Container Registry (default) | <Badge text="ghcr.io/ratimon" variant="path" /> |
| Docker Hub | <Badge text="docker.io/ratimon" variant="path" /> |

| Image | Services |
| --- | --- |
| <Badge text="openquok-api" variant="default" /> | <code>api</code> |
| <Badge text="openquok-orchestrator" variant="default" /> | three <code>worker-*</code> services |
| <Badge text="openquok-web" variant="default" /> | <code>web</code> (usually you build locally) |
| <Badge text="openquok-agent-server" variant="default" /> | <code>agent-server</code> with <code>cli</code> profile |

Example: <code>docker pull ghcr.io/ratimon/openquok-api:latest</code>

Package pages: <DocsExternalLink href="https://github.com/Ratimon/openquok-monorepo/pkgs/container/openquok-api">openquok-api on GHCR</DocsExternalLink>, <DocsExternalLink href="https://hub.docker.com/u/ratimon">ratimon on Docker Hub</DocsExternalLink>.

Pin a version with <Badge text="OPENQUOK_IMAGE_TAG" variant="envBackend" /> in <Badge text="infra/self-host/.env" variant="path" /> (for example <code>1.0.0</code> instead of <code>latest</code>).

## Env vars for pulls

| Variable | Default | Role |
| --- | --- | --- |
| <Badge text="OPENQUOK_IMAGE_REGISTRY" variant="envBackend" /> | <code>ghcr.io/ratimon</code> | Registry host and org |
| <Badge text="OPENQUOK_IMAGE_TAG" variant="envBackend" /> | <code>latest</code> | Tag for all <code>openquok-*</code> images |
| <Badge text="OPENQUOK_PULL_WEB" variant="envBackend" /> | <code>false</code> | Set <code>true</code> only when your <Badge text="VITE_*" variant="envWeb" /> match the published web image |

Base file: <Badge text="infra/self-host/docker-compose.yml" variant="path" />. Add overlay <Badge text="infra/self-host/docker-compose.images.yml" variant="path" /> for registry-first pulls.

<Callout type="warning" title="Web image">
<p><Badge text="VITE_*" variant="envWeb" /> are baked in at web <strong>build</strong> time. If your Supabase URL, keys, or public site URL differ from the CI defaults, <strong>build web locally</strong>. Do not set <Badge text="OPENQUOK_PULL_WEB" variant="envBackend" /> unless you know the pulled image matches your project.</p>
</Callout>

There is no runtime injection of <Badge text="VITE_*" variant="envWeb" /> today. Treat pulled <code>openquok-web</code> as a localhost demo shortcut, not a replacement for <code>compose build web</code> on a real Supabase project.

## Pull and start

Prerequisites: <a href="/docs/installation/system-requirements">System requirements</a> and Supabase keys from <a href="/docs/installation/docker-compose">Docker Compose</a>.

<Steps
	howToName="Run self-host with pre-built images"
	howToDescription="Pull OpenQuok API and worker images; build web when VITE_* differ from CI."
>

### Configure <code>.env</code>

Copy <Badge text="infra/self-host/.env.example" variant="path" /> to <Badge text="infra/self-host/.env" variant="path" />. Fill Supabase and <Badge text="SECURITY_SECRET" variant="envBackend" />.

Optional:

```bash
OPENQUOK_IMAGE_REGISTRY=ghcr.io/ratimon
OPENQUOK_IMAGE_TAG=latest
```

### Pull images

From the **repository root**:

```bash
docker compose -f infra/self-host/docker-compose.yml -f infra/self-host/docker-compose.images.yml pull
```

This pulls API, orchestrator, and (with <code>--profile cli</code>) agent server. Web still **builds** by default.

### Start

```bash
docker compose -f infra/self-host/docker-compose.yml -f infra/self-host/docker-compose.images.yml up -d --build
```

The first web build can take **15–30 minutes** or more. Later restarts are faster.

Open <Badge text="http://localhost:4007" variant="default" />. For restarts without rebuild, see <a href="/docs/installation/docker-compose#start-again">Start again</a> on the Compose page (use both <code>-f</code> files).

### Optional: pulled web (advanced)

Only when your URLs and Supabase publishable keys match the CI bake:

1. Set <Badge text="OPENQUOK_PULL_WEB=true" variant="envBackend" />.
2. Uncomment the <code>web:</code> block in <Badge text="docker-compose.images.yml" variant="path" />.
3. Run <code>pull</code>, then <code>up -d</code> without <code>--build</code> for web.

### Optional: CLI profile

Add <code>--profile cli</code> to <code>pull</code> and <code>up</code> when you need device-flow login. Same as <a href="/docs/installation/docker-compose">Docker Compose</a>.

</Steps>

## Choose an approach

| Approach | When |
| --- | --- |
| One compose file + <code>up --build</code> | Default; custom <Badge text="VITE_*" variant="envWeb" /> |
| Base + images overlay + <code>pull</code> | Faster API and workers; you still build web |
| Pinned <Badge text="OPENQUOK_IMAGE_TAG" variant="envBackend" /> | You want a fixed release version |

## Update

Change <Badge text="OPENQUOK_IMAGE_TAG" variant="envBackend" />, then <code>git pull</code>, <code>pull</code>, and <code>up -d --build</code> with both compose files. Full steps: <a href="/docs/installation/docker-compose#update">Docker Compose — Update</a>.

## Related

<CardGrid>
<LinkCard title="Docker Compose (self-host)" description="Full env reference and build-from-clone path" href="/docs/installation/docker-compose" />
<LinkCard title="System requirements" description="Docker, RAM, and ports" href="/docs/installation/system-requirements" />
<LinkCard title="Database & migrations" description="Apply SQL to your Supabase project" href="/docs/configuration-backend/database" />
<LinkCard title="Maintenance mode" description="Cutover windows" href="/docs/installation/maintenance-mode" />
</CardGrid>

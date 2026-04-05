# Infrastructure

Compose is split **by role** so files stay accurate: the **Temporal cluster** does not need OpenQuok app secrets, so [temporal/docker-compose.yaml](./temporal/docker-compose.yaml) only configures Temporal services.

**Railway (production canvas):** copy [docker-compose.railway.example.yaml](./docker-compose.railway.example.yaml) to **`docker-compose.railway.yaml`** (gitignored), put real secrets in inline `environment`, then drag **`infra/docker-compose.railway.yaml`** onto the Railway canvas and connect the GitHub repo. The `.example` file stays in git without secrets. Optionally run **`pnpm railway:sync-env`** from the repo root to merge gitignored **`backend/.env.production.local`** (default source; override with **`--from`**) into the **`api`** and **`worker`** `environment` blocks in **`docker-compose.railway.yaml`** (paths and options: [scripts/sync-railway-compose-env.mjs](../scripts/sync-railway-compose-env.mjs), [railway/README.md](./railway/README.md)).

**Local / reference stack:** [docker-compose.full-stack.example.yaml](./docker-compose.full-stack.example.yaml) is the **reference** for the same topology (API + worker + Redis + full Temporal stack in one file) with **`env_file`** and **`restart`**—run it with Docker on your machine. Keep its Temporal block aligned with [temporal/docker-compose.yaml](./temporal/docker-compose.yaml). App config uses [api.full-stack.env.example](./api.full-stack.env.example) (or `infra/api.full-stack.env`, gitignored); same keys as `backend/.env.*` / `GlobalConfig.ts` (`REDIS_HOST=redis`, `TEMPORAL_ADDRESS=temporal:7233`, …).

For local development, the API usually runs with **pnpm** on the host; Compose here targets Temporal, Redis, and optional containerized API builds.

| File | Purpose |
|------|---------|
| [docker-compose.dev.yaml](./docker-compose.dev.yaml) | **Dev:** includes [temporal/docker-compose.yaml](./temporal/docker-compose.yaml) plus **Redis** (for `CACHE_PROVIDER=redis`). Project name: `openquok-dev`. |
| [temporal/docker-compose.yaml](./temporal/docker-compose.yaml) | **Temporal only** (Postgres + Elasticsearch + server + UI). No OpenQuok app env (those containers are not the API). |
| [docker-compose.full-stack.example.yaml](./docker-compose.full-stack.example.yaml) | **Reference / local Docker:** API + **worker** + Redis + Temporal stack (`env_file` + `restart`). Use with `infra/api.full-stack.env` and [api.full-stack.env.example](./api.full-stack.env.example)—not for Railway canvas import. |
| [docker-compose.railway.example.yaml](./docker-compose.railway.example.yaml) | **Template** (no secrets): copy to **`docker-compose.railway.yaml`** (gitignored), fill `environment`, drag onto Railway canvas. |
| [railway.backend.example.toml](./railway.backend.example.toml) | **Optional** Railway `phases.setup` (Node/apt) if you host the **API** on <https://railway.app>. Temporal stays a **separate** service or Temporal Cloud—Vercel does not run Docker Compose. |
| [railway/README.md](./railway/README.md) | Railway: **`docker-compose.railway.yaml`** (local, gitignored) for canvas import; **`.example`** template; **`pnpm railway:sync-env`** to merge **`backend/.env.production.local`** into compose by default; Variables checklist [api.full-stack.env.example](./api.full-stack.env.example). |

**Vercel** hosts the default API + web; it does **not** run Compose or a Temporal server. Conceptual mapping (API vs Temporal server vs worker) and a Railway-oriented Temporal outline: `/docs/Installation/temporal-workers-railway`. See also `/docs/Installation/docker` and `/docs/Installation/production-deployment`.

## Root `package.json` scripts

| Script | Command |
|--------|---------|
| `pnpm infra:dev:up` / `down` / `logs` | Full dev stack (Temporal + Redis) |
| `pnpm infra:temporal:*` | Temporal stack only |
| `pnpm docker:build:backend` | Build `backend/Dockerfile` as `openquok-backend:local` |
| `pnpm railway:sync-env` | Merge a dotenv file into **`infra/docker-compose.railway.yaml`** `environment` for **`api`** and **`worker`** (default source: **`backend/.env.production.local`**). Flags: `--from`, `--to`, `--services`, `--worker-mode` (`slim` or `full`), `--temporal-address`, `--no-temporal-override`; env: `RAILWAY_COMPOSE_SYNC_FROM`, `RAILWAY_COMPOSE_SYNC_TO`. |
| `pnpm infra:railway:compose-config` | **`docker compose … config`** on **`infra/docker-compose.railway.example.yaml`** (syntax check in a clean clone). For your gitignored **`docker-compose.railway.yaml`**, run the same with **`-f infra/docker-compose.railway.yaml`**. More checks: [railway/README.md](./railway/README.md) **Pre-deploy validation**. |
| `pnpm railway:deploy:backend-compose` / `:prod` | Railway CLI: `railway up .` from repo root — **only for `api` / `worker`** (`railway service` first). Do **not** select Postgres/Redis/ES/Temporal image services; see **[railway/README.md](./railway/README.md)** (section **CLI `railway up`**). Full stack: canvas import + **Git push** — `/docs/Installation/production-deployment`. |
| `pnpm start:prod:worker` | Run compiled Temporal worker on the **host** without Compose (`backend` build required); optional when not using the `worker` service in Docker |

## Pushing to GHCR (example)

After `pnpm docker:build:backend`:

```bash
docker tag openquok-backend:local ghcr.io/<your-org>/openquok-backend:<tag>
docker push ghcr.io/<your-org>/openquok-backend:<tag>
```

Use your registry’s login and repository naming. Supply secrets at runtime (env, secrets manager, or Compose `env_file`), not in the image. For production at scale, prefer your host’s **secret store** or **cloud secrets manager** over long-lived plaintext files on disk—see **Managing secrets** in the docs site’s **Production deployment** page (`web/.../production-deployment.md`).

## Documentation

See **Docker & Compose** in the project docs (`web/src/content/docs/Installation/docker.md` → `/docs/Installation/docker`).

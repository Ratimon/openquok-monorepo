# Railway deployment (OpenQuok)

**Primary path:** copy **[`infra/docker-compose.railway.example.yaml`](../docker-compose.railway.example.yaml)** to **`infra/docker-compose.railway.yaml`** (gitignored), put real values in inline **`environment`** (or merge from **`backend/.env.production.local`** with **`pnpm railway:sync-env`**—see below), then import that YAML on the [project canvas](https://docs.railway.com/deploy/dockerfiles#docker-compose) and connect your **GitHub** repo. The **`.example`** file stays in git with placeholders only. You can still move or override secrets in Railway **Variables** after import. Use [`infra/api.full-stack.env.example`](../api.full-stack.env.example) as the key checklist for **api**; **worker** uses a **minimal** env block (`NODE_ENV`, `TEMPORAL_ADDRESS`, `TEMPORAL_NAMESPACE`) for the current Temporal worker—add Supabase/Redis/etc. when activities need them (see comments in the YAML). **`infra/docker-compose.full-stack.example.yaml`** is the **reference** for the same topology on **local Docker** (`env_file`, `restart`).

Root **[`railway.json`](../../railway.json)** points the **Railway CLI** (`railway up`) at **`backend/Dockerfile`** and default **`startCommand`** **`node dist/app.js`** (API). **Canvas import** still reads **`build:`** from this compose file—they should agree (repo root context, same Dockerfile). **`worker`** uses the same image but a different process: set **Start Command** to **`node dist/temporal/worker.js`** on the **worker** service (or **Config as code** → [`infra/railway/worker.json`](./worker.json)) so deploys do not run the API entrypoint.

Railway still maps each Compose `service` to a **separate Railway service** in one project (private networking; service names as hostnames where applicable). See [Deploy a Docker Compose app](https://docs.railway.com/guides/docker-compose).

**api** carries the full app env; **worker** carries only what the current worker process needs (see compose comments). The Railway compose template **bind-mounts** **`./temporal/dynamicconfig`** into **`temporal`** (compose file lives in **`infra/`**, so that resolves to **`infra/temporal/dynamicconfig`**). That matches the usual auto-setup pattern for editable SQL visibility config. If Railway’s importer rejects the bind mount, remove only the **`volumes`** block under **`temporal`** and rely on the image’s bundled **`development-sql.yaml`**. Fully local dev with **`restart`** / **`env_file`** remains **`infra/temporal/docker-compose.yaml`** or **`infra/docker-compose.full-stack.example.yaml`**.

---

## Syncing inline `environment` from a dotenv file

From the **repository root**, **`pnpm railway:sync-env`** runs [`scripts/sync-railway-compose-env.mjs`](../../scripts/sync-railway-compose-env.mjs). By default it reads **`backend/.env.production.local`** (gitignored; same canonical file as local production backend config) and updates **`infra/docker-compose.railway.yaml`**. Use **`--from`** (or **`RAILWAY_COMPOSE_SYNC_FROM`**) to point at another file, e.g. **`infra/api.full-stack.env`** for Docker Compose–specific copies.

| Behavior | Details |
|----------|---------|
| **`api`** | Replaces the entire **`environment`** list with every `KEY=value` from the source file (order preserved). |
| **`worker`** (default) | **`--worker-mode slim`**: keeps the **existing keys and order** already in your compose file; fills values from the source when a key exists there, otherwise leaves the previous value. With the template’s **minimal** worker block, only those few keys are touched—handy so the worker does not inherit the full API env. |
| **`worker`** (optional **`--worker-mode full`**) | Same as **`api`**: the worker block becomes a full copy of the source file’s variables (use only if your activities need parity with the API env). |
| **`TEMPORAL_ADDRESS`** | After merge, the script sets **`TEMPORAL_ADDRESS`** to **`temporal:7233`** for each updated service (Compose private DNS). Use **`--no-temporal-override`** to keep whatever the source file contains, or **`--temporal-address <host:port>`** for Temporal Cloud / other endpoints. |

**Overrides:** **`--from <path>`**, **`--to <path>`**, **`--services api`** (or **`api,worker`**), plus environment variables **`RAILWAY_COMPOSE_SYNC_FROM`** and **`RAILWAY_COMPOSE_SYNC_TO`** (same roles as **`--from`** / **`--to`**). Run **`node scripts/sync-railway-compose-env.mjs --help`** for the full flag list.

**Workflow:** copy the **`.example`** compose once, then either edit **`docker-compose.railway.yaml`** by hand or maintain **`backend/.env.production.local`** and re-run **`pnpm railway:sync-env`** before dragging the YAML onto the canvas (ensure Compose-oriented values there, e.g. **`REDIS_HOST=redis`**, **`TEMPORAL_ADDRESS=temporal:7233`**, when using the bundled stack). Do not commit real secrets; those files are gitignored when used with production values.

### Pre-deploy validation (before clicking Deploy on Railway)

Railway’s UI does **not** offer a full dry-run of the whole stack. You can still catch most compose and image issues **locally** from the **monorepo root**:

1. **Syntax and merge (fast)** — resolves the file the same way Compose does; fails on invalid YAML, unknown keys, bad references:

   ```bash
   docker compose -f infra/docker-compose.railway.yaml config >/dev/null
   ```

   Use **`infra/docker-compose.railway.example.yaml`** instead if you only have the template in git.

2. **Pull public images (medium)** — ensures `redis`, `elasticsearch`, `postgres`, `temporalio/*` tags resolve:

   ```bash
   docker compose -f infra/docker-compose.railway.yaml pull redis temporal-elasticsearch temporal-postgresql temporal temporal-ui temporal-admin-tools
   ```

3. **Build app images (slow)** — same **`build.context`** / **`dockerfile`** Railway uses for **`api`** and **`worker`**:

   ```bash
   docker compose -f infra/docker-compose.railway.yaml build api worker
   ```

4. **Run the full stack locally (strongest)** — surfaces **`initdb`**, Elasticsearch, and Temporal startup before you rely on the dashboard:

   ```bash
   docker compose -f infra/docker-compose.railway.yaml up -d
   docker compose -f infra/docker-compose.railway.yaml ps
   docker compose -f infra/docker-compose.railway.yaml logs -f --tail=50 temporal
   ```

   Tear down when done: **`docker compose -f infra/docker-compose.railway.yaml down`**.

**If Deploy “hangs” on Railway:** first-time builds for **eight** image services (plus **api** / **worker** Git builds) can take **many minutes**. Open **each service → Deployments → Logs**; fix the first failing service (often Postgres, Elasticsearch, **`temporal`**, then **`api`**).

### Canvas import or “Deploy” feels stuck

- **Confirm staged changes:** after drag-and-drop or paste, the canvas may show **staged** services—use the UI to **apply** or **deploy** the batch so Railway actually creates/builds them.
- **Try pasting YAML** into the Compose import field instead of drag-and-drop (same content as **`infra/docker-compose.railway.yaml`**).
- **Temporal bind mount:** the template mounts **`./temporal/dynamicconfig`** (from **`infra/`**, i.e. **`infra/temporal/dynamicconfig`**) into **`temporal`**. If the canvas importer fails or hangs, remove that **`volumes`** entry and redeploy; keep the directory in git for local **`docker compose`**.
- **Git connection:** link the monorepo to **`api`** and **`worker`** (and any other Git-based services Railway created) so builds run from your branch; image-only services pull from registries.
- **`There was an error deploying from source`** (often right after **“Deploying service from `redis:7.2-alpine`”** or another image tag): Railway is using **GitHub / repo** as that service’s **Source**, but the Compose line is only **`image:`** — there is nothing to “build from source”. Fix per service:
  1. Open the service (**`redis`**, **`temporal`**, etc.) → **Settings**.
  2. Under **Source** / **Connect** (wording varies): **disconnect** the GitHub repository **or** switch **Deploy** to **Docker Image** / **Registry**.
  3. Set the image to exactly what Compose uses (e.g. **`redis:7.2-alpine`** on Docker Hub — no auth needed for public pulls).
  4. **Redeploy**. Repeat for every service that is **`image:`** only in YAML (**`api`** and **`worker`** should stay **GitHub** + **`backend/Dockerfile`**).
  **Alternative for Redis:** add **[Railway → Database → Redis](https://docs.railway.com/databases/redis)** (managed), point **`REDIS_HOST`** / URL at the generated variables, and remove or ignore the Compose **`redis`** service in the dashboard so you never deploy a duplicate Redis from image.
- **`RAILWAY_DOCKERFILE_PATH`:** if **`api`** / **`worker`** do not build, set **`backend/Dockerfile`** on the service (root directory = repo root). Root **`railway.json`** should already match that path for **`railway up`**.

---

## Step-by-step for this repo (same flow as Railway’s guide)

The tables below mirror [How Compose maps to Railway](https://docs.railway.com/guides/docker-compose#how-compose-maps-to-railway): `services:` → Railway services, `build` → Git + Dockerfile, `image` → Docker Image service, `env_file` / `environment` → [Variables](https://docs.railway.com/guides/variables), `volumes` → [Volumes](https://docs.railway.com/guides/volumes), `depends_on` → **no equivalent** (API and worker must retry Redis/Temporal until ready).

On **local Docker**, **`infra/docker-compose.full-stack.example.yaml`** is one file (API + worker + Redis + Temporal stack); **`infra/temporal/docker-compose.yaml`** remains Temporal-only for `docker-compose.dev.yaml` and standalone runs. **`docker-compose.railway.example.yaml`** / **`docker-compose.railway.yaml`** match that shape for canvas import. On Railway you can also use **Temporal Cloud** and drop self-hosted Temporal services.

### 1. Create a Railway project

1. Dashboard → **New Project** → **Empty project**.
2. This single project will hold every service that corresponds to a Compose `service` (API, worker, Redis, Temporal pieces, etc.).

### 2. Add services (work through your Compose file)

Treat each block under `services:` in your **`docker-compose.railway.yaml`** (copied from the **`.example`**) as its own Railway service. Use **`docker-compose.full-stack.example.yaml`** or **`temporal/docker-compose.yaml`** when you need the local-Docker or Temporal-only reference.

| Compose / included service | What it is in Compose | On Railway |
|----------------------------|------------------------|------------|
| `redis` | `image: redis:7.2-alpine` + volume | **Database → Redis** (recommended) or **Docker Image** `redis:7.2-alpine` + [Volume](https://docs.railway.com/guides/volumes) on `/data` if you mirror Compose |
| `api` | `build: ..` + `dockerfile: backend/Dockerfile` | **GitHub Repo** → monorepo **root**; **`backend/Dockerfile`** + root **`railway.json`** (CLI). Set **`RAILWAY_DOCKERFILE_PATH`** in UI only if needed. |
| `worker` | Same build as API; Compose **`command`**: `node dist/temporal/worker.js` | **Second** GitHub Repo service (same repo/branch). Optional [`infra/railway/worker.json`](./worker.json) only if the dashboard does not pick up Compose **`command`**. |
| `temporal-elasticsearch` | `image: elasticsearch:7.17.27` + volume | **Docker Image** + Volume on `/usr/share/elasticsearch/data` (match [temporal/docker-compose.yaml](../temporal/docker-compose.yaml)) |
| `temporal-postgresql` | `image: postgres:16` + volume | **Database → Postgres** or **Docker Image** + Volume on **`/var/lib/postgresql`** with **`PGDATA=/var/lib/postgresql/pgdata`** (avoids `lost+found` on the volume root) |
| `temporal` | `image: temporalio/auto-setup:1.28.1` + bind `./temporal/dynamicconfig` | **Docker Image**; env mirrors Compose (`DB`, `POSTGRES_SEEDS`, `ES_SEEDS`, etc.). **Source:** Git repo must include **`infra/temporal/dynamicconfig`** so the mount resolves at deploy time; if the importer rejects the mount, drop the **`volumes`** block under **`temporal`**. |
| `temporal-ui` | `image: temporalio/ui:2.34.0` | Optional **Docker Image**; prefer **no public** exposure in production, or lock down access |
| `temporal-admin-tools` | `image: temporalio/admin-tools:1.28.1-…` + long-running `command` | **Docker Image** (optional); keeps a shell for **`kubectl exec` / one-off `tctl`**-style use. Omit the service in the dashboard if you do not need it. |

**Simpler production path:** keep **API + worker + Redis** on Railway, set **`TEMPORAL_ADDRESS`** to [Temporal Cloud](https://temporal.io/cloud) (or another reachable gRPC endpoint). Then you do **not** deploy Elasticsearch, Temporal Postgres, `auto-setup`, or UI on Railway.

### 3. Configure environment variables

1. Use [`infra/api.full-stack.env.example`](../api.full-stack.env.example) as a checklist for **api** (same keys as `backend` / `GlobalConfig.ts`). To copy a filled **`backend/.env.production.local`** into the **`api`** (and **`worker`**, per [Syncing inline `environment` from a dotenv file](#syncing-inline-environment-from-a-dotenv-file) above) blocks of **`docker-compose.railway.yaml`**, run **`pnpm railway:sync-env`** from the repo root.
2. If you did **not** put all secrets in **`docker-compose.railway.yaml`**, set **api** Variables to match your backend production env (same keys as **`backend/.env.production.local`** / `GlobalConfig.ts`). On **worker**, set at least **`NODE_ENV`**, **`TEMPORAL_ADDRESS`**, and **`TEMPORAL_NAMESPACE`** (same values as in your compose file). Add more keys only when worker activities need them (DB, cache, etc.); sharing the **api** Variable group is optional and usually unnecessary for the minimal worker.
3. For values that point at other services (Redis, Temporal, Supabase), prefer Railway **[reference variables](https://docs.railway.com/guides/variables#reference-variables)** so hostnames and passwords stay correct when Railway rotates them.
4. **Hostname mapping:** Compose uses `REDIS_HOST=redis` and `TEMPORAL_ADDRESS=temporal:7233`. On Railway, either **name** your Redis and Temporal frontend services so their **private** DNS matches those names, **or** change `REDIS_HOST` / `TEMPORAL_ADDRESS` to the hostnames Railway assigns (often visible on each service’s **Networking** / private URL docs).

### 4. Set up networking

- **Private:** All services in one project reach each other on the [private network](https://docs.railway.com/guides/private-networking). No manual `networks:` block — equivalent to Compose’s shared network.
- **Public (API only, typically):** For `api`, under **Networking** → **Generate Domain** (replaces Compose `ports:` for external access). Listen on **`PORT`** (e.g. `3000`) as in your env; Railway routes to the port your process uses.
- **Temporal gRPC / UI:** Do **not** expose self-hosted Temporal to the public internet without hardening; align with [Temporal security guidance](https://docs.temporal.io/self-hosted-guide/security) and your [temporal README](../temporal/README.md).

### 5. Attach volumes (if you use Docker images for state)

For each Compose `volumes:` entry that must persist:

| Compose volume (Temporal file) | Mount path in container |
|--------------------------------|---------------------------|
| `temporal-elasticsearch-data` | `/usr/share/elasticsearch/data` |
| `temporal-postgresql-data` | `/var/lib/postgresql` (cluster files under `pgdata/`) |
| `openquok-full-stack-redis-data` (full-stack file) | `/data` |

Managed **Railway Redis/Postgres** handle storage for you — no volume on the app service.

The template **does** bind-mount **`./temporal/dynamicconfig`** into **`temporal`** (same files as local **`infra/temporal/docker-compose.yaml`**). If Railway’s importer rejects that mount, remove the **`volumes`** block under **`temporal`** only; **`DYNAMIC_CONFIG_FILE_PATH`** still points at the image’s bundled **`development-sql.yaml`**. A custom image that **`COPY`**s **`infra/temporal/dynamicconfig`** is another option if you must ship overrides without a bind mount.

### 6. Verify the deployment

1. **Deploy logs** for `api`, `worker`, Redis, and (if used) Temporal — no crash loops; worker should connect to Temporal and subscribe to your task queue.
2. Hit the API’s **public** URL (health or an authenticated route).
3. Confirm **Temporal** workflows if you use them (logs + optional UI on private access only).

---

## Config-as-code files in this repo

| OpenQuok Compose service | Railway | Config file (path from repo root) |
|--------------------------|---------|-----------------------------------|
| `api` | GitHub repo → build `backend/Dockerfile` from monorepo root | **Compose `build:`** + root [`railway.json`](../../railway.json) (CLI / defaults). |
| `worker` | Same repo + same image as API; start command from Compose **`command`** | Optional [`/infra/railway/worker.json`](./worker.json) if the dashboard needs explicit **Config as code**. |
| `redis` | Add **Redis** (managed) or **Docker Image** `redis:7.2-alpine` | Variables / image in UI |
| `temporal` stack | Postgres, Elasticsearch, `temporalio/auto-setup`, UI (inlined in the Railway compose template) | Add each as **Docker Image** or managed DB per the [Docker Compose on Railway](https://docs.railway.com/guides/docker-compose) guide; no single JSON covers the cluster |

## Dashboard steps (summary)

1. **New project** (empty), connect the **same GitHub repo** to multiple services as needed.
2. **API service** — root directory = repo root; Dockerfile **`backend/Dockerfile`** (from Compose). Set variables to mirror **`backend/.env.production.local`** (or the output of **`pnpm railway:sync-env`**); use Railway variable references for Redis/Temporal URLs Railway provides.
3. **Worker service** — same repo and branch; start command should match Compose (**`node dist/temporal/worker.js`**). If the UI does not show it, set **Config as code** to **`/infra/railway/worker.json`** or enter the start command manually. Env: **`NODE_ENV`**, **`TEMPORAL_ADDRESS`**, **`TEMPORAL_NAMESPACE`** (see `worker.environment` in the Railway compose template).
4. **Redis** — managed Redis or image; point `REDIS_HOST` / `REDIS_PORT` / password at Railway’s values (not necessarily hostname `redis`).
5. **Temporal** — mirror `infra/temporal/docker-compose.yaml` with image-based services and volumes as in Railway’s guide, or use Temporal Cloud and drop self-hosted Temporal services.

`depends_on` has no Railway equivalent; apps should retry connections on startup.

## CLI `railway up`

`railway up .` from the monorepo root deploys **one** linked service per run. Root [`railway.json`](../../railway.json) tells Railway how to build (**`backend/Dockerfile`**) and defaults the API **`startCommand`**. The **worker** service must still use **`node dist/temporal/worker.js`** (dashboard **Start Command** or [`infra/railway/worker.json`](./worker.json)).

**`prefix not found` (after “Indexed” / “Compressed”):** the CLI archives the path you pass (e.g. **`.`**) but strips paths using the directory saved by **`railway link`**. If you linked from **`backend/`** (or any subfolder) and run **`railway up .`** from the **repo root**, root files are not under that prefix and the tarball step fails. **Fix:** from the **monorepo root**, run **`railway unlink`**, then **`railway link`** again so the linked path is the **same** root you deploy from; always run **`pnpm railway:deploy:backend-compose`** from that root.

**Do not** run `railway up` with **`temporal-postgresql`**, **`redis`**, **`temporal-elasticsearch`**, **`temporal`**, **`temporal-ui`**, or **`temporal-admin-tools`** selected. Those services use public **`image:`** lines, not a repo build—pick **`api`** or **`worker`** for CLI uploads. Use **Git push** / dashboard redeploy for image-only services after canvas import.

Before **`pnpm railway:deploy:backend-compose`** (or **`railway up .`**), point the CLI at **`api`** or **`worker`**:

```bash
railway service
# choose api or worker — not redis / postgres / temporal / es
pnpm railway:deploy:backend-compose
```

If it persists after re-linking from root: **`railway upgrade`**, **`railway up . --verbose`**; confirm **`railway.json`** is at the repo root; set **`RAILWAY_DOCKERFILE_PATH=backend/Dockerfile`** on the service if the dashboard build differs. Rarely, a symlinked repo path can disagree with the stored link path—use a canonical **`cd`** to the real root before **`railway link`**.

**Recommended:** after Compose import, trigger deploys with **Git push** to the connected branch instead of relying on **`railway up`** for the whole stack.

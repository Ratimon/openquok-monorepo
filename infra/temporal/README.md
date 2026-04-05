# Temporal (Docker Compose)

Runs a self-hosted [Temporal](https://docs.temporal.io/) service for workflow orchestration: PostgreSQL (history), Elasticsearch (visibility), `temporalio/auto-setup`, and the Temporal Web UI. This matches the stack shape recommended for local development and small private deployments; treat it like a database—do not expose the gRPC port to the public internet without TLS and network controls ([self-hosted deployment](https://docs.temporal.io/self-hosted-guide/deployment)).

## Prerequisites

- Docker and Docker Compose v2

## Start

From the monorepo root:

```bash
docker compose -f infra/temporal/docker-compose.yaml up -d
```

For **Temporal and Redis** together (typical dev), prefer `pnpm infra:dev:up` (see [infra/README.md](../README.md)).

Optional: copy `infra/temporal/.env.example` to `infra/temporal/.env` to change host ports, bind address, or UI CORS.

## Troubleshooting

**Elasticsearch `AccessDeniedException` on `/usr/share/elasticsearch/data/nodes`:** The official **`elasticsearch:7.17`** image only **`chown`s** mounted data when **`TAKE_FILE_OWNERSHIP`** is set (default **`CMD`** is **`eswrapper`**, so the entrypoint does not take the shortcut path that would otherwise adjust ownership). This compose sets **`TAKE_FILE_OWNERSHIP=true`** and **`user: "0:0"`** so that step runs. If the error persists, remove the stack’s volumes and recreate (this deletes Elasticsearch data for that stack):

```bash
docker compose -f infra/temporal/docker-compose.yaml down -v
docker compose -f infra/temporal/docker-compose.yaml up -d
```

Use the same **`-f`** path you normally use (e.g. **`infra/docker-compose.dev.yaml`** if you start via `pnpm infra:dev:up`). **`down -v`** removes named volumes declared in that compose project.

On **Linux**, if Elasticsearch exits with **memory map** errors instead, increase `vm.max_map_count` per [Elasticsearch docs](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/docker.html#_set_vm_max_map_count_to_at_least_262144).

**PostgreSQL `initdb` / `lost+found`:** If the data volume is a block device root (e.g. cloud **`lost+found`** next to data), mount the volume at **`/var/lib/postgresql`** and set **`PGDATA=/var/lib/postgresql/pgdata`** so the cluster initializes in an empty subdirectory. This compose does that. After changing from an older layout that mounted at **`/var/lib/postgresql/data`**, recreate the volume (`docker compose ... down -v` and `up`) or migrate data manually.

## Connect the backend

The API reads `TEMPORAL_ADDRESS` from `backend` config (see `backend/config/GlobalConfig.ts`).

| Where the API runs | `TEMPORAL_ADDRESS` |
| -------------------- | -------------------- |
| On your machine (pnpm dev) | `localhost:7233` (default in `backend/.env.development.example`) |
| In Docker on the same Compose network | `temporal:7233` |

Also set `TEMPORAL_NAMESPACE` as needed (default in app config: `default`). The API starts refresh workflows on task queue `main` in code.

## URLs

Published ports bind to **`127.0.0.1` by default** (`TEMPORAL_BIND_HOST`), so the gRPC frontend and Web UI are not reachable from other hosts on your LAN unless you set `TEMPORAL_BIND_HOST=0.0.0.0`.

- gRPC frontend: `localhost:${TEMPORAL_GRPC_PORT:-7233}`
- Web UI: `http://localhost:${TEMPORAL_UI_PORT:-8080}`

## Admin CLI (optional)

Run an interactive shell with `tctl` / Temporal CLI against the local server:

```bash
docker compose -f infra/temporal/docker-compose.yaml --profile tools run --rm temporal-admin-tools
```

## Production notes

This compose file is oriented toward development and private networks. For production, follow Temporal’s guidance on security, TLS, sizing, and not exposing the service to the open internet ([deployment overview](https://docs.temporal.io/self-hosted-guide/deployment)).

## Security (self-hosted)

How this repo’s Compose relates to Temporal’s production expectations:

| Area | What this stack does | Risk if used as-is on the public internet or untrusted networks |
|------|----------------------|------------------------------------------------------------------|
| **Network exposure** | Publishes gRPC **7233** and Web UI **8080** on the host (defaults to **`127.0.0.1` only** via `TEMPORAL_BIND_HOST`); Elasticsearch/Postgres use `expose` only on the internal `temporal` network. | [Temporal expects](https://docs.temporal.io/self-hosted-guide/deployment) the service to be treated like a database: **do not** expose the gRPC frontend (or admin surfaces) to the open internet without controls. Use a **private network**, VPN, firewall, or **Temporal Cloud**. |
| **Encryption in transit** | No **mTLS** or TLS in this example; clients use plaintext gRPC to `temporal:7233` / `localhost:7233`. | Production self-hosting should use **mTLS** (or equivalent) for traffic to the Temporal Frontend and between nodes—see [Security — mTLS](https://docs.temporal.io/self-hosted-guide/security#encryption-in-transit-with-mtls). |
| **Server authorization** | `temporalio/auto-setup` uses defaults; without a custom **Authorizer** / **ClaimMapper**, Temporal’s docs warn the default can allow **unrestricted API access** to anyone who can reach the Frontend. | Configure **authorization** and identity as in [Security — Authentication & Authorization](https://docs.temporal.io/self-hosted-guide/security#authentication). |
| **Temporal Web UI** | UI is reachable on the published port; **no** `TEMPORAL_AUTH_*` / SSO in this file. | Enable UI auth (e.g. OAuth env vars) per [Security — Temporal UI](https://docs.temporal.io/self-hosted-guide/security#temporal-ui), or restrict UI to a trusted network only. |
| **Data stores** | Example Postgres password and Elasticsearch `xpack.security.enabled=false` match **dev-style** images. | Rotate credentials, restrict network access to DB/ES, and harden stores for production—see [Production checklist](https://docs.temporal.io/self-hosted-guide/production-checklist) (security, availability, upgrades). |
| **Operational depth** | Single-node dev-oriented dynamic config. | Plan for monitoring, upgrades, load, and capacity per the [checklist](https://docs.temporal.io/self-hosted-guide/production-checklist). |

**Summary:** this Compose is **appropriate for local development and private networks**. For internet-facing or multi-tenant production, assume you must add **network isolation**, **TLS/mTLS**, **authorization**, **UI authentication**, **strong secrets**, and operational hardening—or use **Temporal Cloud** and point the app at that endpoint instead.

## Dynamic config

`dynamicconfig/development-sql.yaml` is mounted read-only into the server. The `system.forceSearchAttributesCacheRefreshOnRead` flag is appropriate for development only; adjust for production workloads.

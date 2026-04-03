# Temporal (Docker Compose)

Runs a self-hosted [Temporal](https://docs.temporal.io/) service for workflow orchestration: PostgreSQL (history), Elasticsearch (visibility), `temporalio/auto-setup`, and the Temporal Web UI. This matches the stack shape recommended for local development and small private deployments; treat it like a database—do not expose the gRPC port to the public internet without TLS and network controls ([self-hosted deployment](https://docs.temporal.io/self-hosted-guide/deployment)).

## Prerequisites

- Docker and Docker Compose v2

## Start

From the monorepo root:

```bash
docker compose -f infra/temporal/docker-compose.yaml up -d
```

Optional: copy `infra/temporal/.env.example` to `infra/temporal/.env` to change host ports or UI CORS.

## Connect the backend

The API reads `TEMPORAL_ADDRESS` from `backend` config (see `backend/config/GlobalConfig.ts`).

| Where the API runs | `TEMPORAL_ADDRESS` |
| -------------------- | -------------------- |
| On your machine (pnpm dev) | `localhost:7233` (default in `backend/.env.development.example`) |
| In Docker on the same Compose network | `temporal:7233` |

Also set `TEMPORAL_NAMESPACE` and `TEMPORAL_TASK_QUEUE` as needed; defaults are `default` and `main`.

## URLs

- gRPC frontend: `localhost:${TEMPORAL_GRPC_PORT:-7233}`
- Web UI: `http://localhost:${TEMPORAL_UI_PORT:-8080}`

## Admin CLI (optional)

Run an interactive shell with `tctl` / Temporal CLI against the local server:

```bash
docker compose -f infra/temporal/docker-compose.yaml --profile tools run --rm temporal-admin-tools
```

## Production notes

This compose file is oriented toward development and private networks. For production, follow Temporal’s guidance on security, TLS, sizing, and not exposing the service to the open internet ([deployment overview](https://docs.temporal.io/self-hosted-guide/deployment)).

## Dynamic config

`dynamicconfig/development-sql.yaml` is mounted read-only into the server. The `system.forceSearchAttributesCacheRefreshOnRead` flag is appropriate for development only; adjust for production workloads.

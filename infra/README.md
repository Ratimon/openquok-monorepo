# Infra

The default deployment path for this project is **Vercel** for the API and web app (see `/docs/Installation/vercel` and `/docs/Installation/production-deployment`).

**Optional Redis (cache):** run Redis locally or use a managed offering, then set `CACHE_PROVIDER=redis` and `REDIS_*` in `backend/.env.*` to match your host and credentials. There is no Docker Compose bundle in this repository anymore.

Workflow-style jobs run **in-process** in the API via the `flowcraft` dependency (`backend/flowcraft/`). For heavier background work later, you can add a queue or adapter supported by that library without changing the core flow definitions.

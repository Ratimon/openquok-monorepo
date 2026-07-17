# syntax=docker/dockerfile:1
# Build from monorepo root: docker build -f orchestrator/Dockerfile .
# Override CMD in Compose for each BullMQ worker entrypoint.

ARG NODE_VERSION=24-bookworm-slim

FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY common/package.json common/
COPY backend/package.json backend/
COPY orchestrator/package.json orchestrator/
RUN pnpm install --frozen-lockfile --ignore-scripts \
	--filter openquok-orchestrator \
	--filter backend \
	--filter openquok-common \
	&& pnpm rebuild esbuild sharp

FROM deps AS build
COPY common common
COPY backend backend
COPY orchestrator orchestrator
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN pnpm --filter openquok-common build \
	&& pnpm --filter backend build \
	&& pnpm --filter openquok-orchestrator build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY common/package.json common/
COPY backend/package.json backend/
COPY orchestrator/package.json orchestrator/
COPY --from=build /app/common/dist common/dist
COPY --from=build /app/backend/dist backend/dist
COPY --from=build /app/orchestrator/dist orchestrator/dist
RUN pnpm install --frozen-lockfile --prod --ignore-scripts \
	--filter openquok-orchestrator \
	--filter backend \
	--filter openquok-common \
	&& pnpm rebuild sharp \
	&& chown -R node:node /app
USER node
WORKDIR /app/orchestrator
EXPOSE 3091
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:3091/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/worker/runIntegrationRefreshBullMqWorker.js"]

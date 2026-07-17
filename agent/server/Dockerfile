# syntax=docker/dockerfile:1
# Build from monorepo root: docker build -f agent/server/Dockerfile .
# Optional Compose profile `cli` — device-flow OAuth helper for the CLI.

ARG NODE_VERSION=24-bookworm-slim

FROM node:${NODE_VERSION} AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY agent/server/package.json agent/server/
RUN pnpm install --frozen-lockfile --ignore-scripts --filter @openquok/cli-auth-server \
	&& pnpm rebuild esbuild

FROM deps AS build
COPY agent/server agent/server
ENV NODE_ENV=production
RUN pnpm --filter @openquok/cli-auth-server build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY agent/server/package.json agent/server/
COPY --from=build /app/agent/server/dist agent/server/dist
RUN pnpm install --frozen-lockfile --prod --ignore-scripts --filter @openquok/cli-auth-server \
	&& chown -R node:node /app
USER node
WORKDIR /app/agent/server
EXPOSE 3111
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:3111/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]

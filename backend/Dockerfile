# Production API image. Build from the monorepo root:
#   docker build -f backend/Dockerfile -t openquok-backend:local .
#
# Runtime expects env (Supabase, secrets, TEMPORAL_ADDRESS, Redis, etc.) supplied by the host or orchestrator.

FROM node:24-bookworm-slim AS production

WORKDIR /repo

ENV NODE_ENV=production

RUN corepack enable pnpm && corepack prepare pnpm@10.30.3 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

# Prefer aligning pnpm-lock.yaml with the workspace (`pnpm install` at the repo root), then use --frozen-lockfile in CI.
RUN pnpm install --filter ./backend...

COPY backend ./backend

RUN pnpm --filter ./backend build

ENV CI=true
RUN pnpm prune --prod

WORKDIR /repo/backend

EXPOSE 3000

CMD ["node", "dist/app.js"]

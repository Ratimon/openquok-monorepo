#!/usr/bin/env bash
# Thin wrapper: deploy CLI auth server with local agent/server/vercel.json.
#
# Prefer from monorepo root (uses linked project + monorepo upload):
#   pnpm vercel:deploy:agent-server:prod
#
# Prerequisites:
# - Link once: cd agent/server && npx vercel link
# - Vercel project Root Directory = agent/server
# - Env: see agent/server/.env.production.example and pnpm vercel:env:sync:agent-server:prod
#
set -euo pipefail
cd "$(dirname "$0")/.."
exec vercel "$@"

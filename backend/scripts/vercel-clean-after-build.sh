#!/bin/sh
# After tsup: ensure outputDirectory exists for Vercel (see backend/vercel.json).
# Do not add public/index.html — it caused static HTML for every GET and POST 405 before Express.
#
# Do not delete TypeScript sources or tsup.config.ts here — Vercel build cache can restore a
# post-clean tree and the next build fails with tsup "No input files".
# Do not remove api/index.js — vercel.json rewrites to /api and Vercel expects that file.
set -e
cd "$(dirname "$0")/.."
mkdir -p public
echo 'empty' > public/.output-dir-placeholder

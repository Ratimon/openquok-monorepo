#!/bin/sh
# Remove source files after tsup bundle so Vercel does not compile or trace them.
# Keeps api/, node_modules/, static/, package.json, vercel.json, and lockfile.
set -e
cd "$(dirname "$0")/.."
rm -rf config connections controllers data emails errors handler middlewares repositories routes services types utils tests
rm -f app.ts tsup.config.ts tsconfig.json tsconfig.build.json
# Portable on Linux (GNU/BusyBox): avoid find -delete (not always available)
find . -maxdepth 1 -name "*.ts" -type f -exec rm -f {} \;
echo 'export default {};' > index.js
mkdir -p public
echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>API</title></head><body><p>API only.</p></body></html>' > public/index.html

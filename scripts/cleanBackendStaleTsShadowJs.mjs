#!/usr/bin/env node
/**
 * Removes stale `*.js` files under `backend/` that sit next to a same-name TypeScript source
 * (`foo.js` + `foo.ts` or `foo.tsx`). Those siblings can shadow `.ts` when Node/tsx resolves
 * imports ambiguously, so you keep seeing old behavior after editing sources.
 *
 * Does **not** delete:
 * - Anything under `backend/dist/` (compiled output)
 * - `node_modules`, `coverage`, `.git`
 * - Standalone `.js` with no matching `.ts`/`.tsx` (e.g. `jest.config.js`, `eslint.config.js`, `tests/__mocks__/**`)
 *
 * Usage:
 *   pnpm backend:clean:stale-ts-shadow-js
 *   pnpm backend:clean:integrations-provider-js   # alias, same script
 *   pnpm backend:rebuild:integrations            # clean + `pnpm backend:build`
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_ROOT = path.join(__dirname, "../backend");
const LOG_PREFIX = "[clean-backend-stale-ts-shadow-js]";

/** Directory names to skip entirely (do not descend). */
const SKIP_DIR_NAMES = new Set(["dist", "node_modules", "coverage", ".git"]);

/**
 * @param {string} dir
 * @param {string[]} removed
 */
function walk(dir, removed) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return;
    }

    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            if (SKIP_DIR_NAMES.has(ent.name)) continue;
            walk(full, removed);
            continue;
        }
        if (!ent.isFile() || !ent.name.endsWith(".js")) continue;

        const base = ent.name.slice(0, -".js".length);
        const ts = path.join(dir, `${base}.ts`);
        const tsx = path.join(dir, `${base}.tsx`);
        if (!fs.existsSync(ts) && !fs.existsSync(tsx)) continue;

        fs.unlinkSync(full);
        removed.push(path.relative(path.join(__dirname, ".."), full));
    }
}

function main() {
    if (!fs.existsSync(BACKEND_ROOT)) {
        console.error(`${LOG_PREFIX} Missing directory: ${BACKEND_ROOT}`);
        process.exit(1);
    }

    /** @type {string[]} */
    const removed = [];
    walk(BACKEND_ROOT, removed);

    if (removed.length === 0) {
        console.log(`${LOG_PREFIX} No stale shadow .js files found (same name as .ts/.tsx).`);
        return;
    }

    for (const rel of removed.sort()) {
        console.log(`${LOG_PREFIX} Removed ${rel}`);
    }
    console.log(`${LOG_PREFIX} Done. Removed ${removed.length} file(s).`);
}

main();

"use strict";

const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const BACKEND_PACKAGE_NAME = "backend";

/**
 * Finds the `backend` package directory by walking upward from this file.
 * CommonJS + `__dirname` works in Jest (CJS) and in Node when this file is imported from ESM.
 */
function resolveBackendPackageRoot() {
    let dir = __dirname;
    for (let i = 0; i < 25; i++) {
        const pkgPath = path.join(dir, "package.json");
        if (fs.existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
                if (pkg.name === BACKEND_PACKAGE_NAME) {
                    return dir;
                }
            } catch {
                /* invalid or unreadable package.json */
            }
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            break;
        }
        dir = parent;
    }
    return process.cwd();
}

function loadBackendDotenv() {
    const root = resolveBackendPackageRoot();
    const env = process.env.NODE_ENV ?? "development";
    // In local/dev, prefer env files over shell-exported vars so developers don't accidentally
    // run workers against a production-managed Redis (or other shared services).
    const forceOverride = String(process.env.DOTENV_OVERRIDE ?? "").toLowerCase() === "true";
    const override = forceOverride || env !== "production";
    // `backend/jest.env-setup.cjs` (and optional per-package Jest `setupFiles`) already applied
    // `.env.${NODE_ENV}.local` with the intended override rules. Re-applying with `override: true`
    // here would clobber `setupFiles` values (e.g. orchestrator `ORCHESTRATOR_*_TRANSPORT=in_process`)
    // when `GlobalConfig` loads. Only backfill keys not already in `process.env`.
    const underJest = String(process.env.JEST_WORKER_ID ?? "").length > 0;
    const overrideLocal = underJest ? false : override;
    dotenv.config({ path: path.join(root, `.env.${env}.local`), override: overrideLocal });
    dotenv.config({ path: path.join(root, ".env"), override: false });
}

module.exports = { loadBackendDotenv };

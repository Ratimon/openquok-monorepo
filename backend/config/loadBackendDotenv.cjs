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
    dotenv.config({ path: path.join(root, `.env.${env}.local`), override });
    dotenv.config({ path: path.join(root, ".env"), override: false });
}

module.exports = { loadBackendDotenv };

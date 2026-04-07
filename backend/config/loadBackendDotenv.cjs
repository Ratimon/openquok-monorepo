"use strict";

const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const BACKEND_PACKAGE_NAME = "backend";

/**
 * Finds the `backend` package directory by walking upward from this file.
 * CommonJS + __dirname keeps Jest/ts-jest happy (no import.meta in TypeScript).
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
    dotenv.config({ path: path.join(root, `.env.${env}.local`) });
    dotenv.config({ path: path.join(root, ".env") });
}

module.exports = { loadBackendDotenv };

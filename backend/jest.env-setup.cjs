// Load env before tests (CJS for Jest). Must match backend/config/GlobalConfig.ts precedence.
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Always resolve env files relative to the backend package (this file lives in backend/), not
// process.cwd() — Jest may run with cwd at repo root or another package.
const root = path.resolve(__dirname);

if (process.env.NODE_ENV === undefined || process.env.NODE_ENV === "") {
    process.env.NODE_ENV = "test";
}
const env = process.env.NODE_ENV;

// Same order as GlobalConfig: `.env.${NODE_ENV}.local` first, then `.env` (fills missing keys only).
dotenv.config({ path: path.join(root, `.env.${env}.local`) });
dotenv.config({ path: path.join(root, ".env") });

// Optional overrides (e.g. CI): only if present so we do not wipe values with an empty file.
const testLocalPath = path.join(root, ".env.test.local");
if (fs.existsSync(testLocalPath)) {
    dotenv.config({ path: testLocalPath, override: true });
}

// Load env for e2e so Supabase and app config are available (CJS for Jest)
const path = require("path");
const dotenv = require("dotenv");

process.env.NODE_ENV = process.env.NODE_ENV || "test";
// Logger skips info/debug when NODE_ENV is test (below) or JEST_WORKER_ID is set; BACKEND_TEST_VERBOSE_LOGS=true restores them.

const root = path.resolve(process.cwd());
dotenv.config({ path: path.join(root, ".env.test.local") });
dotenv.config({ path: path.join(root, ".env") });

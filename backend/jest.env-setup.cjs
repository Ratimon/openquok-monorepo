// Load env for e2e so Supabase and app config are available (CJS for Jest)
const path = require("path");
const dotenv = require("dotenv");

process.env.NODE_ENV = process.env.NODE_ENV || "test";

const root = path.resolve(process.cwd());
dotenv.config({ path: path.join(root, ".env.test.local") });
dotenv.config({ path: path.join(root, ".env") });

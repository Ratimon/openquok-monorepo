#!/usr/bin/env node
/**
 * Writes agent/server/pnpm-lock.yaml for a standalone install (see agent/server/vercel.json).
 * Run after changing agent/server/package.json dependencies, then commit the lockfile.
 *
 * Usage: pnpm agent-server:sync-standalone-lockfile
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cwd = join(root, "agent", "server");

const r = spawnSync(
  "pnpm",
  ["install", "--ignore-workspace", "--no-frozen-lockfile"],
  { cwd, stdio: "inherit", env: process.env, shell: process.platform === "win32" }
);

process.exit(r.status === null ? 1 : r.status);

#!/usr/bin/env node
/**
 * Layer 3 — download Supabase Storage bucket objects to .backups/YYYYMMDD/storage/.
 *
 * Usage:
 *   node scripts/prod-backup/export-storage.mjs
 *   node scripts/prod-backup/export-storage.mjs --env-file backend/.env.production.local
 */

import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { createWriteStream } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { DEFAULT_ENV_FILE, STORAGE_BUCKETS } from "./constants.mjs";
import { ensureDir, fail, loadBackendProdEnv, log, parseArgs, repoRoot, resolveBackupDir } from "./lib.mjs";

const require = createRequire(resolve(repoRoot, "backend/package.json"));
const { createClient } = require("@supabase/supabase-js");

function printHelp() {
  log(`Usage: node scripts/prod-backup/export-storage.mjs [options]

Options:
  --env-file <path>     Backend prod env (default: ${DEFAULT_ENV_FILE})
  --suffix <text>       Backup dir suffix (e.g. -pre-cutover)
  --backup-dir <path>   Explicit output directory under repo root
  -h, --help            Show this help
`);
}

function parseCli(argv) {
  const base = parseArgs(argv);
  if (base.help) return { help: true };
  return { ...base, envFile: base.envFile ?? DEFAULT_ENV_FILE };
}

async function listAllFiles(supabase, bucket, path = "") {
  const { data, error } = await supabase.storage.from(bucket).list(path, { limit: 1000 });
  if (error) {
    throw new Error(`Error listing '${bucket}${path ? `/${path}` : ""}': ${error.message}`);
  }
  if (!data?.length) return [];

  let files = [];
  for (const item of data) {
    const itemPath = path ? `${path}/${item.name}` : item.name;
    if (!item.metadata) {
      const nested = await listAllFiles(supabase, bucket, itemPath);
      files = files.concat(nested);
    } else {
      files.push(itemPath);
    }
  }
  return files;
}

async function downloadToFile(supabase, bucket, objectPath, destPath) {
  const { data, error } = await supabase.storage.from(bucket).download(objectPath);
  if (error) {
    throw new Error(`Download failed for ${bucket}/${objectPath}: ${error.message}`);
  }

  mkdirSync(dirname(destPath), { recursive: true });
  const body = data instanceof Blob ? Buffer.from(await data.arrayBuffer()) : data;
  const stream = Readable.from(body);
  await pipeline(stream, createWriteStream(destPath));
  return createHash("sha256").update(body).digest("hex");
}

async function exportBucket(supabase, bucket, storageRoot) {
  log(`\nBucket: ${bucket}`);
  const files = await listAllFiles(supabase, bucket);
  log(`  Found ${files.length} object(s)`);

  const exported = [];
  const failed = [];

  for (const objectPath of files) {
    const destPath = resolve(storageRoot, bucket, objectPath);
    try {
      const sha256 = await downloadToFile(supabase, bucket, objectPath, destPath);
      exported.push({ path: objectPath, sha256, bytes: 0 });
      process.stdout.write(`  ✓ ${objectPath}\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failed.push({ path: objectPath, error: message });
      process.stderr.write(`  ✗ ${objectPath}: ${message}\n`);
    }
  }

  return { bucket, total: files.length, exported: exported.length, failed };
}

async function main() {
  const args = parseCli(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const env = loadBackendProdEnv(args.envFile);
  const projectUrl = env.PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = env.SUPABASE_SECRET_KEY?.trim() || env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!projectUrl || !serviceKey) {
    fail(`Set PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in ${args.envFile}`);
  }

  const backupDir = resolveBackupDir(args);
  const storageRoot = resolve(backupDir, "storage");
  ensureDir(storageRoot);

  log(`Layer 3 — Storage export → ${storageRoot.replace(repoRoot + "/", "")}`);
  log(`Project: ${projectUrl}`);

  const supabase = createClient(projectUrl, serviceKey);
  const results = [];

  for (const bucket of STORAGE_BUCKETS) {
    results.push(await exportBucket(supabase, bucket, storageRoot));
  }

  const manifest = {
    layer: 3,
    exportedAt: new Date().toISOString(),
    projectUrl,
    buckets: STORAGE_BUCKETS,
    results,
    totalObjects: results.reduce((sum, r) => sum + r.total, 0),
    exportedObjects: results.reduce((sum, r) => sum + r.exported, 0),
    failedObjects: results.reduce((sum, r) => sum + r.failed.length, 0),
  };

  const manifestPath = resolve(storageRoot, "manifest.json");
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  log("\nLayer 3 summary:");
  for (const row of results) {
    log(`  ${row.bucket}: ${row.exported}/${row.total} exported, ${row.failed.length} failed`);
  }
  log(`Manifest: ${manifestPath.replace(repoRoot + "/", "")}`);

  if (manifest.failedObjects > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Migrate Storage objects between Supabase projects (Phase B cutover).
 * Based on the official backup-restore storage migration guide.
 *
 * Usage:
 *   export OLD_PROJECT_URL='https://ldewhviobysqevtnfznh.supabase.co'
 *   export OLD_PROJECT_SERVICE_KEY='sb_secret_...'
 *   export NEW_PROJECT_URL='https://<new-ref>.supabase.co'
 *   export NEW_PROJECT_SERVICE_KEY='sb_secret_...'
 *   node scripts/prod-backup/migrate-storage.mjs --yes
 */

import { createRequire } from "node:module";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { resolve } from "node:path";
import { STORAGE_BUCKETS } from "./constants.mjs";
import { fail, log, repoRoot } from "./lib.mjs";

const require = createRequire(resolve(repoRoot, "backend/package.json"));
const { createClient } = require("@supabase/supabase-js");

const BATCH_SIZE = 10;

function parseFlags(argv) {
  return {
    autoYes: argv.includes("--yes"),
    buckets: STORAGE_BUCKETS,
  };
}

async function confirm(message, autoYes) {
  if (autoYes) return true;
  const rl = createInterface({ input, output });
  const answer = (await rl.question(`${message} (yes/no): `)).trim().toLowerCase();
  rl.close();
  return answer === "yes";
}

async function listAllFiles(supabase, bucket, path = "") {
  const { data, error } = await supabase.storage.from(bucket).list(path, { limit: 1000 });
  if (error) throw new Error(`List failed for ${bucket}: ${error.message}`);
  if (!data?.length) return [];

  let files = [];
  for (const item of data) {
    const prefix = path ? `${path}${item.name}/` : `${item.name}/`;
    if (!item.metadata) {
      files = files.concat(await listAllFiles(supabase, bucket, prefix));
    } else {
      files.push({ fullPath: path ? `${path}${item.name}` : item.name, metadata: item.metadata });
    }
  }
  return files;
}

async function ensureBucketExists(supabase, bucketName, options) {
  const { data: existing, error } = await supabase.storage.getBucket(bucketName);
  if (error && !error.message.includes("not found")) {
    throw new Error(`Bucket check failed for ${bucketName}: ${error.message}`);
  }
  if (!existing) {
    const { error: createError } = await supabase.storage.createBucket(bucketName, options);
    if (createError) {
      throw new Error(`Create bucket failed for ${bucketName}: ${createError.message}`);
    }
    log(`Created bucket '${bucketName}'`);
  }
}

async function migrateFile(oldSupabase, newSupabase, sourceBucket, targetBucket, file) {
  const { data, error: downloadError } = await oldSupabase.storage
    .from(sourceBucket)
    .download(file.fullPath);
  if (downloadError) {
    return { success: false, path: file.fullPath, error: downloadError.message };
  }

  const { error: uploadError } = await newSupabase.storage
    .from(targetBucket)
    .upload(file.fullPath, data, {
      upsert: true,
      contentType: file.metadata?.mimetype,
      cacheControl: file.metadata?.cacheControl,
    });
  if (uploadError) {
    return { success: false, path: file.fullPath, error: uploadError.message };
  }
  return { success: true, path: file.fullPath };
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function main() {
  const flags = parseFlags(process.argv);
  const oldUrl = process.env.OLD_PROJECT_URL?.trim();
  const oldKey = process.env.OLD_PROJECT_SERVICE_KEY?.trim();
  const newUrl = process.env.NEW_PROJECT_URL?.trim();
  const newKey = process.env.NEW_PROJECT_SERVICE_KEY?.trim();

  if (!oldUrl || !oldKey || !newUrl || !newKey) {
    fail(
      "Set OLD_PROJECT_URL, OLD_PROJECT_SERVICE_KEY, NEW_PROJECT_URL, and NEW_PROJECT_SERVICE_KEY."
    );
  }

  const oldSupabase = createClient(oldUrl, oldKey);
  const newSupabase = createClient(newUrl, newKey);

  log("Supabase Storage migration (cutover)");
  log(`Source: ${oldUrl}`);
  log(`Target: ${newUrl}`);

  if (!(await confirm("Proceed? Existing target paths may be overwritten.", flags.autoYes))) {
    log("Canceled.");
    return;
  }

  const stats = { totalFiles: 0, success: 0, failed: 0, failedPaths: [] };

  for (const bucketName of flags.buckets) {
    log(`\nBucket: ${bucketName}`);
    const { data: bucketMeta, error } = await oldSupabase.storage.getBucket(bucketName);
    if (error) {
      fail(`Could not read bucket metadata for ${bucketName}: ${error.message}`);
    }

    await ensureBucketExists(newSupabase, bucketName, {
      public: bucketMeta.public,
      fileSizeLimit: bucketMeta.file_size_limit,
      allowedMimeTypes: bucketMeta.allowed_mime_types,
    });

    const files = await listAllFiles(oldSupabase, bucketName);
    log(`  ${files.length} file(s)`);
    stats.totalFiles += files.length;

    for (const batch of chunk(files, BATCH_SIZE)) {
      const results = await Promise.all(
        batch.map((file) => migrateFile(oldSupabase, newSupabase, bucketName, bucketName, file))
      );
      for (const result of results) {
        if (result.success) {
          stats.success += 1;
        } else {
          stats.failed += 1;
          stats.failedPaths.push(`${bucketName}/${result.path}`);
        }
      }
    }
  }

  log("\nMigration summary:");
  log(`  ${stats.success}/${stats.totalFiles} succeeded, ${stats.failed} failed`);
  if (stats.failed > 0) {
    for (const path of stats.failedPaths) {
      log(`  - ${path}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});

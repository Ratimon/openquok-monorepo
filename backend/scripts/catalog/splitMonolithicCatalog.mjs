#!/usr/bin/env node
/**
 * One-off / maintenance: split catalog.json into per-slug JSON shards in the same folder.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { writeCatalogEntryShards } from "./loadCatalogEntries.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONOFILE = "catalog.json";

function usage() {
    console.log(`Usage: node scripts/catalog/splitMonolithicCatalog.mjs <hub-dir> [hub-dir ...]

Example:
  node scripts/catalog/splitMonolithicCatalog.mjs scripts/catalog/directory
`);
}

const dirs = process.argv.slice(2).filter((a) => a !== "--");
if (dirs.length === 0) {
    usage();
    process.exit(1);
}

for (const rel of dirs) {
    const dir = path.isAbsolute(rel) ? rel : path.resolve(process.cwd(), rel);
    const monolith = path.join(dir, MONOFILE);
    if (!fs.existsSync(monolith)) {
        console.log(`Skip (no ${MONOFILE}): ${dir}`);
        continue;
    }
    const { entries } = JSON.parse(fs.readFileSync(monolith, "utf8"));
    if (!entries || typeof entries !== "object") {
        console.error(`Invalid ${monolith}: missing entries`);
        process.exit(1);
    }
    const count = writeCatalogEntryShards(dir, entries).size;
    console.log(`Split ${monolith} → ${count} shards in ${dir}`);
}
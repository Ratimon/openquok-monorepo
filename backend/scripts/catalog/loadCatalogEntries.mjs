import fs from "fs";
import path from "path";

const MONOFILE_NAME = "catalog.json";

/**
 * Resolve slug for a shard file (basename without .json).
 * @param {string} fileSlug
 * @param {object} entry
 * @returns {string}
 */
function resolveEntrySlug(fileSlug, entry) {
    const fromSite =
        typeof entry?.site?.slug === "string" ? entry.site.slug.trim() : "";
    const fromListing =
        typeof entry?.listing?.slug === "string" ? entry.listing.slug.trim() : "";
    const canonical = fromSite || fromListing || fileSlug;
    if (canonical !== fileSlug && (fromSite || fromListing)) {
        console.warn(
            `Catalog shard ${fileSlug}.json: filename slug does not match entry slug "${canonical}" (using "${canonical}")`
        );
    }
    return canonical;
}

/**
 * Load catalog entries from a directory of `<slug>.json` shards or a legacy monolithic catalog.json / single shard file.
 *
 * @param {string} catalogPath Absolute or relative path to a hub catalog directory or JSON file
 * @returns {Record<string, object>}
 */
export function loadCatalogEntries(catalogPath) {
    if (!fs.existsSync(catalogPath)) {
        throw new Error(`Catalog path not found: ${catalogPath}`);
    }

    const stat = fs.statSync(catalogPath);

    if (stat.isDirectory()) {
        /** @type {Record<string, object>} */
        const entries = {};

        const monolith = path.join(catalogPath, MONOFILE_NAME);
        if (fs.existsSync(monolith)) {
            const data = JSON.parse(fs.readFileSync(monolith, "utf8"));
            if (data.entries && typeof data.entries === "object") {
                Object.assign(entries, data.entries);
            }
        }

        for (const name of fs.readdirSync(catalogPath).sort()) {
            if (!name.endsWith(".json") || name === MONOFILE_NAME) continue;
            const fileSlug = name.slice(0, -".json".length);
            if (!fileSlug) continue;
            const full = path.join(catalogPath, name);
            const entry = JSON.parse(fs.readFileSync(full, "utf8"));
            const slug = resolveEntrySlug(fileSlug, entry);
            if (entries[slug] && fileSlug !== slug) {
                delete entries[fileSlug];
            }
            entries[slug] = entry;
        }

        return entries;
    }

    const data = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
    if (data.entries && typeof data.entries === "object") {
        return { ...data.entries };
    }

    const fileSlug = path.basename(catalogPath, ".json");
    const slug = resolveEntrySlug(fileSlug, data);
    return { [slug]: data };
}

/**
 * Write one entry per `<slug>.json` under catalogDir. Removes legacy catalog.json when writing shards.
 *
 * @param {string} catalogDir
 * @param {Record<string, object>} entries
 * @param {{ slugsToWrite?: Set<string> }} [opts]
 */
export function writeCatalogEntryShards(catalogDir, entries, opts = {}) {
    fs.mkdirSync(catalogDir, { recursive: true });

    const slugsToWrite = opts.slugsToWrite;
    const written = new Set();

    for (const [slug, entry] of Object.entries(entries)) {
        if (slugsToWrite && !slugsToWrite.has(slug)) continue;
        const filePath = path.join(catalogDir, `${slug}.json`);
        fs.writeFileSync(filePath, `${JSON.stringify(entry, null, "\t")}\n`);
        written.add(slug);
    }

    const monolith = path.join(catalogDir, MONOFILE_NAME);
    if (fs.existsSync(monolith) && written.size > 0) {
        fs.unlinkSync(monolith);
    }

    return written;
}
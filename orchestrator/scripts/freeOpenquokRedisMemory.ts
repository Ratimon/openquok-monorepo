/**
 * Free Redis memory by deleting OpenQuok-owned key prefixes (SCAN + UNLINK), same style as
 * the `clearFlowcraftRuns` script. Does not use FLUSHDB.
 *
 * Stop BullMQ/Flowcraft workers (and avoid hitting the API) for targets that touch queues or runs.
 *
 * Usage (from repo root):
 *   pnpm --filter openquok-orchestrator script:free-openquok-redis-memory -- --dry-run
 *   pnpm --filter openquok-orchestrator script:free-openquok-redis-memory -- --targets=bull,digest,flowcraft
 *   pnpm --filter openquok-orchestrator script:free-openquok-redis-memory -- --targets=cache
 */
import IORedis, { type RedisOptions } from "ioredis";
import * as loadBackendDotenvCjs from "backend/config/loadBackendDotenv.cjs";

const { loadBackendDotenv } = loadBackendDotenvCjs as unknown as { loadBackendDotenv: () => void };

const QUEUE_SEGMENTS = ["integration-refresh", "notification-email", "scheduled-social-post"] as const;
const SCAN_COUNT = 500;
const UNLINK_BATCH = 500;

/** flowcraft:run:* and similar may exist; these three cover Flowcraft + adapter state in repo. */
const FLOWCRAFT_PATTERNS = [
    "workflow:state:*",
    "flowcraft:blueprint:*",
    "workflow:status:*",
] as const;

loadBackendDotenv();

function getEnv(name: string): string | undefined {
    const v = process.env[name];
    return v && v.trim() ? v.trim() : undefined;
}

function requireEnv(name: string): string {
    const v = getEnv(name);
    if (!v) {
        throw new Error(`Missing required env: ${name}`);
    }
    return v;
}

function parseNumberEnv(name: string, fallback: number): number {
    const raw = getEnv(name);
    if (!raw) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
}

function isTruthy(v: string | undefined): boolean {
    if (!v) return false;
    const t = v.toLowerCase();
    return t === "1" || t === "true" || t === "yes";
}

function buildRedisOptions(overrideDb?: number): { options: RedisOptions; tlsEnabled: boolean; db: number } {
    const host = requireEnv("REDIS_HOST");
    const port = parseNumberEnv("REDIS_PORT", 6379);
    const password = getEnv("REDIS_PASSWORD");
    const defaultDb = parseNumberEnv("REDIS_BULLMQ_DB", parseNumberEnv("REDIS_DB", 0));
    const db = overrideDb !== undefined ? overrideDb : defaultDb;
    const useTls = isTruthy(getEnv("REDIS_TLS"));
    const rejectUnauthorized = getEnv("REDIS_TLS_REJECT_UNAUTHORIZED") !== "false";

    const options: RedisOptions = {
        host,
        port,
        password: password || undefined,
        db,
        maxRetriesPerRequest: null,
        ...(useTls
            ? {
                  tls: {
                      servername: host,
                      rejectUnauthorized,
                  },
              }
            : {}),
    };
    return { options, tlsEnabled: useTls, db };
}

type Target = "bull" | "digest" | "flowcraft" | "cache";

const ALL_TARGETS: readonly Target[] = ["bull", "digest", "flowcraft", "cache"];

function parseArgs(argv: string[]): { dryRun: boolean; targets: Set<Target> } {
    let dryRun = false;
    const targets = new Set<Target>();

    for (const a of argv) {
        if (a === "--dry-run" || a === "-n") dryRun = true;
        if (a === "--help" || a === "-h") {
            // eslint-disable-next-line no-console
            console.log(`freeOpenquokRedisMemory

Remove OpenQuok key prefixes to free Redis memory (SCAN + UNLINK; not FLUSHDB).

  --dry-run, -n              Count keys only
  --targets=a,b,c            Default: bull,digest,flowcraft (not cache)
                             Values: ${ALL_TARGETS.join(", ")}

  cache   → keys under REDIS_PREFIX (default app:cache:*) — same logical DB as REDIS_DB
  bull    → bull:<queue>:* (three orchestrator queues)
  digest  → notificationDigest:* (pending digest lines + set)
  flowcraft → workflow:state:*, flowcraft:blueprint:*, workflow:status:*

Stop workers before clear that touches bull or flowcraft. If REDIS_BULLMQ_DB != REDIS_DB, run
separate invocations to clear cache (uses REDIS_DB) vs queues (uses REDIS_BULLMQ_DB) by
setting env or using two shells.

Env: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB, REDIS_BULLMQ_DB, optional REDIS_TLS, REDIS_PREFIX
`);
            process.exit(0);
        }
        if (a.startsWith("--targets=")) {
            const parts = a.slice("--targets=".length).split(",");
            for (const p of parts) {
                const t = p.trim() as Target;
                if (!ALL_TARGETS.includes(t)) {
                    throw new Error(`Unknown target "${p}". Use: ${ALL_TARGETS.join(", ")}`);
                }
                targets.add(t);
            }
        }
    }

    if (targets.size === 0) {
        targets.add("bull");
        targets.add("digest");
        targets.add("flowcraft");
    }

    return { dryRun, targets };
}

async function scanUnlink(redis: IORedis, pattern: string, dryRun: boolean, label: string): Promise<number> {
    // eslint-disable-next-line no-console
    console.error(dryRun ? `[dry-run] ${label}: ${pattern}` : `${label}: ${pattern}`);

    let cursor = "0";
    let n = 0;
    do {
        const [nextCursor, keys] = (await redis.scan(
            cursor,
            "MATCH",
            pattern,
            "COUNT",
            SCAN_COUNT
        )) as unknown as [string, string[]];
        cursor = nextCursor;
        if (keys.length === 0) continue;
        if (dryRun) {
            n += keys.length;
            continue;
        }
        for (let i = 0; i < keys.length; i += UNLINK_BATCH) {
            const chunk = keys.slice(i, i + UNLINK_BATCH);
            n += await redis.unlink(...chunk);
        }
    } while (cursor !== "0");
    return n;
}

function cacheKeyPattern(): string {
    const prefix = getEnv("REDIS_PREFIX") ?? "app:cache:";
    if (!prefix.endsWith("*")) {
        return `${prefix}*`;
    }
    return prefix;
}

async function main(): Promise<void> {
    const { dryRun, targets } = parseArgs(process.argv.slice(2));
    const dbOrch = parseNumberEnv("REDIS_BULLMQ_DB", parseNumberEnv("REDIS_DB", 0));
    const dbCache = parseNumberEnv("REDIS_DB", 0);

    const needOrch = targets.has("bull") || targets.has("digest") || targets.has("flowcraft");
    const needCache = targets.has("cache");

    const byPattern: { pattern: string; keys: number; db: number }[] = [];

    if (needOrch) {
        const { options } = buildRedisOptions(dbOrch);
        const redis = new IORedis(options);
        try {
            await redis.ping();
            if (targets.has("bull")) {
                for (const q of QUEUE_SEGMENTS) {
                    const p = `bull:${q}:*`;
                    byPattern.push({ pattern: p, keys: await scanUnlink(redis, p, dryRun, "bull"), db: dbOrch });
                }
            }
            if (targets.has("digest")) {
                const p = "notificationDigest:*";
                byPattern.push({ pattern: p, keys: await scanUnlink(redis, p, dryRun, "digest"), db: dbOrch });
            }
            if (targets.has("flowcraft")) {
                for (const p of FLOWCRAFT_PATTERNS) {
                    byPattern.push({
                        pattern: p,
                        keys: await scanUnlink(redis, p, dryRun, "flowcraft"),
                        db: dbOrch,
                    });
                }
            }
        } finally {
            await redis.quit();
        }
    }

    if (needCache && dbCache !== dbOrch) {
        const { options } = buildRedisOptions(dbCache);
        const redis = new IORedis(options);
        try {
            await redis.ping();
            const p = cacheKeyPattern();
            byPattern.push({ pattern: p, keys: await scanUnlink(redis, p, dryRun, "cache"), db: dbCache });
        } finally {
            await redis.quit();
        }
    }

    if (needCache && dbCache === dbOrch) {
        const { options } = buildRedisOptions(dbOrch);
        const redis = new IORedis(options);
        try {
            await redis.ping();
            const p = cacheKeyPattern();
            byPattern.push({ pattern: p, keys: await scanUnlink(redis, p, dryRun, "cache"), db: dbOrch });
        } finally {
            await redis.quit();
        }
    }

    const total = byPattern.reduce((a, b) => a + b.keys, 0);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ ok: true, dryRun, byPattern, totalKeysAffected: total }, null, 2));
}

await main();

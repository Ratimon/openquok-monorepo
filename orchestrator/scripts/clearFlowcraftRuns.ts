import IORedis from "ioredis";
import * as loadBackendDotenvCjs from "backend/config/loadBackendDotenv.cjs";

const { loadBackendDotenv } = loadBackendDotenvCjs as unknown as { loadBackendDotenv: () => void };

const WORKFLOW_STATE_KEY_PREFIX = "workflow:state:";

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

function parseBlueprintIdArg(argv: string[]): string {
    const byFlagIdx = argv.findIndex((x) => x === "--blueprintId");
    if (byFlagIdx !== -1 && argv[byFlagIdx + 1]) return argv[byFlagIdx + 1]!;
    const byEq = argv.find((x) => x.startsWith("--blueprintId="));
    if (byEq) return byEq.slice("--blueprintId=".length);
    const positional = argv[2];
    if (positional) return positional;
    throw new Error('Usage: clearFlowcraftRuns <blueprintId> (or --blueprintId="scheduled-social-post")');
}

function stripOptionalJsonQuotes(s: string): string {
    if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
        return s.slice(1, -1);
    }
    return s;
}

async function main(): Promise<void> {
    const blueprintId = parseBlueprintIdArg(process.argv);
    const host = requireEnv("REDIS_HOST");
    const port = parseNumberEnv("REDIS_PORT", 6379);
    const password = getEnv("REDIS_PASSWORD");
    const db = parseNumberEnv("REDIS_BULLMQ_DB", parseNumberEnv("REDIS_DB", 0));

    const redis = new IORedis({
        host,
        port,
        password: password || undefined,
        db,
        maxRetriesPerRequest: null,
    });

    let cursor = "0";
    let deleted = 0;
    let scanned = 0;

    try {
        do {
            const [nextCursor, keys] = (await redis.scan(
                cursor,
                "MATCH",
                `${WORKFLOW_STATE_KEY_PREFIX}*`,
                "COUNT",
                500
            )) as unknown as [string, string[]];
            cursor = nextCursor;
            for (const key of keys) {
                scanned++;
                const runId = key.slice(WORKFLOW_STATE_KEY_PREFIX.length);
                const raw = await redis.hget(key, "blueprintId");
                if (!raw) continue;
                const resolved = stripOptionalJsonQuotes(raw);
                if (resolved !== blueprintId) continue;

                await redis.del(key);
                await redis.del(`flowcraft:blueprint:${runId}`);
                await redis.del(`workflow:status:${runId}`);
                deleted++;
            }
        } while (cursor !== "0");
    } finally {
        await redis.quit();
    }

    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ ok: true, blueprintId, db, scannedKeys: scanned, deletedRuns: deleted }));
}

await main();


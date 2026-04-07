import { readFileSync } from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "redis";
import RedisCacheProvider from "../../connections/cache/RedisCacheProvider";

/**
 * Load production env via dotenv.parse() so we get the Redis credentials
 * without polluting process.env or needing NODE_ENV=production.
 */
const prodEnvPath = path.resolve(process.cwd(), ".env.production.local");
let prodEnv: Record<string, string> = {};
try {
    prodEnv = dotenv.parse(readFileSync(prodEnvPath));
} catch (err) {
    console.warn(`[ThirdParties] Could not load ${prodEnvPath}: ${(err as Error).message}`);
}

const redisHost = prodEnv.REDIS_HOST || process.env.REDIS_HOST || "";
const redisPort = Number(prodEnv.REDIS_PORT || process.env.REDIS_PORT || 6379);
const redisPassword = prodEnv.REDIS_PASSWORD || process.env.REDIS_PASSWORD || "";
const redisDb = Number(prodEnv.REDIS_DB || process.env.REDIS_DB || 0);

const hasRedisConfig = !!redisHost && redisHost !== "localhost";

const describeIfRedis = hasRedisConfig ? describe : describe.skip;

// ---------------------------------------------------------------------------
// Redis Cloud (production) – connectivity & RedisCacheProvider smoke tests
// ---------------------------------------------------------------------------
describeIfRedis("Third-party: Redis Cloud (production)", () => {
    const clientOpts = {
        socket: { host: redisHost, port: redisPort },
        password: redisPassword || undefined,
        database: redisDb,
    };

    describe("raw connection", () => {
        it("should PING the server", async () => {
            const client = createClient(clientOpts);
            try {
                await client.connect();
                const pong = await client.ping();
                expect(pong).toBe("PONG");
            } finally {
                await client.quit();
            }
        });
    });

    describe("RedisCacheProvider", () => {
        const TEST_PREFIX = "test:integration:";
        let provider: RedisCacheProvider;

        beforeAll(async () => {
            provider = new RedisCacheProvider({
                host: redisHost,
                port: redisPort,
                password: redisPassword,
                db: redisDb,
                prefix: TEST_PREFIX,
            });
            await provider.connect();
        });

        afterAll(async () => {
            await provider.del("hello");
            await provider.del("json-test");
            await provider.disconnect();
        });

        it("set + get", async () => {
            const ok = await provider.set("hello", "world", 60);
            expect(ok).toBe(true);

            const val = await provider.get("hello");
            expect(val).toBe("world");
        });

        it("del removes the key", async () => {
            await provider.set("hello", "world", 60);
            const deleted = await provider.del("hello");
            expect(deleted).toBe(true);

            const val = await provider.get("hello");
            expect(val).toBeNull();
        });

        it("set JSON object + get parses back", async () => {
            const data = { name: "quokka", score: 42 };
            await provider.set("json-test", data, 60);

            const raw = await provider.get("json-test");
            expect(raw).not.toBeNull();
            expect(JSON.parse(raw!)).toEqual(data);
        });
    });
});

import { createClient } from "redis";
import RedisCacheProvider from "../../connections/cache/RedisCacheProvider";
import { R2StorageClient } from "../../connections/R2StorageClient";

// Production smoke tests should run with NODE_ENV=production so jest.env-setup loads backend/.env.production.local.
// Dev runs can still set THIRD_PARTY_TESTS_* and export env vars explicitly.
const redisHost = process.env.REDIS_HOST || "";
const redisPort = Number(process.env.REDIS_PORT || 6379);
const redisPassword = process.env.REDIS_PASSWORD || "";
const redisDb = Number(process.env.REDIS_DB || 0);

const enableRedisTests = (process.env.THIRD_PARTY_TESTS_REDIS ?? "").toLowerCase() === "true";
const hasRedisConfig = enableRedisTests && !!redisHost && redisHost !== "localhost";

const describeIfRedis = hasRedisConfig ? describe : describe.skip;

const r2AccountId = process.env.STORAGE_R2_ACCOUNT_ID || "";
const r2AccessKeyId = process.env.STORAGE_R2_ACCESS_KEY_ID || "";
const r2SecretAccessKey = process.env.STORAGE_R2_SECRET_ACCESS_KEY || "";
const r2Bucket = process.env.STORAGE_R2_BUCKET || "";
const r2Region = (process.env.STORAGE_R2_REGION || "auto").trim() || "auto";

const enableR2Tests = (process.env.THIRD_PARTY_TESTS_R2 ?? "").toLowerCase() === "true";
const hasR2Config = enableR2Tests && Boolean(r2AccountId && r2AccessKeyId && r2SecretAccessKey && r2Bucket);
const describeIfR2 = hasR2Config ? describe : describe.skip;

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

// ---------------------------------------------------------------------------
// Cloudflare R2 (production) – connectivity smoke test (S3-compatible)
// ---------------------------------------------------------------------------
describeIfR2("Third-party: Cloudflare R2 (production)", () => {
    it("can put + get + delete a small object", async () => {
        const r2 = new R2StorageClient({
            accountId: r2AccountId,
            accessKeyId: r2AccessKeyId,
            secretAccessKey: r2SecretAccessKey,
            bucket: r2Bucket,
            region: r2Region,
        });

        const key = `test/third-parties/${Date.now()}-${Math.random().toString(16).slice(2)}.txt`;
        const contentType = "text/plain";
        const body = Buffer.from(`ok-${Date.now()}`, "utf8");

        await r2.putObject(key, body, contentType);
        try {
            const got = await r2.getObjectBuffer(key);
            expect(got.contentType).toBeTruthy();
            expect(got.buffer.toString("utf8")).toEqual(body.toString("utf8"));
        } finally {
            await r2.deleteObject(key);
        }
    });
});

import type Redis from "ioredis";

/**
 * Copy of `@flowcraft/bullmq-adapter` `RedisContext`, but `set()` safely serializes:
 * - `JSON.stringify(undefined)` is `undefined`, and ioredis can persist that as an empty hash field
 *   which then crashes `toJSON()` (`JSON.parse("")` => "Unexpected end of JSON input").
 */
export class SafeRedisContext {
    type = "async" as const;
    private readonly redis: Redis;
    private readonly stateKey: string;

    constructor(redis: Redis, runId: string) {
        this.redis = redis;
        this.stateKey = `workflow:state:${runId}`;
    }

    async get(key: string) {
        const value = await this.redis.hget(this.stateKey, key);
        return value ? JSON.parse(value) : undefined;
    }

    async set(key: string, value: unknown) {
        const serialized = JSON.stringify(value === undefined ? null : value);
        await this.redis.hset(this.stateKey, key, serialized);
    }

    async has(key: string) {
        return (await this.redis.hexists(this.stateKey, key)) === 1;
    }

    async delete(key: string) {
        return (await this.redis.hdel(this.stateKey, key)) > 0;
    }

    async toJSON() {
        const data = await this.redis.hgetall(this.stateKey);
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data)) {
            // Defensive: tolerate legacy/corrupt empty values by skipping them
            if (value === "") continue;
            result[key] = JSON.parse(value);
        }
        return result;
    }

    async patch(operations: Array<{ op: "set" | "delete"; key: string; value?: unknown }>) {
        if (operations.length === 0) return;
        const multi = this.redis.multi();
        for (const op of operations) {
            if (op.op === "set") {
                const serialized = JSON.stringify(op.value === undefined ? null : op.value);
                multi.hset(this.stateKey, op.key, serialized);
            } else if (op.op === "delete") {
                multi.hdel(this.stateKey, op.key);
            }
        }
        await multi.exec();
    }
}
